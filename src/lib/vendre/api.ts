/**
 * Storefront data adapter.
 *
 * Same function signatures in both modes:
 *   demo -> src/mock/vendreResponses.ts (cart kept in memory)
 *   live -> /surface/2/* through the browser client (Bearer + credentials: "include")
 *
 * All live paths, headers and error handling follow .vendre/knowledge/api-reference.md.
 * Caching follows .vendre/skills/caching.md: menus/categories are cached, cart and
 * session are never cached.
 */
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useOnboarding } from "@/context/onboarding-context";
import {
  emptyCart,
  mockCategory,
  mockFeaturedProducts,
  mockMenus,
  mockProduct,
  mockSessionContext,
} from "@/mock/vendreResponses";
import type {
  Cart,
  CartLine,
  CategoryQuery,
  CategoryResponse,
  MenuItem,
  MenuNode,
  Product,
  SessionContext,
} from "@/types/vendre";

import {
  getVendreToken,
  setMutationProtectionToken,
  surfaceJson,
  VendreError,
} from "./client";

export type VendreMode = "demo" | "live";

export type VendreApi = {
  mode: VendreMode;
  getMenus: () => Promise<MenuItem[]>;
  getCategory: (id: number, query?: CategoryQuery) => Promise<CategoryResponse>;
  getProduct: (id: string, categoryId?: number) => Promise<Product | null>;
  getCart: () => Promise<Cart>;
  addToCart: (productId: string | number, quantity?: number) => Promise<void>;
  updateQty: (line: CartLine, quantity: number) => Promise<void>;
  removeLine: (line: CartLine) => Promise<void>;
  getSessionContext: () => Promise<SessionContext>;
  checkoutUrl: () => Promise<string | null>;
};

/* ------------------------------------------------------------------ live -- */

let storeBaseUrl: string | null = null;
let sessionReady: Promise<void> | null = null;

export function getStoreBaseUrl() {
  return storeBaseUrl;
}

async function bootstrapSession() {
  const { baseUrl } = await getVendreToken();
  storeBaseUrl = baseUrl;
  const data = await surfaceJson<{ surface_mutation_protection_token?: string }>(
    "session/bootstrap",
    { method: "POST" },
  );
  setMutationProtectionToken(data.surface_mutation_protection_token ?? null);
}

function ensureSession() {
  sessionReady ??= bootstrapSession().catch((error) => {
    sessionReady = null;
    throw error;
  });
  return sessionReady;
}

/** Runs a call behind the session gate and re-bootstraps once on a session 401. */
export function resetSessionGate() {
  sessionReady = null;
}

export async function guarded<T>(run: () => Promise<T>): Promise<T> {
  await ensureSession();
  try {
    return await run();
  } catch (error) {
    const sessionGone =
      error instanceof VendreError &&
      (error.code === "SURFACE_SESSION_UNAUTHORIZED" || error.status === 401);
    if (!sessionGone) throw error;
    sessionReady = null;
    await ensureSession();
    return run();
  }
}

/** Serialises listing state for GET categories/{id}; arrays use bracket syntax. */
function categoryQuery(query?: CategoryQuery) {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  if (query?.sort_by) params.set("sort_by", query.sort_by);
  if (query?.sort_order) params.set("sort_order", query.sort_order);
  for (const tag of query?.tags ?? []) params.append("tags[]", String(tag));
  for (const [specId, values] of Object.entries(query?.specs ?? {}))
    for (const value of values) params.append(`f[${specId}][]`, value);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

const liveApi: VendreApi = {
  mode: "live",
  getMenus: () =>
    guarded(() => surfaceJson<{ menus: MenuItem[] }>("navigation/menus")).then(
      (data) => data.menus ?? [],
    ),
  getCategory: (id, query) =>
    guarded(() => surfaceJson<CategoryResponse>(`categories/${id}${categoryQuery(query)}`)),
  getProduct: async (id, categoryId) => {
    // Surface v2 has no products/{id} endpoint; products are read from a category listing.
    const fromCategory = async (catId: number) => {
      const data = await liveApi.getCategory(catId, { limit: 0 });
      return data.product_list.find((p) => String(p.id) === String(id)) ?? null;
    };
    if (categoryId) {
      const hit = await fromCategory(categoryId);
      if (hit) return hit;
    }
    const menus = await liveApi.getMenus();
    for (const item of menus.filter((menu) => menu.menu_type === "category")) {
      const hit = await fromCategory(item.id);
      if (hit) return hit;
    }
    return null;
  },
  getCart: () => guarded(() => surfaceJson<Cart>("shopping-cart")),
  addToCart: async (productId, quantity = 1) => {
    await guarded(() =>
      surfaceJson("shopping-cart/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ products: [{ id: Number(productId), quantity }] }),
      }),
    );
  },
  updateQty: async (line, quantity) => {
    await guarded(() =>
      surfaceJson("shopping-cart/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          products: [{ id: line.productId, quantity, attributes: line.attributes }],
        }),
      }),
    );
  },
  removeLine: async (line) => {
    await guarded(() =>
      surfaceJson("shopping-cart", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: line.id }),
      }),
    );
  },
  getSessionContext: () => guarded(() => surfaceJson<SessionContext>("session/context")),
  checkoutUrl: async () => {
    const { baseUrl } = await getVendreToken();
    storeBaseUrl = baseUrl;
    return `${baseUrl}/checkout`;
  },
};

/* ------------------------------------------------------------------ demo -- */

let demoCart: Cart = { ...emptyCart, products: [] };

function recalcDemoCart() {
  demoCart = {
    products: demoCart.products,
    cart_count: demoCart.products.reduce((sum, line) => sum + line.quantity, 0),
    cart_total: demoCart.products.reduce(
      (sum, line) => sum + (line.product_data?.price_raw ?? 0) * line.quantity,
      0,
    ),
  };
}

const demoApi: VendreApi = {
  mode: "demo",
  getMenus: async () => mockMenus,
  getCategory: async (id, query) => mockCategory(id, query),
  getProduct: async (id) => mockProduct(id),
  getCart: async () => demoCart,
  addToCart: async (productId, quantity = 1) => {
    const id = String(productId);
    const existing = demoCart.products.find((line) => line.id === id);
    if (existing) existing.quantity += quantity;
    else {
      const data = mockProduct(id);
      demoCart.products = [
        ...demoCart.products,
        {
          id,
          productId: Number(id),
          quantity,
          attributes: [],
          data: null,
          ...(data ? { product_data: data } : {}),
        },
      ];
    }
    recalcDemoCart();
  },
  updateQty: async (line, quantity) => {
    demoCart.products = demoCart.products
      .map((item) => (item.id === line.id ? { ...item, quantity } : item))
      .filter((item) => item.quantity > 0);
    recalcDemoCart();
  },
  removeLine: async (line) => {
    demoCart.products = demoCart.products.filter((item) => item.id !== line.id);
    recalcDemoCart();
  },
  getSessionContext: async () => mockSessionContext,
  checkoutUrl: async () => null,
};

/* ------------------------------------------------------------------ hooks -- */

export function useVendreApi(): VendreApi {
  const { isConfigured } = useOnboarding();
  return useMemo(() => (isConfigured ? liveApi : demoApi), [isConfigured]);
}

export function useMenus() {
  const api = useVendreApi();
  return useQuery({
    queryKey: ["vendre", api.mode, "menus"],
    queryFn: () => api.getMenus(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMenuTree() {
  const { data } = useMenus();
  return useMemo(() => buildMenuTree(data ?? []), [data]);
}

export function buildMenuTree(items: MenuItem[]): MenuNode[] {
  const nodes = new Map<number, MenuNode>();
  for (const item of items) nodes.set(item.id, { ...item, children: [] });
  const roots: MenuNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.parent_id != null ? nodes.get(node.parent_id) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  return roots;
}

/**
 * Cache scope for price-bearing data: market, currency, language and VAT mode
 * change what the store returns, so they belong in every cache key.
 */
export function useCacheScope() {
  const { data } = useSessionContext();
  return useMemo(
    () =>
      data
        ? [data.market?.id ?? null, data.currency?.code ?? null, data.language?.code ?? null, data.prices_include_vat]
        : null,
    [data],
  );
}

export function useCategory(id: number, query?: CategoryQuery) {
  const api = useVendreApi();
  const scope = useCacheScope();
  return useQuery({
    queryKey: ["vendre", api.mode, "category", id, query ?? null, scope],
    queryFn: () => api.getCategory(id, query),
    staleTime: 5 * 60 * 1000,
    placeholderData: (previous) => previous,
  });
}

export function useProduct(id: string, categoryId?: number) {
  const api = useVendreApi();
  return useQuery({
    queryKey: ["vendre", api.mode, "product", id, categoryId ?? null],
    queryFn: () => api.getProduct(id, categoryId),
    staleTime: 5 * 60 * 1000,
  });
}

/** Never cached — the cart is live state. */
export function useCart() {
  const api = useVendreApi();
  return useQuery({
    queryKey: ["vendre", api.mode, "cart"],
    queryFn: () => api.getCart(),
    staleTime: 0,
    gcTime: 0,
  });
}

export function useSessionContext() {
  const api = useVendreApi();
  return useQuery({
    queryKey: ["vendre", api.mode, "session-context"],
    queryFn: () => api.getSessionContext(),
    staleTime: 0,
    gcTime: 0,
  });
}

export function useCartMutations() {
  const api = useVendreApi();
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["vendre", api.mode, "cart"] });

  const add = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string | number; quantity?: number }) =>
      api.addToCart(productId, quantity ?? 1),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ line, quantity }: { line: CartLine; quantity: number }) =>
      api.updateQty(line, quantity),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: ({ line }: { line: CartLine }) => api.removeLine(line),
    onSuccess: invalidate,
  });

  return { add, update, remove };
}

export function useFeaturedProducts(count = 4) {
  const api = useVendreApi();
  return useQuery({
    queryKey: ["vendre", api.mode, "featured", count],
    queryFn: async () => {
      if (api.mode === "demo") return mockFeaturedProducts(count);
      const menus = await api.getMenus();
      const first = menus.find((item) => item.menu_type === "category" && !item.has_children);
      if (!first) return [];
      const category = await api.getCategory(first.id, { limit: count });
      return category.product_list.slice(0, count);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Resolves a store-relative image path against the connected store base URL. */
export function resolveImageUrl(path: string | null | undefined) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  if (!storeBaseUrl) return null;
  return `${storeBaseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function formatPrice(product: Pick<Product, "price" | "price_raw">) {
  return product.price ?? (product.price_raw != null ? `${product.price_raw} kr` : "—");
}
