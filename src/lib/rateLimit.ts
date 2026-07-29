/**
 * Minimal fixed-window rate limiter.
 *
 * In-memory, so on a serverless deployment each instance keeps its own counters
 * and the effective limit is (limit x instances). That is a real limitation —
 * it is a guardrail against a single caller hammering an endpoint, not a
 * defence against a distributed attack. If this ever needs to be exact, move
 * the counter to Redis/Upstash; the call sites won't change.
 *
 * The map is capped so it cannot grow without bound under a flood of unique
 * keys (which would itself be a memory-exhaustion vector).
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 10_000;

function sweep(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  // Still too big after dropping expired entries: evict oldest-inserted.
  if (buckets.size > MAX_TRACKED_KEYS) {
    const excess = buckets.size - MAX_TRACKED_KEYS;
    let i = 0;
    for (const key of buckets.keys()) {
      buckets.delete(key);
      if (++i >= excess) break;
    }
  }
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  /** Seconds until the window resets. Suitable for a Retry-After header. */
  retryAfter: number;
}

/**
 * @param key    Caller identity — user id where available, else client IP.
 * @param limit  Requests allowed per window.
 * @param windowMs Window length in milliseconds.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  if (buckets.size > MAX_TRACKED_KEYS) sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  bucket.count += 1;
  const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
  return {
    ok: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
    retryAfter,
  };
}

/**
 * Best-effort client identity for anonymous endpoints. Vercel sets
 * x-forwarded-for; the first entry is the client.
 */
export function clientKey(req: Request, prefix: string): string {
  const fwd = req.headers.get('x-forwarded-for') ?? '';
  const ip = fwd.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  return `${prefix}:${ip}`;
}

/** 429 response with the standard headers. */
export function tooManyRequests(result: RateLimitResult): Response {
  return new Response(JSON.stringify({ error: 'Too many requests' }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': String(result.retryAfter),
    },
  });
}
