import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { StoreImage } from "@/components/store/store-image";
import { StoreShell } from "@/components/store/store-shell";
import { useI18n } from "@/lib/i18n";
import { ProductPrice } from "@/components/store/product-price";
import { useCartMutations, useProduct } from "@/lib/vendre/api";
import { cn } from "@/lib/utils";

export default function ProductPage({ id }: { id: string }) {
  const { t } = useI18n();
  const { data: product, isLoading } = useProduct(id);
  const { add } = useCartMutations();
  const [variant, setVariant] = useState<string | number | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <StoreShell>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> {t("store.loading")}
        </p>
      </StoreShell>
    );
  }

  if (!product) {
    return (
      <StoreShell>
        <p className="text-sm text-muted-foreground">{t("store.notFound")}</p>
        <Link to="/" className="brand-button mt-4">
          {t("store.backToStore")}
        </Link>
      </StoreShell>
    );
  }

  const soldOut = product.stock_total === 0 && product.stock_allow_checkout === false;
  const attributes = product.attributes ?? [];

  return (
    <StoreShell>
      <div className="grid gap-10 lg:grid-cols-2">
        <StoreImage
          image={product.image ?? product.images[0] ?? null}
          alt={product.name}
          label={product.name}
          className="aspect-4/5 w-full rounded-2xl border border-border"
        />

        <div>
          <h1 className="text-3xl font-extrabold text-foreground">{product.name}</h1>
          {product.description_short && (
            <p className="mt-3 text-sm text-muted-foreground">{product.description_short}</p>
          )}
          <ProductPrice product={product} size="lg" className="mt-5" />
          <p className={cn("mt-1 text-sm", soldOut ? "text-destructive" : "text-emerald-700")}>
            {soldOut ? t("store.outOfStock") : t("store.inStock")}
          </p>

          {attributes.map((attribute) => (
            <div key={attribute.id} className="mt-6">
              <h2 className="brand-eyebrow text-muted-foreground">{attribute.name}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {attribute.values.map((value) => (
                  <button
                    key={value.id}
                    type="button"
                    onClick={() => setVariant(value.id)}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-sm transition-colors",
                      variant === value.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:bg-accent",
                    )}
                  >
                    {value.name}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-6 flex items-center gap-3">
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
              className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              aria-label="1"
            />
            <button
              type="button"
              className="brand-button"
              disabled={soldOut || add.isPending}
              onClick={() => add.mutate({ productId: product.id, quantity })}
            >
              {soldOut ? t("store.outOfStock") : t("store.addToCart")}
            </button>
          </div>

          {product.description && (
            <section className="mt-10">
              <h2 className="text-lg font-bold text-foreground">{t("store.description")}</h2>
              <div
                className="mt-2 text-sm leading-relaxed text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </section>
          )}
        </div>
      </div>
    </StoreShell>
  );
}
