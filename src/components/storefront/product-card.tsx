import { Link } from "@tanstack/react-router";

import { formatPrice, type DemoProduct } from "@/lib/storefront/data";

export function ProductCard({ product }: { product: DemoProduct }) {
  return (
    <Link
      to="/produkt/$slug"
      params={{ slug: product.slug }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1024}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex grow flex-col gap-1 p-4">
        <h3 className="text-sm font-semibold text-foreground">{product.name}</h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="text-base font-bold text-foreground">
            {formatPrice(product.priceIncVat, product.currency)}
          </span>
          {product.comparePriceIncVat && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.comparePriceIncVat, product.currency)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: DemoProduct[] }) {
  if (products.length === 0) {
    return <p className="text-sm text-muted-foreground">Inga produkter i den här kategorin.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
