/**
 * Mockade Surface v2-svar för demoläget.
 *
 * Objekten här är HELA svarsobjekt i samma form som de riktiga endpointsen
 * returnerar (se src/types/vendre.ts för hur fältnamnen härletts ur
 * .vendre/knowledge/api-reference.md). Adaptern i
 * src/lib/vendre/use-vendre-api.ts byter ut dem mot live-data så fort
 * butiken är konfigurerad.
 */

import type {
  VendreCart,
  VendreCategoryResponse,
  VendreNavigationMenus,
  VendreProduct,
  VendreSessionContext,
} from "@/types/vendre";

const CURRENCY = "SEK";
const VAT_RATE = 0.25;

const nf = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 0,
});

export function formatPrice(value: number) {
  return nf.format(value);
}

export function price(value: number, compareAt?: number) {
  return {
    value,
    formatted: formatPrice(value),
    currency: CURRENCY,
    includes_vat: true,
    vat_rate: VAT_RATE,
    compare_at_value: compareAt ?? null,
    compare_at_formatted: compareAt ? formatPrice(compareAt) : null,
  };
}

const img = (seed: string, alt: string) => ({
  url: `https://picsum.photos/seed/${seed}/900/900`,
  alt,
});

/* ------------------------------------------------------------------ */
/* GET /surface/2/session/context                                      */
/* ------------------------------------------------------------------ */

export const mockSessionContext: VendreSessionContext = {
  authenticated: false,
  customer: null,
  cart_item_count: 0,
  currency: { code: CURRENCY },
  language: { id: 1, code: "sv" },
  market: { id: 1 },
  prices_include_vat: true,
  STORE_NAME: "Nordsken",
  SHOP_LOGO: "",
};

/* ------------------------------------------------------------------ */
/* GET /surface/2/navigation/menus                                     */
/* ------------------------------------------------------------------ */

export const mockNavigationMenus: VendreNavigationMenus = {
  menus: {
    header: [
      {
        id: 10,
        title: "Möbler",
        type: "category",
        category_id: 10,
        url: "/kategori/mobler",
        children: [
          { id: 11, title: "Stolar", type: "category", category_id: 11, url: "/kategori/stolar" },
          { id: 12, title: "Bord", type: "category", category_id: 12, url: "/kategori/bord" },
          { id: 13, title: "Förvaring", type: "category", category_id: 13, url: "/kategori/forvaring" },
        ],
      },
      {
        id: 20,
        title: "Belysning",
        type: "category",
        category_id: 20,
        url: "/kategori/belysning",
        children: [
          { id: 21, title: "Bordslampor", type: "category", category_id: 21, url: "/kategori/bordslampor" },
          { id: 22, title: "Taklampor", type: "category", category_id: 22, url: "/kategori/taklampor" },
        ],
      },
      {
        id: 30,
        title: "Textil",
        type: "category",
        category_id: 30,
        url: "/kategori/textil",
        children: [
          { id: 31, title: "Mattor", type: "category", category_id: 31, url: "/kategori/mattor" },
          { id: 32, title: "Kuddar & plädar", type: "category", category_id: 32, url: "/kategori/kuddar" },
        ],
      },
      { id: 40, title: "Kök", type: "category", category_id: 40, url: "/kategori/kok" },
      { id: 90, title: "Om oss", type: "information_page", gallery_id: 90, url: "/kategori/mobler" },
    ],
    footer: [
      {
        title: "Kundservice",
        items: [
          { id: 101, title: "Kontakta oss", type: "information_page", gallery_id: 101, url: "#" },
          { id: 102, title: "Frakt & leverans", type: "information_page", gallery_id: 102, url: "#" },
          { id: 103, title: "Returer & byten", type: "information_page", gallery_id: 103, url: "#" },
          { id: 104, title: "Vanliga frågor", type: "information_page", gallery_id: 104, url: "#" },
        ],
      },
      {
        title: "Om oss",
        items: [
          { id: 111, title: "Vår historia", type: "information_page", gallery_id: 111, url: "#" },
          { id: 112, title: "Hållbarhet", type: "information_page", gallery_id: 112, url: "#" },
          { id: 113, title: "Butiker", type: "information_page", gallery_id: 113, url: "#" },
          { id: 114, title: "Jobba hos oss", type: "information_page", gallery_id: 114, url: "#" },
        ],
      },
      {
        title: "Information",
        items: [
          { id: 121, title: "Köpvillkor", type: "information_page", gallery_id: 121, url: "#" },
          { id: 122, title: "Integritetspolicy", type: "information_page", gallery_id: 122, url: "#" },
          { id: 123, title: "Cookies", type: "information_page", gallery_id: 123, url: "#" },
        ],
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Produkter                                                           */
/* ------------------------------------------------------------------ */

type Seed = {
  id: number;
  name: string;
  slug: string;
  brand: string;
  value: number;
  compareAt?: number;
  category: number;
  tags: number[];
  short: string;
  colors: string[];
  inStock?: boolean;
};

const seeds: Seed[] = [
  { id: 1001, name: "Fanö Loungefåtölj", slug: "fano-loungefatolj", brand: "Nordsken", value: 6490, compareAt: 7990, category: 11, tags: [64, 81], short: "Djup fåtölj i ekstomme med ullklädsel.", colors: ["Grågrön", "Sand", "Antracit"] },
  { id: 1002, name: "Hylte Matstol", slug: "hylte-matstol", brand: "Nordsken", value: 2190, category: 11, tags: [64], short: "Formpressad ek med läderdetaljer.", colors: ["Ek", "Svartbetsad"] },
  { id: 1003, name: "Sälen Pinnstol", slug: "salen-pinnstol", brand: "Bruket", value: 1690, category: 11, tags: [81], short: "Klassisk pinnstol i massiv björk.", colors: ["Natur", "Rökgrå"], inStock: false },
  { id: 1004, name: "Vinga Matbord 200", slug: "vinga-matbord-200", brand: "Nordsken", value: 11900, category: 12, tags: [64], short: "Massivt ekbord för sex till åtta personer.", colors: ["Ljus ek", "Mörk ek"] },
  { id: 1005, name: "Kust Soffbord", slug: "kust-soffbord", brand: "Bruket", value: 4290, compareAt: 4990, category: 12, tags: [81], short: "Runt soffbord med skiva i kalksten.", colors: ["Kalksten", "Marmor"] },
  { id: 1006, name: "Björke Sideboard", slug: "bjorke-sideboard", brand: "Nordsken", value: 9450, category: 13, tags: [64], short: "Sideboard med räfflade luckor och mjuk stängning.", colors: ["Ek", "Valnöt"] },
  { id: 1007, name: "Orre Bordslampa", slug: "orre-bordslampa", brand: "Ljusverk", value: 2390, category: 21, tags: [81], short: "Opalglas på borstad mässingsfot.", colors: ["Mässing", "Krom"] },
  { id: 1008, name: "Måne Golvlampa", slug: "mane-golvlampa", brand: "Ljusverk", value: 3890, compareAt: 4490, category: 21, tags: [64, 81], short: "Riktbar golvlampa med linneskärm.", colors: ["Linne", "Svart"] },
  { id: 1009, name: "Krans Taklampa", slug: "krans-taklampa", brand: "Ljusverk", value: 5290, category: 22, tags: [64], short: "Handblåst glaskupa i tre delar.", colors: ["Klarglas", "Rökglas"] },
  { id: 1010, name: "Hav Ullmatta 200x300", slug: "hav-ullmatta-200x300", brand: "Väv", value: 7990, category: 31, tags: [81], short: "Handvävd ullmatta med melerad yta.", colors: ["Dimblå", "Havre"] },
  { id: 1011, name: "Lin Kuddfodral 50x50", slug: "lin-kuddfodral-50x50", brand: "Väv", value: 449, category: 32, tags: [64], short: "Tvättat lin med dold dragkedja.", colors: ["Salvia", "Terrakotta", "Off-white"] },
  { id: 1012, name: "Sten Serveringsskål", slug: "sten-serveringsskal", brand: "Bruket", value: 690, category: 40, tags: [81], short: "Drejad stengodsskål med reaktiv glasyr.", colors: ["Sand", "Kol"] },
];

function buildProduct(seed: Seed): VendreProduct {
  const inStock = seed.inStock !== false;
  return {
    id: seed.id,
    sku: `NS-${seed.id}`,
    name: seed.name,
    slug: seed.slug,
    brand: seed.brand,
    short_description: seed.short,
    description: `${seed.short} ${seed.name} är formgiven för att åldras vackert och tillverkas i begränsade serier hos vår partner i södra Sverige. Materialen är valda för lång livslängd och enkel skötsel.`,
    in_stock: inStock,
    stock_quantity: inStock ? 12 : 0,
    images: [
      img(`${seed.slug}-1`, `${seed.name} – produktbild`),
      img(`${seed.slug}-2`, `${seed.name} – miljöbild`),
      img(`${seed.slug}-3`, `${seed.name} – detalj`),
    ],
    price: price(seed.value, seed.compareAt),
    tags: seed.tags,
    category_ids: [seed.category],
    attributes: [
      { name: "Material", value: "Massiv ek, ull, stengods" },
      { name: "Ursprung", value: "Tillverkad i Sverige" },
      { name: "Garanti", value: "5 år" },
    ],
    variants: seed.colors.map((color, index) => ({
      id: seed.id * 10 + index,
      sku: `NS-${seed.id}-${index + 1}`,
      name: `${seed.name} – ${color}`,
      in_stock: inStock && index !== seed.colors.length - 1 ? true : inStock,
      stock_quantity: inStock ? 12 - index * 3 : 0,
      price: price(seed.value + index * 200, seed.compareAt ? seed.compareAt + index * 200 : undefined),
      image: img(`${seed.slug}-${index + 1}`, `${seed.name} i ${color}`),
      options: [{ name: "Färg", value: color }],
    })),
  };
}

export const mockProducts: VendreProduct[] = seeds.map(buildProduct);

export function findMockProduct(slug: string) {
  return mockProducts.find((product) => product.slug === slug) ?? null;
}

/* ------------------------------------------------------------------ */
/* GET /surface/2/categories/{id}                                      */
/* ------------------------------------------------------------------ */

type CategoryMeta = {
  id: number;
  name: string;
  slug: string;
  description: string;
  children: number[];
};

const categoryMeta: CategoryMeta[] = [
  { id: 10, name: "Möbler", slug: "mobler", description: "Stolar, bord och förvaring i massivt trä.", children: [11, 12, 13] },
  { id: 11, name: "Stolar", slug: "stolar", description: "Matstolar, fåtöljer och pinnstolar.", children: [] },
  { id: 12, name: "Bord", slug: "bord", description: "Matbord och soffbord i ek och sten.", children: [] },
  { id: 13, name: "Förvaring", slug: "forvaring", description: "Sideboards, hyllor och skåp.", children: [] },
  { id: 20, name: "Belysning", slug: "belysning", description: "Lampor i glas, mässing och linne.", children: [21, 22] },
  { id: 21, name: "Bordslampor", slug: "bordslampor", description: "Bords- och golvlampor för mjukt ljus.", children: [] },
  { id: 22, name: "Taklampor", slug: "taklampor", description: "Pendlar och plafonder.", children: [] },
  { id: 30, name: "Textil", slug: "textil", description: "Mattor, kuddar och plädar i naturmaterial.", children: [31, 32] },
  { id: 31, name: "Mattor", slug: "mattor", description: "Handvävda ullmattor.", children: [] },
  { id: 32, name: "Kuddar & plädar", slug: "kuddar", description: "Lin och ull för soffan.", children: [] },
  { id: 40, name: "Kök", slug: "kok", description: "Servering och keramik för vardagen.", children: [] },
];

const categoryImage = (slug: string) => `https://picsum.photos/seed/kategori-${slug}/1200/600`;

function productsForCategory(meta: CategoryMeta) {
  const ids = [meta.id, ...meta.children];
  return mockProducts.filter((product) => product.category_ids.some((id) => ids.includes(id)));
}

export function buildMockCategory(slug: string): VendreCategoryResponse | null {
  const meta = categoryMeta.find((item) => item.slug === slug);
  if (!meta) return null;
  const products = productsForCategory(meta);
  return {
    id: meta.id,
    name: meta.name,
    slug: meta.slug,
    description: meta.description,
    banner_image: categoryImage(meta.slug),
    product_count: products.length,
    page: 1,
    limit: 24,
    page_count: 1,
    subcategories: meta.children
      .map((childId) => categoryMeta.find((item) => item.id === childId))
      .filter((item): item is CategoryMeta => Boolean(item))
      .map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        image: categoryImage(child.slug),
        product_count: productsForCategory(child).length,
      })),
    products,
    filters: [
      {
        code: "tags",
        title: "Egenskaper",
        values: [
          { id: 64, title: "Nyhet", count: products.filter((p) => p.tags.includes(64)).length },
          { id: 81, title: "Handgjord", count: products.filter((p) => p.tags.includes(81)).length },
        ],
      },
    ],
    sort_options: [
      { sort_by: "popularity", sort_order: "desc", title: "Popularitet" },
      { sort_by: "price", sort_order: "asc", title: "Pris: lägst först" },
      { sort_by: "price", sort_order: "desc", title: "Pris: högst först" },
      { sort_by: "name", sort_order: "asc", title: "Namn A–Ö" },
    ],
  };
}

export const mockTopCategories = categoryMeta
  .filter((meta) => meta.children.length > 0 || meta.id === 40)
  .map((meta) => ({
    id: meta.id,
    name: meta.name,
    slug: meta.slug,
    image: categoryImage(meta.slug),
    product_count: productsForCategory(meta).length,
  }));

export const mockFeaturedProducts = mockProducts.filter((product) => product.tags.includes(64)).slice(0, 8);

/* ------------------------------------------------------------------ */
/* GET /surface/2/shopping-cart                                        */
/* ------------------------------------------------------------------ */

export const emptyMockCart: VendreCart = {
  items: [],
  item_count: 0,
  prices_include_vat: true,
  totals: {
    sub_total: price(0),
    vat: price(0),
    shipping: price(0),
    grand_total: price(0),
  },
  coupons: [],
};

/** Räknar om totalsummor lokalt i demoläget; live är servern facit. */
export function recalculateMockCart(items: VendreCart["items"]): VendreCart {
  const subTotal = items.reduce((sum, line) => sum + line.unit_price.value * line.quantity, 0);
  const shipping = subTotal > 0 && subTotal < 999 ? 79 : 0;
  const grandTotal = subTotal + shipping;
  const vat = Math.round((grandTotal * VAT_RATE) / (1 + VAT_RATE));
  return {
    items: items.map((line) => ({
      ...line,
      row_total: price(line.unit_price.value * line.quantity),
    })),
    item_count: items.reduce((sum, line) => sum + line.quantity, 0),
    prices_include_vat: true,
    totals: {
      sub_total: price(subTotal),
      vat: price(vat),
      shipping: price(shipping),
      grand_total: price(grandTotal),
    },
    coupons: [],
  };
}
