import { Globe } from "lucide-react";

import { useI18n, type Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Language; label: string }[] = [
  { value: "sv", label: "SV" },
  { value: "en", label: "EN" },
];

export function LanguagePicker() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div
      className="flex items-center gap-1 rounded-lg border border-border bg-card p-1"
      role="group"
      aria-label={t("lang.label")}
    >
      <Globe className="ml-1 size-3.5 text-muted-foreground" aria-hidden />
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLanguage(option.value)}
          aria-pressed={language === option.value}
          className={cn(
            "rounded-md px-2 py-1 text-xs font-bold transition-colors",
            language === option.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
