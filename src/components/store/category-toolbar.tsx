import { useI18n } from "@/lib/i18n";
import type { CategoryResponse } from "@/types/vendre";

export type SortValue = "name-ASC" | "name-DESC" | "price-ASC" | "price-DESC";

/** Server-side sort + page size controls (values are sent to the API, never applied locally). */
export function CategoryToolbar({
  data,
  sort,
  onSortChange,
  onLimitChange,
}: {
  data: CategoryResponse;
  sort: SortValue;
  onSortChange: (value: SortValue) => void;
  onLimitChange: (limit: number) => void;
}) {
  const { t } = useI18n();

  const sortOptions: { value: SortValue; label: string }[] = [
    { value: "name-ASC", label: t("store.sortNameAsc") },
    { value: "name-DESC", label: t("store.sortNameDesc") },
    { value: "price-ASC", label: t("store.sortPriceAsc") },
    { value: "price-DESC", label: t("store.sortPriceDesc") },
  ];

  const limits = data.page_limits?.length
    ? data.page_limits
    : [12, 24, 48].map((limit) => ({ name: limit, limit, selected: limit === data.page_limit }));

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <p className="text-sm text-muted-foreground">
        {data.product_count} {t("store.products")}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          {t("store.sort")}
          <select
            className="brand-input h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground"
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SortValue)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          {t("store.perPage")}
          <select
            className="brand-input h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground"
            value={data.page_limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
          >
            {limits.map((option) => (
              <option key={String(option.name)} value={option.limit}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
