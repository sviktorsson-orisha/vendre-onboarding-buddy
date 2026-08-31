/**
 * Dataadapter: samma funktionssignaturer i demoläge och live-läge.
 *
 * - isConfigured === false → svar från src/mock/vendreResponses.ts
 * - isConfigured === true  → riktiga anrop mot /surface/2/* via surfaceJson
 *
 * Cachestrategi enligt .vendre/skills/caching.md:
 * menyer, kategorier och produkter cachas; session och kundvagn hämtas alltid
 * färskt (staleTime: 0, gcTime: 0).
 */

import { useQuery } from "@tanstack/react-query";

import {
  buildMockCategory,
  findMockProduct,
  mockNavigationMenus,
  mockSessionContext,
} from "@/mock/vendreResponses";
import type {
  VendreCategoryResponse,
  VendreListingParams,
  VendreNavigationMenus,
  VendreProduct,
  VendreSessionContext,
} from "@/types/vendre";

import { surfaceJson, setMutationProtectionToken } from "./client";
import { useOnboarding } from "./onboarding-context";

let bootstrapped: Promise<void> | null = null;

/** POST session/bootstrap exakt en gång; allt annat gate:as på detta löfte. */
export function ensureSession() {
  if (!bootstrapped) {
    bootstrapped = surfaceJson<{ surface_mutation_protection_token?: string }>("session/bootstrap", {
      method: "POST",
    })
      .then((data) => {
        setMutationProtectionToken(data.surface_mutation_protection_token ?? null);
      })
      .catch((error) => {
        bootstrapped = null;
        throw error;
      });
  }
  return bootstrapped;
}

async function live<T>(path: string, init?: RequestInit & { method?: string }) {
  await ensureSession();
  return surfaceJson<T>(path, init);
}

/**
 * Live-anrop med mockad reserv. Så länge butiken inte är CORS-allowlistad
 * (eller endpointen saknas på installationen) fortsätter mallen att rendera
 * demodata i stället för en tom sida.
 */
async function liveOrMock<T>(request: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await request();
  } catch {
    return fallback;
  }
}

function listingQuery(params: VendreListingParams) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.sort_by) search.set("sort_by", params.sort_by);
  if (params.sort_order) search.set("sort_order", params.sort_order);
  if (params.pfrom !== undefined) search.set("pfrom", String(params.pfrom));
  if (params.pto !== undefined) search.set("pto", String(params.pto));
  // Array-parametrar använder brackets (api-reference.md §1.9).
  for (const tag of params.tags ?? []) search.append("tags[]", String(tag));
  const query = search.toString();
  return query ? `?${query}` : "";
}

/** Sorterar/filtrerar mockdata lokalt så demoläget beter sig som servern. */
function applyMockListing(category: VendreCategoryResponse, params: VendreListingParams) {
  let products = category.products;
  if (params.tags?.length) {
    products = products.filter((product) => params.tags!.every((tag) => product.tags.includes(tag)));
  }
  if (params.sort_by === "price") {
    products = [...products].sort((a, b) =>
      params.sort_order === "desc" ? b.price.value - a.price.value : a.price.value - b.price.value,
    );
  } else if (params.sort_by === "name") {
    products = [...products].sort((a, b) => a.name.localeCompare(b.name, "sv"));
  }
  return { ...category, products, product_count: products.length };
}

/** Slår upp kategori-id från menyträdet så rutterna kan använda slugs. */
function findCategoryId(menus: VendreNavigationMenus, slug: string): number | null {
  const walk = (items: VendreNavigationMenus["menus"]["header"]): number | null => {
    for (const item of items) {
      if (item.type === "category" && item.url.endsWith(`/${slug}`)) return item.category_id ?? null;
      const child = item.children ? walk(item.children) : null;
      if (child) return child;
    }
    return null;
  };
  return walk(menus.menus.header);
}

const STATIC = { staleTime: 5 * 60 * 1000, gcTime: 30 * 60 * 1000 };
const LIVE_ONLY = { staleTime: 0, gcTime: 0 };

export function useVendreApi() {
  const { isConfigured } = useOnboarding();

  return {
    isConfigured,

    /** GET session/context — aldrig cachad. */
    async getSessionContext(): Promise<VendreSessionContext> {
      if (!isConfigured) return mockSessionContext;
      return liveOrMock(() => live<VendreSessionContext>("session/context"), mockSessionContext);
    },

    /** GET navigation/menus — cachas hårt. */
    async getNavigation(): Promise<VendreNavigationMenus> {
      if (!isConfigured) return mockNavigationMenus;
      return liveOrMock(() => live<VendreNavigationMenus>("navigation/menus"), mockNavigationMenus);
    },

    /** GET categories/{id} — filtrering, sortering och paginering på servern. */
    async getCategory(slug: string, params: VendreListingParams = {}) {
      if (!isConfigured) {
        const category = buildMockCategory(slug);
        return category ? applyMockListing(category, params) : null;
      }
      const mock = buildMockCategory(slug);
      return liveOrMock(async () => {
        const menus = await live<VendreNavigationMenus>("navigation/menus");
        const id = findCategoryId(menus, slug);
        if (!id) throw new Error("Okänd kategori");
        return live<VendreCategoryResponse>(`categories/${id}${listingQuery(params)}`);
      }, mock ? applyMockListing(mock, params) : null);
    },

    async getProduct(slug: string): Promise<VendreProduct | null> {
      if (!isConfigured) return findMockProduct(slug);
      // POST vql är primärkälla; faller tillbaka på kategorisvaret när VQL
      // inte är påslaget på installationen (api-reference.md §4).
      const data = await liveOrMock<{ products?: VendreProduct[] }>(
        () =>
          live<{ products?: VendreProduct[] }>("vql", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ resource: "products", filter: { slug }, limit: 1 }),
          }),
        { products: [findMockProduct(slug)].filter(Boolean) as VendreProduct[] },
      );
      return data.products?.[0] ?? null;
    },
  };
}

export function useSessionContext() {
  const api = useVendreApi();
  return useQuery({
    queryKey: ["vendre", "session-context", api.isConfigured],
    queryFn: () => api.getSessionContext(),
    ...LIVE_ONLY,
  });
}

export function useNavigation() {
  const api = useVendreApi();
  return useQuery({
    queryKey: ["vendre", "navigation", api.isConfigured],
    queryFn: () => api.getNavigation(),
    ...STATIC,
  });
}

export function useCategory(slug: string, params: VendreListingParams) {
  const api = useVendreApi();
  return useQuery({
    queryKey: ["vendre", "category", api.isConfigured, slug, params],
    queryFn: () => api.getCategory(slug, params),
    ...STATIC,
  });
}

export function useProduct(slug: string) {
  const api = useVendreApi();
  return useQuery({
    queryKey: ["vendre", "product", api.isConfigured, slug],
    queryFn: () => api.getProduct(slug),
    ...STATIC,
  });
}
