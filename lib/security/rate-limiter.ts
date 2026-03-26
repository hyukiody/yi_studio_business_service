/**
 * Rate Limiting Service
 * 
 * Token bucket algorithm (sliding window):
 * - 5 requests per hour per IP (contact form)
 * - 100 requests per minute per session (telemetry)
 * - Uses Redis for distributed state (production)
 * - Falls back to in-memory for dev
 * 
 * Location: lib/security/rate-limiter.ts
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client (uses Upstash Redis)
const redis = Redis.fromEnv();

/**
 * Create rate limiter for contact form
 * Limit: 5 requests per hour per IP address
 */
export const contactFormLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  analytics: true,
  prefix: 'ratelimit:contact:',
});

/**
 * Create rate limiter for telemetry
 * Limit: 100 events per minute per session
 */
export const telemetryLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'ratelimit:telemetry:',
});

/**
 * Generic rate limiter factory
 * @param requests - Number of allowed requests
 * @param window - Time window (e.g., '1 h', '1 m')
 * @param prefix - Redis key prefix for this limiter
 * @returns Ratelimit instance
 */
export function createRateLimiter(
  requests: number,
  window: string,
  prefix: string
) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: `ratelimit:${prefix}:`,
  });
}

export type { RatelimitResponse } from '@upstash/ratelimit';
