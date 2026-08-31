/**
 * Kundvagn: optimistisk lokal state + debouncad synk mot Surface v2.
 *
 * Följer .vendre/skills/cart-sync.md:
 * - Antal och radborttagning slår igenom direkt i UI:t, ingen spinner.
 * - Ändringar coalesceras och synkas debouncat (500 ms), max ett inflight-anrop.
 * - Efter lyckad synk ersätts den lokala vyn av butikens svar.
 * - Checkout flushar allt pending, verifierar mot en färsk GET shopping-cart
 *   och navigerar därefter som en riktig webbläsarnavigering.
 *
 * I demoläge (isConfigured === false) sker allt lokalt mot mockdata.
 */

import { useSyncExternalStore } from "react";

import { emptyMockCart, price, recalculateMockCart } from "@/mock/vendreResponses";
import type { VendreCart, VendreCartLine, VendreProduct, VendreVariant } from "@/types/vendre";

import { surfaceJson } from "./client";
import { ensureSession } from "./use-vendre-api";

type CartState = {
  cart: VendreCart;
  open: boolean;
  syncing: boolean;
  error: string | null;
};

let state: CartState = { cart: emptyMockCart, open: false, syncing: false, error: null };
const listeners = new Set<() => void>();
const serverSnapshot: CartState = state;

function emit(next: Partial<CartState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useCart() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => serverSnapshot,
  );
}

export function openCart() {
  emit({ open: true });
}

export function closeCart() {
  emit({ open: false });
}

/* ------------------------------------------------------------------ */
/* Live-synk                                                           */
/* ------------------------------------------------------------------ */

let liveMode = false;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let inflight: Promise<void> | null = null;
let pending = new Map<string, { line: VendreCartLine; quantity: number }>();

export function setCartLiveMode(value: boolean) {
  liveMode = value;
}

async function pushPending(): Promise<void> {
  if (pending.size === 0) return;
  const batch = [...pending.values()];
  pending = new Map();

  const removals = batch.filter((entry) => entry.quantity <= 0);
  const upserts = batch.filter((entry) => entry.quantity > 0);

  try {
    for (const entry of removals) {
      await surfaceJson("shopping-cart", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: entry.line.id }),
      });
    }
    if (upserts.length > 0) {
      await surfaceJson("shopping-cart/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          products: upserts.map((entry) => ({
            product_id: entry.line.product_id,
            variant_id: entry.line.variant_id,
            quantity: entry.quantity,
          })),
        }),
      });
    }
    // Butiken är facit för priser, rabatter och lager.
    const fresh = await surfaceJson<VendreCart>("shopping-cart");
    emit({ cart: fresh, error: null });
  } catch (error) {
    emit({ error: (error as Error).message });
    await refreshCart();
  }
}

function scheduleSync() {
  if (!liveMode) return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void flushCart();
  }, 500);
}

/** Kör alla pending mutationer klart; max ett inflight-anrop i taget. */
export async function flushCart(): Promise<void> {
  if (!liveMode) return;
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  if (inflight) {
    await inflight;
    if (pending.size === 0) return;
  }
  emit({ syncing: true });
  inflight = pushPending().finally(() => {
    inflight = null;
    emit({ syncing: false });
  });
  await inflight;
  if (pending.size > 0) await flushCart();
}

export async function refreshCart() {
  if (!liveMode) return;
  try {
    await ensureSession();
    const fresh = await surfaceJson<VendreCart>("shopping-cart");
    emit({ cart: fresh });
  } catch {
    /* 401 hanteras av klienten; vagnen lämnas orörd */
  }
}

/* ------------------------------------------------------------------ */
/* Optimistiska operationer                                            */
/* ------------------------------------------------------------------ */

function localRecalculate(items: VendreCartLine[]) {
  emit({ cart: recalculateMockCart(items) });
}

function queue(line: VendreCartLine, quantity: number) {
  pending.set(`${line.product_id}:${line.variant_id ?? 0}`, { line, quantity });
  scheduleSync();
}

export function addToCart(product: VendreProduct, variant: VendreVariant | null, quantity = 1) {
  const unit = variant?.price ?? product.price;
  const key = `${product.id}:${variant?.id ?? 0}`;
  const existing = state.cart.items.find(
    (line) => `${line.product_id}:${line.variant_id ?? 0}` === key,
  );

  let items: VendreCartLine[];
  if (existing) {
    items = state.cart.items.map((line) =>
      line === existing ? { ...line, quantity: line.quantity + quantity } : line,
    );
  } else {
    const line: VendreCartLine = {
      id: Number(`${product.id}${variant?.id ?? 0}`.slice(0, 12)),
      product_id: product.id,
      variant_id: variant?.id ?? null,
      sku: variant?.sku ?? product.sku,
      name: product.name,
      slug: product.slug,
      quantity,
      image: variant?.image ?? product.images[0] ?? null,
      options: variant?.options ?? [],
      unit_price: unit,
      row_total: price(unit.value * quantity),
    };
    items = [...state.cart.items, line];
  }

  localRecalculate(items);
  emit({ open: true });
  const line = items.find((item) => `${item.product_id}:${item.variant_id ?? 0}` === key);
  if (line) queue(line, line.quantity);
}

export function setLineQuantity(lineId: number, quantity: number) {
  const line = state.cart.items.find((item) => item.id === lineId);
  if (!line) return;
  const next = Math.max(0, quantity);
  const items =
    next === 0
      ? state.cart.items.filter((item) => item.id !== lineId)
      : state.cart.items.map((item) => (item.id === lineId ? { ...item, quantity: next } : item));
  localRecalculate(items);
  queue(line, next);
}

export function removeLine(lineId: number) {
  setLineQuantity(lineId, 0);
}

/**
 * Flush → verifiera → navigera. Checkout är alltid en riktig
 * webbläsarnavigering; sessionscookien är det som bär över vagnen.
 */
export async function startCheckout(baseUrl?: string) {
  if (!liveMode) {
    emit({ error: "Demoläge: checkout aktiveras när butiken är kopplad till Vendre." });
    return false;
  }
  emit({ syncing: true });
  try {
    await flushCart();
    const fresh = await surfaceJson<VendreCart>("shopping-cart");
    emit({ cart: fresh });
    const matches =
      fresh.item_count === state.cart.item_count &&
      fresh.items.length === state.cart.items.length;
    if (!matches) {
      emit({ error: "Kundvagnen uppdaterades — kontrollera innehållet innan du går vidare." });
      return false;
    }
    if (baseUrl) window.location.href = `${baseUrl.replace(/\/+$/, "")}/checkout`;
    return true;
  } finally {
    emit({ syncing: false });
  }
}
