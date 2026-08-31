import type { ReactNode } from "react";

import { CartDrawer } from "@/components/storefront/cart-drawer";
import { StoreFooter } from "@/components/storefront/store-footer";
import { StoreHeader } from "@/components/storefront/store-header";
import { SetupNoticeBar } from "@/components/vendre/setup-notice-bar";

export function StoreShell({ children }: { children: ReactNode }) {
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
