import { useEffect, type ReactNode } from "react";

import { CartDrawer } from "@/components/storefront/cart-drawer";
import { StoreFooter } from "@/components/storefront/store-footer";
import { StoreHeader } from "@/components/storefront/store-header";
import { SetupNoticeBar } from "@/components/vendre/setup-notice-bar";
import { refreshCart } from "@/lib/store/cart-state";
import { useIsConfigured } from "@/lib/store/onboarding-state";

export function StoreShell({ children }: { children: ReactNode }) {
  const isConfigured = useIsConfigured();

  // Live Mode owns the cart server-side; load it once the connection is live.
  useEffect(() => {
    if (!isConfigured) return;
    void refreshCart();
  }, [isConfigured]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SetupNoticeBar />
      <StoreHeader />
      <main className="grow">{children}</main>
      <StoreFooter />
      <CartDrawer />
    </div>
  );
}
