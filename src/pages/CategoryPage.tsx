import { Link, useNavigate, useSearch } from "@tanstack/react-router";

import { Breadcrumbs, type Crumb } from "@/components/store/breadcrumbs";
import { CategoryFilters } from "@/components/store/category-filters";
import { CategoryToolbar, type SortValue } from "@/components/store/category-toolbar";
import { Pagination } from "@/components/store/pagination";
import { ProductCard } from "@/components/store/product-card";
import { StoreImage } from "@/components/store/store-image";
import { StoreShell } from "@/components/store/store-shell";
import { useI18n } from "@/lib/i18n";
import { useCategory, useMenus } from "@/lib/vendre/api";
import type { MenuItem } from "@/types/vendre";

function buildTrail(menus: MenuItem[], id: number, fallbackName: string): Crumb[] {
  const byId = new Map(menus.map((item) => [item.id, item]));
  const trail: Crumb[] = [];
  let current = byId.get(id);
  while (current) {
    trail.unshift({ id: current.id, name: current.name });
    current = current.parent_id != null ? byId.get(current.parent_id) : undefined;
  }
  return trail.length ? trail : [{ id, name: fallbackName }];
}

export default function CategoryPage({ id }: { id: number }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const search = useSearch({ from: "/kategori/$id" });
  const { data: menus } = useMenus();

  const tags = search.tags ?? [];
  const query = {
    page: search.page ?? 1,
    limit: search.limit ?? 12,
    sort_by: search.sort_by ?? "name",
    sort_order: search.sort_order ?? "ASC",
    ...(tags.length ? { tags } : {}),
    ...(search.pfrom != null ? { pfrom: search.pfrom } : {}),
    ...(search.pto != null ? { pto: search.pto } : {}),
  };

  const { data, isLoading, isFetching, error } = useCategory(id, query);

  const setSearch = (patch: Record<string, unknown>, resetPage = true) => {
    void navigate({
      to: "/kategori/$id",
      params: { id: String(id) },
      search: (prev: Record<string, unknown>) => {
        const next = { ...prev, ...patch };
        if (resetPage) next["page"] = 1;
        for (const key of Object.keys(next)) {
          const value = next[key];
          if (value == null || (Array.isArray(value) && value.length === 0)) delete next[key];
        }
        return next;
      },
    });
  };

  const trail = buildTrail(menus ?? [], id, data?.header.name ?? "");

  return (
    <StoreShell>
      {error && !data ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">{t("store.loadError")}</p>
          <Link to="/" className="brand-button mt-4 inline-flex">
            {t("store.backToStore")}
          </Link>
        </div>
      ) : isLoading || !data ? (
        <div className="space-y-6" aria-busy="true">
          <div className="h-8 w-56 animate-pulse rounded bg-muted" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="aspect-4/5 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
          <p className="sr-only">{t("store.loading")}</p>
        </div>
      ) : (
        <>
          <Breadcrumbs trail={trail} />

          <header className="mt-4">
            {data.header.image && (
              <div className="mb-5 aspect-[16/5] overflow-hidden rounded-xl">
                <StoreImage
                  image={data.header.image}
                  alt={data.header.name}
                  label={data.header.name}
                  className="size-full"
                />
              </div>
            )}
            <h1 className="text-3xl font-extrabold text-foreground">{data.header.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {data.product_count} {t("store.products")}
            </p>
            {data.header.text && (
              <div
                className="mt-3 max-w-2xl text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: data.header.text }}
              />
            )}
          </header>

          {data.subcategory_list.length > 0 && (
            <nav className="mt-6" aria-label={t("store.subcategories")}>
              <div className="flex flex-wrap gap-2">
                {data.subcategory_list.map((sub) => (
                  <Link
                    key={sub.id}
                    to="/kategori/$id"
                    params={{ id: String(sub.id) }}
                    className="brand-button-ghost"
                    activeProps={{ "aria-current": "page" }}
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </nav>
          )}

          <div className="mt-8 flex flex-col gap-8 lg:flex-row">
            {data.filters.length > 0 && (
              <CategoryFilters
                filters={data.filters}
                selected={tags.map(String)}
                priceFrom={search.pfrom}
                priceTo={search.pto}
                onToggleTag={(tag) =>
                  setSearch({
                    tags: tags.map(String).includes(tag)
                      ? tags.map(String).filter((value) => value !== tag)
                      : [...tags.map(String), tag],
                  })
                }
                onPriceChange={(from, to) => setSearch({ pfrom: from, pto: to })}
                onClear={() => setSearch({ tags: [], pfrom: undefined, pto: undefined })}
              />
            )}

            <div className="grow">
              <CategoryToolbar
                data={data}
                sort={`${data.sort_by}-${data.sort_order}` as SortValue}
                onSortChange={(value) => {
                  const [sortBy, sortOrder] = value.split("-");
                  setSearch({ sort_by: sortBy, sort_order: sortOrder });
                }}
                onLimitChange={(limit) => setSearch({ limit })}
              />

              {data.product_list.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-sm text-muted-foreground">{t("store.noResults")}</p>
                  <button
                    type="button"
                    className="brand-button mt-4"
                    onClick={() => setSearch({ tags: [], pfrom: undefined, pto: undefined })}
                  >
                    {t("store.clearFilters")}
                  </button>
                </div>
              ) : (
                <div
                  className={`mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${
                    isFetching ? "opacity-60" : ""
                  }`}
                >
                  {data.product_list.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              <Pagination
                page={data.page_index}
                pageCount={data.page_count}
                onPageChange={(page) => setSearch({ page }, false)}
              />
            </div>
          </div>
        </>
      )}
    </StoreShell>
  );
}
