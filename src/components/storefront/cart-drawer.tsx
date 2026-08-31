import { Loader2, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { closeCart, removeLine, setLineQuantity, startCheckout, useCart } from "@/lib/vendre/cart-store";
import { useOnboarding } from "@/lib/vendre/onboarding-context";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { cart, open, syncing, error } = useCart();
  const { isConfigured } = useOnboarding();

  return (
    <div className={cn("fixed inset-0 z-90", !open && "pointer-events-none")} aria-hidden={!open}>
      <div
        onClick={closeCart}
        className={cn(
          "absolute inset-0 bg-foreground/40 transition-opacity",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <aside
        aria-label="Varukorg"
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center gap-3 border-b border-border px-5 py-4">
          <ShoppingBag className="size-5 text-primary" aria-hidden />
          <h2 className="text-lg font-bold text-foreground">Varukorg</h2>
          <span className="brand-eyebrow rounded-md bg-primary/10 px-2 py-0.5 text-primary">
            {cart.item_count} st
          </span>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Stäng varukorgen"
            className="ml-auto rounded-md p-2 text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="grow overflow-y-auto px-5 py-4">
          {cart.items.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Varukorgen är tom. Lägg till något fint.
            </p>
          ) : (
            <ul className="space-y-4">
              {cart.items.map((line) => (
                <li key={line.id} className="flex gap-3 rounded-lg border border-border bg-card p-3">
                  {line.image && (
                    <img
                      src={line.image.url}
                      alt={line.image.alt}
                      loading="lazy"
                      className="size-20 shrink-0 rounded-md object-cover"
                    />
                  )}
                  <div className="min-w-0 grow">
                    <p className="truncate text-sm font-semibold text-foreground">{line.name}</p>
                    {line.options.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {line.options.map((option) => `${option.name}: ${option.value}`).join(" · ")}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center rounded-md border border-border">
                        <button
                          type="button"
                          aria-label="Minska antal"
                          className="p-1.5 text-muted-foreground hover:text-foreground"
                          onClick={() => setLineQuantity(line.id, line.quantity - 1)}
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-foreground">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Öka antal"
                          className="p-1.5 text-muted-foreground hover:text-foreground"
                          onClick={() => setLineQuantity(line.id, line.quantity + 1)}
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label="Ta bort rad"
                        onClick={() => removeLine(line.id)}
                        className="rounded-md p-1.5 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                      <span className="ml-auto text-sm font-bold text-foreground">
                        {line.row_total.formatted}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="space-y-3 border-t border-border bg-secondary px-5 py-4">
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <dt>Delsumma</dt>
              <dd>{cart.totals.sub_total.formatted}</dd>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <dt>Frakt</dt>
              <dd>{cart.totals.shipping.value === 0 ? "Fri frakt" : cart.totals.shipping.formatted}</dd>
            </div>
            <div className="flex justify-between text-base font-bold text-foreground">
              <dt>Att betala</dt>
              <dd>{cart.totals.grand_total.formatted}</dd>
            </div>
            <p className="text-xs text-muted-foreground">
              {cart.prices_include_vat
                ? `Varav moms ${cart.totals.vat.formatted}`
                : `Moms tillkommer: ${cart.totals.vat.formatted}`}
            </p>
          </dl>
          {error && <p className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">{error}</p>}
          <button
            type="button"
            disabled={cart.items.length === 0 || syncing}
            onClick={() => void startCheckout()}
            className="brand-button w-full justify-center"
          >
            {syncing && <Loader2 className="size-4 animate-spin" />}
            Till kassan
          </button>
          {!isConfigured && (
            <p className="text-center text-xs text-muted-foreground">
              Demoläge — kassan aktiveras när butiken är kopplad till Vendre.
            </p>
          )}
          <Link
            to="/"
            onClick={closeCart}
            className="block text-center text-xs font-medium text-primary underline underline-offset-4"
          >
            Fortsätt handla
          </Link>
        </footer>
      </aside>
    </div>
  );
}
