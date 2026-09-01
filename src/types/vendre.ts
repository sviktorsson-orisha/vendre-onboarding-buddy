/**
 * Vendre Surface v2 response types.
 *
 * Field names below were read from the connected store
 * (GET /surface/2/navigation/menus, GET /surface/2/categories/{id},
 * GET /surface/2/shopping-cart, GET /surface/2/session/context).
 * Only the fields the storefront actually renders are typed; the API returns more.
 */

export type VendreImage = {
  id: string | null;
  path: string | null;
  /** Store-relative path, e.g. "/image/210/t-shirt.jpeg". Resolve against the store base URL. */
  image: string | null;
  alt: string | null;
  alt_translated: string | null;
};

export type MenuItem = {
  id: number;
  entity_id: number;
  source: string;
  parent_id: number | null;
  parent_source: string | null;
  /** "category" | "information_page" | ... */
  menu_type: string;
  name: string;
  icon: string | null;
  target: string | null;
  route: string | null;
  has_children: boolean;
};

export type MenusResponse = { menus: MenuItem[] };

/** Menu items nested by parent_id for multi-level dropdowns. */
export type MenuNode = MenuItem & { children: MenuNode[] };

export type Product = {
  id: string;
  name: string;
  model: string | null;
  description: string | null;
  description_short: string | null;
  /** Formatted by the store, already in the session currency. */
  price: string | null;
  price_raw: number | null;
  price_original: string | null;
  price_original_raw: number | null;
  /** Price excluding VAT (raw). */
  final_price_excl_raw: number | null;
  tax: number | null;
  unit: string | null;
  image: VendreImage | null;
  images: VendreImage[];
  stock_total: number | null;
  stock_allow_checkout: boolean | null;
  seo_link: string | null;
  categories_id: string | null;
  has_attributes: boolean;
  /** Present on some installs; variant selectors render from it when available. */
  attributes?: ProductAttribute[];
};

export type ProductAttribute = {
  id: string | number;
  name: string;
  values: { id: string | number; name: string }[];
};

export type CategoryHeader = {
  id: number;
  name: string;
  alternative_name: string | null;
  text: string | null;
  image: VendreImage | null;
  images: VendreImage[];
  meta_title: string | null;
  meta_description: string | null;
  href: string | null;
};

/** Sort option as returned by the store, when the install provides a list. */
export type CategorySort = {
  name: string;
  /** Field passed as sort_by. */
  value?: string;
  sort_by?: string;
  sort_order?: string;
  selected?: boolean;
};

export type CategoryFilterOption = {
  id: string | number;
  name: string;
  count?: number;
  selected?: boolean;
  image?: VendreImage | null;
};

export type CategoryFilter = {
  id: string | number;
  name: string;
  /** 0 = category filter (subcategory links), 1 = tag filter, 2 = price range, 4 = spec filter. */
  type?: number | string;
  options?: CategoryFilterOption[];
  /** Price filters (type 2) return a range instead of options. */
  min?: number;
  max?: number;
  unit?: string;
};

export type CategoryResponse = {
  header: CategoryHeader;
  product_list: Product[];
  product_count: number;
  page_index: number;
  page_count: number;
  page_limit: number;
  page_limits: { name: string | number; limit: number; selected: boolean }[];
  sort_by: string;
  sort_order: string;
  /** Only some installs return a list of selectable sort options. */
  sort_options?: CategorySort[];
  sorts?: CategorySort[];
  subcategory_list: CategoryHeader[];
  filters: CategoryFilter[];
};

export type CartLine = {
  /** Cart line id (string), not always equal to productId. */
  id: string;
  productId: number;
  quantity: number;
  attributes: unknown[];
  data: unknown;
  product_data?: Product;
};

export type Cart = {
  products: CartLine[];
  cart_count: number;
  cart_total: number;
  /** Refreshed mutation protection token, when the store returns one. */
  mutationProtectionToken?: string;
};

export type SessionContext = {
  authenticated: boolean;
  cart_item_count: number;
  customer: { first_name?: string; last_name?: string } | null;
  customer_type: string | null;
  currency: { code: string };
  language: { id: number; code: string };
  market: { id: number };
  prices_include_vat: boolean;
  STORE_NAME?: string;
  SHOP_LOGO?: string;
};

export type CategoryQuery = {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
  /** Selected tag filter values, sent as tags[]=64&tags[]=81. */
  tags?: (string | number)[];
  /** Selected spec filter values, sent as f[44][]=Bomull. */
  specs?: Record<string, string[]>;
  /** Price range from the type 2 filter, sent as pfrom/pto. */
  pfrom?: number;
  pto?: number;
};
