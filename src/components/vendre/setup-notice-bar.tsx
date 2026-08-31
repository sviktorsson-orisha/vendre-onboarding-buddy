import { useEffect, useState } from "react";
import { Rocket } from "lucide-react";

import { SetupWizard } from "@/components/vendre/setup-wizard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIsConfigured } from "@/lib/store/onboarding-state";

const AUTO_OPEN_KEY = "vendre.setup-autoopened";

export function SetupNoticeBar() {
  const isConfigured = useIsConfigured();
  const [open, setOpen] = useState(false);

  // Ett nyimporterat projekt ska mötas av uppstartsguiden direkt, en gång.
  useEffect(() => {
    if (isConfigured) return;
    if (window.localStorage.getItem(AUTO_OPEN_KEY) === "true") return;
    window.localStorage.setItem(AUTO_OPEN_KEY, "true");
    setOpen(true);
  }, [isConfigured]);

  if (isConfigured) return null;

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-accent-foreground/15 bg-accent text-accent-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-5 py-2.5 sm:px-6">
          <span className="brand-eyebrow rounded-md bg-accent-foreground/10 px-2.5 py-1">
            Demo Mode (Dummy Data)
          </span>
          <p className="text-sm">
            Du kör just nu med dummy-data. Koppla ditt Vendre-konto för att aktivera din butik.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="ml-auto inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Rocket className="size-4" aria-hidden />
            Starta Uppstartsguide
          </button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Uppstartsguide</DialogTitle>
          </DialogHeader>
          <SetupWizard onFinish={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
