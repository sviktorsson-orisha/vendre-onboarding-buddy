import { Facebook, Instagram, Youtube } from "lucide-react";

import { useI18n } from "@/lib/i18n";

export function StoreFooter() {
  const { t } = useI18n();

  const columns: { title: string; items: string[] }[] = [
    { title: t("footer.service"), items: [t("footer.contact"), t("footer.shipping"), t("footer.returns"), t("footer.faq")] },
    { title: t("footer.info"), items: [t("footer.about"), t("footer.terms"), t("footer.privacy"), t("footer.cookies")] },
  ];

  return (
    <footer className="mt-16 border-t border-border bg-secondary">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <span className="brand-wordmark text-xl text-foreground">vendre</span>
          <p className="mt-3 text-sm text-muted-foreground">{t("footer.tagline")}</p>
          <div className="mt-4 flex gap-3 text-muted-foreground">
            <Instagram className="size-4" aria-label="Instagram" />
            <Facebook className="size-4" aria-label="Facebook" />
            <Youtube className="size-4" aria-label="YouTube" />
          </div>
        </div>

        {columns.map((column) => (
          <nav key={column.title}>
            <h2 className="brand-eyebrow text-foreground">{column.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {column.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h2 className="brand-eyebrow text-foreground">{t("footer.payment")}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {["Klarna", "Swish", "Visa", "Mastercard"].map((method) => (
              <li
                key={method}
                className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground"
              >
                {method}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        {t("footer.copyright")}
      </div>
    </footer>
  );
}
