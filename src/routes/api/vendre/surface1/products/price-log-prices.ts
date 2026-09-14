import { createFileRoute } from "@tanstack/react-router";

/**
 * The ONLY Surface v1 endpoint this template proxies: logged prices
 * (price history). Everything else goes through /api/vendre/surface/* (v2).
 *
 * v1 needs no OAuth bearer token, only the store session cookie — which is the
 * same `visitorid` cookie session/bootstrap (v2) established for this visitor.
 */

const FORWARD_RESPONSE_HEADERS = [
  "content-type",
  "ratelimit-limit",
  "ratelimit-remaining",
  "ratelimit-reset",
  "retry-after",
];

function rewriteSetCookie(raw: string, secure: boolean): string {
  const parts = raw.split(";").map((p) => p.trim());
  const [pair, ...attrs] = parts;
  const kept: string[] = [];

  for (const attr of attrs) {
    const name = attr.split("=")[0]?.toLowerCase();
    if (name === "domain" || name === "samesite" || name === "secure" || name === "path") continue;
    kept.push(attr);
  }

  kept.push("Path=/");
  if (secure) {
    kept.push("SameSite=None");
    kept.push("Partitioned");
    kept.push("Secure");
  } else {
    kept.push("SameSite=Lax");
  }

  return [pair, ...kept].join("; ");
}

async function handler({ request }: { request: Request }) {
  const { isBrowserSameOrigin, rateLimit, tooManyRequests, forbidden } = await import(
    "@/lib/vendre/request-guard.server"
  );

  if (!isBrowserSameOrigin(request)) return forbidden();
  if (!rateLimit(request, "surface1-price-log", 120, 60_000)) return tooManyRequests();

  const { readVendreEnv } = await import("@/lib/vendre/token.server");
  const { missing, baseUrl } = readVendreEnv();
  if (missing.length) {
    return Response.json(
      { errors: [{ code: "missing_credentials", title: "The store is not configured." }] },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }

  const incoming = new URL(request.url);
  const target = `${baseUrl}/surface/1/products/price-log-prices${incoming.search}`;

  const headers = new Headers();
  headers.set("accept", "application/json");
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) headers.set("accept-language", acceptLanguage);
  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);
  // No Authorization header: Surface v1 never uses the OAuth bearer.

  let upstream: Response;
  try {
    upstream = await fetch(target, { method: "GET", headers, redirect: "manual" });
  } catch {
    return Response.json(
      { errors: [{ code: "upstream_unreachable", title: "The store is not responding." }] },
      { status: 502, headers: { "cache-control": "no-store" } },
    );
  }

  const outHeaders = new Headers();
  for (const name of FORWARD_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) outHeaders.set(name, value);
  }
  // Session dependent — never cached.
  outHeaders.set("cache-control", "no-store");

  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const secure = forwardedProto ? forwardedProto === "https" : incoming.protocol === "https:";

  const setCookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : ((upstream.headers.get("set-cookie")
          ? [upstream.headers.get("set-cookie")!]
          : []) as string[]);
  for (const raw of setCookies) outHeaders.append("set-cookie", rewriteSetCookie(raw, secure));

  return new Response(upstream.body, { status: upstream.status, headers: outHeaders });
}

export const Route = createFileRoute("/api/vendre/surface1/products/price-log-prices")({
  server: { handlers: { GET: handler } },
});
