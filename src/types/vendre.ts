/**
 * Vendre Surface v2 response types.
 *
 * These types were captured from live Surface v2 responses on a Vendre store
 * (`navigation/menus`, `categories/{id}`, `shopping-cart`, `session/context`,
 * `session/bootstrap`) and follow `.vendre/knowledge/api-reference.md`.
 * Field names are the API's own — never rename them in the data layer.
 */

/** Standard Surface error object — api-reference.md §1.7. */
export type VendreApiError = {
  id?: string;
  status: string;
  code: string;
  title: string;
  detail?: string;
  public?: boolean;
  source?: { pointer?: string; parameter?: string; header?: string };
};

export type VendreErrorEnvelope = { errors: VendreApiError[] };

/* -------------------------------------------------------------------------- */
/* Session                                                                     */
/* -------------------------------------------------------------------------- */

export type VendreCurrency = { code: string; formatter?: string; rounder?: string };
export type VendreLanguage = { id: number; code: string };
export type VendreMarket = { id: number };

export type VendreCustomer = {
  id?: number | string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
} | null;

export type VendreSessionBootstrap = {
  session_id: string;
  is_new: boolean;
  customer_group_id: number;
  authenticated: boolean;
  cart_item_count: number;
  customer: VendreCustomer;
  customer_type: string | null;
  currency: VendreCurrency;
  language: VendreLanguage;
  market: VendreMarket;
  prices_include_vat: boolean;
  surface_mutation_protection_token: string;
  surface_mutation_protection_token_expires_at: number;
  surface_mutation_protection_token_expires_in: number;
};

export type VendreSessionContext = {
  authenticated: boolean;
  cart_item_count: number;
  customer: VendreCustomer;
  customer_type: string | null;
  currency: VendreCurrency;
  language: VendreLanguage;
  market: VendreMarket;
  prices_include_vat: boolean;
  configuration: {
    STORE_NAME?: string;
    SHOP_LOGO?: string;
    [key: string]: string | undefined;
  };
};

/* -------------------------------------------------------------------------- */
/* Navigation                                                                  */
/* -------------------------------------------------------------------------- */

export type VendreMenuItem = {
  id: number;
  entity_id: number;
  source: string;
  parent_id: number | null;
  parent_source: string | null;
  menu_type: string;
  name: string;
  icon: string | null;
  target: string | null;
  route: string | null;
  quick_command_letter: string | null;
  attributes: unknown[];
  has_children: boolean;
};

export type VendreMenusResponse = { menus: VendreMenuItem[] };

/* -------------------------------------------------------------------------- */
/* Catalogue                                                                   */
/* -------------------------------------------------------------------------- */

export type VendreImage = {
  id: string | number;
  path: string;
  image: string;
  alt: string | null;
  alt_translated: string | null;
};

export type VendreProduct = {
  id: string;
  parent_id: string | null;
  name: string;
  name_default_language: string;
  model: string;
  seo_link: string;
  href: string;
  description: string;
  description_short: string;
  /** VAT percentage for the product. */
  tax: number;
  unit: string;
  price: string;
  price_raw: number;
  price_original: string | null;
  price_original_raw: number | null;
  price_recommended: string | null;
  price_recommended_raw: number | null;
  price_special: string | null;
  /** Price excluding VAT — use when `prices_include_vat` is false. */
  final_price_excl_raw: number;
  image: VendreImage | null;
  images: VendreImage[];
  categories_id: string;
  quantity: string;
  stock_total: number;
  stock_calculated: number;
  stock_allow_checkout: boolean;
  has_attributes: boolean;
  child_count: string;
  manufacturer_name: string | null;
  tags: unknown[];
  products_status: string;
  /** Variant rows, present on products with a variant tree. */
  variants?: VendreVariant[];
};

export type VendreVariant = {
  id: string;
  name: string;
  model: string;
  price: string;
  price_raw: number;
  stock_calculated: number;
  stock_allow_checkout: boolean;
};

export type VendreCategoryHeader = {
  id: number;
  name: string;
  alternative_name: string | null;
  icon: string | null;
  image: VendreImage | null;
  images: VendreImage[];
  text: string;
  alternative_text: string | null;
  meta_title: string | null;
  meta_keywords: string | null;
  meta_description: string | null;
  href: string;
};

export type VendreSubcategory = {
  id: number;
  name: string;
  href: string;
  icon: string | null;
  image: VendreImage | null;
  images: VendreImage[];
};

export type VendrePageLimit = { name: string | number; limit: number; selected: boolean };

export type VendreFilterValue = { id: number | string; name: string; count?: number; selected?: boolean };
export type VendreFilter = { id: number | string; name: string; values: VendreFilterValue[] };

export type VendreCategoryResponse = {
  header: VendreCategoryHeader;
  product_list: VendreProduct[];
  product_count: number;
  page_limit: number;
  page_limits: VendrePageLimit[];
  page_index: number;
  page_count: number;
  sort_by: string;
  sort_order: string;
  subcategory_list: VendreSubcategory[];
  filters: VendreFilter[];
  manufacturers: unknown[];
};

/* -------------------------------------------------------------------------- */
/* Shopping cart                                                               */
/* -------------------------------------------------------------------------- */

export type VendreCartLine = {
  /** Cart line id — this is what DELETE /shopping-cart expects. */
  id: string;
  product_id: number;
  parent_id: string | null;
  name: string;
  model: string;
  quantity: number;
  image: VendreImage | null;
  price: string;
  price_raw: number;
  final_price: string;
  final_price_raw: number;
  final_price_excl_raw: number;
  total_price: string;
  total_price_raw: number;
  total_final_price: string;
  total_final_price_raw: number;
  stock_allow_checkout: boolean;
  stock_calculated: number;
  href: string;
  attributes: unknown[];
  discounts: unknown[];
  variants: unknown[];
};

export type VendreCart = {
  products: VendreCartLine[];
  any_out_of_stock: number;
  total: string;
  total_raw: number;
  discounts: unknown[];
  cart_count: number;
  cart_total: string;
  /** Rotated mutation token — replace the stored one when present. */
  mutationProtectionToken?: string;
};

/** Body accepted by POST /surface/2/shopping-cart/products. */
export type VendreAddToCartBody = {
  products: { id: number | string; quantity: number; attributes?: unknown[]; data?: unknown }[];
};
