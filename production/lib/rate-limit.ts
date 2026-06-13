import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Upstash sliding-window rate limiters (Section 7: rate limiting requirement)

const redis = Redis.fromEnv();

// Contact form: 5 submissions per 10 minutes per IP
export const contactLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '10 m'),
  prefix: 'rl:contact',
});

// Login attempts: 10 per 15 minutes per IP (brute-force protection)
export const loginLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '15 m'),
  prefix: 'rl:login',
});

// Admin mutations: 60 per minute per user
export const adminLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  prefix: 'rl:admin',
});

export function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  return fwd ? fwd.split(',')[0].trim() : '127.0.0.1';
}
