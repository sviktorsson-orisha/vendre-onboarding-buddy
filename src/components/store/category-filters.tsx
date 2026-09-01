import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import type { CategoryFilter } from "@/types/vendre";

export function CategoryFilters({
  filters,
  selected,
  priceFrom,
  priceTo,
  onToggleTag,
  onPriceChange,
  onClear,
}: {
  filters: CategoryFilter[];
  selected: string[];
  priceFrom?: number;
  priceTo?: number;
  onToggleTag: (id: string) => void;
  onPriceChange: (from?: number, to?: number) => void;
  onClear: () => void;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(priceFrom != null ? String(priceFrom) : "");
  const [to, setTo] = useState(priceTo != null ? String(priceTo) : "");

  useEffect(() => setFrom(priceFrom != null ? String(priceFrom) : ""), [priceFrom]);
  useEffect(() => setTo(priceTo != null ? String(priceTo) : ""), [priceTo]);

  const active = selected.length > 0 || priceFrom != null || priceTo != null;

  return (
    <aside className="lg:w-60 lg:shrink-0">
      <button
        type="button"
        className="brand-button-ghost mb-3 w-full justify-center lg:hidden"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <SlidersHorizontal className="size-4" aria-hidden /> {t("store.filters")}
      </button>

      <div className={`${open ? "block" : "hidden"} space-y-6 lg:block`}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">{t("store.filters")}</h2>
          {active && (
            <button type="button" className="text-xs text-primary underline" onClick={onClear}>
              {t("store.clearFilters")}
            </button>
          )}
        </div>

        {filters.map((filter) => (
          <fieldset key={String(filter.id)} className="space-y-2">
            <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {filter.name}
            </legend>
            {filter.values.map((value) => {
              const id = String(value.id);
              return (
                <label key={id} className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-border"
                    checked={selected.includes(id)}
                    onChange={() => onToggleTag(id)}
                  />
                  <span className="grow">{value.name}</span>
                  {value.count != null && (
                    <span className="text-xs text-muted-foreground">{value.count}</span>
                  )}
                </label>
              );
            })}
          </fieldset>
        ))}

        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("store.price")}
          </legend>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={t("store.from")}
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
            />
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={t("store.to")}
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
            />
          </div>
          <button
            type="button"
            className="brand-button-ghost w-full justify-center"
            onClick={() =>
              onPriceChange(
                from.trim() === "" ? undefined : Number(from),
                to.trim() === "" ? undefined : Number(to),
              )
            }
          >
            {t("store.apply")}
          </button>
        </fieldset>
      </div>
    </aside>
  );
}
