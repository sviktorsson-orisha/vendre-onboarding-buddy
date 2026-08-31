import { createFileRoute, Link } from "@tanstack/react-router";

import { ProductGrid } from "@/components/storefront/product-card";
import { StorefrontError, StorefrontLoading } from "@/components/storefront/live-state";
import { useCategoryPage } from "@/lib/storefront/use-storefront";

export const Route = createFileRoute("/kategori/$slug")({
  head: ({ params }) => {
    const title = `${params.slug} — Nordiska Hemmet`;
    const description = `Handla produkter i kategorin ${params.slug} hos Nordiska Hemmet.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data, error, isLoading } = useCategoryPage(slug);

  if (error) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6">
        <StorefrontError error={error} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6">
        <StorefrontLoading />
      </div>
    );
  }

  const { category, products } = data;
  void isLoading;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6">
      <nav aria-label="Brödsmulor" className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Start
        </Link>
        <span className="px-1.5">/</span>
        <span className="text-foreground">{category.name}</span>
      </nav>

      <h1 className="mt-4 text-3xl font-extrabold text-foreground">{category.name}</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">{category.description}</p>

      {category.children.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2">
          {category.children.map((child) => (
            <li
              key={child.id}
              id={child.slug}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground"
            >
              {child.name}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
        <label className="text-sm text-muted-foreground" htmlFor="sort">
          Sortera
        </label>
        <select
          id="sort"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
          defaultValue="popular"
        >
          <option value="popular">Popularitet</option>
          <option value="price-asc">Pris: lågt till högt</option>
          <option value="price-desc">Pris: högt till lågt</option>
          <option value="name">Namn</option>
        </select>
        <span className="ml-auto text-sm text-muted-foreground">{data.productCount} produkter</span>
      </div>

      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
