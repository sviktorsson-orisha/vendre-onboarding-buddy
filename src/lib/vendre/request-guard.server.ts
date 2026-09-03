/**
 * Small server-side guards for the public /api/vendre/* endpoints.
 *
 * These endpoints are reachable by anyone on the published site, so they need
 * a cheap first line of defence:
 *  - isBrowserSameOrigin(): the request actually came from a page on this site
 *    (curl / bots send neither Sec-Fetch-Site, Origin nor a matching Referer).
 *  - rateLimit(): best-effort per-IP throttling within one server instance.
 */

export function isBrowserSameOrigin(request: Request): boolean {
  const selfOrigin = new URL(request.url).origin;

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite) return fetchSite === "same-origin" || fetchSite === "none";

  const origin = request.headers.get("origin");
  if (origin) return origin === selfOrigin;

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin === selfOrigin;
    } catch {
      return false;
    }
  }

  return false;
}

type Bucket = { count: number; resetAt: number };
const g = globalThis as typeof globalThis & { __vendreRateLimit?: Map<string, Bucket> };
const buckets = (g.__vendreRateLimit ??= new Map<string, Bucket>());

function clientKey(request: Request, scope: string): string {
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  return `${scope}:${ip}`;
}

/** Returns true when the request is allowed. */
export function rateLimit(
  request: Request,
  scope: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const key = clientKey(request, scope);
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 5_000) {
      for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
    }
    return true;
  }

  bucket.count += 1;
  return bucket.count <= limit;
}

export function tooManyRequests(retryAfterSeconds = 60): Response {
  return Response.json(
    { error: "rate_limited" },
    {
      status: 429,
      headers: { "cache-control": "no-store", "retry-after": String(retryAfterSeconds) },
    },
  );
}

export function forbidden(): Response {
  return Response.json(
    { error: "forbidden" },
    { status: 403, headers: { "cache-control": "no-store" } },
  );
}
