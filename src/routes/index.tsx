import { createFileRoute, Link } from "@tanstack/react-router";

import { ProductGrid } from "@/components/storefront/product-card";
import { StorefrontError, StorefrontLoading } from "@/components/storefront/live-state";
import { useCategories, useFeaturedProducts, useStoreInfo } from "@/lib/storefront/use-storefront";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nordiska Hemmet — Inredning i naturmaterial" },
      {
        name: "description",
        content:
          "Belysning, textil, keramik och möbler i naturmaterial. Handla utvalda favoriter till hela hemmet.",
      },
      { property: "og:title", content: "Nordiska Hemmet — Inredning i naturmaterial" },
      {
        property: "og:description",
        content: "Belysning, textil, keramik och möbler i naturmaterial till hela hemmet.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const store = useStoreInfo();
  const categoriesState = useCategories();
  const featuredState = useFeaturedProducts();
  const categories = categoriesState.data ?? [];
  const featured = featuredState.data ?? [];
  const error = featuredState.error ?? categoriesState.error;
  const isLoading = featuredState.isLoading || categoriesState.isLoading;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6">
      <section className="relative overflow-hidden rounded-2xl border border-border">
        <img
          src={store.heroImage}
          alt="Ljust vardagsrum inrett i naturmaterial"
          width={1536}
          height={1024}
          className="h-[380px] w-full object-cover sm:h-[460px]"
        />
        <div className="absolute inset-0 bg-linear-to-r from-foreground/70 via-foreground/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center gap-4 p-8 sm:p-12">
          <p className="brand-eyebrow inline-flex w-fit rounded-md bg-background/85 px-3 py-1 text-primary">
            Ny säsong
          </p>
          <h1 className="max-w-lg text-4xl font-extrabold leading-tight text-background sm:text-5xl">
            Lugna rum med varma material
          </h1>
          <p className="max-w-md text-sm text-background/90 sm:text-base">
            Utvalda favoriter i ek, lin och stengods — formgivna för att hålla länge.
          </p>
          <Link
            to="/kategori/$slug"
            params={{ slug: "inredning" }}
            className="inline-flex w-fit items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Handla nyheter
          </Link>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-bold text-foreground">Utvalda produkter</h2>
        <p className="mt-1 text-sm text-muted-foreground">Populärt just nu hos våra kunder.</p>
        <div className="mt-6">
          {error ? (
            <StorefrontError error={error} />
          ) : isLoading ? (
            <StorefrontLoading />
          ) : (
            <ProductGrid products={featured} />
          )}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-bold text-foreground">Kategorier</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              to="/kategori/$slug"
              params={{ slug: category.slug }}
              className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
            >
              <h3 className="text-lg font-bold text-foreground">{category.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
              <p className="mt-4 text-sm font-semibold text-primary">Utforska →</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
