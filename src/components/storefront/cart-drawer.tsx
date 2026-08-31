import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  cartCount,
  cartTotal,
  goToCheckout,
  removeLine,
  setCartOpen,
  setQuantity,
  useCart,
} from "@/lib/store/cart-state";
import { formatPrice } from "@/lib/storefront/data";
import { useIsConfigured } from "@/lib/store/onboarding-state";

export function CartDrawer() {
  const { lines, isOpen } = useCart();
  const count = cartCount(lines);
  const total = cartTotal(lines);
  const isLive = useIsConfigured();

  return (
    <Sheet open={isOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Varukorg</SheetTitle>
          <SheetDescription>
            {count === 0 ? "Din varukorg är tom." : `${count} artiklar i varukorgen.`}
          </SheetDescription>
        </SheetHeader>

        <div className="grow space-y-4 overflow-y-auto py-4">
          {lines.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
              <ShoppingBag className="size-8" aria-hidden />
              <p className="text-sm">Lägg till en produkt för att komma igång.</p>
            </div>
          )}

          {lines.map((line) => (
            <div key={line.lineId} className="flex gap-3 rounded-lg border border-border p-3">
              <img
                src={line.image}
                alt={line.name}
                loading="lazy"
                width={1024}
                height={1024}
                className="size-16 shrink-0 rounded-md object-cover"
              />
              <div className="min-w-0 grow">
                <p className="truncate text-sm font-semibold text-foreground">{line.name}</p>
                {line.variantName && (
                  <p className="text-xs text-muted-foreground">{line.variantName}</p>
                )}
                <p className="mt-1 text-sm text-foreground">
                  {formatPrice(line.unitPrice * line.quantity, line.currency)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center rounded-md border border-border">
                    <button
                      type="button"
                      aria-label="Minska antal"
                      className="px-2 py-1 text-muted-foreground hover:text-foreground"
                      onClick={() => setQuantity(line.lineId, line.quantity - 1)}
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="min-w-8 text-center text-sm font-medium">{line.quantity}</span>
                    <button
                      type="button"
                      aria-label="Öka antal"
                      className="px-2 py-1 text-muted-foreground hover:text-foreground"
                      onClick={() => setQuantity(line.lineId, line.quantity + 1)}
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label="Ta bort"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeLine(line.lineId)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <SheetFooter className="border-t border-border pt-4">
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Totalt (inkl. moms)</span>
              <span className="text-lg font-bold text-foreground">{formatPrice(total)}</span>
            </div>
            <Button className="w-full" disabled={lines.length === 0}>
              Till kassan
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
