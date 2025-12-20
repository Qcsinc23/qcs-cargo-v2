import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { handleAuth } from '@kinde-oss/kinde-auth-sveltekit';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const MAX_FAILED_ATTEMPTS = 5;
const FAILED_ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const failedLoginAttempts = new Map<string, { count: number; resetTime: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of failedLoginAttempts.entries()) {
    if (value.resetTime < now) failedLoginAttempts.delete(key);
  }
}, 60 * 1000);

function getBestEffortClientIp(request: Request, fallback: () => string): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return fallback();
}

// Kinde expects GET /api/auth/login to initiate the login flow.
// This route previously only supported POST (PocketBase email/password), which caused 405s when
// clicking "Login" as a normal link navigation. We keep POST for legacy /auth-legacy pages.
export const GET: RequestHandler = async (event) => {
  return handleAuth(event);
};

export const POST: RequestHandler = async ({ request, locals, getClientAddress }) => {
  if (!locals.pb) {
    return json({ success: false, error: 'Auth system unavailable' }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return json({ success: false, error: 'Invalid login payload' }, { status: 400 });
  }

  const now = Date.now();
  const ip = getBestEffortClientIp(request, getClientAddress) || 'unknown';
  const emailKey = parsed.data.email.trim().toLowerCase();
  const key = `${ip}:${emailKey}`;

  const entry = failedLoginAttempts.get(key);
  if (entry && entry.resetTime > now && entry.count >= MAX_FAILED_ATTEMPTS) {
    return json(
      { success: false, error: 'Too many failed login attempts. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': MAX_FAILED_ATTEMPTS.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': entry.resetTime.toString(),
          'Retry-After': Math.ceil((entry.resetTime - now) / 1000).toString()
        }
      }
    );
  }

  try {
    const authData = await locals.pb
      .collection('users')
      .authWithPassword(parsed.data.email, parsed.data.password);

    // Keep locals.user in sync for this request lifecycle.
    locals.user = authData.record;

    // Successful login clears the failed attempt counter for this IP+email.
    failedLoginAttempts.delete(key);

    return json({ success: true, user: authData.record });
  } catch {
    const current = failedLoginAttempts.get(key);
    if (!current || current.resetTime < now) {
      failedLoginAttempts.set(key, { count: 1, resetTime: now + FAILED_ATTEMPT_WINDOW_MS });
      return json(
        { success: false, error: 'Invalid email or password' },
        {
          status: 401,
          headers: {
            'X-RateLimit-Limit': MAX_FAILED_ATTEMPTS.toString(),
            'X-RateLimit-Remaining': (MAX_FAILED_ATTEMPTS - 1).toString(),
            'X-RateLimit-Reset': (now + FAILED_ATTEMPT_WINDOW_MS).toString()
          }
        }
      );
    }

    current.count += 1;
    const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - current.count);

    if (current.count >= MAX_FAILED_ATTEMPTS) {
      return json(
        { success: false, error: 'Too many failed login attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': MAX_FAILED_ATTEMPTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': current.resetTime.toString(),
            'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString()
          }
        }
      );
    }

    return json(
      { success: false, error: 'Invalid email or password' },
      {
        status: 401,
        headers: {
          'X-RateLimit-Limit': MAX_FAILED_ATTEMPTS.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': current.resetTime.toString()
        }
      }
    );
  }
};


