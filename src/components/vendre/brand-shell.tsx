import type { ReactNode } from "react";

import { LanguagePicker } from "@/components/vendre/language-picker";
import { useI18n } from "@/lib/i18n";

export function BrandShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="brand-canvas flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-5 py-4 sm:px-6">
          <span className="brand-wordmark text-2xl text-foreground">vendre</span>
          <span className="brand-eyebrow text-primary">{t("brand.tagline")}</span>
          <div className="ml-auto">
            <LanguagePicker />
          </div>
        </div>
      </header>

      <main className="grow">
        <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-6 sm:py-14">{children}</div>
      </main>

      <footer className="border-t border-border bg-card/60">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-5 py-6 sm:px-6">
          <span className="brand-wordmark text-base text-foreground">vendre</span>
          <p className="text-xs text-muted-foreground">{t("brand.footer")}</p>
        </div>
      </footer>
    </div>
  );
}

export function BrandHero() {
  const { t } = useI18n();
  return (
    <header>
      <p className="brand-eyebrow inline-flex rounded-md bg-primary/10 px-3 py-1 text-primary">
        {t("hero.eyebrow")}
      </p>
      <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.05] text-foreground sm:text-5xl">
        {t("hero.title")} <span className="brand-gradient-text">{t("hero.titleAccent")}</span>
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
        {t("hero.intro")}
      </p>
    </header>
  );
}
