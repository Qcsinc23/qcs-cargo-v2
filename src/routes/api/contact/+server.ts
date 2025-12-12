import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { contactRateLimit } from '$lib/server/rate-limiter';
import { sendContactFormEmail } from '$lib/server/email';

const ContactBodySchema = z
  .object({
    name: z.string().min(1).max(120),
    email: z.string().email().max(200),
    phone: z.string().max(40).optional(),
    subject: z.string().max(200).optional(),
    message: z.string().min(10).max(1000),

    // Honeypot (should be empty)
    website: z.string().max(200).optional()
  })
  .strict();

function getBestEffortClientIp(request: Request, fallback: () => string): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return fallback();
}

export const POST: RequestHandler = async ({ request, locals, getClientAddress }) => {
  const correlationId = locals.correlationId || crypto.randomUUID();
  const ip = getBestEffortClientIp(request, getClientAddress) || 'unknown';

  const rate = contactRateLimit.check(ip);
  if (!rate.allowed) {
    return json(
      {
        success: false,
        error: 'Too many messages. Please try again later.'
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rate.resetTime.toString(),
          'Retry-After': Math.ceil((rate.resetTime - Date.now()) / 1000).toString()
        }
      }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = ContactBodySchema.safeParse(body);
  if (!parsed.success) {
    return json({ success: false, error: 'Invalid contact form submission' }, { status: 400 });
  }

  // Honeypot filled → treat as success to avoid training bots.
  if (parsed.data.website && parsed.data.website.trim().length > 0) {
    return json({ success: true });
  }

  try {
    await sendContactFormEmail({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      subject: parsed.data.subject,
      message: parsed.data.message,
      correlationId,
      ip,
      userAgent: request.headers.get('user-agent') ?? undefined
    });

    return json(
      { success: true },
      {
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rate.remaining.toString(),
          'X-RateLimit-Reset': rate.resetTime.toString()
        }
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '';
    const emailServiceMisconfigured =
      message.toLowerCase().includes('api key') || message.toLowerCase().includes('resend');

    console.error('[contact_form_error]', {
      correlationId,
      error: message || err
    });

    return json(
      {
        success: false,
        error: emailServiceMisconfigured
          ? 'Email service is not configured. Please try again later.'
          : 'Failed to send message. Please try again later.'
      },
      { status: emailServiceMisconfigured ? 503 : 500 }
    );
  }
};


