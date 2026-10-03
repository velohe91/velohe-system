/**
 * Per-IP guard for NODE. Checked before the model call so a blocked
 * visitor does not spend API credits.
 *
 * Memory is per server instance. On Vercel that still stops bursts on a
 * warm instance; it is not a global counter across every region.
 */

type Bucket = {
  stamps: number[];
};

const buckets = new Map<string, Bucket>();
const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_MS = 15 * 60 * 1000;
const COOLDOWN_MS = 8 * 1000;
const WINDOW_LIMIT = 8;
const DAY_LIMIT = 30;

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first.slice(0, 80);
  return request.headers.get("x-real-ip")?.slice(0, 80) || "unknown";
}

export function consumeGuideAttempt(request: Request):
  | { ok: true }
  | { ok: false; error: string; retryAfter: number } {
  const now = Date.now();
  const ip = clientIp(request);
  const bucket = buckets.get(ip) ?? { stamps: [] };
  bucket.stamps = bucket.stamps.filter((stamp) => now - stamp < DAY_MS);

  const last = bucket.stamps[bucket.stamps.length - 1] ?? 0;
  const sinceLast = now - last;
  if (last && sinceLast < COOLDOWN_MS) {
    const retryAfter = Math.ceil((COOLDOWN_MS - sinceLast) / 1000);
    return {
      ok: false,
      retryAfter,
      error: `NODE is cooling down. Wait ${retryAfter}s.`,
    };
  }

  const inWindow = bucket.stamps.filter((stamp) => now - stamp < WINDOW_MS).length;
  if (inWindow >= WINDOW_LIMIT) {
    return {
      ok: false,
      retryAfter: 60,
      error: "This connection reached the 15-minute NODE limit. Try again shortly.",
    };
  }

  if (bucket.stamps.length >= DAY_LIMIT) {
    return {
      ok: false,
      retryAfter: 3600,
      error: "This connection reached the daily NODE limit.",
    };
  }

  bucket.stamps.push(now);
  buckets.set(ip, bucket);

  if (buckets.size > 5000) {
    for (const [key, value] of buckets) {
      if (value.stamps.every((stamp) => now - stamp >= DAY_MS)) buckets.delete(key);
    }
  }

  return { ok: true };
}
