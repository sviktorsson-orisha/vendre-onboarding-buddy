import { createFileRoute } from "@tanstack/react-router";

/**
 * Same-origin image proxy for store assets (logo, product images).
 *
 * The browser never sees the store hostname, and the response carries a long
 * cache lifetime because these assets rarely change.
 */

const CACHE_CONTROL = "public, max-age=86400, stale-while-revalidate=604800";

async function proxyImage({ request, params }: { request: Request; params: { _splat?: string } }) {
  const { isBrowserSameOrigin, rateLimit, tooManyRequests, forbidden } = await import(
    "@/lib/vendre/request-guard.server"
  );

  if (!isBrowserSameOrigin(request)) return forbidden();
  if (!rateLimit(request, "image", 1200, 60_000)) return tooManyRequests();

  const { readVendreEnv } = await import("@/lib/vendre/token.server");
  const { missing, baseUrl } = readVendreEnv();
  if (missing.length || !baseUrl) return new Response("Not configured", { status: 400 });

  const incoming = new URL(request.url);
  const path = (params._splat ?? "").replace(/^\/+/, "");
  if (!path || path.includes("..")) return new Response("Not found", { status: 404 });

  const target = `${baseUrl.replace(/\/+$/, "")}/${path}${incoming.search}`;

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      headers: { accept: request.headers.get("accept") ?? "image/*" },
      redirect: "follow",
    });
  } catch {
    return new Response("Upstream unreachable", { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  if (!upstream.ok || !contentType.startsWith("image/")) {
    return new Response("Not found", { status: upstream.ok ? 415 : upstream.status });
  }

  const headers = new Headers({ "content-type": contentType, "cache-control": CACHE_CONTROL });
  const length = upstream.headers.get("content-length");
  if (length) headers.set("content-length", length);

  return new Response(upstream.body, { status: 200, headers });
}

export const Route = createFileRoute("/api/vendre/image/$")({
  server: {
    handlers: {
      GET: proxyImage,
      HEAD: proxyImage,
    },
  },
});
