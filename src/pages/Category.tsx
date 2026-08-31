import { Link, useParams, useNavigate, useSearch } from "@tanstack/react-router";

import { ProductCard } from "@/components/storefront/product-card";
import { StorefrontLayout } from "@/components/storefront/layout";
import { useCategory } from "@/lib/vendre/use-vendre-api";
import { cn } from "@/lib/utils";

export type CategorySearch = {
  sort_by?: string | undefined;
  sort_order?: "asc" | "desc" | undefined;
  tags?: number[] | undefined;
  page?: number | undefined;
};

export default function CategoryPage() {
  const { slug } = useParams({ from: "/kategori/$slug" });
  const search = useSearch({ from: "/kategori/$slug" }) as CategorySearch;
  const navigate = useNavigate({ from: "/kategori/$slug" });

  // Filter, sortering och sida ligger i URL:en så listningen är delbar och
  // cachenyckeln stämmer med länken (.vendre/skills/category-plp.md).
  const { data: category, isPending } = useCategory(slug, {
    sort_by: search.sort_by,
    sort_order: search.sort_order,
    tags: search.tags,
    page: search.page ?? 1,
  });

  const activeTags = search.tags ?? [];

  const toggleTag = (id: number) => {
    const next = activeTags.includes(id)
      ? activeTags.filter((tag) => tag !== id)
      : [...activeTags, id];
    void navigate({ search: (prev) => ({ ...prev, tags: next.length ? next : undefined, page: undefined }) });
  };

  if (!isPending && !category) {
    return (
      <StorefrontLayout>
        <div className="mx-auto max-w-7xl px-5 py-24 text-center">
          <h1 className="text-2xl font-bold text-foreground">Kategorin hittades inte</h1>
          <Link to="/" className="mt-4 inline-block text-sm text-primary underline underline-offset-4">
            Till startsidan
          </Link>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      {category && (
        <>
          <section className="relative border-b border-border">
            <div className="relative h-48 overflow-hidden bg-muted sm:h-64">
              {category.banner_image && (
                <img
                  src={category.banner_image}
                  alt={category.name}
                  className="size-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-linear-to-r from-foreground/70 to-transparent" />
              <div className="absolute inset-0 mx-auto flex w-full max-w-7xl flex-col justify-end px-5 pb-6 sm:px-6">
                <nav aria-label="Brödsmulor" className="text-xs text-background/80">
                  <Link to="/">Start</Link> <span aria-hidden>/</span> {category.name}
                </nav>
                <h1 className="mt-1 text-3xl font-extrabold text-background sm:text-4xl">
                  {category.name}
                </h1>
                <p className="max-w-lg text-sm text-background/85">{category.description}</p>
              </div>
            </div>
          </section>

          {category.subcategories.length > 0 && (
            <section className="mx-auto w-full max-w-7xl px-5 pt-8 sm:px-6">
              <ul className="flex flex-wrap gap-2">
                {category.subcategories.map((sub) => (
                  <li key={sub.id}>
                    <Link
                      to="/kategori/$slug"
                      params={{ slug: sub.slug }}
                      className="brand-button-ghost"
                    >
                      {sub.name} <span className="text-muted-foreground">({sub.product_count})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6">
            <div className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
              <p className="text-sm text-muted-foreground">{category.product_count} produkter</p>
              <div className="flex flex-wrap gap-2">
                {category.filters.flatMap((filter) =>
                  filter.values.map((value) => (
                    <button
                      key={`${filter.code}-${value.id}`}
                      type="button"
                      onClick={() => toggleTag(value.id)}
                      className={cn(
                        "rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors",
                        activeTags.includes(value.id)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {value.title} ({value.count})
                    </button>
                  )),
                )}
              </div>
              <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                Sortera
                <select
                  className="rounded-md border border-border bg-card px-2 py-1.5 text-xs text-foreground"
                  value={`${search.sort_by ?? "popularity"}:${search.sort_order ?? "desc"}`}
                  onChange={(event) => {
                    const [sort_by, sort_order] = event.target.value.split(":");
                    void navigate({
                      search: (prev) => ({
                        ...prev,
                        sort_by,
                        sort_order: sort_order as "asc" | "desc",
                      }),
                    });
                  }}
                >
                  {category.sort_options.map((option) => (
                    <option
                      key={`${option.sort_by}:${option.sort_order}`}
                      value={`${option.sort_by}:${option.sort_order}`}
                    >
                      {option.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {category.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {category.products.length === 0 && (
              <p className="py-16 text-center text-sm text-muted-foreground">
                Inga produkter matchar filtret.
              </p>
            )}
          </section>
        </>
      )}
    </StorefrontLayout>
  );
}
