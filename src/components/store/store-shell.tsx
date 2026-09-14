import type { ReactNode } from "react";

import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";
import { SetupNoticeBar } from "@/components/vendre/setup-notice-bar";

/** Chrome for every storefront page: notice bar, header, content, footer. */
export function StoreShell({ children }: { children: ReactNode }) {
  return (
    <div className="brand-canvas flex min-h-screen flex-col">
      <SetupNoticeBar />
      <StoreHeader />
      <main className="grow">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 sm:py-12">{children}</div>
      </main>
      <StoreFooter />
    </div>
  );
}
