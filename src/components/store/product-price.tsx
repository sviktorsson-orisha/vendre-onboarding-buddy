import { usePriceLogEntry } from "@/components/store/price-log-provider";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/vendre";

/**
 * Single source of truth for how prices render across the storefront.
 *
 * Discount rule (Vendre Surface): a product is on sale only when
 * price_special_raw is set and lower than price_raw. price_original* is not used.
 */
export type PriceFields = Pick<Product, "price" | "price_raw"> &
  Partial<Pick<Product, "price_special" | "price_special_raw">>;

type Size = "sm" | "md" | "lg";

const currentSize: Record<Size, string> = {
  sm: "text-sm font-semibold",
  md: "text-base font-bold",
  lg: "text-2xl font-bold",
};

const originalSize: Record<Size, string> = {
  sm: "text-xs",
  md: "text-xs",
  lg: "text-base",
};

function format(text: string | null | undefined, raw: number | null | undefined) {
  if (text) return text;
  if (raw != null) return `${raw} kr`;
  return null;
}

export function resolvePrice(fields: PriceFields) {
  const regular = format(fields.price, fields.price_raw);
  const special = format(fields.price_special, fields.price_special_raw);
  const onSale =
    fields.price_special_raw != null &&
    fields.price_raw != null &&
    fields.price_special_raw < fields.price_raw &&
    special != null;

  return {
    onSale,
    current: (onSale ? special : regular) ?? "—",
    original: onSale ? regular : null,
  };
}

export function ProductPrice({
  product,
  productId,
  size = "md",
  className,
}: {
  product: PriceFields;
  /** Enables the "lowest price 30 days" line for discounted products. */
  productId?: string | number | null;
  size?: Size;
  className?: string;
}) {
  const { t } = useI18n();
  const { onSale, current, original } = resolvePrice(product);
  const logged = usePriceLogEntry(productId, onSale);
  const loggedText = onSale ? logged?.price_log_price : null;

  return (
    <span className={cn("inline-flex flex-col", className)}>
      <span className="inline-flex items-baseline gap-2">
        <span className={cn(currentSize[size], onSale ? "text-destructive" : "text-foreground")}>
          {current}
        </span>
        {onSale && original && (
          <span className={cn(originalSize[size], "text-muted-foreground line-through")}>
            {original}
          </span>
        )}
      </span>
      {loggedText && (
        <span className="text-xs text-muted-foreground">
          {t("store.lowestPrice30Days")}: {loggedText}
        </span>
      )}
    </span>
  );
}
