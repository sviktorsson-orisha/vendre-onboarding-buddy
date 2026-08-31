import { Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, RotateCcw, Truck } from "lucide-react";

import { ProductCard } from "@/components/storefront/product-card";
import { StorefrontLayout } from "@/components/storefront/layout";
import { mockFeaturedProducts, mockTopCategories } from "@/mock/vendreResponses";
import { useCategory } from "@/lib/vendre/use-vendre-api";

const usps = [
  { icon: Truck, title: "Fri frakt över 999 kr", body: "Leverans inom 2–4 arbetsdagar." },
  { icon: RotateCcw, title: "60 dagars öppet köp", body: "Enkla returer, inga frågor." },
  { icon: Leaf, title: "Tillverkat i Sverige", body: "Material som åldras vackert." },
];

export default function Home() {
  // Startsidans utvalda produkter hämtas från huvudkategorin; i demoläge
  // svarar adaptern med mockdata i exakt samma form.
  const { data: category } = useCategory("mobler", { limit: 8 });
  const featured = category?.products.slice(0, 4) ?? mockFeaturedProducts.slice(0, 4);

  return (
    <StorefrontLayout>
      <section className="relative overflow-hidden border-b border-border bg-secondary">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="brand-eyebrow inline-flex rounded-md bg-primary/10 px-3 py-1 text-primary">
              Ny kollektion
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] text-foreground sm:text-6xl">
              Inredning som <span className="brand-gradient-text">håller i decennier</span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              Massiv ek, handvävd ull och blåst glas. Formgivet i Sverige, tillverkat i begränsade
              serier.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/kategori/$slug" params={{ slug: "mobler" }} className="brand-button">
                Handla möbler <ArrowRight className="size-4" />
              </Link>
              <Link to="/kategori/$slug" params={{ slug: "belysning" }} className="brand-button-ghost">
                Se belysning
              </Link>
            </div>
          </div>
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-border">
            <img
              src="https://picsum.photos/seed/vendre-hero/1400/1050"
              alt="Ljust vardagsrum med möbler ur kollektionen"
              className="size-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-6">
        <ul className="grid gap-4 sm:grid-cols-3">
          {usps.map(({ icon: Icon, title, body }) => (
            <li key={title} className="brand-card flex items-start gap-3 p-4">
              <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="text-sm font-bold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-foreground">Utvalda produkter</h2>
          <Link
            to="/kategori/$slug"
            params={{ slug: "mobler" }}
            className="text-sm font-semibold text-primary underline underline-offset-4"
          >
            Visa alla
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6">
        <h2 className="text-2xl font-bold text-foreground">Utforska kategorier</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {mockTopCategories.map((category) => (
            <Link
              key={category.id}
              to="/kategori/$slug"
              params={{ slug: category.slug }}
              className="group relative block aspect-4/5 overflow-hidden rounded-xl border border-border"
            >
              <img
                src={category.image ?? ""}
                alt={category.name}
                loading="lazy"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-foreground/80 to-transparent p-4">
                <p className="text-lg font-bold text-background">{category.name}</p>
                <p className="text-xs text-background/80">{category.product_count} produkter</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </StorefrontLayout>
  );
}
