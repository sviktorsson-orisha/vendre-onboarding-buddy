import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Menu, Search, ShoppingBag } from "lucide-react";

import { AccountMenu } from "@/components/store/account-menu";
import { CartSheet } from "@/components/store/cart-sheet";
import { SearchBox } from "@/components/store/search-box";
import { LanguagePicker } from "@/components/vendre/language-picker";
import { useI18n } from "@/lib/i18n";
import { useCart, useCategoryMenu } from "@/lib/vendre/api";
import { cn } from "@/lib/utils";
import type { MenuNode } from "@/types/vendre";

/** Full-viewport-width mega menu panel for one top-level category. */
function MegaPanel({ node, onNavigate }: { node: MenuNode; onNavigate: () => void }) {
  const { t } = useI18n();
  const columns = node.children;
  const columnCount = Math.min(Math.max(columns.length, 1), 5);

  return (
    <div
      className="absolute inset-x-0 top-full z-40 max-h-[70vh] overflow-y-auto border-b border-border bg-card shadow-xl"
      onClick={onNavigate}
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6">
        <div
          className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3"
          style={{ ["--mega-cols" as string]: String(columnCount) }}
        >
          {columns.map((child) => (
            <div key={`${child.source}:${child.id}`} className="min-w-0">
              <Link
                to="/kategori/$id"
                params={{ id: String(child.id) }}
                className="block truncate text-sm font-bold text-foreground hover:text-primary"
              >
                {child.name}
              </Link>
              {child.children.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {child.children.map((leaf) => (
                    <li key={`${leaf.source}:${leaf.id}`}>
                      <Link
                        to="/kategori/$id"
                        params={{ id: String(leaf.id) }}
                        className="block truncate rounded-md py-1 text-sm text-muted-foreground hover:text-primary"
                      >
                        {leaf.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-border pt-4">
          <Link
            to="/kategori/$id"
            params={{ id: String(node.id) }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            {t("store.viewAllIn", { name: node.name })}
            <ArrowRight className="size-4 shrink-0" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function StoreHeader() {
  const { t } = useI18n();
  const tree = useCategoryMenu();
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
