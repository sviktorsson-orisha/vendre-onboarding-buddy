import { AlertTriangle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { openSetupWizard } from "@/lib/store/onboarding-state";

export function StorefrontLoading({ label = "Hämtar data från din Vendre-butik…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" aria-hidden />
      {label}
    </div>
  );
}

export function StorefrontError({ error }: { error: Error }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-foreground"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
        <div>
          <h2 className="text-base font-bold text-foreground">Kunde inte hämta data från Vendre</h2>
          <p className="mt-1 text-muted-foreground">{error.message}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Vanliga orsaker: origin saknas i Surface CORS-allowlistan, ogiltiga API-nycklar, eller att
            butiken svarar med 401/429.
          </p>
          <Button className="mt-4" onClick={openSetupWizard}>
            Öppna uppstartsguiden
          </Button>
        </div>
      </div>
    </div>
  );
}
