/**
 * Minimal Vendre Surface v2 browser client.
 *
 * Rules (from .vendre/knowledge/general.md):
 * - client_secret never reaches the browser: only /oauth/token runs server-side.
 * - Everything else is called directly from the browser with credentials: "include".
 * - The mutation protection token lives in a module variable, never localStorage.
 */

export type VendreToken = { accessToken: string; baseUrl: string; expiresAt: number };

let tokenState: VendreToken | null = null;
let tokenInflight: Promise<VendreToken> | null = null;
let mutationProtectionToken: string | null = null;

export class VendreError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public missing: string[] = [],
  ) {
    super(message);
    this.name = "VendreError";
  }
}

export function getMutationProtectionToken() {
  return mutationProtectionToken;
}

export function setMutationProtectionToken(token: string | null) {
  mutationProtectionToken = token;
}

export function resetVendreClient() {
  tokenState = null;
  tokenInflight = null;
  mutationProtectionToken = null;
}

async function fetchToken(): Promise<VendreToken> {
  const res = await fetch("/api/vendre/token", { headers: { accept: "application/json" } });
  const data = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    base_url?: string;
    expires_at?: number;
    error?: string;
    message?: string;
    missing?: string[];
  };

  if (!res.ok || !data.access_token || !data.base_url) {
    throw new VendreError(
      data.message ?? data.error ?? `Kunde inte hämta OAuth-token (${res.status})`,
      res.status,
      data.error,
      data.missing ?? [],
    );
  }

  return {
    accessToken: data.access_token,
    baseUrl: data.base_url.replace(/\/+$/, ""),
    expiresAt: data.expires_at ?? Date.now() + 3_000_000,
  };
}

export async function getVendreToken(force = false): Promise<VendreToken> {
  if (!force && tokenState && tokenState.expiresAt > Date.now()) return tokenState;
  if (tokenInflight) return tokenInflight;

  tokenInflight = fetchToken()
    .then((state) => {
      tokenState = state;
      return state;
    })
    .finally(() => {
      tokenInflight = null;
    });

  return tokenInflight;
}

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Calls a Surface v2 endpoint directly from the browser. `path` is relative to /surface/2/. */
export async function surfaceFetch(
  path: string,
  init: RequestInit & { method?: string } = {},
): Promise<Response> {
  const { accessToken, baseUrl } = await getVendreToken();
  const method = (init.method ?? "GET").toUpperCase();

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  headers.set("Accept", "application/json");

  // Mutating calls — plus the documented GET exception — carry the protection token.
  const needsProtection = MUTATING.has(method) || path.startsWith("accounts/me/forgot-password");
  if (needsProtection && mutationProtectionToken) {
    headers.set("Surface-Mutation-Protection-Token", mutationProtectionToken);
  }

  return fetch(`${baseUrl}/surface/2/${path.replace(/^\/+/, "")}`, {
    ...init,
    method,
    headers,
    mode: "cors",
    credentials: "include",
  });
}

export async function surfaceJson<T = unknown>(
  path: string,
  init?: RequestInit & { method?: string },
): Promise<T> {
  const res = await surfaceFetch(path, init);
  const body = (await res.json().catch(() => null)) as
    | (T & { errors?: { code?: string; title?: string; status?: string }[] })
    | null;

  if (!res.ok) {
    const first = body?.errors?.[0];
    throw new VendreError(first?.title ?? `Surface-anrop misslyckades (${res.status})`, res.status, first?.code);
  }

  return body as T;
}
