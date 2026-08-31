/**
 * Dummy data used while the store is not connected (Demo Mode).
 *
 * Shapes mirror real responses read from a live Vendre store:
 * navigation/menus, categories/{id}, shopping-cart and session/context.
 * Replace nothing here manually — once CORS and credentials are green the
 * app switches to live data through the same adapter (src/lib/vendre/api.ts).
 */
import type {
  Cart,
  CategoryHeader,
  CategoryResponse,
  MenuItem,
  Product,
  SessionContext,
} from "@/types/vendre";

export const mockSessionContext: SessionContext = {
  authenticated: false,
  cart_item_count: 0,
  customer: null,
  customer_type: "consumer",
  currency: { code: "SEK" },
  language: { id: 1, code: "sv" },
  market: { id: 0 },
  prices_include_vat: true,
  STORE_NAME: "Demo Store",
};

export const mockMenus: MenuItem[] = [
  m(90, null, "Kläder", "klader/", true),
  m(163, 90, "Herr", "herr/", true),
  m(166, 163, "Kavajer", "kavajer/", false),
  m(91, 163, "Jackor", "jackor/", false),
  m(92, 163, "T-shirts", "t-shirts/", false),
  m(164, 90, "Dam", "dam/", true),
  m(162, 164, "Klänningar", "klanningar/", false),
  m(120, 164, "Toppar", "toppar/", false),
  m(200, null, "Skor", "skor/", false),
  m(210, null, "Accessoarer", "accessoarer/", false),
];

function m(
  id: number,
  parent: number | null,
  name: string,
  target: string,
  hasChildren: boolean,
): MenuItem {
  return {
    id,
    entity_id: id,
    source: "category",
    parent_id: parent,
    parent_source: parent ? "category" : null,
    menu_type: "category",
    name,
    icon: null,
    target,
    route: null,
    has_children: hasChildren,
  };
}

function price(value: number) {
  return `${value} kr`;
}

function product(
  id: number,
  name: string,
  amount: number,
  categoryId: number,
  opts: { original?: number; stock?: number; short?: string; attributes?: Product["attributes"] } = {},
): Product {
  const stock = opts.stock ?? 24;
  return {
    id: String(id),
    name,
    model: `DEMO-${id}`,
    description: `<p>${name} från demosortimentet. Beskrivningen kommer från butikens produktdata när Vendre-kopplingen är aktiv.</p>`,
    description_short: opts.short ?? "Demoprodukt – ersätts av butikens riktiga sortiment.",
    price: price(amount),
    price_raw: amount,
    price_original: opts.original ? price(opts.original) : price(amount),
    price_original_raw: opts.original ?? amount,
    final_price_excl_raw: Math.round((amount / 1.25) * 100) / 100,
    tax: 25,
    unit: "st",
    image: null,
    images: [],
    stock_total: stock,
    stock_allow_checkout: stock > 0,
    seo_link: null,
    categories_id: String(categoryId),
    has_attributes: Boolean(opts.attributes?.length),
    ...(opts.attributes ? { attributes: opts.attributes } : {}),
  };
}

const sizeAttribute: Product["attributes"] = [
  {
    id: 1,
    name: "Storlek",
    values: [
      { id: "s", name: "S" },
      { id: "m", name: "M" },
      { id: "l", name: "L" },
      { id: "xl", name: "XL" },
    ],
  },
];

const products: Product[] = [
  product(1001, "Linnetröja Oversize", 899, 92, { original: 1099, attributes: sizeAttribute }),
  product(1002, "T-shirt med tryck", 299, 92, { attributes: sizeAttribute }),
  product(1003, "Piké i bomull", 549, 92),
  product(1004, "Ullkavaj Marin", 2499, 166, { attributes: sizeAttribute }),
  product(1005, "Blazer Slim Fit", 1899, 166),
  product(1006, "Parkas Vinter", 2999, 91, { original: 3499 }),
  product(1007, "Skinnjacka Svart", 3899, 91, { stock: 0 }),
  product(1008, "Klänning Midi", 1299, 162, { attributes: sizeAttribute }),
  product(1009, "Sommarklänning Blom", 999, 162),
  product(1010, "Topp i siden", 799, 120),
  product(1011, "Sneakers Vit", 1499, 200, { attributes: sizeAttribute }),
  product(1012, "Loafers Brun", 1999, 200),
  product(1013, "Läderbälte", 499, 210),
  product(1014, "Ullhalsduk", 399, 210),
];

function header(id: number, name: string, text = ""): CategoryHeader {
  return {
    id,
    name,
    alternative_name: null,
    text,
    image: null,
    images: [],
    meta_title: null,
    meta_description: null,
    href: null,
  };
}

const categoryHeaders: Record<number, CategoryHeader> = {
  90: header(90, "Kläder", "<p>Hela demosortimentet av kläder.</p>"),
  163: header(163, "Herr"),
  164: header(164, "Dam"),
  166: header(166, "Kavajer"),
  91: header(91, "Jackor"),
  92: header(92, "T-shirts"),
  162: header(162, "Klänningar"),
  120: header(120, "Toppar"),
  200: header(200, "Skor"),
  210: header(210, "Accessoarer"),
};

function descendantIds(id: number): number[] {
  const children = mockMenus.filter((item) => item.parent_id === id).map((item) => item.id);
  return [id, ...children.flatMap(descendantIds)];
}

export function mockCategory(id: number): CategoryResponse {
  const ids = new Set(descendantIds(id).map(String));
  const list = products.filter((p) => ids.has(p.categories_id ?? ""));
  return {
    header: categoryHeaders[id] ?? header(id, "Kategori"),
    product_list: list,
    product_count: list.length,
    page_index: 1,
    page_count: 1,
    page_limit: 12,
    page_limits: [
      { name: 12, limit: 12, selected: true },
      { name: 24, limit: 24, selected: false },
      { name: "Alla", limit: 0, selected: false },
    ],
    sort_by: "name",
    sort_order: "ASC",
    subcategory_list: mockMenus
      .filter((item) => item.parent_id === id)
      .map((item) => categoryHeaders[item.id] ?? header(item.id, item.name)),
    filters: [
      {
        id: "size",
        name: "Storlek",
        values: [
          { id: "s", name: "S" },
          { id: "m", name: "M" },
          { id: "l", name: "L" },
        ],
      },
      {
        id: "color",
        name: "Färg",
        values: [
          { id: "black", name: "Svart" },
          { id: "blue", name: "Blå" },
          { id: "beige", name: "Beige" },
        ],
      },
    ],
  };
}

export function mockProduct(id: string): Product | null {
  return products.find((p) => p.id === id) ?? null;
}

export function mockFeaturedProducts(count = 4): Product[] {
  return products.slice(0, count);
}

export const mockTopCategories = [90, 200, 210].map((id) => categoryHeaders[id]!);

export const emptyCart: Cart = { products: [], cart_count: 0, cart_total: 0 };
