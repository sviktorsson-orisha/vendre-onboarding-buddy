import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { imageUrl, setCartDrawerOpen, useCartStore, useVendreApi } from "@/lib/vendre/api";
import type { VendreSessionContext } from "@/types/vendre";

export function CartDrawer({ session }: { session: VendreSessionContext | null }) {
  const api = useVendreApi();
  const { cart, drawerOpen } = useCartStore();
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  const vatLabel = session?.prices_include_vat ? "Priser inkl. moms" : "Priser exkl. moms";

  return (
    <Sheet open={drawerOpen} onOpenChange={setCartDrawerOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="size-5" aria-hidden />
            Varukorg ({cart.cart_count})
          </SheetTitle>
        </SheetHeader>

        <div className="grow overflow-y-auto px-5 py-4">
          {cart.products.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Din varukorg är tom.</p>
          ) : (
            <ul className="space-y-4">
              {cart.products.map((line) => {
                const src = imageUrl(line.image);
                return (
                  <li key={line.id} className="flex gap-3 rounded-lg border border-border bg-card p-3">
                    <div className="size-20 shrink-0 overflow-hidden rounded-md bg-muted">
                      {src ? <img src={src} alt={line.name} className="size-full object-cover" /> : null}
                    </div>
                    <div className="min-w-0 grow">
                      <p className="truncate text-sm font-semibold text-foreground">{line.name}</p>
                      <p className="text-xs text-muted-foreground">{line.model}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center rounded-md border border-border">
                          <button
                            type="button"
                            aria-label="Minska antal"
                            className="px-2 py-1 text-muted-foreground hover:text-foreground"
                            onClick={() => void run(() => api.setQuantity(line, line.quantity - 1))}
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="min-w-8 text-center text-sm font-medium">{line.quantity}</span>
                          <button
                            type="button"
                            aria-label="Öka antal"
                            className="px-2 py-1 text-muted-foreground hover:text-foreground"
                            onClick={() => void run(() => api.setQuantity(line, line.quantity + 1))}
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <span className="ml-auto text-sm font-bold text-foreground">
                          {line.total_final_price}
                        </span>
                        <button
                          type="button"
                          aria-label="Ta bort"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => void run(() => api.removeLine(line))}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-border bg-card px-5 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{vatLabel}</span>
            <span>{session?.currency.code ?? "SEK"}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-base font-bold text-foreground">
            <span>Summa</span>
            <span>{cart.cart_total}</span>
          </div>
          <Button
            className="mt-4 w-full"
            disabled={cart.products.length === 0 || busy}
            onClick={() => {
              if (!api.isConfigured) return;
              // Checkout is a real browser navigation so the session cookie follows.
              window.location.href = "/checkout";
            }}
          >
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Till kassan
          </Button>
          {!api.isConfigured && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Kassan aktiveras när butiken är kopplad till Vendre.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
