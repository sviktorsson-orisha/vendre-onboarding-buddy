/**
 * Live catalog reads (Surface v2).
 *
 * - GET navigation/menus  -> header/footer navigation
 * - GET categories/{id}   -> category header, subcategories, products, paging
 * - POST vql              -> product detail, with a categories fallback on 500
 *
 * Responses are normalised into the shared storefront view models so the UI is
 * unchanged between Demo Mode and Live Mode.
 */
import type { StoreCategory, StoreProduct, StoreVariant } from "@/lib/storefront/types";

import { surfaceJson } from "./client";
import { getSessionContext, withSession } from "./session";

type AnyRecord = Record<string, unknown>;

const menusCache = new Map<string, Promise<StoreCategory[]>>();
const categoryCache = new Map<string, Promise<CategoryResult>>();
const productCache = new Map<string, Promise<StoreProduct>>();
const slugToId = new Map<string, string>();

export type CategoryResult = {
  category: StoreCategory;
  products: StoreProduct[];
  productCount: number;
  pageCount: number;
};

export function clearCatalogCache() {
  menusCache.clear();
  categoryCache.clear();
  productCache.clear();
  slugToId.clear();
}

function cacheKey(parts: (string | number | undefined)[]) {
  const ctx = getSessionContext();
  return [ctx?.currency, ctx?.language, ctx?.marketId, ctx?.pricesIncludeVat, ...parts].join("|");
}

function asArray(value: unknown): AnyRecord[] {
  if (Array.isArray(value)) return value.filter((item): item is AnyRecord => typeof item === "object" && item !== null);
  if (value && typeof value === "object") {
    const data = (value as AnyRecord)["data"];
    if (Array.isArray(data)) return asArray(data);
  }
  return [];
}

function pick(source: AnyRecord | undefined, ...keys: string[]): unknown {
  if (!source) return undefined;
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function text(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function num(value: unknown): number | undefined {
  const parsed = typeof value === "string" ? Number(value.replace(/\s/g, "").replace(",", ".")) : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function slugify(value: string, fallback: string) {
  const slug = value
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function slugFromUrl(url: unknown): string | undefined {
  const raw = typeof url === "string" ? url : undefined;
  if (!raw) return undefined;
  const parts = raw.split("?")[0]?.split("/").filter(Boolean) ?? [];
  return parts.length > 0 ? parts[parts.length - 1] : undefined;
}

function resolveImage(value: unknown): string | undefined {
  const raw =
    typeof value === "string"
      ? value
      : text(pick(value as AnyRecord, "url", "src", "path", "large", "original", "image"), "");
  if (!raw) return undefined;
  if (/^https?:\/\//i.test(raw)) return raw;
  const ctx = getSessionContext();
  void ctx;
  return raw.startsWith("/") ? raw : `/${raw}`;
}

function normalizeCategory(node: AnyRecord): StoreCategory {
  const id = text(pick(node, "id", "category_id", "identifier"), "");
  const name = text(pick(node, "name", "title", "label"), "Kategori");
  const slug = text(pick(node, "slug", "url_key"), "") || slugFromUrl(pick(node, "url", "link")) || slugify(name, id);

  slugToId.set(slug, id);

  const children = asArray(pick(node, "children", "subcategories", "sub_categories", "items")).map((child) => {
    const childId = text(pick(child, "id", "category_id"), "");
    const childName = text(pick(child, "name", "title", "label"), "");
    const childSlug =
      text(pick(child, "slug", "url_key"), "") || slugFromUrl(pick(child, "url", "link")) || slugify(childName, childId);
    slugToId.set(childSlug, childId);
    return { id: childId, name: childName, slug: childSlug };
  });

  return {
    id,
    name,
    slug,
    description: text(pick(node, "description", "short_description", "intro"), ""),
    children: children.filter((child) => child.name),
  };
}

function normalizeVariants(node: AnyRecord): StoreVariant[] {
  const raw = asArray(pick(node, "variants", "variant_products", "children", "skus"));
  return raw.map((variant, index) => ({
    id: text(pick(variant, "id", "sku", "variant_id"), `v-${index}`),
    name: text(pick(variant, "name", "title", "label", "value"), `Variant ${index + 1}`),
    inStock: pick(variant, "in_stock", "is_in_stock", "available") !== false,
  }));
}

function normalizeProduct(node: AnyRecord, categoryId = ""): StoreProduct {
  const id = text(pick(node, "id", "product_id", "sku"), "");
  const name = text(pick(node, "name", "title"), "Produkt");
  const slug = text(pick(node, "slug", "url_key"), "") || slugFromUrl(pick(node, "url", "link")) || slugify(name, id);

  const priceNode = (pick(node, "price", "prices", "pricing") as AnyRecord | number | string | undefined) ?? {};
  const ctx = getSessionContext();
  const incVat = ctx?.pricesIncludeVat !== false;

  const price =
    (typeof priceNode === "object"
      ? num(
          pick(
            priceNode as AnyRecord,
            incVat ? "price_incl_vat" : "price_excl_vat",
            incVat ? "incl_vat" : "excl_vat",
            "price",
            "amount",
            "value",
          ),
        )
      : num(priceNode)) ??
    num(pick(node, "price_incl_vat", "price_excl_vat", "final_price")) ??
    0;

  const compare =
    (typeof priceNode === "object"
      ? num(pick(priceNode as AnyRecord, "original_price", "list_price", "compare_at_price", "regular_price"))
      : undefined) ?? num(pick(node, "original_price", "list_price", "regular_price"));

  const images = asArray(pick(node, "images", "media", "gallery"))
    .map((image) => resolveImage(image))
    .filter((image): image is string => Boolean(image));

  const single = resolveImage(pick(node, "image", "thumbnail", "main_image"));
  if (images.length === 0 && single) images.push(single);

  const product: StoreProduct = {
    id,
    name,
    slug,
    categoryId: text(pick(node, "category_id", "main_category_id"), categoryId),
    description: text(pick(node, "description", "short_description", "intro"), ""),
    priceIncVat: price,
    vatRate: num(pick(node, "vat_rate", "vat", "tax_rate")) ?? 25,
    currency: ctx?.currency ?? "SEK",
    images,
    variants: normalizeVariants(node),
  };

  if (compare !== undefined && compare > price) product.comparePriceIncVat = compare;
  slugToId.set(`product:${slug}`, id);
  return product;
}

/** Header/footer navigation, cached per language/market. */
export function getLiveNavigation(): Promise<StoreCategory[]> {
  const key = cacheKey(["menus"]);
  const cached = menusCache.get(key);
  if (cached) return cached;

  const request = withSession(async () => {
    const payload = await surfaceJson<AnyRecord>("navigation/menus");
    const menus = asArray(pick(payload, "menus", "data", "items")) as AnyRecord[];
    const source = menus.length > 0 ? menus : asArray(payload);

    const header =
      source.find((menu) => /header|main|top/i.test(text(pick(menu, "code", "name", "type"), ""))) ?? source[0];
    const items = asArray(pick(header ?? {}, "items", "children", "menu_items"));
    const nodes = items.length > 0 ? items : source;

    return nodes
      .filter((item) => {
        const type = text(pick(item, "type", "item_type"), "category");
        return !/information_page|external|url/i.test(type);
      })
      .map((item) => normalizeCategory(item))
      .filter((category) => category.id || category.slug);
  }).catch((error: unknown) => {
    menusCache.delete(key);
    throw error;
  });

  menusCache.set(key, request);
  return request;
}

async function resolveCategoryId(slug: string): Promise<string> {
  if (slugToId.has(slug)) return slugToId.get(slug) as string;
  await getLiveNavigation();
  const id = slugToId.get(slug);
  if (!id) throw new Error(`Kategorin "${slug}" finns inte i butikens meny.`);
  return id;
}

export type CategoryQuery = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
};

/** Category page data — sorting and pagination happen server-side. */
export function getLiveCategory(slug: string, query: CategoryQuery = {}): Promise<CategoryResult> {
  const key = cacheKey(["category", slug, query.page, query.limit, query.sortBy, query.sortOrder]);
  const cached = categoryCache.get(key);
  if (cached) return cached;

  const request = withSession(async () => {
    const id = await resolveCategoryId(slug);
    const params = new URLSearchParams();
    params.set("page", String(query.page ?? 1));
    params.set("limit", String(query.limit ?? 24));
    if (query.sortBy) params.set("sort_by", query.sortBy);
    if (query.sortOrder) params.set("sort_order", query.sortOrder);

    const payload = await surfaceJson<AnyRecord>(`categories/${encodeURIComponent(id)}?${params.toString()}`);
    const node = (pick(payload, "category", "data") as AnyRecord | undefined) ?? payload;
    const category = normalizeCategory(node);
    const products = asArray(pick(payload, "products") ?? pick(node, "products")).map((item) =>
      normalizeProduct(item, category.id),
    );

    const productCount = num(pick(payload, "product_count", "total", "count") ?? pick(node, "product_count")) ?? products.length;
    const pageCount = num(pick(payload, "page_count", "pages", "total_pages")) ?? 1;

    return { category, products, productCount, pageCount } satisfies CategoryResult;
  }).catch((error: unknown) => {
    categoryCache.delete(key);
    throw error;
  });

  categoryCache.set(key, request);
  return request;
}

/** Top-level categories for the home page. */
export async function getLiveCategories(): Promise<StoreCategory[]> {
  return getLiveNavigation();
}

/** Featured products for the home page — first page of the first category. */
export async function getLiveFeaturedProducts(limit = 8): Promise<StoreProduct[]> {
  const categories = await getLiveNavigation();
  const first = categories[0];
  if (!first) return [];
  const result = await getLiveCategory(first.slug, { limit });
  return result.products.slice(0, limit).map((product) => ({ ...product, featured: true }));
}

async function findProductInCategories(slug: string): Promise<StoreProduct | undefined> {
  const categories = await getLiveNavigation();
  for (const category of categories) {
    const result = await getLiveCategory(category.slug, { limit: 100 });
    const match = result.products.find((product) => product.slug === slug);
    if (match) return match;
  }
  return undefined;
}

/** Product detail — VQL first, category payload as fallback when VQL is disabled. */
export function getLiveProduct(slug: string): Promise<StoreProduct> {
  const key = cacheKey(["product", slug]);
  const cached = productCache.get(key);
  if (cached) return cached;

  const request = withSession(async () => {
    try {
      const payload = await surfaceJson<AnyRecord>("vql", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          resource: "products",
          filter: { slug },
          limit: 1,
        }),
      });
      const rows = asArray(pick(payload, "products", "data", "results", "items"));
      const row = rows[0];
      if (row) return normalizeProduct(row);
    } catch {
      // VQL is not enabled on every install — fall through to the category payload.
    }

    const fallback = await findProductInCategories(slug);
    if (!fallback) throw new Error(`Produkten "${slug}" hittades inte i butiken.`);
    return fallback;
  }).catch((error: unknown) => {
    productCache.delete(key);
    throw error;
  });

  productCache.set(key, request);
  return request;
}
