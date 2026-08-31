import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, Search, ShoppingBag } from "lucide-react";

import { LanguagePicker } from "@/components/vendre/language-picker";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/store/cart";
import { useVendreApi } from "@/lib/vendre/api";
import type { MenuNode, StoreContext } from "@/types/vendre";

export function StoreHeader() {
  const { t } = useI18n();
  const api = useVendreApi();
  const { cart, setOpen } = useCart();
  const [menus, setMenus] = useState<MenuNode[]>([]);
  const [context, setContext] = useState<StoreContext | null>(null);

  useEffect(() => {
    let active = true;
    void api.getMenus().then((nodes) => active && setMenus(nodes)).catch(() => undefined);
    void api.getSessionContext().then((ctx) => active && setContext(ctx)).catch(() => undefined);
    return () => {
      active = false;
    };
  }, [api]);

  const categories = menus.filter((node) => node.type === "category");

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-5 py-4 sm:px-6">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="brand-wordmark text-2xl text-foreground">vendre</span>
          <span className="brand-eyebrow hidden text-primary sm:inline">
            {context?.storeName ?? ""}
          </span>
        </Link>

        <div className="ml-auto hidden grow items-center md:flex md:max-w-sm">
          <div className="relative w-full">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              placeholder={t("store.searchPlaceholder")}
              aria-label={t("store.searchPlaceholder")}
              className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-4">
          <LanguagePicker />
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t("cart.title")}
            className="brand-button-ghost relative"
          >
            <ShoppingBag className="size-4" aria-hidden />
            {cart.count > 0 && (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cart.count}
              </span>
            )}
          </button>
        </div>
      </div>

      <nav className="border-t border-border/60">
        <ul className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-1 px-5 sm:px-6">
          {categories.map((node) => (
            <li key={node.id} className="group relative">
              <Link
                to="/category/$id"
                params={{ id: String(node.id) }}
                className="flex items-center gap-1 px-3 py-2.5 text-sm font-medium text-foreground hover:text-primary"
              >
                {node.name}
                {node.children.length > 0 && <ChevronDown className="size-3.5" aria-hidden />}
              </Link>
              {node.children.length > 0 && (
                <div className="invisible absolute left-0 top-full z-40 min-w-56 rounded-md border border-border bg-card p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                  {node.children.map((child) => (
                    <div key={child.id}>
                      <Link
                        to="/category/$id"
                        params={{ id: String(child.id) }}
                        className="block rounded px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-muted"
                      >
                        {child.name}
                      </Link>
                      {child.children.map((leaf) => (
                        <Link
                          key={leaf.id}
                          to="/category/$id"
                          params={{ id: String(leaf.id) }}
                          className="block rounded px-6 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          {leaf.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
