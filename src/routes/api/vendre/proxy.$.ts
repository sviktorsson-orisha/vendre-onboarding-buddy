import { createFileRoute } from "@tanstack/react-router";

/**
 * Same-origin fallback proxy for Surface v2.
 *
 * The browser calls the store directly whenever the origin is allowlisted in
 * Vendre Admin. Preview origins usually are not, so the client silently retries
 * through here instead of surfacing a CORS error. The bearer token is minted
 * server-side; the store session cookie is forwarded both ways and rewritten to
 * `Secure; SameSite=None; Partitioned` so it survives the preview iframe.
 */

const HOP_BY_HOP = new Set([
  "host",
  "connection",
  "content-length",
  "accept-encoding",
  "origin",
  "referer",
]);

function rewriteCookie(value: string) {
  const withoutSameSite = value.replace(/;\s*SameSite=[^;]*/gi, "").replace(/;\s*Partitioned/gi, "");
  const withSecure = /;\s*Secure/i.test(withoutSameSite) ? withoutSameSite : `${withoutSameSite}; Secure`;
  return `${withSecure}; SameSite=None; Partitioned`;
}

async function handle({ request, params }: { request: Request; params: { _splat?: string } }) {
  const tokenRes = await fetch(new URL("/api/vendre/token", request.url), {
    headers: { accept: "application/json" },
  });
  const token = (await tokenRes.json().catch(() => ({}))) as {
    access_token?: string;
    base_url?: string;
  };
  if (!tokenRes.ok || !token.access_token || !token.base_url) {
    return Response.json({ error: "token_failed" }, { status: tokenRes.status || 502 });
  }

  const incoming = new URL(request.url);
  const path = (params._splat ?? "").replace(/^\/+/, "");
  const target = `${token.base_url.replace(/\/+$/, "")}/surface/2/${path}${incoming.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) headers.set(key, value);
  });
  headers.set("Authorization", `Bearer ${token.access_token}`);
  headers.set("Accept", "application/json");

  const method = request.method.toUpperCase();
  const upstream = await fetch(target, {
    method,
    headers,
    body: method === "GET" || method === "HEAD" ? undefined : await request.text(),
    redirect: "manual",
  });

  const outHeaders = new Headers();
  outHeaders.set("content-type", upstream.headers.get("content-type") ?? "application/json");
  outHeaders.set("cache-control", "no-store");
  const setCookie = upstream.headers.getSetCookie?.() ?? [];
  for (const cookie of setCookie) outHeaders.append("set-cookie", rewriteCookie(cookie));

  return new Response(await upstream.text(), { status: upstream.status, headers: outHeaders });
}

export const Route = createFileRoute("/api/vendre/proxy/$")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
      PUT: handle,
      PATCH: handle,
      DELETE: handle,
    },
  },
});
