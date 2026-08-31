import { useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Check, Minus, Plus, Truck } from "lucide-react";

import { StorefrontLayout } from "@/components/storefront/layout";
import { addToCart } from "@/lib/vendre/cart-store";
import { useProduct, useSessionContext } from "@/lib/vendre/use-vendre-api";
import { cn } from "@/lib/utils";

export default function ProductPage() {
  const { slug } = useParams({ from: "/produkt/$slug" });
  const { data: product, isPending } = useProduct(slug);
  const { data: session } = useSessionContext();
  const [variantIndex, setVariantIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (isPending) {
    return (
      <StorefrontLayout>
        <div className="mx-auto max-w-7xl px-5 py-24 text-sm text-muted-foreground">Laddar…</div>
      </StorefrontLayout>
    );
  }

  if (!product) {
    return (
      <StorefrontLayout>
        <div className="mx-auto max-w-7xl px-5 py-24 text-center">
          <h1 className="text-2xl font-bold text-foreground">Produkten hittades inte</h1>
          <Link to="/" className="mt-4 inline-block text-sm text-primary underline underline-offset-4">
            Till startsidan
          </Link>
        </div>
      </StorefrontLayout>
    );
  }

  const variant = product.variants[variantIndex] ?? null;
  const price = variant?.price ?? product.price;
  const inStock = variant ? variant.in_stock : product.in_stock;
  const images = product.images;
  const includesVat = session?.prices_include_vat ?? price.includes_vat;

  return (
    <StorefrontLayout>
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-10 sm:px-6 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-xl border border-border bg-muted">
            <img
              src={(variant?.image ?? images[imageIndex])?.url}
              alt={(variant?.image ?? images[imageIndex])?.alt ?? product.name}
              className="size-full object-cover"
            />
          </div>
          <ul className="mt-3 flex gap-3">
            {images.map((image, index) => (
              <li key={image.url}>
                <button
                  type="button"
                  onClick={() => setImageIndex(index)}
                  className={cn(
                    "size-20 overflow-hidden rounded-lg border",
                    index === imageIndex ? "border-primary" : "border-border",
                  )}
                >
                  <img src={image.url} alt={image.alt} loading="lazy" className="size-full object-cover" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <nav aria-label="Brödsmulor" className="text-xs text-muted-foreground">
            <Link to="/">Start</Link> <span aria-hidden>/</span> {product.name}
          </nav>
          {product.brand && <p className="brand-eyebrow mt-3 text-primary">{product.brand}</p>}
          <h1 className="mt-1 text-3xl font-extrabold text-foreground sm:text-4xl">{product.name}</h1>
          <p className="mt-3 text-muted-foreground">{product.short_description}</p>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-foreground">{price.formatted}</span>
            {price.compare_at_formatted && (
              <span className="text-sm text-muted-foreground line-through">
                {price.compare_at_formatted}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {includesVat ? "Priser inkl. moms" : "Priser exkl. moms"} · Art.nr {variant?.sku ?? product.sku}
          </p>

          {product.variants.length > 0 && (
            <fieldset className="mt-6">
              <legend className="brand-eyebrow text-muted-foreground">
                {product.variants[0]?.options[0]?.name ?? "Variant"}
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.variants.map((option, index) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setVariantIndex(index)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      index === variantIndex
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:text-foreground",
                      !option.in_stock && "opacity-60",
                    )}
                  >
                    {option.options[0]?.value ?? option.name}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <p
            className={cn(
              "mt-5 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold",
              inStock ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground",
            )}
          >
            <span className={cn("size-2 rounded-full", inStock ? "bg-emerald-500" : "bg-muted-foreground")} />
            {inStock ? "I lager – skickas inom 1–2 dagar" : "Tillfälligt slut"}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border border-border">
              <button
                type="button"
                aria-label="Minska antal"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="p-2.5 text-muted-foreground hover:text-foreground"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-10 text-center font-semibold text-foreground">{quantity}</span>
              <button
                type="button"
                aria-label="Öka antal"
                onClick={() => setQuantity((value) => value + 1)}
                className="p-2.5 text-muted-foreground hover:text-foreground"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <button
              type="button"
              disabled={!inStock}
              onClick={() => addToCart(product, variant, quantity)}
              className="brand-button grow justify-center sm:grow-0"
            >
              Lägg i varukorg
            </button>
          </div>

          <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Truck className="size-4" aria-hidden /> Fri frakt över 999 kr · 60 dagars öppet köp
          </p>

          <div className="mt-8 border-t border-border pt-6">
            <h2 className="text-lg font-bold text-foreground">Om produkten</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            <dl className="mt-4 space-y-2">
              {product.attributes.map((attribute) => (
                <div key={attribute.name} className="flex gap-3 text-sm">
                  <dt className="w-32 shrink-0 text-muted-foreground">{attribute.name}</dt>
                  <dd className="flex items-center gap-1.5 font-medium text-foreground">
                    <Check className="size-3.5 text-primary" aria-hidden />
                    {attribute.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
