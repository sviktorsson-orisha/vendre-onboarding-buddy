import { useState } from "react";
import { Rocket, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SetupWizard } from "@/components/vendre/setup-wizard";
import { useOnboarding } from "@/context/onboarding-context";

/**
 * Demo-mode banner. Visible on every page until the connection test in
 * .vendre/skills/setup.md returns ok.
 */
export function SetupNoticeBar() {
  const { isConfigured, markConfigured } = useOnboarding();
  const [open, setOpen] = useState(false);

  if (isConfigured) return null;

  return (
    <>
      <div className="relative z-50 border-b border-amber-500/40 bg-amber-100 text-amber-950 dark:bg-amber-950/60 dark:text-amber-100">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 py-2.5 sm:px-6">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-950">
            <Sparkles className="size-3.5" aria-hidden />
            Demo Mode (Dummy Data)
          </span>
          <p className="text-sm">
            Du kör just nu med dummy-data. Koppla ditt Vendre-konto för att aktivera din live-butik.
          </p>
          <Button size="sm" className="ml-auto" onClick={() => setOpen(true)}>
            <Rocket className="size-4" aria-hidden />
            Starta Uppstartsguide
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Uppstartsguide</DialogTitle>
          </DialogHeader>
          <SetupWizard
            onComplete={() => {
              markConfigured(true);
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
