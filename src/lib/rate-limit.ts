/**
 * Token-bucket rate limiter — in-memory.
 *
 * Trade-off: cheap and zero-dep, but only correct on a single instance.
 * For Vercel multi-region or multi-instance production switch to
 * `@upstash/ratelimit` + Redis. The API of `consume()` stays the same so
 * the call sites won't change.
 *
 * Survives the proxy edge runtime because Node's `Map` is in module scope
 * and Vercel keeps the module warm for the lifetime of a single instance.
 */

type Bucket = {
  tokens: number;
  lastRefillMs: number;
};

const buckets = new Map<string, Bucket>();

// Garbage-collect stale entries periodically — prevents the map from
// growing forever under sustained traffic.
const GC_INTERVAL_MS = 5 * 60_000;
let lastGcMs = 0;

export interface RateLimitConfig {
  /** Number of requests allowed within `windowMs`. */
  capacity: number;
  /** Time window in ms for the capacity. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function consume(key: string, cfg: RateLimitConfig): RateLimitResult {
  // Cheap periodic GC.
  const now = Date.now();
  if (now - lastGcMs > GC_INTERVAL_MS) {
    lastGcMs = now;
    const cutoff = now - 2 * cfg.windowMs;
    for (const [k, v] of buckets) {
      if (v.lastRefillMs < cutoff) buckets.delete(k);
    }
  }

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: cfg.capacity, lastRefillMs: now };
    buckets.set(key, bucket);
  }

  // Refill — linear (tokens per millisecond × elapsed).
  const refill = ((now - bucket.lastRefillMs) / cfg.windowMs) * cfg.capacity;
  if (refill > 0) {
    bucket.tokens = Math.min(cfg.capacity, bucket.tokens + refill);
    bucket.lastRefillMs = now;
  }

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      retryAfterSeconds: 0,
    };
  }

  // Compute when the next token will be available.
  const msPerToken = cfg.windowMs / cfg.capacity;
  const retryAfterMs = Math.ceil((1 - bucket.tokens) * msPerToken);

  return {
    allowed: false,
    remaining: 0,
    retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
  };
}

/** Extract a stable identifier for the caller — IP if available, else "anon". */
export function ipFromRequest(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "anon"
  );
}
