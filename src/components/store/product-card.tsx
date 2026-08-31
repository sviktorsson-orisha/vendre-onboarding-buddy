import { Link } from "@tanstack/react-router";

import { imageUrl } from "@/lib/vendre/api";
import type { VendreProduct } from "@/types/vendre";

export function ProductCard({ product }: { product: VendreProduct }) {
  const src = imageUrl(product.image);
  const onSale =
    product.price_original_raw !== null && product.price_original_raw > product.price_raw;

  return (
    <Link
      to="/produkt/$productId"
      params={{ productId: product.id }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {src ? (
          <img
            src={src}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        {onSale && (
          <span className="absolute left-3 top-3 rounded-md bg-destructive px-2 py-1 text-xs font-bold text-destructive-foreground">
            Rea
          </span>
        )}
        {!product.stock_allow_checkout && (
          <span className="absolute right-3 top-3 rounded-md bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
            Slut i lager
          </span>
        )}
      </div>
      <div className="flex grow flex-col gap-1 p-4">
        <h3 className="text-sm font-semibold text-foreground">{product.name}</h3>
        <p className="text-xs text-muted-foreground">{product.model}</p>
        <p className="mt-auto pt-2 text-sm font-bold text-foreground">
          {product.price}
          {onSale && (
            <span className="ml-2 text-xs font-medium text-muted-foreground line-through">
              {product.price_original}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
