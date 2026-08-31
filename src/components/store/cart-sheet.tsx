import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { ProductImage } from "@/components/store/product-image";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/store/cart";
import { useVendreApi } from "@/lib/vendre/api";

export function CartSheet() {
  const { t } = useI18n();
  const api = useVendreApi();
  const { cart, open, busy, setOpen, setQuantity, remove } = useCart();

  const checkout = async () => {
    // Checkout is a real browser navigation so the store session cookie follows.
    const url = await api.checkoutUrl();
    if (url) window.location.href = url;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="size-4" aria-hidden /> {t("cart.title")}
          </SheetTitle>
        </SheetHeader>

        <div className="grow overflow-y-auto px-5 py-4">
          {cart.lines.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">{t("cart.empty")}</p>
          ) : (
            <ul className="space-y-4">
              {cart.lines.map((line) => (
                <li key={line.lineId} className="flex gap-3">
                  <ProductImage
                    product={{ name: line.name, image: line.image }}
                    className="size-20 shrink-0 rounded-md"
                  />
                  <div className="grow">
                    <p className="text-sm font-semibold text-foreground">{line.name}</p>
                    <p className="text-sm text-muted-foreground">{line.price}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={t("cart.decrease")}
                        className="brand-button-ghost size-7 justify-center p-0"
                        onClick={() => void setQuantity(line, line.quantity - 1)}
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{line.quantity}</span>
                      <button
                        type="button"
                        aria-label={t("cart.increase")}
                        className="brand-button-ghost size-7 justify-center p-0"
                        onClick={() => void setQuantity(line, line.quantity + 1)}
                      >
                        <Plus className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={t("cart.remove")}
                        className="brand-button-ghost ml-auto size-7 justify-center p-0 text-destructive"
                        onClick={() => void remove(line)}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{line.total}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border px-5 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {cart.pricesIncludeVat ? t("cart.totalInclVat") : t("cart.totalExclVat")}
            </span>
            <span className="font-display text-lg font-bold text-foreground">
              {cart.total || "—"}
            </span>
          </div>
          <button
            type="button"
            className="brand-button mt-4 w-full justify-center"
            disabled={cart.lines.length === 0 || busy || api.demo}
            onClick={() => void checkout()}
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {t("cart.checkout")}
          </button>
          {api.demo && <p className="mt-2 text-xs text-muted-foreground">{t("cart.demoNotice")}</p>}
        </div>
      </SheetContent>
    </Sheet>
  );
}
