import { cn } from "@/lib/utils";
import type { Product } from "@/types/vendre";

/**
 * Renders the product image when the store provides one, otherwise a branded
 * placeholder — the template never ships fake product photography.
 */
export function ProductImage({
  product,
  src,
  className,
}: {
  product: Pick<Product, "name" | "image">;
  src?: string | null;
  className?: string;
}) {
  const url = src ?? product.image;

  if (url) {
    return (
      <img
        src={url}
        alt={product.name}
        loading="lazy"
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={product.name}
      className={cn(
        "flex items-center justify-center bg-linear-to-br from-muted via-secondary to-muted",
        className,
      )}
    >
      <span className="brand-wordmark text-3xl text-muted-foreground/60">
        {product.name.slice(0, 2)}
      </span>
    </div>
  );
}
