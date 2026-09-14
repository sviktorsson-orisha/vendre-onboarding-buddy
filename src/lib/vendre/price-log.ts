/**
 * Logged prices (price history) — the only Surface v1 call in this template.
 *
 * Endpoint: GET /surface/1/products/price-log-prices?id[]=222&id[]=271
 * Reached through our own same-origin proxy, so no store URL, credential or
 * token is exposed to the browser. v1 needs no OAuth bearer, only the store
 * session cookie that session/bootstrap (v2) already established.
 *
 * The response is an object keyed by product id — products without a logged
 * price are simply omitted:
 *   { "222": { product_id: 222, price_log_price_raw: 49, price_log_price: "49 kr", ... } }
 *
 * Nothing in the storefront renders this today: it exists so a price-history
 * feature can be switched on without touching the transport layer.
 * See .vendre/skills/price-log.md.
 */
import { useQuery } from "@tanstack/react-query";

import { VendreError } from "./client";

const PRICE_LOG_PATH = "/api/vendre/surface1/products/price-log-prices";

/** One logged-price record as returned by the store. */
export type PriceLogPrice = {
  product_id: number;
  price_list_id: number | null;
  currency_id: number | null;
  products_tax_class_id: number | null;
  /** Raw logged price excluding VAT. */
  price_log_price_ex_vat_raw: number | null;
  /** Raw logged price including VAT. */
  price_log_price_raw: number | null;
  /** Already formatted by the store in the session currency. */
  price_log_price: string | null;
};

/** Keyed by product id as a string. Missing key = no logged price. */
export type PriceLogMap = Record<string, PriceLogPrice>;

function buildQuery(ids: (string | number)[]): string {
  const search = new URLSearchParams();
  for (const id of ids) search.append("id[]", String(id));
  const query = search.toString();
  return query ? `?${query}` : "";
}

/** Fetch logged prices for one or more product ids. */
export async function getPriceLogPrices(
  ids: (string | number)[],
): Promise<PriceLogMap> {
  if (!ids.length) return {};

  const res = await fetch(`${PRICE_LOG_PATH}${buildQuery(ids)}`, {
    headers: { accept: "application/json" },
    credentials: "same-origin",
  });

  const body = (await res.json().catch(() => null)) as
    | PriceLogMap
    | { errors?: { code?: string; title?: string }[] }
    | null;

  if (!res.ok) {
    const first = (body as { errors?: { code?: string; title?: string }[] } | null)?.errors?.[0];
    throw new VendreError(
      first?.title ?? `Price log request failed (${res.status})`,
      res.status,
      first?.code,
    );
  }

  return body && typeof body === "object" && !Array.isArray(body)
    ? (body as PriceLogMap)
    : {};
}

/** Convenience wrapper for a single product. Returns null when not logged. */
export async function getPriceLogPrice(
  id: string | number,
): Promise<PriceLogPrice | null> {
  const map = await getPriceLogPrices([id]);
  return map[String(id)] ?? null;
}

/**
 * Disabled by default so no existing page gains a network call. Enable it from
 * the view that needs price history.
 */
export function usePriceLogPrices(
  ids: (string | number)[] = [],
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: ["vendre", "price-log", ids.map(String)],
    queryFn: () => getPriceLogPrices(ids),
    enabled: (options.enabled ?? false) && ids.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
