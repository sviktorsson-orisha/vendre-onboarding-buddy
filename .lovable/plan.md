# Shared price display with price_special support

Prices must render identically everywhere (product cards, PDP, search autocomplete, search results, cart, related lists) and the discount decision must be based on Vendre's `price_special` / `price_special_raw` fields, not only on `price_original`.

## Display rules

- Discounted: the active (special) price in red, the ordinary price next to it in grey with strikethrough.
- Not discounted: single price in normal black/foreground text.
- No price available: neutral black text placeholder, no strikethrough.

## Discount logic

A product counts as discounted when Vendre supplies a special price that is lower than the ordinary price:

1. If `price_special_raw` is set and lower than `price_raw`/`price_original_raw`, use `price_special` as the active price and the ordinary price as the struck-through one.
2. Otherwise fall back to the existing rule: `price_original_raw > price_raw` means discounted, with `price` active and `price_original` struck through.
3. Otherwise not discounted: show `price` (or `price_raw` formatted) alone.

Formatted strings from Vendre (`price`, `price_original`, `price_special`) are preferred for output; the `_raw` numbers are only used for the comparison.

## Work

1. `src/types/vendre.ts` — add `price_special: string | null` and `price_special_raw: number | null` to the product type.
2. `src/mock/vendreResponses.ts` — let the mock product factory emit `price_special` fields so demo mode exercises both the special-price and the original-price discount paths.
3. New `src/components/store/product-price.tsx` — one component that takes a product (or loose price fields for cart rows, which have no full product) plus a `size` variant (`sm` for search/cart, `md` for cards, `lg` for PDP). It holds the discount logic and the colour/strikethrough markup, using existing semantic tokens (destructive for the sale price, muted-foreground for the struck original) — no hardcoded colours.
4. Replace the inline price markup in `src/components/store/product-card.tsx`, `src/pages/ProductPage.tsx`, `src/components/store/search-box.tsx`, the search results grid, and the cart line rows with this component.
5. Keep `formatPrice` in `src/lib/vendre/api.ts` as the string formatter used internally by the component; extend it so it can format a chosen price field.

No API calls, endpoints or data fetching change.
