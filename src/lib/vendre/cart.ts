/**
 * Live shopping cart (Surface v2).
 *
 * - GET shopping-cart is never cached; it is the truth.
 * - Mutations carry Surface-Mutation-Protection-Token (attached by client.ts).
 * - The UI keeps an optimistic layer; changes are debounced, coalesced and
 *   reconciled against the server response (see .vendre/skills/cart-sync.md).
 */
import type { CartLine } from "@/lib/store/cart-state";

import { surfaceJson } from "./client";
import { getSessionContext, withSession } from "./session";

type AnyRecord = Record<string, unknown>;

const SYNC_DEBOUNCE_MS = 500;

function pick(source: AnyRecord | undefined, ...keys: string[]): unknown {
  if (!source) return undefined;
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function num(value: unknown): number {
  const parsed = typeof value === "string" ? Number(value.replace(/\s/g, "").replace(",", ".")) : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : fallback;
}

function rows(value: unknown): AnyRecord[] {
  if (Array.isArray(value)) return value.filter((row): row is AnyRecord => typeof row === "object" && row !== null);
  return [];
}

function normalizeCart(payload: AnyRecord): CartLine[] {
  const cart = (pick(payload, "cart", "shopping_cart", "data") as AnyRecord | undefined) ?? payload;
  const lines = rows(pick(cart, "items", "products", "lines", "rows"));
  const currency = getSessionContext()?.currency ?? "SEK";
  const incVat = getSessionContext()?.pricesIncludeVat !== false;

  return lines.map((line, index) => {
    const product = (pick(line, "product") as AnyRecord | undefined) ?? line;
    const image = pick(product, "image", "thumbnail", "main_image");
    const imageUrl =
      typeof image === "string" ? image : text(pick(image as AnyRecord, "url", "src", "path"), "");

    return {
      lineId: text(pick(line, "id", "item_id", "row_id", "line_id"), `line-${index}`),
      productId: text(pick(line, "product_id", "id"), ""),
      slug: text(pick(product, "slug", "url_key"), ""),
      name: text(pick(line, "name", "title") ?? pick(product, "name", "title"), "Produkt"),
      image: imageUrl,
      unitPrice: num(
        pick(line, incVat ? "unit_price_incl_vat" : "unit_price_excl_vat", "unit_price", "price", "price_incl_vat"),
      ),
      currency: text(pick(line, "currency"), currency),
      quantity: num(pick(line, "quantity", "qty")) || 1,
    } satisfies CartLine;
  });
}

export function fetchLiveCart(): Promise<CartLine[]> {
  return withSession(async () => normalizeCart(await surfaceJson<AnyRecord>("shopping-cart")));
}

async function postProduct(productId: string, quantity: number): Promise<CartLine[]> {
  return withSession(async () =>
    normalizeCart(
      await surfaceJson<AnyRecord>("shopping-cart/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ products: [{ product_id: productId, quantity }] }),
      }),
    ),
  );
}

async function deleteLine(lineId: string): Promise<CartLine[]> {
  return withSession(async () =>
    normalizeCart(
      await surfaceJson<AnyRecord>("shopping-cart", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: [{ id: lineId }] }),
      }),
    ),
  );
}

type Operation =
  | { kind: "add"; productId: string; quantity: number }
  | { kind: "set"; productId: string; lineId: string; quantity: number }
  | { kind: "remove"; lineId: string };

type Pending = { operation: Operation; resolve: (lines: CartLine[]) => void; reject: (error: unknown) => void };

let timer: ReturnType<typeof setTimeout> | null = null;
let inflight: Promise<CartLine[]> | null = null;
let queue = new Map<string, Pending>();

function keyOf(operation: Operation) {
  return operation.kind === "remove" ? `remove:${operation.lineId}` : `line:${operation.productId}`;
}

async function runOperation(operation: Operation): Promise<CartLine[]> {
  if (operation.kind === "remove") return deleteLine(operation.lineId);
  if (operation.kind === "set" && operation.quantity <= 0) return deleteLine(operation.lineId);
  return postProduct(operation.productId, operation.quantity);
}

async function drain() {
  const batch = [...queue.values()];
  queue = new Map();

  let latest: CartLine[] = [];
  for (const item of batch) {
    try {
      latest = await runOperation(item.operation);
      item.resolve(latest);
    } catch (error) {
      item.reject(error);
    }
  }
  return latest;
}

function schedule(): Promise<CartLine[]> {
  if (timer) clearTimeout(timer);
  return new Promise((resolve, reject) => {
    timer = setTimeout(() => {
      timer = null;
      const run = (inflight ?? Promise.resolve([] as CartLine[])).then(drain, drain);
      inflight = run.finally(() => {
        if (inflight === run) inflight = null;
      });
      run.then(resolve, reject);
    }, SYNC_DEBOUNCE_MS);
  });
}

/** Queues a cart mutation. Resolves with the server's cart once synced. */
export function queueCartOperation(operation: Operation): Promise<CartLine[]> {
  const key = keyOf(operation);
  const promise = new Promise<CartLine[]>((resolve, reject) => {
    queue.set(key, { operation, resolve, reject });
  });
  void schedule();
  return promise;
}

/** Flushes pending debounced syncs and returns a fresh server cart. */
export async function flushCartSync(): Promise<CartLine[]> {
  if (timer) {
    clearTimeout(timer);
    timer = null;
    const run = (inflight ?? Promise.resolve([] as CartLine[])).then(drain, drain);
    inflight = run.finally(() => {
      if (inflight === run) inflight = null;
    });
    await run;
  } else if (inflight) {
    await inflight.catch(() => undefined);
  }
  return fetchLiveCart();
}

/** Checkout must be a real browser navigation so the session cookie travels. */
export async function getCheckoutUrl(): Promise<string> {
  const { getVendreToken } = await import("./client");
  const { baseUrl } = await getVendreToken();
  return `${baseUrl}/checkout`;
}
