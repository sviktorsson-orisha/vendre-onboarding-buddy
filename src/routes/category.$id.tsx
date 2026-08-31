import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { ProductCard } from "@/components/store/product-card";
import { StoreLayout } from "@/components/store/store-layout";
import { useI18n } from "@/lib/i18n";
import { useVendreApi } from "@/lib/vendre/api";
import type { Category } from "@/types/vendre";

export const Route = createFileRoute("/category/$id")({
  head: () => ({
    meta: [
      { title: "Kategori — Vendre Storefront" },
      {
        name: "description",
        content: "Bläddra bland produkter i kategorin med filter, sortering och live prisdata.",
      },
      { property: "og:title", content: "Kategori — Vendre Storefront" },
      {
        property: "og:description",
        content: "Bläddra bland produkter i kategorin med filter, sortering och live prisdata.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { id } = Route.useParams();
  const { t } = useI18n();
  const api = useVendreApi();
  const [category, setCategory] = useState<Category | null>(null);
  const [sort, setSort] = useState("name-ASC");

  useEffect(() => {
    let active = true;
    const [sortBy, sortOrder] = sort.split("-") as [string, "ASC" | "DESC"];
    void api
      .getCategory(Number(id), { sortBy, sortOrder, limit: 24 })
      .then((next) => active && setCategory(next))
      .catch(() => active && setCategory(null));
    return () => {
      active = false;
    };
  }, [api, id, sort]);

  return (
    <StoreLayout>
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6">
        <nav className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            {t("store.home")}
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">{category?.name ?? "…"}</span>
        </nav>

        <header className="mt-4 rounded-xl border border-border bg-secondary p-8">
          <h1 className="font-display text-3xl font-extrabold text-foreground">
            {category?.name ?? t("store.loading")}
          </h1>
          {category?.text && (
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{category.text}</p>
          )}
        </header>

        {category && category.subcategories.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2">
            {category.subcategories.map((sub) => (
              <li key={sub.id}>
                <Link
                  to="/category/$id"
                  params={{ id: String(sub.id) }}
                  className="brand-button-ghost"
                >
                  {sub.name}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
          <aside className="space-y-6">
            <div>
              <label
                htmlFor="sort"
                className="brand-eyebrow block text-muted-foreground"
              >
                {t("store.sort")}
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="name-ASC">{t("store.sortName")}</option>
                <option value="price-ASC">{t("store.sortPriceAsc")}</option>
                <option value="price-DESC">{t("store.sortPriceDesc")}</option>
              </select>
            </div>

            {(category?.filters ?? []).map((filter) => (
              <fieldset key={filter.id}>
                <legend className="brand-eyebrow text-muted-foreground">{filter.name}</legend>
                <div className="mt-2 space-y-1.5">
                  {filter.options.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <input type="checkbox" className="size-3.5 accent-primary" />
                      {option.name}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </aside>

          <div>
            <p className="text-sm text-muted-foreground">
              {t("store.productCount", { count: category?.productCount ?? 0 })}
            </p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {(category?.products ?? []).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {category?.products.length === 0 && (
              <p className="py-16 text-center text-sm text-muted-foreground">{t("store.noProducts")}</p>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
