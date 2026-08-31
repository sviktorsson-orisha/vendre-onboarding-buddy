/**
 * Storefront data adapter.
 *
 * Same function signatures in both modes:
 *  - Demo mode (isConfigured === false): reads src/mock/vendreResponses.ts,
 *    cart is kept in memory.
 *  - Live mode: calls /surface/2/* through surfaceFetch (Bearer + credentials:
 *    "include"), attaches Surface-Mutation-Protection-Token on every mutation
 *    and re-bootstraps once on SURFACE_SESSION_UNAUTHORIZED.
 *
 * Caching (see .vendre/skills/caching.md): menus and categories are cacheable,
 * cart and session context are never cached.
 */
import { useMemo } from "react";

import { isStoreConfigured, useOnboarding } from "@/context/onboarding-context";
import {
  emptyMockCart,
  mockCategory,
  mockFeaturedIds,
  mockMenus,
  mockProduct,
  mockProducts,
  mockSessionContext,
} from "@/mock/vendreResponses";
import type {
  Cart,
  CartLine,
  Category,
  CategoryQuery,
  MenuNode,
  Product,
  RawBootstrapResponse,
  RawCartResponse,
  RawCategoryResponse,
  RawCartProduct,
  RawMenuItem,
  RawMenusResponse,
  RawProduct,
  RawSessionContext,
  StoreContext,
} from "@/types/vendre";

import {
  VendreError,
  getVendreToken,
  setMutationProtectionToken,
  surfaceFetch,
} from "./client";

/* --------------------------------------------------------------- helpers */

let storeBaseUrl = "";

function absolute(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return storeBaseUrl ? `${storeBaseUrl}${path.startsWith("/") ? "" : "/"}${path}` : null;
}

function toNumber(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normaliseProduct(raw: RawProduct): Product {
  const stock = toNumber(raw.stock_calculated ?? raw.stock_total);
  const gallery = (raw.images ?? [])
    .map((image) => absolute(image.image ?? image.path))
    .filter((value): value is string => Boolean(value));
  const main = absolute(raw.image?.image ?? raw.image?.path);
  const original = raw.price_original_raw ?? null;

  return {
    id: String(raw.id),
    name: raw.name,
    model: raw.model ?? null,
    description: raw.description ?? "",
    descriptionShort: raw.description_short ?? "",
    price: raw.price,
    priceRaw: raw.price_raw,
    priceOriginal: original && original > raw.price_raw ? (raw.price_original ?? null) : null,
    onSale: Boolean(original && original > raw.price_raw),
    image: main ?? gallery[0] ?? null,
    images: main ? [main, ...gallery.filter((url) => url !== main)] : gallery,
    inStock: raw.stock_allow_checkout !== false && (stock === null || stock > 0),
    stock,
    manufacturer: raw.manufacturer_name ?? null,
    // Variant data lives behind has_attributes in Surface v2; demo mode ships
    // a size axis so the PDP variant picker is exercised in the template.
    variants: raw.has_attributes
      ? ["S", "M", "L", "XL"].map((size) => ({ id: `${raw.id}-${size}`, name: size }))
      : [],
  };
}

function normaliseCategory(raw: RawCategoryResponse): Category {
  const headerImage =
    typeof raw.header.image === "string"
      ? absolute(raw.header.image)
      : absolute(raw.header.image?.image ?? raw.header.image?.path);

  return {
    id: raw.header.id,
    name: raw.header.name,
    text: raw.header.text ?? "",
    image: headerImage,
    productCount: raw.product_count ?? raw.product_list.length,
    pageCount: raw.page_count ?? 1,
    pageIndex: raw.page_index ?? 1,
    sortBy: raw.sort_by ?? "name",
    sortOrder: raw.sort_order ?? "ASC",
    subcategories: (raw.subcategory_list ?? []).map((item) => ({ id: item.id, name: item.name })),
    filters: (raw.filters ?? []).map((filter) => ({
      id: filter.id,
      name: filter.name,
      options: (filter.options ?? []).map((option) => ({ id: option.id, name: option.name })),
    })),
    products: (raw.product_list ?? []).map(normaliseProduct),
  };
}

function buildMenuTree(items: RawMenuItem[]): MenuNode[] {
  const nodes = new Map<number, MenuNode>();
  for (const item of items) {
    nodes.set(item.id, {
      id: item.id,
      name: item.name,
      type: item.menu_type,
      target: item.target,
      children: [],
    });
  }
  const roots: MenuNode[] = [];
  for (const item of items) {
    const node = nodes.get(item.id)!;
    const parent = item.parent_id === null ? null : nodes.get(item.parent_id);
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  return roots;
}

function normaliseCart(raw: RawCartResponse, pricesIncludeVat: boolean): Cart {
  const lines: CartLine[] = (raw.products ?? []).map((line: RawCartProduct, index) => {
    const quantity = toNumber(line.quantity) ?? 1;
    const priceRaw = toNumber(line.price_raw) ?? 0;
    return {
      lineId: String(line.cart_id ?? line.id ?? line.products_id ?? index),
      productId: String(line.products_id ?? line.id ?? ""),
      name: line.name ?? "",
      quantity,
      price: line.price ?? "",
      priceRaw,
      total: line.total ?? "",
      image: absolute(line.image?.image ?? line.image?.path),
    };
  });

  return {
    lines,
    count: raw.cart_count ?? lines.reduce((sum, line) => sum + line.quantity, 0),
    total: raw.cart_total ?? raw.total ?? "",
    totalRaw: raw.total_raw ?? 0,
    pricesIncludeVat,
  };
}

function normaliseContext(raw: RawSessionContext): StoreContext {
  return {
    storeName: raw.STORE_NAME ?? "Vendre",
    currency: raw.currency?.code ?? "SEK",
    language: raw.language?.code ?? "sv",
    pricesIncludeVat: raw.prices_include_vat !== false,
    authenticated: Boolean(raw.authenticated),
    cartItemCount: raw.cart_item_count ?? 0,
  };
}

/* ------------------------------------------------------------ live layer */

let bootstrapPromise: Promise<RawBootstrapResponse> | null = null;

async function bootstrapSession(force = false): Promise<RawBootstrapResponse> {
  if (force) bootstrapPromise = null;
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const token = await getVendreToken();
      storeBaseUrl = token.baseUrl;
      const response = await surfaceFetch("session/bootstrap", { method: "POST" });
      if (!response.ok) throw new VendreError("session/bootstrap misslyckades", response.status);
      const data = (await response.json()) as RawBootstrapResponse;
      setMutationProtectionToken(data.surface_mutation_protection_token);
      return data;
    })().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }
  return bootstrapPromise;
}

/** Every live call goes through here: session gate + one re-bootstrap on 401. */
async function live<T>(path: string, init?: RequestInit & { method?: string }): Promise<T> {
  await bootstrapSession();

  const call = async () => {
    const response = await surfaceFetch(path, init);
    const body = (await response.json().catch(() => null)) as
      | (T & { errors?: { code?: string; title?: string }[] })
      | null;
    if (!response.ok) {
      const first = body?.errors?.[0];
      throw new VendreError(
        first?.title ?? `Surface-anrop misslyckades (${response.status})`,
        response.status,
        first?.code,
      );
    }
    return body as T;
  };

  try {
    return await call();
  } catch (error) {
    const err = error as VendreError;
    if (err.status === 401) {
      await bootstrapSession(true);
      return call();
    }
    // The store rate-limits bursts; one short backoff keeps the page from
    // falling back to an empty listing.
    if (err.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return call();
    }
    throw error;
  }
}

/**
 * Read-through cache for cacheable GETs (menus, categories). Cart and session
 * context are never cached — see .vendre/skills/caching.md.
 */
const readCache = new Map<string, { at: number; value: unknown }>();
const CACHE_TTL = 5 * 60_000;

async function liveCached<T>(path: string): Promise<T> {
  const hit = readCache.get(path);
  if (hit && Date.now() - hit.at < CACHE_TTL) return hit.value as T;
  const value = await live<T>(path);
  readCache.set(path, { at: Date.now(), value });
  return value;
}


/* ------------------------------------------------------------- demo cart */

type DemoLine = { product: Product; quantity: number };
let demoCart: DemoLine[] = [];

function demoCartSnapshot(): Cart {
  const lines = demoCart.map((line, index) => ({
    lineId: `demo-${line.product.id}-${index}`,
    productId: line.product.id,
    name: line.product.name,
    quantity: line.quantity,
    price: line.product.price,
    priceRaw: line.product.priceRaw,
    total: `${line.product.priceRaw * line.quantity} kr`,
    image: line.product.image,
  }));
  const totalRaw = lines.reduce((sum, line) => sum + line.priceRaw * line.quantity, 0);
  return {
    lines,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    total: `${totalRaw} kr`,
    totalRaw,
    pricesIncludeVat: emptyMockCart.total_raw === 0,
  };
}

/* --------------------------------------------------------------- adapter */

export type VendreApi = {
  demo: boolean;
  getSessionContext: () => Promise<StoreContext>;
  getMenus: () => Promise<MenuNode[]>;
  getCategory: (id: number, query?: CategoryQuery) => Promise<Category>;
  getProduct: (id: string) => Promise<Product | null>;
  getFeaturedProducts: () => Promise<Product[]>;
  getCart: () => Promise<Cart>;
  addToCart: (productId: string, quantity?: number) => Promise<Cart>;
  updateQty: (line: CartLine, quantity: number) => Promise<Cart>;
  removeLine: (line: CartLine) => Promise<Cart>;
  checkoutUrl: () => Promise<string | null>;
};

function demoApi(): VendreApi {
  return {
    demo: true,
    getSessionContext: async () => normaliseContext(mockSessionContext),
    getMenus: async () => buildMenuTree(mockMenus.menus),
    getCategory: async (id) => normaliseCategory(mockCategory(id)),
    getProduct: async (id) => {
      const raw = mockProduct(id);
      return raw ? normaliseProduct(raw) : null;
    },
    getFeaturedProducts: async () =>
      mockFeaturedIds
        .map((id) => mockProduct(id))
        .filter((raw): raw is RawProduct => Boolean(raw))
        .map(normaliseProduct),
    getCart: async () => demoCartSnapshot(),
    addToCart: async (productId, quantity = 1) => {
      const raw = mockProduct(productId);
      if (raw) {
        const product = normaliseProduct(raw);
        const existing = demoCart.find((line) => line.product.id === product.id);
        if (existing) existing.quantity += quantity;
        else demoCart.push({ product, quantity });
      }
      return demoCartSnapshot();
    },
    updateQty: async (line, quantity) => {
      demoCart = demoCart
        .map((entry) => (entry.product.id === line.productId ? { ...entry, quantity } : entry))
        .filter((entry) => entry.quantity > 0);
      return demoCartSnapshot();
    },
    removeLine: async (line) => {
      demoCart = demoCart.filter((entry) => entry.product.id !== line.productId);
      return demoCartSnapshot();
    },
    checkoutUrl: async () => null,
  };
}

/** Category menu nodes, deepest first — leaves are where products actually live. */
async function leafCategories(): Promise<MenuNode[]> {
  const menus = buildMenuTree((await liveCached<RawMenusResponse>("navigation/menus")).menus ?? []);
  const walk = (nodes: MenuNode[], depth: number): { node: MenuNode; depth: number }[] =>
    nodes.flatMap((node) => [{ node, depth }, ...walk(node.children, depth + 1)]);
  return walk(menus, 0)
    .filter((entry) => entry.node.type === "category")
    .sort((a, b) => (b.node.children.length === 0 ? 1 : 0) - (a.node.children.length === 0 ? 1 : 0) || b.depth - a.depth)
    .map((entry) => entry.node);
}

function liveApi(): VendreApi {

  const context = async () => {
    const raw = await live<RawSessionContext>("session/context");
    return normaliseContext(raw);
  };

  const cart = async () => {
    const [raw, ctx] = await Promise.all([live<RawCartResponse>("shopping-cart"), context()]);
    return normaliseCart(raw, ctx.pricesIncludeVat);
  };

  const mutateCart = async (path: string, body: unknown, method = "POST") => {
    await live(path, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return cart();
  };

  return {
    demo: false,
    getSessionContext: context,
    getMenus: async () =>
      buildMenuTree((await liveCached<RawMenusResponse>("navigation/menus")).menus ?? []),
    getCategory: async (id, query) => {
      const params = new URLSearchParams();
      if (query?.page) params.set("page", String(query.page));
      if (query?.limit) params.set("limit", String(query.limit));
      if (query?.sortBy) params.set("sort_by", query.sortBy);
      if (query?.sortOrder) params.set("sort_order", query.sortOrder);
      for (const tag of query?.tags ?? []) params.append("tags[]", String(tag));
      const suffix = params.toString() ? `?${params}` : "";
      return normaliseCategory(await liveCached<RawCategoryResponse>(`categories/${id}${suffix}`));
    },
    getProduct: async (id) => {
      // Surface v2 exposes products through their category listing; the PDP
      // resolves the product from the category it belongs to.
      for (const node of await leafCategories()) {
        const category = normaliseCategory(
          await liveCached<RawCategoryResponse>(`categories/${node.id}?limit=48`),
        );
        const found = category.products.find((product) => product.id === id);
        if (found) return found;
      }
      return null;
    },
    getFeaturedProducts: async () => {
      // Parent categories in Vendre often carry no products of their own, so we
      // walk the tree until a listing actually returns products.
      const collected: Product[] = [];
      for (const node of (await leafCategories()).slice(0, 5)) {
        const category = normaliseCategory(
          await liveCached<RawCategoryResponse>(`categories/${node.id}?limit=8`),
        );
        for (const product of category.products) {
          if (!collected.some((entry) => entry.id === product.id)) collected.push(product);
        }
        if (collected.length >= 8) break;
      }
      return collected.slice(0, 8);
    },


    getCart: cart,
    addToCart: (productId, quantity = 1) =>
      mutateCart("shopping-cart/products", { products: [{ id: productId, quantity }] }),
    updateQty: (line, quantity) =>
      mutateCart("shopping-cart/products", { products: [{ id: line.productId, quantity }] }),
    removeLine: (line) => mutateCart("shopping-cart", { id: line.lineId }, "DELETE"),
    checkoutUrl: async () => {
      const token = await getVendreToken();
      storeBaseUrl = token.baseUrl;
      return `${token.baseUrl}/checkout`;
    },
  };
}

export function getVendreApi(): VendreApi {
  return isStoreConfigured() ? liveApi() : demoApi();
}

export function useVendreApi(): VendreApi {
  const { isConfigured } = useOnboarding();
  return useMemo(() => (isConfigured ? liveApi() : demoApi()), [isConfigured]);
}

export const mockProductList = mockProducts;
