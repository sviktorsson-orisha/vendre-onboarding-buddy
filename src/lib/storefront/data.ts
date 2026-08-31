/**
 * Storefront data layer.
 *
 * Demo Mode (isConfigured === false) reads local dummy data.
 * Live Mode  (isConfigured === true)  reads Vendre Surface v2.
 *
 * The UI always consumes the shared view models in ./types.
 */
import {
  demoCategories,
  demoFooterColumns,
  demoProducts,
  demoStore,
} from "@/mock/dummyData";
import { getSessionContext } from "@/lib/vendre/session";

import type { FooterColumn, StoreCategory, StoreInfo, StoreProduct } from "./types";

export type { StoreCategory, StoreInfo, StoreProduct, StoreVariant, FooterColumn } from "./types";
/** @deprecated kept for existing imports — use StoreProduct / StoreCategory. */
export type DemoProduct = StoreProduct;
export type DemoCategory = StoreCategory;

export function getStore(): StoreInfo {
  const session = getSessionContext();
  if (!session) return demoStore;
  return {
    name: session.storeName,
    currency: session.currency,
    locale: session.locale,
    pricesIncludeVat: session.pricesIncludeVat,
    heroImage: demoStore.heroImage,
  };
}

export function getDemoStore(): StoreInfo {
  return demoStore;
}

export function getCategories(): StoreCategory[] {
  return demoCategories;
}

export function getNavigation(): StoreCategory[] {
  return demoCategories;
}

export function getFooterColumns(): FooterColumn[] {
  return demoFooterColumns;
}

export function getCategoryBySlug(slug: string): StoreCategory | undefined {
  return demoCategories.find((category) => category.slug === slug);
}

export function getProducts(categoryId?: string): StoreProduct[] {
  if (!categoryId) return demoProducts;
  return demoProducts.filter((product) => product.categoryId === categoryId);
}

export function getFeaturedProducts(): StoreProduct[] {
  return demoProducts.filter((product) => product.featured);
}

export function getProductBySlug(slug: string): StoreProduct | undefined {
  return demoProducts.find((product) => product.slug === slug);
}

export function formatPrice(amount: number, currency?: string) {
  const session = getSessionContext();
  const locale = session?.locale ?? demoStore.locale;
  const code = currency ?? session?.currency ?? demoStore.currency;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  }).format(amount);
}
