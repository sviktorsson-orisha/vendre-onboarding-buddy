# Product price rendering

How prices are displayed across the storefront. One component owns the rule; no
call site re-implements discount logic.

Implementation: `src/components/store/product-price.tsx`
Used by: `src/components/store/product-card.tsx` (PLP, search results, featured),
`src/pages/ProductPage.tsx` (PDP), `src/components/store/search-box.tsx`
(autocomplete), `src/components/store/cart-sheet.tsx` (cart lines).

## Surface API fields used

From the product object returned by `GET /surface/2/categories/{id}`
(`product_list[]`) and by VQL product results — typed in `src/types/vendre.ts`:

| Field               | Type             | Use                                              |
| ------------------- | ---------------- | ------------------------------------------------ |
| `price`             | `string \| null` | Ordinary price, already formatted in session currency |
| `price_raw`         | `number \| null` | Ordinary price as a number — used for comparison  |
| `price_special`     | `string \| null` | Sale price, formatted. Only set when discounted   |
| `price_special_raw` | `number \| null` | Sale price as a number — used for comparison      |

Not used for display:

- `price_original` / `price_original_raw` — still returned by the API and kept
  in the type, but they are **not** the discount signal in this store. Do not
  reintroduce a `price_original_raw > price_raw` comparison.
- `final_price_excl_raw` (ex-VAT) and `tax` — not part of the display rule.

Formatted strings are always preferred for output; the `_raw` numbers are only
used for the comparison and as a formatting fallback.

## Logic

`resolvePrice(fields)` in `product-price.tsx`:

1. `regular = price ?? (price_raw != null ? "<price_raw> kr" : null)`
2. `special = price_special ?? (price_special_raw != null ? "<price_special_raw> kr" : null)`
3. `onSale = price_special_raw != null && price_raw != null && price_special_raw < price_raw && special != null`
4. Returns `{ onSale, current: (onSale ? special : regular) ?? "—", original: onSale ? regular : null }`

Rendering:

- On sale: `current` in `text-destructive` (red), `original` next to it in
  `text-muted-foreground line-through` (grey, struck through).
- Not on sale: `current` in `text-foreground`.
- No price at all: `—` in `text-foreground`, no strikethrough.

Colours are semantic tokens only — never `text-red-500` or similar.

## API

```tsx
<ProductPrice product={product} size="md" className="mt-5" />
```

- `product`: `PriceFields` = `Pick<Product, "price" | "price_raw">` plus optional
  `price_special` / `price_special_raw`. A full `Product` satisfies it, and so
  does a loose object for places without a product (e.g. cart lines).
- `size`: `sm` (autocomplete, cart), `md` (product cards), `lg` (PDP). Controls
  font size/weight only, never colour.
- Renders an inline `<span>` with `items-baseline gap-2` — do not wrap it in
  another `<p>` that duplicates price styling.

## Demo mode

`src/mock/vendreResponses.ts` mirrors the same shape: `product(..., { original })`
means *`original` is the ordinary price and `amount` is the special price*, so
the mock sets `price = original`, `price_raw = original`, `price_special = amount`,
`price_special_raw = amount`. Products without `original` get
`price_special = null`. Any new mock product must keep this invariant or demo
mode will show wrong discount styling.

## Edge cases and pitfalls

- **Special price equal to or higher than the ordinary price** — not a discount.
  The comparison is strict `<`; never trust the mere presence of `price_special`.
- **Only `price_special_raw` set, `price_special` missing** — the raw fallback
  formatter (`"<n> kr"`) kicks in. It is a crude fallback: it assumes SEK and no
  thousand separators, so it is wrong in other markets. Prefer fixing the API
  read over relying on it.
- **`price` null but `price_special` set** — `onSale` is false because
  `price_raw` is null; the ordinary price is then shown as `—`. Treat that as
  bad product data in Vendre, not a UI bug.
- **Currency/VAT scope** — prices depend on market, currency, language and
  `prices_include_vat`. Cached price-bearing queries must include the cache scope
  from `useCacheScope()` (see `src/lib/vendre/api.ts`); otherwise a market switch
  shows stale prices.
- **Cart lines** — `line.product_data` can be undefined; render the price only
  when it exists.
- **`formatPrice()` in `src/lib/vendre/api.ts`** is a plain string helper for
  non-visual uses. It knows nothing about discounts — never build price UI on it.
- **New price surfaces** (upsell, order confirmation, account order lines) must
  use `ProductPrice`. Order history lines from `accounts/me/orders` carry a
  single formatted `price` string and no special price, so they render as regular
  prices by design.
