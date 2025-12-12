interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory rate limit store (for production, use Redis or similar)
const store: RateLimitStore = {};

export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Clean up expired entries periodically
    setInterval(() => {
      const now = Date.now();
      for (const key in store) {
        if (store[key].resetTime < now) {
          delete store[key];
        }
      }
    }, this.windowMs * 2);
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const key = identifier;

    if (!store[key] || store[key].resetTime < now) {
      // First request or window expired
      store[key] = {
        count: 1,
        resetTime: now + this.windowMs
      };
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: store[key].resetTime
      };
    }

    // Increment counter
    store[key].count++;

    return {
      allowed: store[key].count <= this.maxRequests,
      remaining: Math.max(0, this.maxRequests - store[key].count),
      resetTime: store[key].resetTime
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