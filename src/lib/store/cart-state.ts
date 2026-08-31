/**
 * Local cart for Demo Mode.
 *
 * In Live Mode the cart is owned by Vendre (`GET /surface/2/shopping-cart`)
 * and this store is only the optimistic layer in front of it, so the shape is
 * kept close to a Surface cart line.
 */
import { useSyncExternalStore } from "react";

import { isConfigured } from "./onboarding-state";

export type CartLine = {
  lineId: string;
  productId: string;
  slug: string;
  name: string;
  variantName?: string;
  image: string;
  unitPrice: number;
  currency: string;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
  isOpen: boolean;
};

let state: CartState = { lines: [], isOpen: false };
const listeners = new Set<() => void>();

const serverSnapshot: CartState = { lines: [], isOpen: false };

function set(next: CartState) {
  state = next;
  for (const listener of listeners) listener();
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
  set({ ...state, isOpen: true });
}

export function setCartOpen(isOpen: boolean) {
  set({ ...state, isOpen });
}

/** Replaces the local cart with the store's truth after a live sync. */
export function replaceLines(lines: CartLine[]) {
  set({ ...state, lines });
}

async function sync(run: () => Promise<CartLine[]>) {
  if (!isConfigured()) return;
  const snapshot = state.lines;
  try {
    const lines = await run();
    replaceLines(lines);
  } catch {
    // Roll back the optimistic change and let the next read reconcile.
    set({ ...state, lines: snapshot });
  }
}

/** Loads the live Vendre cart (no-op in Demo Mode). */
export async function refreshCart() {
  if (!isConfigured()) return;
  const { fetchLiveCart } = await import("@/lib/vendre/cart");
  await sync(fetchLiveCart);
}

export function addToCart(line: Omit<CartLine, "lineId" | "quantity">, quantity = 1) {
  const lineId = `${line.productId}:${line.variantName ?? "default"}`;
  const existing = state.lines.find((item) => item.lineId === lineId);
  const lines = existing
    ? state.lines.map((item) =>
        item.lineId === lineId ? { ...item, quantity: item.quantity + quantity } : item,
      )
    : [...state.lines, { ...line, lineId, quantity }];
  set({ lines, isOpen: true });

  const target = lines.find((item) => item.lineId === lineId);
  void sync(async () => {
    const { queueCartOperation } = await import("@/lib/vendre/cart");
    return queueCartOperation({
      kind: "add",
      productId: line.productId,
      quantity: target?.quantity ?? quantity,
    });
  });
}

export function setQuantity(lineId: string, quantity: number) {
  if (quantity <= 0) {
    removeLine(lineId);
    return;
  }
  const line = state.lines.find((item) => item.lineId === lineId);
  set({
    ...state,
    lines: state.lines.map((item) => (item.lineId === lineId ? { ...item, quantity } : item)),
  });
  if (!line) return;
  void sync(async () => {
    const { queueCartOperation } = await import("@/lib/vendre/cart");
    return queueCartOperation({ kind: "set", productId: line.productId, lineId, quantity });
  });
}

export function removeLine(lineId: string) {
  set({ ...state, lines: state.lines.filter((item) => item.lineId !== lineId) });
  void sync(async () => {
    const { queueCartOperation } = await import("@/lib/vendre/cart");
    return queueCartOperation({ kind: "remove", lineId });
  });
}

/** Flush pending syncs, verify against the store, then navigate to checkout. */
export async function goToCheckout() {
  if (!isConfigured()) return;
  const { flushCartSync, getCheckoutUrl } = await import("@/lib/vendre/cart");
  const lines = await flushCartSync();
  replaceLines(lines);
  window.location.href = await getCheckoutUrl();
}

export function cartCount(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function cartTotal(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
}
