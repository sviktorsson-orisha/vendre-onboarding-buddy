import { useState } from "react";
import { ArrowUpDown, SlidersHorizontal } from "lucide-react";

import {
  activeFilterCount,
  FiltersContent,
  visibleFilters,
  type FilterProps,
} from "@/components/store/category-filters";
import {
  applySort,
  currentSortKey,
  sortKeyOf,
  sortOptionsOf,
} from "@/components/store/category-toolbar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useI18n } from "@/lib/i18n";
import type { CategoryResponse } from "@/types/vendre";

/** Mobile-only filter + sort buttons that open slide-over panels. */
export function CategoryMobileControls({
  data,
  onSortChange,
  filterProps,
}: {
  data: CategoryResponse;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  filterProps: FilterProps;
}) {
  const { t } = useI18n();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const hasFilters = visibleFilters(filterProps.filters).length > 0;
  const sortOptions = sortOptionsOf(data);
  const current = currentSortKey(data);
  const activeCount = activeFilterCount(filterProps);

  if (!hasFilters && sortOptions.length === 0) return null;

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 lg:hidden">
      {hasFilters && (
        <button
          type="button"
          className="brand-button-ghost justify-center"
          onClick={() => setFiltersOpen(true)}
        >
          <SlidersHorizontal className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{t("store.filters")}</span>
          {activeCount > 0 && (
            <span className="ml-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </button>
      )}

      {sortOptions.length > 0 && (
        <button
          type="button"
          className={`brand-button-ghost justify-center ${hasFilters ? "" : "col-span-2"}`}
          onClick={() => setSortOpen(true)}
        >
          <ArrowUpDown className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{t("store.sort")}</span>
        </button>
      )}

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-sm overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("store.filters")}</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <FiltersContent {...filterProps} showHeading={false} />
          </div>
          <button
            type="button"
            className="brand-button mt-6 w-full justify-center"
            onClick={() => setFiltersOpen(false)}
          >
            {t("store.showProducts")}
          </button>
        </SheetContent>
      </Sheet>

      <Sheet open={sortOpen} onOpenChange={setSortOpen}>
        <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("store.sort")}</SheetTitle>
          </SheetHeader>
          <ul className="mt-4 space-y-1">
            {sortOptions.map((option) => {
              const key = sortKeyOf(option);
              return (
                <li key={key}>
                  <button
                    type="button"
                    className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                      key === current
                        ? "bg-secondary font-semibold text-foreground"
                        : "text-muted-foreground"
                    }`}
                    aria-current={key === current ? "true" : undefined}
                    onClick={() => {
                      applySort(option, onSortChange);
                      setSortOpen(false);
                    }}
                  >
                    {option.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </SheetContent>
      </Sheet>
    </div>
  );
}
