const buckets = new Map<string, { count: number; resetAt: number }>();

const MAX_BUCKETS = 5000;
const SWEEP_INTERVAL_MS = 60_000;
let lastSweep = Date.now();

function sweepExpiredBuckets(now = Date.now()) {
  if (now - lastSweep < SWEEP_INTERVAL_MS && buckets.size < MAX_BUCKETS) return;
  lastSweep = now;

  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }

  if (buckets.size > MAX_BUCKETS) {
    const overflow = buckets.size - MAX_BUCKETS;
    const keys = buckets.keys();
    for (let i = 0; i < overflow; i += 1) {
      const next = keys.next();
      if (next.done) break;
      buckets.delete(next.value);
    }
  }
}

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  sweepExpiredBuckets(now);

  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}

export function getClientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}
