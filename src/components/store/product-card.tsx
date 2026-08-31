import { Link } from "@tanstack/react-router";

import { ProductImage } from "@/components/store/product-image";
import { useI18n } from "@/lib/i18n";
import type { Product } from "@/types/vendre";

export function ProductCard({ product }: { product: Product }) {
  const { t } = useI18n();

  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className="brand-card group flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
    >
      <ProductImage product={product} className="aspect-4/5 w-full" />
      <div className="flex grow flex-col gap-1 p-4">
        {product.manufacturer && (
          <span className="brand-eyebrow text-muted-foreground">{product.manufacturer}</span>
        )}
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary">
          {product.name}
        </h3>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="font-display text-base font-bold text-foreground">{product.price}</span>
          {product.priceOriginal && (
            <span className="text-xs text-muted-foreground line-through">{product.priceOriginal}</span>
          )}
        </div>
        {!product.inStock && (
          <span className="text-xs font-medium text-destructive">{t("store.outOfStock")}</span>
        )}
      </div>
    </Link>
  );
}
