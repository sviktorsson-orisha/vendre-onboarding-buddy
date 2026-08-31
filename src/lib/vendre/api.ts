/**
 * Storefront data layer.
 *
 * One API surface for the whole storefront. In demo mode (`isConfigured === false`)
 * it serves the Vendre-shaped payloads in `src/mock/vendreResponses.ts`; once the
 * setup guide is green it calls Surface v2 directly through `surfaceFetch`.
 *
 * Rules from .vendre/knowledge/api-reference.md:
 * - session/bootstrap runs once and owns the session cookie + mutation token.
 * - Cart reads are never cached; every mutation invalidates the cart.
 * - Array query params use brackets; listings are filtered/sorted server-side.
 */
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import {
  EMPTY_MOCK_CART,
  MOCK_MENUS,
  MOCK_PRODUCTS,
  MOCK_SESSION_CONTEXT,
  mockCartFromLines,
  mockCartLine,
  mockCategory,
} from "@/mock/vendreResponses";
import type {
  VendreCart,
  VendreCategoryResponse,
  VendreImage,
  VendreMenusResponse,
  VendreProduct,
  VendreSessionBootstrap,
  VendreSessionContext,
} from "@/types/vendre";
import { useOnboarding } from "@/context/onboarding-context";

import { setMutationProtectionToken, surfaceJson } from "./client";

/* -------------------------------------------------------------------------- */
/* Store base URL (for resolving relative image paths)                         */
/* -------------------------------------------------------------------------- */

let storeBaseUrl = "";

export function imageUrl(image: VendreImage | null | undefined) {
  if (!image) return null;
  const src = image.image || image.path;
  if (!src) return null;
  if (/^https?:\/\//.test(src)) return src;
  return `${storeBaseUrl}${src.startsWith("/") ? "" : "/"}${src}`;
}

/* -------------------------------------------------------------------------- */
/* Cart store — shared across header badge, drawer and PDP                     */
/* -------------------------------------------------------------------------- */

let cart: VendreCart = EMPTY_MOCK_CART;
let drawerOpen = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

function setCart(next: VendreCart) {
  cart = next;
  if (next.mutationProtectionToken) setMutationProtectionToken(next.mutationProtectionToken);
  emit();
}

export function setCartDrawerOpen(open: boolean) {
  drawerOpen = open;
  emit();
}

export function useCartStore() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => cart,
    () => EMPTY_MOCK_CART,
  );
  const open = useSyncExternalStore(
    subscribe,
    () => drawerOpen,
    () => false,
  );
  return { cart: snapshot, drawerOpen: open };
}

/* -------------------------------------------------------------------------- */
/* Session                                                                     */
/* -------------------------------------------------------------------------- */

let bootstrapPromise: Promise<void> | null = null;

/** Bootstraps the store session once; every other live call awaits it. */
function ready(): Promise<void> {
  bootstrapPromise ??= surfaceJson<VendreSessionBootstrap>("session/bootstrap", { method: "POST" })
    .then((session) => {
      setMutationProtectionToken(session.surface_mutation_protection_token);
    })
    .catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  return bootstrapPromise;
}

/* -------------------------------------------------------------------------- */
/* API                                                                         */
/* -------------------------------------------------------------------------- */

export type VendreApi = {
  isConfigured: boolean;
  getSessionContext: () => Promise<VendreSessionContext>;
  getMenus: () => Promise<VendreMenusResponse>;
  getCategory: (id: number, options?: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }) => Promise<VendreCategoryResponse>;
  getProduct: (id: string) => Promise<VendreProduct | null>;
  getCart: () => Promise<VendreCart>;
  addToCart: (product: VendreProduct, quantity: number) => Promise<void>;
  setQuantity: (line: VendreCart["products"][number], quantity: number) => Promise<void>;
  removeLine: (line: VendreCart["products"][number]) => Promise<void>;
};

function demoApi(): VendreApi {
  const findProduct = (id: string) => MOCK_PRODUCTS.find((product) => product.id === id) ?? null;

  const writeLines = (lines: VendreCart["products"]) => {
    setCart(mockCartFromLines(lines));
  };

  return {
    isConfigured: false,
    getSessionContext: async () => MOCK_SESSION_CONTEXT,
    getMenus: async () => MOCK_MENUS,
    getCategory: async (id, options) => mockCategory(id, options?.page ?? 1, options?.limit ?? 12),
    getProduct: async (id) => findProduct(id),
    getCart: async () => cart,
    addToCart: async (product, quantity) => {
      const existing = cart.products.find((line) => line.id === product.id);
      const lines = existing
        ? cart.products.map((line) =>
            line.id === product.id ? mockCartLine(product, line.quantity + quantity) : line,
          )
        : [...cart.products, mockCartLine(product, quantity)];
      writeLines(lines);
    },
    setQuantity: async (line, quantity) => {
      const product = findProduct(line.id);
      if (!product) return;
      writeLines(
        quantity <= 0
          ? cart.products.filter((item) => item.id !== line.id)
          : cart.products.map((item) => (item.id === line.id ? mockCartLine(product, quantity) : item)),
      );
    },
    removeLine: async (line) => {
      writeLines(cart.products.filter((item) => item.id !== line.id));
    },
  };
}

function liveApi(): VendreApi {
  const refreshCart = async () => {
    const next = await surfaceJson<VendreCart>("shopping-cart");
    setCart(next);
    return next;
  };

  return {
    isConfigured: true,
    getSessionContext: async () => {
      await ready();
      return surfaceJson<VendreSessionContext>("session/context");
    },
    getMenus: async () => {
      await ready();
      return surfaceJson<VendreMenusResponse>("navigation/menus");
    },
    getCategory: async (id, options) => {
      await ready();
      const params = new URLSearchParams();
      params.set("page", String(options?.page ?? 1));
      params.set("limit", String(options?.limit ?? 12));
      if (options?.sortBy) params.set("sort_by", options.sortBy);
      if (options?.sortOrder) params.set("sort_order", options.sortOrder);
      return surfaceJson<VendreCategoryResponse>(`categories/${id}?${params.toString()}`);
    },
    getProduct: async (id) => {
      await ready();
      // Products are read from their category payload — POST vql is not enabled
      // on every install (api-reference.md §2.5).
      for (const categoryId of [90, 92, 95, 96]) {
        const category = await surfaceJson<VendreCategoryResponse>(`categories/${categoryId}?limit=0`);
        const match = category.product_list.find((product) => String(product.id) === id);
        if (match) return match;
      }
      return null;
    },
    getCart: async () => {
      await ready();
      return refreshCart();
    },
    addToCart: async (product, quantity) => {
      await ready();
      await surfaceJson("shopping-cart/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ products: [{ id: Number(product.id), quantity }] }),
      });
      await refreshCart();
    },
    setQuantity: async (line, quantity) => {
      await ready();
      if (quantity <= 0) {
        await surfaceJson("shopping-cart", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ products: [{ id: line.id }] }),
        });
      } else {
        await surfaceJson("shopping-cart/products", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ products: [{ id: Number(line.product_id), quantity }] }),
        });
      }
      await refreshCart();
    },
    removeLine: async (line) => {
      await ready();
      await surfaceJson("shopping-cart", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ products: [{ id: line.id }] }),
      });
      await refreshCart();
    },
  };
}

/** Bridge hook: dummy data in demo mode, live Surface v2 once configured. */
export function useVendreApi(): VendreApi {
  const { isConfigured } = useOnboarding();
  return isConfigured ? liveApi() : demoApi();
}

/** Small helper for one-off async reads inside components. */
export function useAsync<T>(factory: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: string | null }>({
    data: null,
    loading: true,
    error: null,
  });

  const run = useCallback(factory, deps);

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    run()
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((error: Error) => !cancelled && setState({ data: null, loading: false, error: error.message }));
    return () => {
      cancelled = true;
    };
  }, [run]);

  return state;
}

export function setStoreBaseUrl(url: string) {
  storeBaseUrl = url.replace(/\/+$/, "");
}
