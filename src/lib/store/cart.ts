/**
 * Shared live cart state.
 *
 * The cart is never cached (see .vendre/skills/caching.md): every mutation
 * replaces the snapshot with the response from the adapter, and the drawer,
 * header badge and PDP all read the same module store.
 */
import { useCallback, useEffect, useSyncExternalStore } from "react";

import { getVendreApi } from "@/lib/vendre/api";
import type { Cart, CartLine } from "@/types/vendre";

const EMPTY: Cart = { lines: [], count: 0, total: "", totalRaw: 0, pricesIncludeVat: true };

let cart: Cart = EMPTY;
let open = false;
let busy = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

type Snapshot = { cart: Cart; open: boolean; busy: boolean };
let snapshot: Snapshot = { cart, open, busy };

function commit(next: Partial<Snapshot>) {
  if (next.cart) cart = next.cart;
  if (next.open !== undefined) open = next.open;
  if (next.busy !== undefined) busy = next.busy;
  snapshot = { cart, open, busy };
  emit();
}

const serverSnapshot: Snapshot = { cart: EMPTY, open: false, busy: false };

async function run(action: () => Promise<Cart>) {
  commit({ busy: true });
  try {
    commit({ cart: await action() });
  } catch (error) {
    console.error("[cart]", error);
  } finally {
    commit({ busy: false });
  }
}

export function useCart() {
  const state = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => serverSnapshot,
  );

  useEffect(() => {
    void run(() => getVendreApi().getCart());
  }, []);

  const refresh = useCallback(() => run(() => getVendreApi().getCart()), []);
  const add = useCallback(async (productId: string, quantity = 1) => {
    await run(() => getVendreApi().addToCart(productId, quantity));
    commit({ open: true });
  }, []);
  const setQuantity = useCallback(
    (line: CartLine, quantity: number) => run(() => getVendreApi().updateQty(line, quantity)),
    [],
  );
  const remove = useCallback((line: CartLine) => run(() => getVendreApi().removeLine(line)), []);
  const setOpen = useCallback((value: boolean) => commit({ open: value }), []);

  return { ...state, refresh, add, setQuantity, remove, setOpen };
}
