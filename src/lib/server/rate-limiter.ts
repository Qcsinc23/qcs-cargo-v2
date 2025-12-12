export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private store = new Map<string, { count: number; resetTime: number }>();

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Clean up expired entries periodically
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.store.entries()) {
        if (value.resetTime < now) this.store.delete(key);
      }
    }, this.windowMs * 2);
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const key = identifier;

    const entry = this.store.get(key);
    if (!entry || entry.resetTime < now) {
      // First request or window expired
      const next = { count: 1, resetTime: now + this.windowMs };
      this.store.set(key, next);
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: next.resetTime
      };
    }

    // Increment counter
    entry.count++;

    return {
      allowed: entry.count <= this.maxRequests,
      remaining: Math.max(0, this.maxRequests - entry.count),
      resetTime: entry.resetTime
    };
  }

  middleware() {
    return ({ request, locals }: { request: Request; locals: App.Locals }) => {
      // Use user ID if authenticated, otherwise IP address
      const identifier = locals.user?.id || request.headers.get('x-forwarded-for') || 'unknown';
      const result = this.check(identifier);

      // Store rate limit info for response headers
      locals.rateLimit = result;

      return result.allowed;
    };
  }
}

// Predefined rate limiters for different use cases
export const paymentRateLimit = new RateLimiter(60 * 1000, 5); // 5 requests per minute
export const webhookRateLimit = new RateLimiter(60 * 1000, 100); // 100 requests per minute
export const bookingRateLimit = new RateLimiter(60 * 1000, 10); // 10 requests per minute
export const contactRateLimit = new RateLimiter(60 * 1000, 5); // 5 contact submissions per minute