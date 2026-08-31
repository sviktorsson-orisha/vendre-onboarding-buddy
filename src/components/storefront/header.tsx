import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu, Search, ShoppingBag, User, X } from "lucide-react";

import { LanguagePicker } from "@/components/vendre/language-picker";
import { openCart, useCart } from "@/lib/vendre/cart-store";
import { useNavigation, useSessionContext } from "@/lib/vendre/use-vendre-api";
import { cn } from "@/lib/utils";
import type { VendreMenuItem } from "@/types/vendre";

function slugFromUrl(url: string) {
  return url.split("/").filter(Boolean).pop() ?? "";
}

function TopLevelItem({ item }: { item: VendreMenuItem }) {
  const hasChildren = Boolean(item.children?.length);
  return (
    <li className="group relative">
      <Link
        to="/kategori/$slug"
        params={{ slug: slugFromUrl(item.url) }}
        className="flex items-center gap-1 px-3 py-3 text-sm font-semibold text-foreground transition-colors hover:text-primary"
        activeProps={{ className: "text-primary" }}
      >
        {item.title}
        {hasChildren && <ChevronDown className="size-3.5" aria-hidden />}
      </Link>
      {hasChildren && (
        <div className="invisible absolute left-0 top-full z-40 min-w-56 rounded-lg border border-border bg-card p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
          <ul>
            {item.children!.map((child) => (
              <li key={child.id}>
                <Link
                  to="/kategori/$slug"
                  params={{ slug: slugFromUrl(child.url) }}
                  className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {child.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

export function StorefrontHeader() {
  const { data: menus } = useNavigation();
  const { data: session } = useSessionContext();
  const { cart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = menus?.menus.header ?? [];
  const storeName = session?.STORE_NAME ?? "Vendre";

  return (
    <header className="sticky top-0 z-60 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-5 py-3 sm:px-6">
        <button
          type="button"
          aria-label="Öppna menyn"
          className="rounded-md p-2 text-muted-foreground lg:hidden"
          onClick={() => setMobileOpen((value) => !value)}
        >
          {mobileOpen ? <Menu className="size-5" /> : <Menu className="size-5" />}
        </button>

        <Link to="/" className="flex items-center gap-2">
          {session?.SHOP_LOGO ? (
            <img src={session.SHOP_LOGO} alt={storeName} className="h-7 w-auto" />
          ) : (
            <span className="brand-wordmark text-2xl text-foreground">{storeName}</span>
          )}
        </Link>

        <div className="ml-4 hidden grow items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 md:flex">
          <Search className="size-4 text-muted-foreground" aria-hidden />
          <input
            type="search"
            placeholder="Sök produkter…"
            aria-label="Sök produkter"
            className="w-full bg-transparent text-sm text-foreground outline-hidden placeholder:text-muted-foreground"
          />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <LanguagePicker />
          <button
            type="button"
            aria-label="Mitt konto"
            className="rounded-md p-2 text-muted-foreground hover:text-foreground"
          >
            <User className="size-5" />
          </button>
          <button
            type="button"
            onClick={openCart}
            aria-label="Öppna varukorgen"
            className="relative rounded-md p-2 text-muted-foreground hover:text-foreground"
          >
            <ShoppingBag className="size-5" />
            {cart.item_count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                {cart.item_count}
              </span>
            )}
          </button>
        </div>
      </div>

      <nav aria-label="Kategorier" className="hidden border-t border-border lg:block">
        <ul className="mx-auto flex w-full max-w-7xl items-center px-4 sm:px-5">
          {items.map((item) => (
            <TopLevelItem key={item.id} item={item} />
          ))}
        </ul>
      </nav>

      <nav
        aria-label="Mobilmeny"
        className={cn("border-t border-border lg:hidden", mobileOpen ? "block" : "hidden")}
      >
        <ul className="mx-auto w-full max-w-7xl px-5 py-3">
          {items.map((item) => (
            <li key={item.id} className="border-b border-border/60 py-1 last:border-0">
              <Link
                to="/kategori/$slug"
                params={{ slug: slugFromUrl(item.url) }}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm font-semibold text-foreground"
              >
                {item.title}
              </Link>
              {item.children && (
                <ul className="pb-2 pl-3">
                  {item.children.map((child) => (
                    <li key={child.id}>
                      <Link
                        to="/kategori/$slug"
                        params={{ slug: slugFromUrl(child.url) }}
                        onClick={() => setMobileOpen(false)}
                        className="block py-1.5 text-sm text-muted-foreground"
                      >
                        {child.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <button type="button" className="sr-only" aria-hidden onClick={() => setMobileOpen(false)}>
        <X />
      </button>
    </header>
  );
}
