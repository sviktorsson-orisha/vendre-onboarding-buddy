import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { StoreImage } from "@/components/store/store-image";
import { StoreShell } from "@/components/store/store-shell";
import { useI18n } from "@/lib/i18n";
import { ProductPrice } from "@/components/store/product-price";
import { useCartMutations, useProduct, useProductVariants } from "@/lib/vendre/api";
import { cn } from "@/lib/utils";
import type { ProductVariantChoice } from "@/types/vendre";

export default function ProductPage({ id }: { id: string }) {
  const { t } = useI18n();
  const { data: product, isLoading } = useProduct(id);
  const { data: variantTypes = [] } = useProductVariants(id);
  const { add } = useCartMutations();
  /** typeId -> selected choice id */
  const [selection, setSelection] = useState<Record<number, number>>({});
  const [quantity, setQuantity] = useState(1);

  const choiceProductId = (choice: ProductVariantChoice) => choice.products[0]?.id ?? null;

  const selectedChoices = useMemo(
    () =>
      variantTypes
        .map((type) =>
          type.product_variant_choices.find((choice) => choice.id === selection[type.id]),
        )
        .filter((choice): choice is ProductVariantChoice => Boolean(choice)),
    [variantTypes, selection],
  );

  const allSelected = variantTypes.length > 0 && selectedChoices.length === variantTypes.length;

  /**
   * With one variant type the selected choice decides the product. With several,
   * only a combination that resolves to the same product id is a real product.
   */
  const selectedVariantProductId = useMemo(() => {
    if (!allSelected) return null;
    const ids = selectedChoices.map(choiceProductId);
    const first = ids[0];
    return first != null && ids.every((value) => value === first) ? first : null;
  }, [allSelected, selectedChoices]);

  const { data: variantProduct } = useProduct(
    selectedVariantProductId != null ? String(selectedVariantProductId) : "",
  );

  const buyableProduct = variantProduct ?? product;
  const activeProductId = selectedVariantProductId ?? product?.id ?? null;

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

  /**
   * A variant with no stock may still be sold: stock_allow_checkout === false is the
   * only thing that blocks it, and null means "inherit the store default" (allowed).
   */
  const choiceBlocked = (choice: ProductVariantChoice) => {
    const variant = choice.products[0];
    if (!variant || variant.in_stock !== false) return false;
    const allow = variant.stock_allow_checkout ?? product?.stock_allow_checkout ?? true;
    return allow === false;
  };
  const selectedInStock = selectedChoices.every(
    (choice) => choice.products[0]?.in_stock !== false,
  );
  const selectedBlocked = selectedChoices.some(choiceBlocked);
  const parentSoldOut = product.stock_total === 0 && product.stock_allow_checkout === false;
  const soldOut = variantTypes.length > 0 ? allSelected && selectedBlocked : parentSoldOut;

  // Fallback for installs where VQL returns no variant types.
  const attributes = variantTypes.length > 0 ? [] : (product.attributes ?? []);
  const canBuy =
    (variantTypes.length === 0 || selectedVariantProductId != null) && !soldOut && Boolean(activeProductId);

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
          <ProductPrice product={buyableProduct ?? product} size="lg" className="mt-5" />
          {(variantTypes.length === 0 || allSelected) && (
            <p
              className={cn(
                "mt-1 text-sm",
                variantTypes.length > 0
                  ? selectedInStock
                    ? "text-emerald-700"
                    : "text-destructive"
                  : soldOut
                    ? "text-destructive"
                    : "text-emerald-700",
              )}
            >
              {(variantTypes.length > 0 ? !selectedInStock : soldOut)
                ? t("store.outOfStock")
                : t("store.inStock")}
            </p>
          )}

          {variantTypes.map((type) => (
            <div key={type.id} className="mt-6">
              <h2 className="brand-eyebrow text-muted-foreground">{type.name}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {type.product_variant_choices.map((choice) => {
                  const blocked = choiceBlocked(choice);
                  const active = selection[type.id] === choice.id;
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      disabled={blocked}
                      onClick={() => setSelection((prev) => ({ ...prev, [type.id]: choice.id }))}
                      className={cn(
                        "rounded-md border px-3 py-1.5 text-sm transition-colors",
                        blocked
                          ? "cursor-not-allowed border-border bg-muted text-muted-foreground line-through opacity-60"
                          : active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-foreground hover:bg-accent",
                      )}
                    >
                      {choice.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {attributes.map((attribute) => (
            <div key={attribute.id} className="mt-6">
              <h2 className="brand-eyebrow text-muted-foreground">{attribute.name}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {attribute.values.map((value) => (
                  <button
                    key={value.id}
                    type="button"
                    className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent"
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
              disabled={!canBuy || add.isPending}
              onClick={() =>
                activeProductId != null && add.mutate({ productId: activeProductId, quantity })
              }
            >
              {soldOut ? t("store.outOfStock") : t("store.addToCart")}
            </button>
          </div>
          {variantTypes.length > 0 && selectedVariantProductId == null && !soldOut && (
            <p className="mt-2 text-xs text-muted-foreground">{t("store.selectVariant")}</p>
          )}

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
