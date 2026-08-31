/**
 * Shared storefront view models.
 *
 * Both the Demo Mode dummy data and the live Vendre Surface v2 responses are
 * normalised into these shapes, so the UI is identical in both modes.
 */
export type StoreInfo = {
  name: string;
  currency: string;
  locale: string;
  pricesIncludeVat: boolean;
  heroImage: string;
};

export type StoreCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  children: { id: string; name: string; slug: string }[];
};

export type StoreVariant = {
  id: string;
  name: string;
  inStock: boolean;
};

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  subcategoryId?: string;
  description: string;
  priceIncVat: number;
  comparePriceIncVat?: number;
  vatRate: number;
  currency: string;
  images: string[];
  variants: StoreVariant[];
  badge?: string;
  featured?: boolean;
};

export type FooterColumn = { title: string; links: string[] };
