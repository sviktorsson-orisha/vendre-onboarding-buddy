import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag } from "lucide-react";

import { cartCount, openCart, useCart } from "@/lib/store/cart-state";
import { useNavigation, useStoreInfo } from "@/lib/storefront/use-storefront";

export function StoreHeader() {
  const store = useStoreInfo();
  const categories = useNavigation().data ?? [];
  const { lines } = useCart();
  const count = cartCount(lines);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-5 py-4 sm:px-6">
        <Link to="/" className="brand-wordmark shrink-0 text-xl text-foreground">
          {store.name}
        </Link>

        <nav aria-label="Kategorier" className="hidden lg:flex">
          <ul className="flex items-center gap-1">
            {categories.map((category) => (
              <li key={category.id} className="group relative">
                <Link
                  to="/kategori/$slug"
                  params={{ slug: category.slug }}
                  className="inline-flex rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  activeProps={{ className: "bg-muted" }}
                >
                  {category.name}
                </Link>
                {category.children.length > 0 && (
                  <div className="invisible absolute left-0 top-full z-40 w-56 pt-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <ul className="rounded-lg border border-border bg-popover p-2 shadow-lg">
                      {category.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            to="/kategori/$slug"
                            params={{ slug: category.slug }}
                            hash={child.slug}
                            className="block rounded-md px-3 py-2 text-sm text-popover-foreground hover:bg-muted"
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Sök produkter"
              aria-label="Sök produkter"
              className="h-9 w-44 rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring lg:w-56"
            />
          </div>

          <button
            type="button"
            onClick={openCart}
            aria-label={`Varukorg, ${count} artiklar`}
            className="relative inline-flex size-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-muted"
          >
            <ShoppingBag className="size-4" aria-hidden />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold leading-5 text-primary-foreground">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      <nav aria-label="Kategorier mobil" className="border-t border-border lg:hidden">
        <ul className="mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto px-5 py-2 sm:px-6">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                to="/kategori/$slug"
                params={{ slug: category.slug }}
                className="inline-flex whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-foreground hover:bg-muted"
                activeProps={{ className: "bg-muted" }}
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
