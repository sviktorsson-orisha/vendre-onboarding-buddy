import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import type { CategoryFilter } from "@/types/vendre";

/** Spec filters (type 4) carry no ids — their options are identified by name. */
export function isSpecFilter(filter: CategoryFilter) {
  return String(filter.type) === "4";
}

/**
 * Renders only what the store returns in `filters`.
 * Tag filters (type 1) are sent as tags[], spec filters (type 4) as f[{id}][].
 * Category filters (type 0) are rendered as subcategory links elsewhere.
 */
export function CategoryFilters({
  filters,
  selected,
  selectedSpecs,
  onToggleTag,
  onToggleSpec,
  onClear,
}: {
  filters: CategoryFilter[];
  selected: string[];
  selectedSpecs: Record<string, string[]>;
  onToggleTag: (id: string) => void;
  onToggleSpec: (filterId: string, value: string) => void;
  onClear: () => void;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const visible = filters.filter(
    (filter) => String(filter.type) !== "0" && (filter.options ?? []).length > 0,
  );
  if (visible.length === 0) return null;

  const active = selected.length > 0 || Object.values(selectedSpecs).some((v) => v.length > 0);

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

        {visible.map((filter) => {
          const spec = isSpecFilter(filter);
          const filterId = String(filter.id);
          const chosen = spec ? (selectedSpecs[filterId] ?? []) : selected;
          return (
            <fieldset key={filterId} className="space-y-2">
              <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {filter.name}
              </legend>
              {(filter.options ?? []).map((option) => {
                const value = spec ? option.name : String(option.id);
                return (
                  <label
                    key={`${filterId}-${value}`}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded border-border"
                      checked={chosen.includes(value)}
                      onChange={() =>
                        spec ? onToggleSpec(filterId, value) : onToggleTag(value)
                      }
                    />
                    <span className="grow">{option.name}</span>
                    {option.count != null && (
                      <span className="text-xs text-muted-foreground">{option.count}</span>
                    )}
                  </label>
                );
              })}
            </fieldset>
          );
        })}
      </div>
    </aside>
  );
}
