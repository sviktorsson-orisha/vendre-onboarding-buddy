import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu, Search, ShoppingBag } from "lucide-react";

import { AccountMenu } from "@/components/store/account-menu";
import { CartSheet } from "@/components/store/cart-sheet";
import { SearchBox } from "@/components/store/search-box";
import { LanguagePicker } from "@/components/vendre/language-picker";
import { useI18n } from "@/lib/i18n";
import { useCart, useMenuTree } from "@/lib/vendre/api";
import { cn } from "@/lib/utils";
import type { MenuNode } from "@/types/vendre";

function DesktopMenuItem({ node }: { node: MenuNode }) {
  const hasChildren = node.children.length > 0;
  return (
    <li className="group relative">
      <Link
        to="/kategori/$id"
        params={{ id: String(node.id) }}
        className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
      >
        {node.name}
        {hasChildren && <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />}
      </Link>
      {hasChildren && (
        <div className="invisible absolute left-0 top-full z-40 min-w-56 rounded-xl border border-border bg-card p-3 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
          <ul className="space-y-1">
            {node.children.map((child) => (
              <li key={child.id} className="group/sub relative">
                <Link
                  to="/kategori/$id"
                  params={{ id: String(child.id) }}
                  className="flex items-center justify-between rounded-md px-3 py-1.5 text-sm text-foreground hover:bg-accent"
                >
                  {child.name}
                  {child.children.length > 0 && <ChevronDown className="size-3 -rotate-90" aria-hidden />}
                </Link>
                {child.children.length > 0 && (
                  <div className="invisible absolute left-full top-0 z-50 min-w-52 rounded-xl border border-border bg-card p-3 opacity-0 shadow-xl transition-all group-hover/sub:visible group-hover/sub:opacity-100">
                    <ul className="space-y-1">
                      {child.children.map((leaf) => (
                        <li key={leaf.id}>
                          <Link
                            to="/kategori/$id"
                            params={{ id: String(leaf.id) }}
                            className="block rounded-md px-3 py-1.5 text-sm text-foreground hover:bg-accent"
                          >
                            {leaf.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

export function StoreHeader() {
  const { t } = useI18n();
  const tree = useMenuTree();
  const { data: cart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const count = cart?.cart_count ?? 0;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-5 py-3 sm:px-6">
        <button
          type="button"
          className="brand-button-ghost lg:hidden"
          aria-label="Menu"
          onClick={() => setMobileOpen((value) => !value)}
        >
          <Menu className="size-4" />
        </button>

        <Link to="/" className="brand-wordmark text-2xl text-foreground">
          vendre
        </Link>

        <SearchBox className="ml-2 hidden grow md:block" />

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="brand-button-ghost md:hidden"
            aria-label={t("store.search")}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((value) => !value)}
          >
            <Search className="size-4" />
          </button>
          <LanguagePicker />
          <AccountMenu />
          <button
            type="button"
            className="brand-button-ghost relative"
            onClick={() => setCartOpen(true)}
            aria-label={t("store.cart")}
          >
            <ShoppingBag className="size-4" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex size-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="mx-auto w-full max-w-6xl px-5 pb-3 sm:px-6 md:hidden">
          <SearchBox autoFocus />
        </div>
      )}

      <nav className="hidden border-t border-border lg:block">
        <ul className="mx-auto flex w-full max-w-6xl items-center gap-1 px-5 sm:px-6">
          {tree.map((node) => (
            <DesktopMenuItem key={node.id} node={node} />
          ))}
        </ul>
      </nav>

      <nav className={cn("border-t border-border lg:hidden", mobileOpen ? "block" : "hidden")}>
        <ul className="mx-auto w-full max-w-6xl space-y-1 px-5 py-3 sm:px-6">
          {tree.map((node) => (
            <li key={node.id}>
              <Link
                to="/kategori/$id"
                params={{ id: String(node.id) }}
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-2 py-1.5 text-sm font-semibold text-foreground hover:bg-accent"
              >
                {node.name}
              </Link>
              {node.children.length > 0 && (
                <ul className="ml-3 border-l border-border pl-3">
                  {node.children.map((child) => (
                    <li key={child.id}>
                      <Link
                        to="/kategori/$id"
                        params={{ id: String(child.id) }}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}
