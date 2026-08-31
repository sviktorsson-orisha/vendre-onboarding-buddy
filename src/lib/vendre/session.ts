/**
 * Vendre session lifecycle (Surface v2).
 *
 * Rules from .vendre/skills/session-context.md:
 * - POST session/bootstrap exactly once at app start; only it establishes the cookie.
 * - Every other call is gated on a shared ready promise.
 * - The mutation protection token lives in a module variable (client.ts).
 * - A session 401 triggers exactly one throttled re-bootstrap, never a bearer renew.
 */
import { setMutationProtectionToken, surfaceJson, VendreError } from "./client";

export type SessionContext = {
  storeName: string;
  logo?: string;
  currency: string;
  language: string;
  locale: string;
  marketId?: number;
  pricesIncludeVat: boolean;
  authenticated: boolean;
  cartItemCount: number;
};

type AnyRecord = Record<string, unknown>;

const REBOOTSTRAP_THROTTLE_MS = 5_000;

let ready: Promise<SessionContext> | null = null;
let current: SessionContext | null = null;
let lastBootstrapAt = 0;

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function pick(source: AnyRecord | undefined, ...keys: string[]): unknown {
  if (!source) return undefined;
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) return source[key];
  }
  return undefined;
}

function normalizeContext(bootstrap: AnyRecord, context: AnyRecord): SessionContext {
  const settings = (pick(context, "settings", "store", "config") as AnyRecord | undefined) ?? context;
  const currencyNode = (pick(context, "currency") ?? pick(bootstrap, "currency")) as AnyRecord | string | undefined;
  const languageNode = (pick(context, "language") ?? pick(bootstrap, "language")) as AnyRecord | string | undefined;
  const marketNode = (pick(context, "market") ?? pick(bootstrap, "market")) as AnyRecord | undefined;

  const currency =
    (typeof currencyNode === "string" ? currencyNode : str(pick(currencyNode as AnyRecord, "code"))) ?? "SEK";
  const language =
    (typeof languageNode === "string" ? languageNode : str(pick(languageNode as AnyRecord, "code"))) ?? "sv";

  const pricesIncludeVat = pick(context, "prices_include_vat") ?? pick(bootstrap, "prices_include_vat");

  const result: SessionContext = {
    storeName:
      str(pick(settings, "STORE_NAME", "store_name", "name")) ??
      str(pick(context, "STORE_NAME", "store_name")) ??
      "Vendre",
    currency,
    language,
    locale: language === "sv" ? "sv-SE" : language,
    pricesIncludeVat: pricesIncludeVat !== false,
    authenticated: Boolean(pick(context, "authenticated") ?? pick(bootstrap, "authenticated")),
    cartItemCount: Number(pick(context, "cart_item_count") ?? pick(bootstrap, "cart_item_count") ?? 0),
  };

  const logo = str(pick(settings, "SHOP_LOGO", "shop_logo", "logo"));
  if (logo) result.logo = logo;
  const marketId = Number(pick(marketNode, "id"));
  if (Number.isFinite(marketId)) result.marketId = marketId;

  return result;
}

async function bootstrap(): Promise<SessionContext> {
  lastBootstrapAt = Date.now();

  const boot = await surfaceJson<AnyRecord>("session/bootstrap", { method: "POST" });
  const token = boot["surface_mutation_protection_token"];
  setMutationProtectionToken(typeof token === "string" ? token : null);

  let context: AnyRecord = {};
  try {
    context = await surfaceJson<AnyRecord>("session/context");
  } catch {
    // Context is a nice-to-have; the session itself is what gates other calls.
  }

  current = normalizeContext(boot, context);
  return current;
}

/** Resolves once the visitor session exists. Every other Surface call awaits this. */
export function ensureSession(): Promise<SessionContext> {
  if (!ready) {
    ready = bootstrap().catch((error: unknown) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}

export function getSessionContext(): SessionContext | null {
  return current;
}

export function resetSession() {
  ready = null;
  current = null;
  lastBootstrapAt = 0;
  setMutationProtectionToken(null);
}

function isSessionUnauthorized(error: unknown) {
  return error instanceof VendreError && error.status === 401;
}

/** Runs a Surface call behind the session gate, with one throttled re-bootstrap on 401. */
export async function withSession<T>(run: () => Promise<T>): Promise<T> {
  await ensureSession();
  try {
    return await run();
  } catch (error) {
    if (!isSessionUnauthorized(error)) throw error;
    if (Date.now() - lastBootstrapAt < REBOOTSTRAP_THROTTLE_MS) throw error;
    ready = null;
    await ensureSession();
    return run();
  }
}
