/**
 * Storefront data layer.
 *
 * Today every read returns local dummy data (Demo Mode). When the Vendre
 * connection is verified these functions are the single place to swap in
 * Surface v2 calls (categories, VQL, shopping-cart) — the UI does not change.
 */
import {
  demoCategories,
  demoFooterColumns,
  demoProducts,
  demoStore,
  type DemoCategory,
  type DemoProduct,
} from "@/mock/dummyData";

export type { DemoCategory, DemoProduct };

export function getStore() {
  return demoStore;
}

export function getCategories(): DemoCategory[] {
  return demoCategories;
}

export function getNavigation(): DemoCategory[] {
  return demoCategories;
}

export function getFooterColumns() {
  return demoFooterColumns;
}

export function getCategoryBySlug(slug: string): DemoCategory | undefined {
  return demoCategories.find((category) => category.slug === slug);
}

export function getProducts(categoryId?: string): DemoProduct[] {
  if (!categoryId) return demoProducts;
  return demoProducts.filter((product) => product.categoryId === categoryId);
}

export function getFeaturedProducts(): DemoProduct[] {
  return demoProducts.filter((product) => product.featured);
}

export function getProductBySlug(slug: string): DemoProduct | undefined {
  return demoProducts.find((product) => product.slug === slug);
}

export function formatPrice(amount: number, currency = demoStore.currency) {
  return new Intl.NumberFormat(demoStore.locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
