import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { vendreBootstrap, vendreCall } from "./vendre.functions";

type SurfaceResponse<T> = { status: number; data: T; cookie?: string };

type SessionState = {
  ready: boolean;
  error: string | null;
  /** Session context returned by session/bootstrap. */
  session: Record<string, unknown> | null;
};

type VendreContextValue = SessionState & {
  request: <T = unknown>(input: {
    path: string;
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
  }) => Promise<T>;
  /** Re-runs session/bootstrap (keeps the same session) and refreshes the token. */
  refreshSession: () => Promise<Record<string, unknown> | null>;
};


const VendreContext = createContext<VendreContextValue | null>(null);

/** Thrown when the Vendre session has no authenticated customer. */
export class VendreUnauthorizedError extends Error {
  constructor() {
    super("Customer is not authenticated.");
    this.name = "VendreUnauthorizedError";
  }
}

/** Thrown for expected 4xx API responses (validation errors etc.). */
export class VendreApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "VendreApiError";
  }
}

function apiErrorMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const errors = (payload as { errors?: unknown }).errors;
  if (!Array.isArray(errors) || errors.length === 0) return undefined;
  const first = errors[0] as { title?: string; detail?: string };
  return first?.detail ?? first?.title;
}


function extractMutationToken(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const obj = payload as Record<string, unknown>;
  const direct =
    obj["surface_mutation_protection_token"] ??
    obj["mutationProtectionToken"] ??
    (obj["data"] as Record<string, unknown> | undefined)?.[
      "surface_mutation_protection_token"
    ] ??
    (obj["data"] as Record<string, unknown> | undefined)?.["mutationProtectionToken"];
  return typeof direct === "string" ? direct : undefined;
}

/* ------------------------------------------------------------------ */
/* Direct-to-store transport                                           */
/*                                                                     */
/* When the store CORS-allowlists this origin, the browser talks to the */
/* store domain itself with `credentials: "include"`. The Vendre        */
/* session cookie then lives in the visitor's own cookie jar, which is  */
/* what keeps a signed-in customer signed in across reloads. If the     */
/* origin is not allowlisted the call fails at the network layer and we */
/* fall back to the server proxy (session mirrored server-side).        */
/* ------------------------------------------------------------------ */

type BearerInfo = { token: string; origin: string };

let bearer: BearerInfo | null = null;
let bearerPromise: Promise<BearerInfo | null> | null = null;
/** null = unknown, true = direct works, false = must use the server proxy. */
let directMode: boolean | null = null;

async function getBearer(force = false): Promise<BearerInfo | null> {
  if (!force && bearer) return bearer;
  if (!bearerPromise) {
    bearerPromise = fetch("/api/vendre/token", { headers: { Accept: "application/json" } })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = (await res.json()) as { access_token?: string; base_url?: string };
        if (!data.access_token || !data.base_url) return null;
        bearer = { token: data.access_token, origin: data.base_url.replace(/\/+$/, "") };
        return bearer;
      })
      .catch(() => null)
      .finally(() => {
        bearerPromise = null;
      });
  }
  return bearerPromise;
}

async function directRequest(input: {
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  mutationToken?: string | undefined;
}): Promise<{ status: number; data: unknown } | null> {
  if (typeof window === "undefined" || directMode === false) return null;
  const info = await getBearer();
  if (!info) return null;

  const method = input.method ?? "GET";
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${info.token}`,
  };
  if (input.body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET" && input.mutationToken) {
    headers["Surface-Mutation-Protection-Token"] = input.mutationToken;
  }

  let res: Response;
  try {
    res = await fetch(`${info.origin}${input.path}`, {
      method,
      headers,
      credentials: "include",
      mode: "cors",
      ...(input.body === undefined ? {} : { body: JSON.stringify(input.body) }),
    });
  } catch {
    // CORS / network failure — this origin isn't allowlisted on the store.
    directMode = false;
    return null;
  }

  // Expired app bearer: mint a new one once and retry.
  if (res.status === 401 && !bearerRetried) {
    const text = await res.clone().text();
    if (!/SURFACE_(SESSION_UNAUTHORIZED|CUSTOMER_LOGIN)/.test(text)) {
      bearerRetried = true;
      await getBearer(true);
      const retry = await directRequest(input);
      bearerRetried = false;
      if (retry) return retry;
    }
  }

  directMode = true;
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  return { status: res.status, data };
}

let bearerRetried = false;

const LEGACY_COOKIE_KEY = "vendre.session.cookie";

/**
 * The Vendre session id is now owned by the server (HttpOnly first-party
 * cookie set by the server functions), so the browser must not keep a copy.
 * Clear the values written by the previous implementation once.
 */
function clearLegacySessionStorage() {
  if (typeof document === "undefined") return;
  document.cookie = `${LEGACY_COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`;
  try {
    window.localStorage.removeItem(LEGACY_COOKIE_KEY);
  } catch {
    // storage unavailable — nothing to clean up
  }
}

export function VendreProvider({ children }: { children: ReactNode }) {
  const bootstrap = useServerFn(vendreBootstrap);
  const call = useServerFn(vendreCall);

  // The mutation-protection token stays in memory only; the session cookie
  // travels with the request/response automatically.
  const tokenRef = useRef<string | undefined>(undefined);

  const [state, setState] = useState<SessionState>({
    ready: false,
    error: null,
    session: null,
  });

  const lastBootstrapRef = useRef(0);
  // Every non-bootstrap call waits for the session to exist. Without this the
  // first page load fires menus/cart/context in parallel with bootstrap, each
  // gets its own visitorid from the store, and the session cookie churns.
  const readyRef = useRef<Promise<unknown> | null>(null);

  /** Direct-to-store first (own cookie jar), server proxy as fallback. */
  const send = useCallback(
    async (input: {
      path: string;
      method?: "GET" | "POST" | "PUT" | "DELETE";
      body?: unknown;
    }): Promise<SurfaceResponse<unknown>> => {
      if (readyRef.current) await readyRef.current.catch(() => undefined);
      const mutationToken =
        input.method && input.method !== "GET" ? tokenRef.current : undefined;
      const direct = await directRequest({ ...input, mutationToken });
      if (direct) return direct as SurfaceResponse<unknown>;
      return (await call({
        data: { ...input, mutationToken },
      })) as SurfaceResponse<unknown>;
    },
    [call],
  );

  const runBootstrap = useCallback(async () => {
    const run = (async () => {
      const direct = await directRequest({
        path: "/surface/2/session/bootstrap",
        method: "POST",
      });
      return (direct ??
        ((await bootstrap({ data: {} })) as SurfaceResponse<
          Record<string, unknown>
        >)) as SurfaceResponse<Record<string, unknown>>;
    })();
    readyRef.current = run;
    const res = await run;
    lastBootstrapRef.current = Date.now();
    tokenRef.current = extractMutationToken(res.data);
    return res.data;
  }, [bootstrap]);



  const request = useCallback(
    async <T,>(input: {
      path: string;
      method?: "GET" | "POST" | "PUT" | "DELETE";
      body?: unknown;
    }): Promise<T> => {
      const res = (await send(input)) as SurfaceResponse<T>;

      const isSessionUnauthorized =
        res.status === 401 &&
        JSON.stringify(res.data ?? "").includes("SURFACE_SESSION_UNAUTHORIZED");

      if (res.status === 401 && !isSessionUnauthorized) {
        // e.g. invalid login credentials — surface the store's own message.
        throw new VendreApiError(
          401,
          apiErrorMessage(res.data) ?? "Invalid email or password.",
        );
      }

      if (res.status === 401) {
        // The Vendre session expired or holds no customer — refresh it so the
        // next call runs on a live session instead of a dead cookie. Throttled
        // so a burst of 401s cannot rotate the session under an in-flight login.
        const now = Date.now();
        if (now - lastBootstrapRef.current > 30_000) {
          lastBootstrapRef.current = now;
          void runBootstrap().catch(() => undefined);
        }
        throw new VendreUnauthorizedError();
      }
      if (res.status >= 400) {
        throw new VendreApiError(
          res.status,
          apiErrorMessage(res.data) ?? `Request failed (${res.status})`,
        );
      }

      const nextToken = extractMutationToken(res.data);
      if (nextToken) tokenRef.current = nextToken;
      return res.data;
    },
    [send, runBootstrap],
  );

  useEffect(() => {
    let cancelled = false;
    clearLegacySessionStorage();
    (async () => {

      try {
        const data = await runBootstrap();
        if (cancelled) return;
        setState({ ready: true, error: null, session: data });
      } catch (err) {
        if (cancelled) return;
        setState({
          ready: false,
          error: err instanceof Error ? err.message : "Session bootstrap failed",
          session: null,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [runBootstrap]);

  const refreshSession = useCallback(async () => {
    try {
      const data = await runBootstrap();
      setState({ ready: true, error: null, session: data });
      return data;
    } catch {
      return null;
    }
  }, [runBootstrap]);

  const value = useMemo<VendreContextValue>(
    () => ({ ...state, request, refreshSession }),
    [state, request, refreshSession],
  );


  return <VendreContext.Provider value={value}>{children}</VendreContext.Provider>;
}

export function useVendre() {
  const ctx = useContext(VendreContext);
  if (!ctx) throw new Error("useVendre must be used inside <VendreProvider>");
  return ctx;
}
