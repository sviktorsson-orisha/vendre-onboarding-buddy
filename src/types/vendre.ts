/**
 * Types for Vendre Surface v2 responses.
 *
 * Raw* types mirror the exact field names returned by the connected store
 * (verified against GET /surface/2/navigation/menus, GET /surface/2/categories/{id},
 * GET /surface/2/shopping-cart and POST /surface/2/session/bootstrap).
 * The normalised types below are what the UI renders, in both demo and live mode.
 */

/* ------------------------------------------------------------------ raw */

export type RawMenuItem = {
  id: number;
  entity_id: number;
  source: string;
  parent_id: number | null;
  parent_source: string | null;
  menu_type: string; // "category" | "information_page" | ...
  name: string;
  icon: string | null;
  target: string | null;
  route: string | null;
  has_children: boolean;
  attributes?: unknown[];
};

export type RawMenusResponse = { menus: RawMenuItem[] };

export type RawImage = {
  id?: string;
  path?: string | null;
  image?: string | null;
  alt?: string | null;
  alt_translated?: string | null;
};

export type RawProduct = {
  id: string;
  name: string;
  model?: string | null;
  description?: string | null;
  description_short?: string | null;
  price: string;
  price_raw: number;
  price_original?: string | null;
  price_original_raw?: number | null;
  final_price_excl_raw?: number | null;
  tax?: number | null;
  unit?: string | null;
  image?: RawImage | null;
  images?: RawImage[];
  stock_total?: number | string | null;
  stock_calculated?: number | string | null;
  stock_allow_checkout?: boolean | null;
  manufacturer_name?: string | null;
  seo_link?: string | null;
  href?: string | null;
  has_attributes?: boolean | number | null;
  categories_id?: string | number | null;
};

export type RawFilterOption = { id: number; name: string; image: string | null };
export type RawFilter = { id: number; name: string; type: number; options: RawFilterOption[] };

export type RawCategoryHeader = {
  id: number;
  name: string;
  text?: string | null;
  image?: RawImage | string | null;
  images?: RawImage[];
  meta_title?: string | null;
  meta_description?: string | null;
  href?: string | null;
};

export type RawSubcategory = { id: number; name: string; href?: string | null; image?: RawImage | null };

export type RawCategoryResponse = {
  header: RawCategoryHeader;
  product_list: RawProduct[];
  product_count: number;
  page_limit: number;
  page_index: number;
  page_count: number;
  sort_by: string;
  sort_order: string;
  subcategory_list: RawSubcategory[];
  filters: RawFilter[];
};

export type RawCartProduct = {
  id?: string | number;
  products_id?: string | number;
  cart_id?: string | number;
  name?: string;
  model?: string | null;
  quantity?: number | string;
  price?: string;
  price_raw?: number;
  total?: string;
  total_raw?: number;
  image?: RawImage | null;
};

export type RawCartResponse = {
  products: RawCartProduct[];
  cart_count: number;
  cart_total: string;
  total: string;
  total_raw: number;
  discounts: unknown[];
  any_out_of_stock?: number;
  mutationProtectionToken?: string;
};

export type RawSessionContext = {
  authenticated: boolean;
  cart_item_count: number;
  customer: unknown | null;
  customer_type: string | null;
  currency: { code: string };
  language: { id: number; code: string };
  market: { id: number };
  prices_include_vat: boolean;
  STORE_NAME?: string;
  SHOP_LOGO?: string;
};

export type RawBootstrapResponse = RawSessionContext & {
  session_id: string;
  is_new: boolean;
  surface_mutation_protection_token: string;
  surface_mutation_protection_token_expires_in: number;
};

/* ----------------------------------------------------------- normalised */

export type MenuNode = {
  id: number;
  name: string;
  type: string;
  target: string | null;
  children: MenuNode[];
};

export type Product = {
  id: string;
  name: string;
  model: string | null;
  description: string;
  descriptionShort: string;
  price: string;
  priceRaw: number;
  priceOriginal: string | null;
  onSale: boolean;
  image: string | null;
  images: string[];
  inStock: boolean;
  stock: number | null;
  manufacturer: string | null;
  variants: { id: string; name: string }[];
};

export type CategoryFilter = { id: number; name: string; options: { id: number; name: string }[] };

export type Category = {
  id: number;
  name: string;
  text: string;
  image: string | null;
  productCount: number;
  pageCount: number;
  pageIndex: number;
  sortBy: string;
  sortOrder: string;
  subcategories: { id: number; name: string }[];
  filters: CategoryFilter[];
  products: Product[];
};

export type CartLine = {
  lineId: string;
  productId: string;
  name: string;
  quantity: number;
  price: string;
  priceRaw: number;
  total: string;
  image: string | null;
};

export type Cart = {
  lines: CartLine[];
  count: number;
  total: string;
  totalRaw: number;
  pricesIncludeVat: boolean;
};

export type StoreContext = {
  storeName: string;
  currency: string;
  language: string;
  pricesIncludeVat: boolean;
  authenticated: boolean;
  cartItemCount: number;
};

export type CategoryQuery = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  tags?: number[];
};
