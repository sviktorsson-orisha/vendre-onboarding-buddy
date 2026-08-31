import { X } from "lucide-react";

import { SetupWizard } from "@/components/vendre/setup-wizard";
import { closeSetupWizard, setConfigured, useOnboarding } from "@/lib/vendre/onboarding-context";

/** Uppstartsguiden (.vendre/skills/setup.md) som overlay ovanpå butiken. */
export function SetupWizardModal() {
  const { wizardOpen } = useOnboarding();
  if (!wizardOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm sm:p-8">
      <div className="brand-card relative h-fit w-full max-w-3xl bg-background p-5 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="brand-eyebrow text-primary">Uppstartsguide</p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">Koppla butiken till Vendre</h2>
          </div>
          <button
            type="button"
            onClick={closeSetupWizard}
            aria-label="Stäng guiden"
            className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-6">
          <SetupWizard onVerified={() => setConfigured(true)} />
        </div>
      </div>
    </div>
  );
}
