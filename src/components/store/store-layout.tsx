import type { ReactNode } from "react";

import { CartSheet } from "@/components/store/cart-sheet";
import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";
import { SetupNoticeBar } from "@/components/vendre/setup-notice-bar";

export function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SetupNoticeBar />
      <StoreHeader />
      <main className="grow">{children}</main>
      <StoreFooter />
      <CartSheet />
    </div>
  );
}
