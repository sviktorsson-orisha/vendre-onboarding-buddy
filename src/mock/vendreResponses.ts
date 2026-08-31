/**
 * Demo Mode data.
 *
 * Field names are taken verbatim from live Surface v2 responses of a connected
 * Vendre store (navigation/menus, categories/{id}, shopping-cart, session/context),
 * so switching to live mode only swaps the data source — never the shapes.
 *
 * Images are intentionally null: the storefront renders a branded placeholder
 * instead of shipping fake product photography.
 */
import type {
  RawCartResponse,
  RawCategoryResponse,
  RawMenusResponse,
  RawProduct,
  RawSessionContext,
} from "@/types/vendre";

export const MOCK_STORE_NAME = "Demo Store";

export const mockSessionContext: RawSessionContext = {
  authenticated: false,
  cart_item_count: 0,
  customer: null,
  customer_type: "consumer",
  currency: { code: "SEK" },
  language: { id: 5, code: "sv" },
  market: { id: 0 },
  prices_include_vat: true,
  STORE_NAME: MOCK_STORE_NAME,
};

export const mockMenus: RawMenusResponse = {
  menus: [
    { id: 90, entity_id: 90, source: "category", parent_id: null, parent_source: null, menu_type: "category", name: "Kläder", icon: null, target: "klader/", route: null, has_children: true },
    { id: 163, entity_id: 163, source: "category", parent_id: 90, parent_source: "category", menu_type: "category", name: "Herr", icon: null, target: "herr/", route: null, has_children: true },
    { id: 91, entity_id: 91, source: "category", parent_id: 163, parent_source: "category", menu_type: "category", name: "Jackor", icon: null, target: "jackor/", route: null, has_children: false },
    { id: 92, entity_id: 92, source: "category", parent_id: 163, parent_source: "category", menu_type: "category", name: "T-shirts", icon: null, target: "t-shirts/", route: null, has_children: false },
    { id: 164, entity_id: 164, source: "category", parent_id: 90, parent_source: "category", menu_type: "category", name: "Dam", icon: null, target: "dam/", route: null, has_children: true },
    { id: 167, entity_id: 167, source: "category", parent_id: 164, parent_source: "category", menu_type: "category", name: "Klänningar", icon: null, target: "klanningar/", route: null, has_children: false },
    { id: 200, entity_id: 200, source: "category", parent_id: null, parent_source: null, menu_type: "category", name: "Accessoarer", icon: null, target: "accessoarer/", route: null, has_children: false },
    { id: 300, entity_id: 300, source: "information_page", parent_id: null, parent_source: null, menu_type: "information_page", name: "Om oss", icon: null, target: "om-oss/", route: null, has_children: false },
  ],
};

function product(
  id: string,
  name: string,
  priceRaw: number,
  options: Partial<RawProduct> = {},
): RawProduct {
  return {
    id,
    name,
    model: `DEMO-${id}`,
    description: `<p>${name} — demoartikel som visar hur produktdata från Vendre renderas i storefronten.</p>`,
    description_short: "Demoartikel i väntan på skarp Vendre-data.",
    price: `${priceRaw} kr`,
    price_raw: priceRaw,
    price_original: null,
    price_original_raw: priceRaw,
    final_price_excl_raw: Math.round((priceRaw / 1.25) * 100) / 100,
    tax: 25,
    unit: "pc",
    image: null,
    images: [],
    stock_total: 12,
    stock_calculated: 12,
    stock_allow_checkout: true,
    manufacturer_name: "Demo Brand",
    seo_link: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    href: null,
    has_attributes: false,
    ...options,
  };
}

export const mockProducts: RawProduct[] = [
  product("240", "Duffeljacka", 599, { categories_id: "91" }),
  product("241", "Vindjacka", 899, { categories_id: "91", price_original: "1099 kr", price_original_raw: 1099 }),
  product("242", "Parkas", 1499, { categories_id: "91", stock_total: 0, stock_calculated: 0, stock_allow_checkout: false }),
  product("243", "T-shirt Basic", 199, { categories_id: "92", has_attributes: true }),
  product("244", "T-shirt Oversize", 249, { categories_id: "92", has_attributes: true }),
  product("245", "Klänning Linne", 799, { categories_id: "167" }),
  product("246", "Klänning Vår", 999, { categories_id: "167", price_original: "1199 kr", price_original_raw: 1199 }),
  product("247", "Mössa Ull", 299, { categories_id: "200" }),
  product("248", "Halsduk", 349, { categories_id: "200" }),
  product("249", "Bälte Läder", 449, { categories_id: "200" }),
];

const CATEGORY_NAMES: Record<number, string> = {
  90: "Kläder",
  163: "Herr",
  164: "Dam",
  91: "Jackor",
  92: "T-shirts",
  167: "Klänningar",
  200: "Accessoarer",
};

const CHILDREN: Record<number, number[]> = {
  90: [163, 164],
  163: [91, 92],
  164: [167],
};

function descendants(id: number): number[] {
  const children = CHILDREN[id] ?? [];
  return [id, ...children.flatMap(descendants)];
}

export function mockCategory(id: number): RawCategoryResponse {
  const ids = descendants(id).map(String);
  const products = mockProducts.filter((item) => ids.includes(String(item.categories_id)));
  const name = CATEGORY_NAMES[id] ?? "Demokategori";

  return {
    header: {
      id,
      name,
      text: `Demoinnehåll för ${name}. När Vendre-kontot är kopplat hämtas texten från kategorin i Admin.`,
      image: null,
      images: [],
      meta_title: name,
      meta_description: `${name} i demobutiken.`,
      href: `${name.toLowerCase()}/`,
    },
    product_list: products,
    product_count: products.length,
    page_limit: 12,
    page_index: 1,
    page_count: 1,
    sort_by: "name",
    sort_order: "ASC",
    subcategory_list: (CHILDREN[id] ?? []).map((child) => ({
      id: child,
      name: CATEGORY_NAMES[child] ?? "",
      href: null,
      image: null,
    })),
    filters: [
      { id: 66, name: "Färg", type: 1, options: [{ id: 64, name: "Svart", image: null }, { id: 65, name: "Blå", image: null }] },
      { id: 67, name: "Storlek", type: 1, options: [{ id: 70, name: "S", image: null }, { id: 71, name: "M", image: null }, { id: 72, name: "L", image: null }] },
    ],
  };
}

export function mockProduct(id: string): RawProduct | null {
  return mockProducts.find((item) => item.id === id) ?? null;
}

export const emptyMockCart: RawCartResponse = {
  products: [],
  any_out_of_stock: 0,
  total: "0 kr",
  total_raw: 0,
  discounts: [],
  cart_count: 0,
  cart_total: "0 kr",
};

export const mockFeaturedIds = ["240", "245", "243", "247"];
