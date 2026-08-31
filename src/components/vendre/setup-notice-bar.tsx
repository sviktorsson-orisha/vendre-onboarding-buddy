import { useEffect } from "react";
import { Rocket } from "lucide-react";

import { SetupWizard } from "@/components/vendre/setup-wizard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  setConfigured,
  setSetupWizardOpen,
  useIsConfigured,
  useSetupWizardOpen,
} from "@/lib/store/onboarding-state";

export function SetupNoticeBar() {
  const isConfigured = useIsConfigured();
  const open = useSetupWizardOpen();
  const setOpen = setSetupWizardOpen;

  // Permanent template invariant: every unconfigured import must open setup
  // immediately. Do not add a "shown once" flag here; closing is only valid
  // for the current page load until the Vendre connection is verified.
  useEffect(() => {
    if (isConfigured) return;
    setOpen(true);
  }, [isConfigured]);

  // A copied browser state must never bypass setup in a newly imported project
  // where the required server-side credentials are absent.
  useEffect(() => {
    let active = true;

    void fetch("/api/vendre/status", {
      headers: { accept: "application/json" },
      cache: "no-store",
    })
      .then((response) => response.json() as Promise<{ ok: boolean }>)
      .then((status) => {
        if (!active || status.ok) return;
        setConfigured(false);
        setOpen(true);
      })
      .catch(() => {
        if (active && !isConfigured) setOpen(true);
      });

    return () => {
      active = false;
    };
  }, [isConfigured]);

  if (isConfigured) return open ? null : null;

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
