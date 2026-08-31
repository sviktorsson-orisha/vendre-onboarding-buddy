/**
 * TypeScript-typer för Vendre Surface API v2.
 *
 * Källa: .vendre/knowledge/api-reference.md (source of truth) och
 * .vendre/knowledge/general.md + .vendre/skills/.
 *
 * OBS: api-reference.md är normativ för endpoints, metoder, CORS-policyer,
 * headers, felformat och query-konventioner. Fältnamn som referensen och
 * skills uttryckligen namnger används exakt (t.ex.
 * `surface_mutation_protection_token`, `prices_include_vat`, `product_count`,
 * `currency.code`, `STORE_NAME`, `SHOP_LOGO`). Övriga fält på produkt-,
 * kategori- och kundvagnsradnivå är HÄRLEDDA i samma snake_case-stil och ska
 * verifieras mot ett riktigt live-svar första gången butiken kopplas upp.
 * All sådan mappning är isolerad till src/lib/vendre/use-vendre-api.ts.
 */

/* ------------------------------------------------------------------ */
/* Fel (api-reference.md §1.7)                                         */
/* ------------------------------------------------------------------ */

export type VendreErrorObject = {
  id?: string;
  status: string;
  code: string;
  title: string;
  detail?: string;
  public?: boolean;
  source?: { pointer?: string; parameter?: string; header?: string };
};

export type VendreErrorResponse = { errors: VendreErrorObject[] };

/* ------------------------------------------------------------------ */
/* Session (api-reference.md §2.2)                                     */
/* ------------------------------------------------------------------ */

export type VendreCurrency = { code: string };
export type VendreLanguage = { id: number; code: string };
export type VendreMarket = { id: number };

export type VendreCustomer = {
  id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
} | null;

export type VendreBootstrapResponse = {
  session_id: string;
  is_new: boolean;
  customer_group_id: number;
  authenticated: boolean;
  customer: VendreCustomer;
  cart_item_count: number;
  customer_type: string | null;
  currency: VendreCurrency;
  language: VendreLanguage;
  market: VendreMarket;
  prices_include_vat: boolean;
  surface_mutation_protection_token: string;
  surface_mutation_protection_token_expires_at?: number;
  surface_mutation_protection_token_expires_in?: number;
};

/** GET /surface/2/session — kompakt status. */
export type VendreSession = {
  authenticated: boolean;
  cart_item_count: number;
};

/** GET /surface/2/session/context — utökad kontext + butikskonfiguration. */
export type VendreSessionContext = {
  authenticated: boolean;
  customer: VendreCustomer;
  cart_item_count: number;
  currency: VendreCurrency;
  language: VendreLanguage;
  market: VendreMarket;
  prices_include_vat: boolean;
  STORE_NAME: string;
  SHOP_LOGO: string;
};

/* ------------------------------------------------------------------ */
/* Navigation (api-reference.md §2.6)                                  */
/* ------------------------------------------------------------------ */

export type VendreMenuItemType = "category" | "information_page" | "url";

export type VendreMenuItem = {
  id: number;
  title: string;
  type: VendreMenuItemType;
  /** Satt när type === "category". */
  category_id?: number;
  /** Satt när type === "information_page" (gallery-id). */
  gallery_id?: number;
  url: string;
  children?: VendreMenuItem[];
};

export type VendreMenuGroup = {
  title: string;
  items: VendreMenuItem[];
};

export type VendreNavigationMenus = {
  menus: {
    header: VendreMenuItem[];
    footer: VendreMenuGroup[];
  };
};

/* ------------------------------------------------------------------ */
/* Pris                                                                */
/* ------------------------------------------------------------------ */

export type VendrePrice = {
  /** Belopp i valutans huvudenhet. */
  value: number;
  formatted: string;
  currency: string;
  /** Speglar sessionens prices_include_vat vid tillfället svaret skapades. */
  includes_vat: boolean;
  vat_rate: number;
  /** Ordinarie pris när produkten är nedsatt. */
  compare_at_value?: number | null;
  compare_at_formatted?: string | null;
};

/* ------------------------------------------------------------------ */
/* Katalog (api-reference.md §2.5)                                     */
/* ------------------------------------------------------------------ */

export type VendreImage = { url: string; alt: string };

export type VendreVariantOption = {
  /** T.ex. "Storlek" eller "Färg". */
  name: string;
  value: string;
};

export type VendreVariant = {
  id: number;
  sku: string;
  name: string;
  in_stock: boolean;
  stock_quantity: number;
  price: VendrePrice;
  image?: VendreImage | null;
  options: VendreVariantOption[];
};

export type VendreProduct = {
  id: number;
  sku: string;
  name: string;
  slug: string;
  brand?: string | null;
  short_description: string;
  description: string;
  in_stock: boolean;
  stock_quantity: number;
  images: VendreImage[];
  price: VendrePrice;
  tags: number[];
  category_ids: number[];
  variants: VendreVariant[];
  attributes: { name: string; value: string }[];
};

export type VendreFilterValue = {
  /** Tag-id, används som `tags[]=<id>`. */
  id: number;
  title: string;
  count: number;
};

export type VendreFilter = {
  code: string;
  title: string;
  values: VendreFilterValue[];
};

export type VendreSortOption = {
  sort_by: string;
  sort_order: "asc" | "desc";
  title: string;
};

export type VendreCategorySummary = {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  product_count: number;
};

/** GET /surface/2/categories/{id} */
export type VendreCategoryResponse = {
  id: number;
  name: string;
  slug: string;
  description: string;
  banner_image?: string | null;
  product_count: number;
  page: number;
  limit: number;
  page_count: number;
  subcategories: VendreCategorySummary[];
  products: VendreProduct[];
  filters: VendreFilter[];
  sort_options: VendreSortOption[];
};

/** Query-parametrar enligt api-reference.md §1.9. */
export type VendreListingParams = {
  page?: number | undefined;
  limit?: number | undefined;
  sort_by?: string | undefined;
  sort_order?: "asc" | "desc" | undefined;
  tags?: number[] | undefined;
  pfrom?: number | undefined;
  pto?: number | undefined;
};

/* ------------------------------------------------------------------ */
/* Kundvagn (api-reference.md §2.4)                                    */
/* ------------------------------------------------------------------ */

export type VendreCartLine = {
  /** Radens id — används i DELETE /surface/2/shopping-cart. */
  id: number;
  product_id: number;
  variant_id: number | null;
  sku: string;
  name: string;
  slug: string;
  quantity: number;
  image?: VendreImage | null;
  options: VendreVariantOption[];
  unit_price: VendrePrice;
  row_total: VendrePrice;
};

export type VendreCartTotals = {
  sub_total: VendrePrice;
  vat: VendrePrice;
  shipping: VendrePrice;
  grand_total: VendrePrice;
};

export type VendreCoupon = { code: string; title: string; active: boolean };

/** GET /surface/2/shopping-cart */
export type VendreCart = {
  items: VendreCartLine[];
  item_count: number;
  prices_include_vat: boolean;
  totals: VendreCartTotals;
  coupons: VendreCoupon[];
};
