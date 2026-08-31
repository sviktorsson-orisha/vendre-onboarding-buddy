import { useEffect, type ReactNode } from "react";

import { CartDrawer } from "@/components/storefront/cart-drawer";
import { StorefrontFooter } from "@/components/storefront/footer";
import { StorefrontHeader } from "@/components/storefront/header";
import { DemoBanner } from "@/components/vendre/demo-banner";
import { SetupWizardModal } from "@/components/vendre/setup-wizard-modal";
import { refreshCart, setCartLiveMode } from "@/lib/vendre/cart-store";
import { refreshConfiguredStatus, useOnboarding } from "@/lib/vendre/onboarding-context";

export function StorefrontLayout({ children }: { children: ReactNode }) {
  const { isConfigured, checked } = useOnboarding();

  useEffect(() => {
    if (!checked) void refreshConfiguredStatus();
  }, [checked]);

  // Kundvagnen växlar från lokal demodata till riktig synk först när butiken
  // verkligen är kopplad.
  useEffect(() => {
    setCartLiveMode(isConfigured);
    if (isConfigured) void refreshCart();
  }, [isConfigured]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DemoBanner />
      <StorefrontHeader />
      <main className="grow">{children}</main>
      <StorefrontFooter />
      <CartDrawer />
      <SetupWizardModal />
    </div>
  );
}
