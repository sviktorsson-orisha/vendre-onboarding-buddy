/**
 * Server-only Vendre Surface API v2 helpers.
 * client_secret never leaves this module (server runtime only).
 */

type TokenState = {
  accessToken: string;
  refreshToken?: string | undefined;
  expiresAt: number;
};

let tokenState: TokenState | null = null;

function config() {
  const baseUrl = process.env["VENDRE_BASE_URL"];
  const clientId = process.env["VENDRE_CLIENT_ID"];
  const clientSecret = process.env["VENDRE_CLIENT_SECRET"];
  if (!baseUrl) throw new Error("VENDRE_BASE_URL is not configured");
  if (!clientId) throw new Error("VENDRE_CLIENT_ID is not configured");
  if (!clientSecret) throw new Error("VENDRE_CLIENT_SECRET is not configured");
  return { baseUrl: baseUrl.replace(/\/+$/, ""), clientId, clientSecret };
}

async function requestToken(form: Record<string, string>): Promise<TokenState> {
  const { baseUrl, clientId, clientSecret } = config();
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    ...form,
  });

  const res = await fetch(`${baseUrl}/surface/2/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Vendre OAuth failed [${res.status}]: ${text}`);
  }
  const json = JSON.parse(text) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    // renew 60s before actual expiry
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000 - 60_000,
  };
}

export function storeOrigin(): string {
  return new URL(config().baseUrl).origin;
}

export async function getAccessToken(forceNew = false): Promise<string> {
  if (!forceNew && tokenState && tokenState.expiresAt > Date.now()) {
    return tokenState.accessToken;
  }
  if (!forceNew && tokenState?.refreshToken) {
    try {
      tokenState = await requestToken({
        grant_type: "refresh_token",
        refresh_token: tokenState.refreshToken,
      });
      return tokenState.accessToken;
    } catch {
      // fall through to a fresh client_credentials grant
    }
  }
  tokenState = await requestToken({ grant_type: "client_credentials" });
  return tokenState.accessToken;
}

export type SurfaceCall = {
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | undefined;
  body?: unknown;
  /** Per-user session cookie jar, serialized as a Cookie header value. */
  cookie?: string | undefined;
  mutationToken?: string | undefined;
};

export type SurfaceResult<T = any> = {
  status: number;
  data: T;
  /** Updated cookie jar to hand back to the caller. */
  cookie?: string | undefined;
};

function mergeCookies(existing: string | undefined, setCookies: string[]) {
  const jar = new Map<string, string>();
  for (const pair of (existing ?? "").split(";")) {
    const [name, ...rest] = pair.trim().split("=");
    if (name && rest.length) jar.set(name, rest.join("="));
  }
  for (const raw of setCookies) {
    const pair = raw.split(";")[0] ?? "";
    const [name, ...rest] = pair.trim().split("=");
    if (name && rest.length) jar.set(name, rest.join("="));
  }
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

const RETRYABLE = new Set([429, 502, 503, 504]);

export async function surfaceRequest<T = any>(
  call: SurfaceCall,
): Promise<SurfaceResult<T>> {
  const { baseUrl } = config();
  const method = call.method ?? "GET";
  const path = call.path.startsWith("/") ? call.path : `/${call.path}`;
  if (!path.startsWith("/surface/2/")) {
    throw new Error(`Unsupported Vendre path: ${path}`);
  }

  let attempt = 0;
  let retriedAuth = false;

  for (;;) {
    const token = await getAccessToken(retriedAuth);
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };
    if (call.cookie) headers["Cookie"] = call.cookie;
    if (call.mutationToken) {
      headers["Surface-Mutation-Protection-Token"] = call.mutationToken;
    }
    if (call.body !== undefined) headers["Content-Type"] = "application/json";

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      ...(call.body === undefined ? {} : { body: JSON.stringify(call.body) }),
    });

    if (RETRYABLE.has(res.status) && attempt < 3) {
      const retryAfter = Number(res.headers.get("Retry-After"));
      const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : 2 ** attempt * 400;
      attempt += 1;
      await new Promise((r) => setTimeout(r, Math.min(waitMs, 5000)));
      continue;
    }

    const setCookies =
      typeof (res.headers as unknown as { getSetCookie?: () => string[] })
        .getSetCookie === "function"
        ? (res.headers as unknown as { getSetCookie: () => string[] }).getSetCookie()
        : res.headers.get("set-cookie")
          ? [res.headers.get("set-cookie") as string]
          : [];

    const text = await res.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (res.status === 401) {
      // "Customer is not authenticated" is an expected anonymous-session state,
      // not a proxy/OAuth failure — return it softly so the UI can react.
      const isCustomerUnauthenticated = text.includes("SURFACE_SESSION_UNAUTHORIZED");
      if (!isCustomerUnauthenticated && !retriedAuth) {
        retriedAuth = true;
        continue;
      }
      if (isCustomerUnauthenticated) {
        return {
          status: 401,
          data: data as T,
          cookie: setCookies.length ? mergeCookies(call.cookie, setCookies) : call.cookie,
        };
      }
    }

    if (!res.ok) {
      console.error(`Vendre ${method} ${path} failed [${res.status}]: ${text}`);
      // Client errors (validation, conflicts, ...) are expected API states:
      // return them softly so the UI can show the message instead of crashing.
      if (res.status >= 400 && res.status < 500) {
        return {
          status: res.status,
          data: data as T,
          cookie: setCookies.length ? mergeCookies(call.cookie, setCookies) : call.cookie,
        };
      }
      throw new Error(`Vendre request failed [${res.status}]: ${text}`);
    }



    return {
      status: res.status,
      data: data as T,
      cookie: setCookies.length ? mergeCookies(call.cookie, setCookies) : call.cookie,
    };
  }
}
