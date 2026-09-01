import { useI18n } from "@/lib/i18n";
import type { CategoryResponse, CategorySort } from "@/types/vendre";

/**
 * Server-side sort control. The options come from the store response only —
 * when the install returns no sort list, no dropdown is rendered.
 */
export function CategoryToolbar({
  data,
  onSortChange,
}: {
  data: CategoryResponse;
  onSortChange: (sortBy: string, sortOrder: string) => void;
}) {
  const { t } = useI18n();

  const options: CategorySort[] = data.sort_options ?? data.sorts ?? [];

  const keyOf = (option: CategorySort) =>
    option.sort_by
      ? `${option.sort_by}-${(option.sort_order ?? "ASC").toUpperCase()}`
      : String(option.value ?? option.name);

  const current = options.some(
    (option) => keyOf(option) === `${data.sort_by}-${data.sort_order}`,
  )
    ? `${data.sort_by}-${data.sort_order}`
    : (options.find((option) => option.selected)?.name ?? "");

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <p className="text-sm text-muted-foreground">
        {data.product_count} {t("store.products")}
      </p>
      {options.length > 0 && (
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          {t("store.sort")}
          <select
            className="brand-input h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground"
            value={current}
            onChange={(event) => {
              const picked = options.find((option) => keyOf(option) === event.target.value);
              if (!picked) return;
              const [sortBy, sortOrder] = picked.sort_by
                ? [picked.sort_by, (picked.sort_order ?? "ASC").toUpperCase()]
                : String(picked.value ?? "").split("-");
              if (sortBy) onSortChange(sortBy, (sortOrder ?? "ASC").toUpperCase());
            }}
          >
            {options.map((option) => (
              <option key={keyOf(option)} value={keyOf(option)}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
