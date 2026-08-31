import { Sparkles } from "lucide-react";

import { openSetupWizard, useOnboarding } from "@/lib/vendre/onboarding-context";

/** Visas överst på alla sidor så länge butiken kör på dummy-data. */
export function DemoBanner() {
  const { isConfigured } = useOnboarding();
  if (isConfigured) return null;

  return (
    <div className="relative z-50 bg-accent text-accent-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-2.5 sm:px-6">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-foreground/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wide">
          <Sparkles className="size-3.5" aria-hidden />
          Demo Mode (Dummy Data)
        </span>
        <p className="text-sm font-medium">
          Du kör just nu med dummy-data. Koppla ditt Vendre-konto för att aktivera din live-butik.
        </p>
        <button type="button" onClick={openSetupWizard} className="brand-button ml-auto py-1.5 text-sm">
          Starta uppstartsguide
        </button>
      </div>
    </div>
  );
}
