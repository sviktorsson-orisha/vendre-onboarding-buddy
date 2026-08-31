/**
 * Storefront hooks: Demo Mode returns dummy data synchronously, Live Mode
 * fetches from Vendre Surface v2. Live failures surface as an error (no silent
 * fallback to dummy data) so the user is pointed back at the setup wizard.
 */
import { useCallback, useEffect, useRef, useState } from "react";

import { useIsConfigured } from "@/lib/store/onboarding-state";
import {
  getLiveCategories,
  getLiveCategory,
  getLiveFeaturedProducts,
  getLiveNavigation,
  getLiveProduct,
  type CategoryQuery,
} from "@/lib/vendre/catalog";
import { ensureSession } from "@/lib/vendre/session";

import {
  getCategories,
  getCategoryBySlug,
  getFeaturedProducts,
  getNavigation,
  getProductBySlug,
  getProducts,
  getStore,
} from "./data";
import type { StoreCategory, StoreInfo, StoreProduct } from "./types";

export type Async<T> = {
  data: T | undefined;
  isLoading: boolean;
  error: Error | undefined;
  isLive: boolean;
};

function toError(value: unknown): Error {
  if (value instanceof Error) return value;
  return new Error(typeof value === "string" ? value : "Kunde inte hämta data från Vendre.");
}

function useAsyncData<T>(
  demo: () => T,
  live: () => Promise<T>,
  deps: unknown[],
): Async<T> {
  const isConfigured = useIsConfigured();
  const [state, setState] = useState<{ data: T | undefined; error: Error | undefined; isLoading: boolean }>(() => ({
    data: undefined,
    error: undefined,
    isLoading: isConfigured,
  }));

  const liveRef = useRef(live);
  liveRef.current = live;
  const demoRef = useRef(demo);
  demoRef.current = demo;

  useEffect(() => {
    let cancelled = false;

    if (!isConfigured) {
      setState({ data: demoRef.current(), error: undefined, isLoading: false });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: undefined }));
    ensureSession()
      .then(() => liveRef.current())
      .then((data) => {
        if (!cancelled) setState({ data, error: undefined, isLoading: false });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ data: undefined, error: toError(error), isLoading: false });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfigured, ...deps]);

  return { ...state, isLive: isConfigured };
}

export function useStoreInfo(): StoreInfo {
  const isConfigured = useIsConfigured();
  const [, force] = useState(0);
  const rerender = useCallback(() => force((n) => n + 1), []);

  useEffect(() => {
    if (!isConfigured) return;
    let cancelled = false;
    ensureSession()
      .then(() => {
        if (!cancelled) rerender();
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [isConfigured, rerender]);

  return getStore();
}

export function useNavigation(): Async<StoreCategory[]> {
  return useAsyncData(() => getNavigation(), () => getLiveNavigation(), []);
}

export function useCategories(): Async<StoreCategory[]> {
  return useAsyncData(() => getCategories(), () => getLiveCategories(), []);
}

export function useFeaturedProducts(): Async<StoreProduct[]> {
  return useAsyncData(() => getFeaturedProducts(), () => getLiveFeaturedProducts(), []);
}

export type CategoryPage = {
  category: StoreCategory;
  products: StoreProduct[];
  productCount: number;
  pageCount: number;
};

export function useCategoryPage(slug: string, query: CategoryQuery = {}): Async<CategoryPage> {
  const { page, limit, sortBy, sortOrder } = query;
  return useAsyncData<CategoryPage>(
    () => {
      const category = getCategoryBySlug(slug);
      if (!category) throw new Error("Kategorin hittades inte.");
      const products = getProducts(category.id);
      return { category, products, productCount: products.length, pageCount: 1 };
    },
    async () => {
      const result = await getLiveCategory(slug, query);
      return result;
    },
    [slug, page, limit, sortBy, sortOrder],
  );
}

export function useProduct(slug: string): Async<StoreProduct> {
  return useAsyncData<StoreProduct>(
    () => {
      const product = getProductBySlug(slug);
      if (!product) throw new Error("Produkten hittades inte.");
      return product;
    },
    () => getLiveProduct(slug),
    [slug],
  );
}
