/**
 * Vendre-shaped demo payloads.
 *
 * Every object here mirrors a real Surface v2 response (captured from a live
 * Vendre store) field for field, so the UI can be written once against the real
 * schema and switch to live data without any mapping layer.
 */
import type {
  VendreCart,
  VendreCategoryResponse,
  VendreImage,
  VendreMenuItem,
  VendreMenusResponse,
  VendreProduct,
  VendreSessionContext,
} from "@/types/vendre";

const img = (id: number, seed: string): VendreImage => ({
  id: String(id),
  path: `/products/d/${seed}.jpeg`,
  image: `https://picsum.photos/seed/${seed}/900/1200`,
  alt: null,
  alt_translated: null,
});

type Seed = {
  id: number;
  name: string;
  model: string;
  price: number;
  original?: number;
  category: number;
  seed: string;
  short: string;
  stock?: number;
};

const SEEDS: Seed[] = [
  { id: 201, name: "Long Jacket", model: "43-3758", price: 1299, original: 1599, category: 163, seed: "vendre-jacket", short: "Vindtät jacka i återvunnen polyester." },
  { id: 202, name: "Blazer in linen mix", model: "43-3812", price: 699, category: 163, seed: "vendre-blazer", short: "Ledig kavaj i linnemix." },
  { id: 203, name: "Oxford Shirt", model: "43-3901", price: 449, category: 163, seed: "vendre-shirt", short: "Klassisk oxfordskjorta i bomull." },
  { id: 204, name: "Slim Chinos", model: "43-4011", price: 549, original: 699, category: 163, seed: "vendre-chinos", short: "Chinos med smal passform." },
  { id: 205, name: "Wool Coat", model: "51-1120", price: 2199, category: 164, seed: "vendre-coat", short: "Ullkappa med dold knäppning." },
  { id: 206, name: "Pleated Skirt", model: "51-1204", price: 599, category: 164, seed: "vendre-skirt", short: "Plisserad kjol i satin." },
  { id: 207, name: "Knit Cardigan", model: "51-1288", price: 799, original: 999, category: 164, seed: "vendre-cardigan", short: "Mjuk kofta i merinoull." },
  { id: 208, name: "Silk Blouse", model: "51-1330", price: 899, category: 164, seed: "vendre-blouse", short: "Blus i tvättat siden.", stock: 0 },
  { id: 209, name: "Everyday Tee", model: "62-2001", price: 199, category: 92, seed: "vendre-tee", short: "T-shirt i ekologisk bomull." },
  { id: 210, name: "Striped Tee", model: "62-2044", price: 249, category: 92, seed: "vendre-tee-striped", short: "Randig t-shirt med rund hals." },
  { id: 211, name: "Heavy Tee", model: "62-2090", price: 299, original: 349, category: 92, seed: "vendre-tee-heavy", short: "Tjock jersey, boxig passform." },
  { id: 212, name: "Runner Low", model: "74-3001", price: 1099, category: 95, seed: "vendre-sneaker", short: "Låg sneaker med gummisula." },
  { id: 213, name: "Chelsea Boot", model: "74-3055", price: 1899, category: 95, seed: "vendre-boot", short: "Chelseaboots i oljat läder." },
  { id: 214, name: "Canvas Tote", model: "88-4002", price: 349, category: 96, seed: "vendre-tote", short: "Väska i kraftig canvas." },
  { id: 215, name: "Leather Belt", model: "88-4030", price: 399, category: 96, seed: "vendre-belt", short: "Bälte i vegetabiliskt garvat läder." },
  { id: 216, name: "Wool Beanie", model: "88-4077", price: 249, category: 96, seed: "vendre-beanie", short: "Ribbstickad mössa i ull." },
];

const money = (value: number) => `${value.toLocaleString("sv-SE")} kr`;

function makeProduct(seed: Seed): VendreProduct {
  const image = img(seed.id, seed.seed);
  const stock = seed.stock ?? 25;
  return {
    id: String(seed.id),
    parent_id: null,
    name: seed.name,
    name_default_language: seed.name,
    model: seed.model,
    seo_link: `${seed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/`,
    href: `/${seed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/`,
    description: `<p>${seed.short}</p><p>DETALJER<br />Material och skötselråd enligt etikett. Tvättas i 40°.</p>`,
    description_short: seed.short,
    tax: 25,
    unit: "st",
    price: money(seed.price),
    price_raw: seed.price,
    price_original: seed.original ? money(seed.original) : money(seed.price),
    price_original_raw: seed.original ?? seed.price,
    price_recommended: null,
    price_recommended_raw: null,
    price_special: seed.original ? money(seed.price) : null,
    final_price_excl_raw: Math.round((seed.price / 1.25) * 100) / 100,
    image,
    images: [image, img(seed.id + 500, `${seed.seed}-2`), img(seed.id + 900, `${seed.seed}-3`)],
    categories_id: String(seed.category),
    quantity: String(stock),
    stock_total: stock,
    stock_calculated: stock,
    stock_allow_checkout: stock > 0,
    has_attributes: true,
    child_count: "0",
    manufacturer_name: null,
    tags: [],
    products_status: "1",
    variants: ["XS", "S", "M", "L", "XL"].map((size, index) => ({
      id: `${seed.id}-${index}`,
      name: size,
      model: `${seed.model}-${size}`,
      price: money(seed.price),
      price_raw: seed.price,
      stock_calculated: size === "XS" && stock > 0 ? 0 : stock,
      stock_allow_checkout: stock > 0 && size !== "XS",
    })),
  };
}

export const MOCK_PRODUCTS: VendreProduct[] = SEEDS.map(makeProduct);

const CATEGORY_META: Record<number, { name: string; text: string; parent: number | null }> = {
  90: { name: "Kläder", text: "<p>Plagg för vardag och fest — utvalda kvaliteter som håller.</p>", parent: null },
  163: { name: "Herr", text: "<p>Herrkollektionen: skjortor, kavajer och ytterplagg.</p>", parent: 90 },
  164: { name: "Dam", text: "<p>Damkollektionen: kappor, kjolar och stickat.</p>", parent: 90 },
  92: { name: "T-shirts", text: "<p>T-shirts i ekologisk bomull.</p>", parent: null },
  95: { name: "Skor", text: "<p>Sneakers och boots för hela året.</p>", parent: null },
  96: { name: "Accessoarer", text: "<p>Väskor, bälten och mössor.</p>", parent: null },
};

const CHILDREN: Record<number, number[]> = { 90: [163, 164] };

function productsForCategory(id: number): VendreProduct[] {
  const children = CHILDREN[id] ?? [];
  const ids = [id, ...children].map(String);
  return MOCK_PRODUCTS.filter((product) => ids.includes(product.categories_id));
}

export function mockCategory(id: number, page = 1, limit = 12): VendreCategoryResponse {
  const meta = CATEGORY_META[id] ?? CATEGORY_META[90]!;
  const all = productsForCategory(id);
  const start = (page - 1) * limit;
  return {
    header: {
      id,
      name: meta.name,
      alternative_name: null,
      icon: null,
      image: null,
      images: [],
      text: meta.text,
      alternative_text: null,
      meta_title: meta.name,
      meta_keywords: null,
      meta_description: meta.name,
      href: `${meta.name.toLowerCase()}/`,
    },
    product_list: all.slice(start, start + limit),
    product_count: all.length,
    page_limit: limit,
    page_limits: [
      { name: 12, limit: 12, selected: limit === 12 },
      { name: 15, limit: 15, selected: limit === 15 },
      { name: 20, limit: 20, selected: limit === 20 },
      { name: "Alla", limit: 0, selected: false },
    ],
    page_index: page,
    page_count: Math.max(1, Math.ceil(all.length / limit)),
    sort_by: "name",
    sort_order: "ASC",
    subcategory_list: (CHILDREN[id] ?? []).map((childId) => ({
      id: childId,
      name: CATEGORY_META[childId]!.name,
      href: `${CATEGORY_META[childId]!.name.toLowerCase()}/`,
      icon: null,
      image: null,
      images: [],
    })),
    filters: [],
    manufacturers: [],
  };
}

export const MOCK_CATEGORY_IDS = [90, 92, 95, 96];

const menuItem = (
  id: number,
  name: string,
  parent: number | null,
  hasChildren: boolean,
  source = "category",
): VendreMenuItem => ({
  id,
  entity_id: id,
  source,
  parent_id: parent,
  parent_source: parent ? "category" : null,
  menu_type: source,
  name,
  icon: null,
  target: `${name.toLowerCase()}/`,
  route: null,
  quick_command_letter: null,
  attributes: [],
  has_children: hasChildren,
});

export const MOCK_MENUS: VendreMenusResponse = {
  menus: [
    menuItem(90, "Kläder", null, true),
    menuItem(163, "Herr", 90, false),
    menuItem(164, "Dam", 90, false),
    menuItem(92, "T-shirts", null, false),
    menuItem(95, "Skor", null, false),
    menuItem(96, "Accessoarer", null, false),
    menuItem(300, "Om oss", null, false, "information_page"),
    menuItem(301, "Kundservice", null, false, "information_page"),
  ],
};

export const MOCK_SESSION_CONTEXT: VendreSessionContext = {
  authenticated: false,
  cart_item_count: 0,
  customer: null,
  customer_type: null,
  currency: { code: "SEK" },
  language: { id: 1, code: "sv" },
  market: { id: 1 },
  prices_include_vat: true,
  configuration: { STORE_NAME: "Vendre Demo Store", SHOP_LOGO: "" },
};

export const EMPTY_MOCK_CART: VendreCart = {
  products: [],
  any_out_of_stock: 0,
  total: "0 kr",
  total_raw: 0,
  discounts: [],
  cart_count: 0,
  cart_total: "0 kr",
};

/** Build a Vendre-shaped cart line from a demo product. */
export function mockCartLine(product: VendreProduct, quantity: number) {
  const total = product.price_raw * quantity;
  return {
    id: product.id,
    product_id: Number(product.id),
    parent_id: null,
    name: product.name,
    model: product.model,
    quantity,
    image: product.image,
    price: product.price,
    price_raw: product.price_raw,
    final_price: product.price,
    final_price_raw: product.price_raw,
    final_price_excl_raw: product.final_price_excl_raw,
    total_price: money(total),
    total_price_raw: total,
    total_final_price: money(total),
    total_final_price_raw: total,
    stock_allow_checkout: product.stock_allow_checkout,
    stock_calculated: product.stock_calculated,
    href: product.href,
    attributes: [],
    discounts: [],
    variants: [],
  };
}

export function mockCartFromLines(lines: VendreCart["products"]): VendreCart {
  const total = lines.reduce((sum, line) => sum + line.total_final_price_raw, 0);
  return {
    products: lines,
    any_out_of_stock: 0,
    total: money(total),
    total_raw: total,
    discounts: [],
    cart_count: lines.reduce((sum, line) => sum + line.quantity, 0),
    cart_total: money(total),
  };
}
