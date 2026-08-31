import { useState } from "react";
import { Sparkles } from "lucide-react";

import { SetupWizard } from "@/components/vendre/setup-wizard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useOnboarding } from "@/context/onboarding-context";
import { useI18n } from "@/lib/i18n";

/** Top banner shown while the storefront runs on demo data. */
export function SetupNoticeBar() {
  const { t } = useI18n();
  const { isConfigured } = useOnboarding();
  const [open, setOpen] = useState(false);

  if (isConfigured) return null;

  return (
    <>
      <div className="border-b border-border bg-linear-to-r from-primary/10 via-brand-pink/10 to-brand-blue/10">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-5 py-3 sm:px-6">
          <span className="brand-eyebrow inline-flex items-center gap-1.5 rounded-md bg-primary/15 px-2.5 py-1 text-primary">
            <Sparkles className="size-3.5" aria-hidden /> {t("notice.badge")}
          </span>
          <p className="text-sm text-foreground">{t("notice.text")}</p>
          <button type="button" className="brand-button ml-auto" onClick={() => setOpen(true)}>
            {t("notice.action")}
          </button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{t("notice.dialogTitle")}</DialogTitle>
          </DialogHeader>
          <SetupWizard onComplete={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
