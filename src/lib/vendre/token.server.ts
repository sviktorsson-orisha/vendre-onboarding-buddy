/**
 * Server-only OAuth token handling for Vendre Surface v2.
 *
 * client_secret never leaves the server. The token is cached on globalThis so
 * HMR and separate route bundles share one token instead of minting per request.
 */

export type TokenState = { accessToken: string; expiresAt: number; baseUrl: string };

type TokenCache = {
  state: TokenState | null;
  inflight: Promise<TokenState> | null;
  cooldownUntil: number;
};

const g = globalThis as typeof globalThis & { __vendreToken?: TokenCache };
const cache = (g.__vendreToken ??= { state: null, inflight: null, cooldownUntil: 0 });

export function readVendreEnv() {
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

export class TokenError extends Error {
  constructor(
    public status: number,
    message: string,
    public retryAfter?: string | null,
  ) {
    super(message);
    this.name = "TokenError";
  }
}

async function mintToken(): Promise<TokenState> {
  const { baseUrl, clientId, clientSecret } = readVendreEnv();

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

export async function getVendreServerToken(): Promise<TokenState> {
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

export type VendreStatus = {
  /** true only when credentials exist AND the store accepts them. */
  ok: boolean;
  secretsOk: boolean;
  tokenOk: boolean;
  missing: string[];
  baseUrl: string;
  message?: string;
};

type StatusCache = { value: VendreStatus | null; checkedAt: number; inflight: Promise<VendreStatus> | null };
const sg = globalThis as typeof globalThis & { __vendreStatus?: StatusCache };
const statusCache = (sg.__vendreStatus ??= { value: null, checkedAt: 0, inflight: null });

const STATUS_TTL = 60_000;

async function probeStatus(): Promise<VendreStatus> {
  const { missing, baseUrl } = readVendreEnv();
  if (missing.length) {
    return { ok: false, secretsOk: false, tokenOk: false, missing, baseUrl };
  }

  try {
    await getVendreServerToken();
    return { ok: true, secretsOk: true, tokenOk: true, missing: [], baseUrl };
  } catch (error) {
    return {
      ok: false,
      secretsOk: true,
      tokenOk: false,
      missing: [],
      baseUrl,
      message: (error as Error).message,
    };
  }
}

/** Cached (~60s) answer to "is this storefront connected to a Vendre store?". */
export async function getVendreStatus(force = false): Promise<VendreStatus> {
  const now = Date.now();
  if (!force && statusCache.value && now - statusCache.checkedAt < STATUS_TTL) return statusCache.value;
  if (statusCache.inflight) return statusCache.inflight;

  statusCache.inflight = probeStatus()
    .then((value) => {
      statusCache.value = value;
      statusCache.checkedAt = Date.now();
      return value;
    })
    .finally(() => {
      statusCache.inflight = null;
    });

  return statusCache.inflight;
}
