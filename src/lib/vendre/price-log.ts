/**
 * Logged prices (price history) — the only Surface v1 call in this template.
 *
 * Endpoint: GET /surface/1/products/price-log-prices
 * Reached through our own same-origin proxy, so no store URL, credential or
 * token is exposed to the browser. v1 needs no OAuth bearer, only the store
 * session cookie that session/bootstrap (v2) already established.
 *
 * Nothing in the storefront renders this today: it exists so a price-history
 * feature can be switched on without touching the transport layer.
 * See .vendre/skills/price-log.md.
 */
import { useQuery } from "@tanstack/react-query";

import { VendreError } from "./client";

const PRICE_LOG_PATH = "/api/vendre/surface1/products/price-log-prices";

/**
 * The documented spec declares no query parameters, so anything passed here is
 * forwarded verbatim. Arrays are sent as repeated `key[]=value` pairs.
 */
export type PriceLogParams = Record<string, string | number | (string | number)[] | undefined>;

/** Shape is store dependent; keep the raw entries and read fields defensively. */
export type PriceLogEntry = Record<string, unknown>;

function buildQuery(params: PriceLogParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) search.append(`${key}[]`, String(item));
    } else {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function getPriceLogPrices(
  params: PriceLogParams = {},
): Promise<PriceLogEntry[]> {
  const res = await fetch(`${PRICE_LOG_PATH}${buildQuery(params)}`, {
    headers: { accept: "application/json" },
    credentials: "same-origin",
  });

  const body = (await res.json().catch(() => null)) as
    | PriceLogEntry[]
    | { errors?: { code?: string; title?: string }[] }
    | null;

  if (!res.ok) {
    const first = Array.isArray(body) ? undefined : body?.errors?.[0];
    throw new VendreError(
      first?.title ?? `Price log request failed (${res.status})`,
      res.status,
      first?.code,
    );
  }

  return Array.isArray(body) ? body : [];
}

/**
 * Disabled by default so no existing page gains a network call. Enable it from
 * the view that needs price history.
 */
export function usePriceLogPrices(
  params: PriceLogParams = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: ["vendre", "price-log", params],
    queryFn: () => getPriceLogPrices(params),
    enabled: options.enabled ?? false,
    staleTime: 5 * 60 * 1000,
  });
}
