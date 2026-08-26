import { createFileRoute } from "@tanstack/react-router";

type TokenState = { accessToken: string; expiresAt: number; baseUrl: string };
type TokenCache = {
  state: TokenState | null;
  inflight: Promise<TokenState> | null;
  cooldownUntil: number;
};

const g = globalThis as typeof globalThis & { __vendreToken?: TokenCache };
const cache = (g.__vendreToken ??= { state: null, inflight: null, cooldownUntil: 0 });

function readEnv() {
  const baseUrl = (process.env["VENDRE_BASE_URL"] ?? "").replace(/\/+$/, "");
  const clientId = process.env["VENDRE_CLIENT_ID"] ?? "";
  const clientSecret = process.env["VENDRE_CLIENT_SECRET"] ?? "";
  const missing = [
    !baseUrl && "VENDRE_BASE_URL",
    !clientId && "VENDRE_CLIENT_ID",
    !clientSecret && "VENDRE_CLIENT_SECRET",
  ].filter(Boolean) as string[];
  return { baseUrl, clientId, clientSecret, missing };
}

class TokenError extends Error {
  constructor(
    public status: number,
    message: string,
    public retryAfter?: string | null,
  ) {
    super(message);
  }
}

async function mintToken(): Promise<TokenState> {
  const { baseUrl, clientId, clientSecret } = readEnv();

  const res = await fetch(`${baseUrl}/surface/2/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });

  if (res.status === 429) {
    cache.cooldownUntil = Date.now() + 60_000;
    throw new TokenError(429, "Vendre rate limit (429) on oauth/token", res.headers.get("retry-after"));
  }
  if (!res.ok) {
    const body = await res.text();
    throw new TokenError(res.status, body.slice(0, 400) || `oauth/token failed (${res.status})`);
  }

  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) throw new TokenError(502, "oauth/token response missing access_token");

  return {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 - 60_000,
    baseUrl,
  };
}

async function getToken(): Promise<TokenState> {
  const now = Date.now();
  if (cache.state && cache.state.expiresAt > now) return cache.state;
  if (cache.state && now < cache.cooldownUntil) return cache.state;
  if (cache.inflight) return cache.inflight;

  cache.inflight = mintToken()
    .then((state) => {
      cache.state = state;
      return state;
    })
    .finally(() => {
      cache.inflight = null;
    });

  return cache.inflight;
}

export const Route = createFileRoute("/api/vendre/token")({
  server: {
    handlers: {
      GET: async () => {
        const { missing, baseUrl } = readEnv();
        if (missing.length) {
          return Response.json(
            { error: "missing_credentials", missing },
            { status: 400, headers: { "cache-control": "no-store" } },
          );
        }

        try {
          const state = await getToken();
          return Response.json(
            { access_token: state.accessToken, base_url: baseUrl, expires_at: state.expiresAt },
            { headers: { "cache-control": "no-store" } },
          );
        } catch (error) {
          const status = error instanceof TokenError ? error.status : 502;
          const headers: Record<string, string> = { "cache-control": "no-store" };
          if (error instanceof TokenError && error.retryAfter) headers["retry-after"] = error.retryAfter;
          return Response.json(
            { error: "token_failed", status, message: (error as Error).message },
            { status, headers },
          );
        }
      },
    },
  },
});
