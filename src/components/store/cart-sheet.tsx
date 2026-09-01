import { Link } from "@tanstack/react-router";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";

import { ProductPrice } from "@/components/store/product-price";
import { StoreImage } from "@/components/store/store-image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useOnboarding } from "@/context/onboarding-context";
import { useI18n } from "@/lib/i18n";
import { useCart, useCartMutations, useVendreApi } from "@/lib/vendre/api";


export function CartSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useI18n();
  const api = useVendreApi();
  const { isConfigured } = useOnboarding();
  const { data: cart, isLoading } = useCart();
  const { update, remove } = useCartMutations();
  const lines = cart?.products ?? [];
  // The total always comes from the store — never summed in the frontend.
  const cartTotal =
    cart?.cart_total_formatted ??
    (cart?.cart_total != null ? `${cart.cart_total} kr` : "—");


  const goToCheckout = async () => {
    // Checkout is a real browser navigation so the store session cookie follows.
    const url = await api.checkoutUrl();
    if (url) window.location.href = url;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("store.cart")}</SheetTitle>
        </SheetHeader>

        <div className="grow overflow-y-auto py-4">
          {isLoading ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> {t("store.loading")}
            </p>
          ) : lines.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("store.cartEmpty")}</p>
          ) : (
            <ul className="space-y-4">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-3">
                  <Link
                    to="/produkt/$id"
                    params={{ id: String(line.productId) }}
                    onClick={() => onOpenChange(false)}
                    className="shrink-0"
                  >
                    <StoreImage
                      image={line.product_data?.image ?? null}
                      alt={line.product_data?.name ?? `#${line.productId}`}
                      label={line.product_data?.name ?? "P"}
                      className="size-16 shrink-0 rounded-md"
                    />
                  </Link>
                  <div className="grow">
                    <Link
                      to="/produkt/$id"
                      params={{ id: String(line.productId) }}
                      onClick={() => onOpenChange(false)}
                      className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                    >
                      {line.product_data?.name ?? `#${line.productId}`}
                    </Link>
                    {line.product_data && <ProductPrice product={line.product_data} size="sm" />}

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="-"
                        className="brand-button-ghost size-7 justify-center p-0"
                        onClick={() => update.mutate({ line, quantity: line.quantity - 1 })}
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium text-foreground">{line.quantity}</span>
                      <button
                        type="button"
                        aria-label="+"
                        className="brand-button-ghost size-7 justify-center p-0"
                        onClick={() => update.mutate({ line, quantity: line.quantity + 1 })}
                      >
                        <Plus className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        className="brand-button-ghost ml-auto"
                        onClick={() => remove.mutate({ line })}
                      >
                        <Trash2 className="size-3.5" /> {t("store.remove")}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("store.total")}</span>
            <span className="text-lg font-bold text-foreground">{cartTotal}</span>
          </div>
          <button
            type="button"
            className="brand-button mt-4 w-full justify-center"
            disabled={!isConfigured || lines.length === 0}
            onClick={() => void goToCheckout()}
          >
            {t("store.checkout")}
          </button>
          {!isConfigured && <p className="mt-2 text-xs text-muted-foreground">{t("store.checkoutDemo")}</p>}
        </div>
      </SheetContent>
    </Sheet>
  );
}
