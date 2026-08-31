import { Link } from "@tanstack/react-router";

import { addToCart } from "@/lib/vendre/cart-store";
import type { VendreProduct } from "@/types/vendre";

export function ProductCard({ product }: { product: VendreProduct }) {
  const image = product.images[0];
  const onSale = Boolean(product.price.compare_at_value);

  return (
    <article className="group brand-card flex flex-col overflow-hidden p-0">
      <Link
        to="/produkt/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        {image && (
          <img
            src={image.url}
            alt={image.alt}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {onSale && (
          <span className="absolute left-3 top-3 rounded-md bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
            Kampanj
          </span>
        )}
        {!product.in_stock && (
          <span className="absolute right-3 top-3 rounded-md bg-foreground/80 px-2 py-1 text-xs font-bold text-background">
            Slut i lager
          </span>
        )}
      </Link>
      <div className="flex grow flex-col p-4">
        {product.brand && <p className="brand-eyebrow text-muted-foreground">{product.brand}</p>}
        <h3 className="mt-1 text-sm font-bold text-foreground">
          <Link to="/produkt/$slug" params={{ slug: product.slug }}>
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{product.short_description}</p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-base font-bold text-foreground">{product.price.formatted}</span>
          {onSale && (
            <span className="text-xs text-muted-foreground line-through">
              {product.price.compare_at_formatted}
            </span>
          )}
        </div>
        <button
          type="button"
          disabled={!product.in_stock}
          onClick={() => addToCart(product, product.variants[0] ?? null, 1)}
          className="brand-button mt-4 w-full justify-center py-2 text-sm"
        >
          Lägg i varukorg
        </button>
      </div>
    </article>
  );
}
