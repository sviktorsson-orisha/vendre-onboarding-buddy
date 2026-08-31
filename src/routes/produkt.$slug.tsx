import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/store/cart-state";
import { StorefrontError, StorefrontLoading } from "@/components/storefront/live-state";
import { formatPrice } from "@/lib/storefront/data";
import { useCategories, useProduct } from "@/lib/storefront/use-storefront";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/produkt/$slug")({
  head: ({ params }) => {
    const title = `${params.slug} — Nordiska Hemmet`;
    const description = `Läs mer om ${params.slug} och handla direkt hos Nordiska Hemmet.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product, error } = useProduct(slug);
  const categories = useCategories().data ?? [];
  const [activeImage, setActiveImage] = useState(0);
  const [variantId, setVariantId] = useState<string | undefined>(undefined);

  if (error) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6">
        <StorefrontError error={error} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6">
        <StorefrontLoading />
      </div>
    );
  }

  const category = categories.find((item) => item.id === product.categoryId);
  const selectedId =
    variantId ?? product.variants.find((item) => item.inStock)?.id ?? product.variants[0]?.id;
  const variant = product.variants.find((item) => item.id === selectedId);
  const canBuy = variant?.inStock !== false;
  const parentSlug = category?.slug ?? categories[0]?.slug ?? "";

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6">
      <nav aria-label="Brödsmulor" className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Start
        </Link>
        <span className="px-1.5">/</span>
        <Link to="/kategori/$slug" params={{ slug: parentSlug }} className="hover:text-foreground">
          {category?.name ?? "Sortiment"}
        </Link>
        <span className="px-1.5">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-xl border border-border bg-muted">
            <img
              src={product.images[activeImage] ?? product.images[0]}
              alt={product.name}
              width={1024}
              height={1024}
              className="aspect-square w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Visa bild ${index + 1}`}
                  className={cn(
                    "size-20 overflow-hidden rounded-lg border",
                    index === activeImage ? "border-primary" : "border-border",
                  )}
                >
                  <img
                    src={image}
                    alt=""
                    loading="lazy"
                    width={1024}
                    height={1024}
                    className="size-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.badge && (
            <span className="brand-eyebrow inline-flex rounded-md bg-primary/10 px-2.5 py-1 text-primary">
              {product.badge}
            </span>
          )}
          <h1 className="mt-3 text-3xl font-extrabold text-foreground">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-bold text-foreground">
              {formatPrice(product.priceIncVat, product.currency)}
            </span>
            {product.comparePriceIncVat && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.comparePriceIncVat, product.currency)}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Inkl. {product.vatRate} % moms. Fri frakt över 995 kr.
          </p>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          {product.variants.length > 0 && (
            <fieldset className="mt-6">
              <legend className="text-sm font-semibold text-foreground">Variant</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.variants.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setVariantId(item.id)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm transition-colors",
                      item.id === selectedId
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:bg-muted",
                      !item.inStock && "opacity-60",
                    )}
                  >
                    {item.name}
                    {!item.inStock && " (slut)"}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <Button
            className="mt-8 w-full sm:w-auto"
            disabled={!canBuy}
            onClick={() =>
              addToCart({
                productId: product.id,
                slug: product.slug,
                name: product.name,
                ...(variant?.name ? { variantName: variant.name } : {}),
                image: product.images[0] ?? "",
                unitPrice: product.priceIncVat,
                currency: product.currency,
              })
            }
          >
            {canBuy ? "Lägg i varukorg" : "Tillfälligt slut"}
          </Button>
        </div>
      </div>
    </div>
  );
}
