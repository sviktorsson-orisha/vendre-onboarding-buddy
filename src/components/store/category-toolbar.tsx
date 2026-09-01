import { useI18n } from "@/lib/i18n";
import type { CategoryResponse, CategorySort } from "@/types/vendre";

/** Sort options come from the store response only — nothing is invented client-side. */
export function sortOptionsOf(data: CategoryResponse): CategorySort[] {
  return data.sort_options ?? data.sorts ?? [];
}

export function sortKeyOf(option: CategorySort) {
  return option.sort_by
    ? `${option.sort_by}-${(option.sort_order ?? "ASC").toUpperCase()}`
    : String(option.value ?? option.name);
}

export function currentSortKey(data: CategoryResponse) {
  const options = sortOptionsOf(data);
  return options.some((option) => sortKeyOf(option) === `${data.sort_by}-${data.sort_order}`)
    ? `${data.sort_by}-${data.sort_order}`
    : (options.find((option) => option.selected)?.name ?? "");
}

export function applySort(
  option: CategorySort,
  onSortChange: (sortBy: string, sortOrder: string) => void,
) {
  const [sortBy, sortOrder] = option.sort_by
    ? [option.sort_by, (option.sort_order ?? "ASC").toUpperCase()]
    : String(option.value ?? "").split("-");
  if (sortBy) onSortChange(sortBy, (sortOrder ?? "ASC").toUpperCase());
}

/**
 * Product count plus the desktop sort control. On mobile the sort control lives
 * in CategoryMobileControls instead.
 */
export function CategoryToolbar({
  data,
  onSortChange,
}: {
  data: CategoryResponse;
  onSortChange: (sortBy: string, sortOrder: string) => void;
}) {
  const { t } = useI18n();

  const options = sortOptionsOf(data);
  const current = currentSortKey(data);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <p className="text-sm text-muted-foreground">
        {data.product_count} {t("store.products")}
      </p>
      {options.length > 0 && (
        <label className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
          {t("store.sort")}
          <select
            className="brand-input h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground"
            value={current}
            onChange={(event) => {
              const picked = options.find((option) => sortKeyOf(option) === event.target.value);
              if (picked) applySort(picked, onSortChange);
            }}
          >
            {options.map((option) => (
              <option key={sortKeyOf(option)} value={sortKeyOf(option)}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
