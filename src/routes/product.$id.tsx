import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { ProductImage } from "@/components/store/product-image";
import { StoreLayout } from "@/components/store/store-layout";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/store/cart";
import { useVendreApi } from "@/lib/vendre/api";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/vendre";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "Produkt — Vendre Storefront" },
      {
        name: "description",
        content: "Produktsida med bilder, varianter, lagerstatus och köp direkt till kundvagnen.",
      },
      { property: "og:title", content: "Produkt — Vendre Storefront" },
      {
        property: "og:description",
        content: "Produktsida med bilder, varianter, lagerstatus och köp direkt till kundvagnen.",
      },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { t } = useI18n();
  const api = useVendreApi();
  const { add, busy } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [active, setActive] = useState(0);
  const [variant, setVariant] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void api
      .getProduct(id)
      .then((next) => {
        if (!alive) return;
        setProduct(next);
        setActive(0);
        setVariant(next?.variants[0]?.id ?? null);
      })
      .catch(() => alive && setProduct(null));
    return () => {
      alive = false;
    };
  }, [api, id]);

  if (!product) {
    return (
      <StoreLayout>
        <div className="mx-auto w-full max-w-6xl px-5 py-24 text-center text-sm text-muted-foreground sm:px-6">
          {t("store.loading")}
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6">
        <nav className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            {t("store.home")}
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div>
            <ProductImage
              product={product}
              src={product.images[active] ?? product.image}
              className="aspect-4/5 w-full rounded-xl border border-border"
            />
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActive(index)}
                    aria-label={`${product.name} ${index + 1}`}
                    className={cn(
                      "size-16 overflow-hidden rounded-md border",
                      index === active ? "border-primary" : "border-border",
                    )}
                  >
                    <ProductImage product={product} src={image} className="size-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {product.manufacturer && (
              <span className="brand-eyebrow text-muted-foreground">{product.manufacturer}</span>
            )}
            <h1 className="mt-2 font-display text-3xl font-extrabold text-foreground">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-display text-2xl font-bold text-foreground">{product.price}</span>
              {product.priceOriginal && (
                <span className="text-sm text-muted-foreground line-through">
                  {product.priceOriginal}
                </span>
              )}
            </div>

            <p
              className={cn(
                "mt-2 flex items-center gap-2 text-sm font-medium",
                product.inStock ? "text-emerald-700" : "text-destructive",
              )}
            >
              <span
                className={cn(
                  "size-2 rounded-full",
                  product.inStock ? "bg-emerald-500" : "bg-destructive",
                )}
              />
              {product.inStock ? t("store.inStock") : t("store.outOfStock")}
            </p>

            {product.variants.length > 0 && (
              <div className="mt-6">
                <span className="brand-eyebrow text-muted-foreground">{t("store.variant")}</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.variants.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setVariant(option.id)}
                      className={cn(
                        "rounded-md border px-4 py-2 text-sm font-medium",
                        variant === option.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-foreground hover:border-primary/50",
                      )}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              className="brand-button mt-8 w-full justify-center sm:w-auto"
              disabled={!product.inStock || busy}
              onClick={() => void add(product.id, 1)}
            >
              {t("store.addToCart")}
            </button>

            {product.description && (
              <div
                className="mt-8 space-y-3 text-sm leading-relaxed text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
