# Shared price display based on price_special

Prices must render identically everywhere (product cards, PDP, search autocomplete, search results page, cart rows). Whether a price is discounted is decided only by `price_special` / `price_special_raw` against `price` / `price_raw`. `price_original` / `price_original_raw` are not used at all.

## Display rules

- Discounted (`price_special_raw` is set and lower than `price_raw`): special price in red, `price` next to it in grey with strikethrough.
- Not discounted: `price` alone in normal black/foreground text.
- No price at all: neutral black placeholder, no strikethrough.

## Discount logic

1. If `price_special_raw != null` and `price_raw != null` and `price_special_raw < price_raw` -> discounted. Active price text = `price_special` (fallback: formatted `price_special_raw`), struck-through text = `price` (fallback: formatted `price_raw`).
2. Otherwise -> regular. Show `price` (fallback: formatted `price_raw`, else placeholder).

Formatted strings from Vendre are always preferred for output; the `_raw` numbers are used only for the comparison and as a formatting fallback.

## Work

1. `src/types/vendre.ts` — add `price_special: string | null` and `price_special_raw: number | null` to `Product`. Leave `price_original*` in the type (still returned by the API) but stop using them for display.
2. `src/mock/vendreResponses.ts` — the mock product factory emits `price_special` / `price_special_raw` for the discounted demo products so demo mode shows the red/struck styling.
3. New `src/components/store/product-price.tsx` — single component holding the logic and markup. Accepts either a product or loose price fields (cart rows without a full product), plus a size variant (`sm` search/cart, `md` cards, `lg` PDP). Colours come from existing semantic tokens (destructive for the special price, muted-foreground for the struck ordinary price); no hardcoded colours.
4. Use it in `src/components/store/product-card.tsx` (replacing the current `price_original_raw` comparison), `src/pages/ProductPage.tsx`, `src/components/store/search-box.tsx`, the search results grid, and cart line rows.
5. Keep `formatPrice` in `src/lib/vendre/api.ts` as the internal string formatter, extended so it can format any given price string/raw pair.

No endpoints, requests or data fetching change.
