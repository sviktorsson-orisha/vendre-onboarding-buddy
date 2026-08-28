import { createServerFn } from "@tanstack/react-start";
import { getCookie, setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";

const callSchema = z.object({
  path: z.string().startsWith("/surface/2/"),
  method: z.enum(["GET", "POST", "PUT", "DELETE"]).optional(),
  body: z.unknown().optional(),
  /** Legacy fallback only — the HttpOnly request cookie always wins. */
  cookie: z.string().optional(),
  mutationToken: z.string().optional(),
});

export type VendreCallInput = z.infer<typeof callSchema>;

const SESSION_COOKIE = "vendre_sid";
const MAX_AGE = 60 * 60 * 24 * 30;

/**
 * The Vendre session lives on their domain, so it must be mirrored into a
 * first-party cookie owned by the server. It is written as
 * HttpOnly/Secure/SameSite=None/Partitioned so it survives page reloads inside
 * the preview iframe, where a script-written SameSite=Lax cookie is dropped.
 */
function readSessionCookie(fallback?: string): string | undefined {
  try {
    const raw = getCookie(SESSION_COOKIE);
    if (raw) return decodeURIComponent(raw);
  } catch {
    // no request context (shouldn't happen inside a handler)
  }
  return fallback;
}

function writeSessionCookie(cookie: string | undefined) {
  if (!cookie) return;
  try {
    setResponseHeader(
      "set-cookie",
      `${SESSION_COOKIE}=${encodeURIComponent(cookie)}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=None; Partitioned`,
    );
  } catch {
    // ignore — the in-memory session still works for this page view
  }
}

export const vendreCall = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => callSchema.parse(data))
  .handler(async ({ data }) => {
    const { surfaceRequest } = await import("./vendre.server");
    const incoming = readSessionCookie(data.cookie);
    const res = await surfaceRequest({
      path: data.path,
      method: data.method,
      body: data.body,
      cookie: incoming,
      mutationToken: data.mutationToken,
    });
    // Only session/bootstrap may establish a session. Otherwise a call that
    // races the bootstrap (menus, cart, context) would receive its own fresh
    // visitorid from the store and overwrite the real session cookie.
    if (incoming) writeSessionCookie(res.cookie);
    return res;
  });

export const vendreBootstrap = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ cookie: z.string().optional() }).parse(data ?? {}),
  )
  .handler(async ({ data }) => {
    const { surfaceRequest } = await import("./vendre.server");
    const res = await surfaceRequest({
      path: "/surface/2/session/bootstrap",
      method: "POST",
      cookie: readSessionCookie(data.cookie),
    });
    writeSessionCookie(res.cookie);
    return res;
  });

