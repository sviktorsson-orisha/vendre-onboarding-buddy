import { useEffect, useRef, useState } from "react";
import { Rocket, Settings2 } from "lucide-react";

import { SetupWizardDialog } from "@/components/vendre/setup-wizard";
import { useOnboarding } from "@/context/onboarding-context";
import { useI18n } from "@/lib/i18n";

/** Top banner: demo-mode warning + entry point to the setup guide modal. */
export function SetupNoticeBar() {
  const { t } = useI18n();
  const { isConfigured, guideDismissed } = useOnboarding();
  const [open, setOpen] = useState(false);

  // The guide is the first thing to do in a fresh project: open it on load
  // until the store is connected or the developer closed it themselves.
  const autoOpened = useRef(false);
  useEffect(() => {
    if (autoOpened.current) return;
    if (isConfigured || guideDismissed) return;
    autoOpened.current = true;
    setOpen(true);
  }, [isConfigured, guideDismissed]);

  return (
    <>
      <div className="border-b border-border bg-linear-to-r from-primary/10 via-brand-pink/10 to-brand-blue/10">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-5 py-2.5 sm:px-6">
          {isConfigured ? (
            <Rocket className="size-4 text-primary" aria-hidden />
          ) : (
            <Settings2 className="size-4 text-primary" aria-hidden />
          )}
          <span className="brand-eyebrow rounded-md bg-primary/10 px-2 py-0.5 text-primary">
            {isConfigured ? "Vendre" : t("notice.title")}
          </span>
          <p className="text-sm text-muted-foreground">
            {isConfigured ? t("panel.verified") : t("notice.body")}
          </p>
          <button type="button" className="brand-button-ghost ml-auto" onClick={() => setOpen(true)}>
            {t("notice.cta")}
          </button>
        </div>
      </div>
      <SetupWizardDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
