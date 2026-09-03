# Order detail: missing image and price

## Short answer

I cannot confirm it from here. The order-detail call requires a logged-in customer session, and I have no captured raw response from `accounts/me/order-history/{id}` for your store. The current code guesses at field names (`products` / `order_products` / `lines` / `items` / `rows`, and `price` / `final_price` / `total_final_price`, plus a handful of image keys). If Vendre names them differently — or genuinely does not return an image on order lines — everything falls back to blank. So the diagnosis has to come first, not another round of guessing.

## Plan

1. **Capture the real payload.** Add a temporary, development-only debug view on the order detail page (behind a toggle, not visible to customers) that prints the raw JSON returned by `accounts/me/order-history/{id}`. You open one of your own orders and paste the JSON back to me — or hand me test credentials so I can log in and read it myself.
2. **Map the real fields.** Rewrite the order-line normalisation to the actual keys, removing the speculative aliases. Prices are taken from the API only, never calculated in the frontend.
3. **Images, if the order does not carry them.** If order lines only reference a product id/model but no image, look the image up per line via the product endpoint the PDP already uses, cached, with the name/quantity/price rendered immediately and the thumbnail filling in when it arrives. If there is no reliable id either, we drop the image column instead of showing broken placeholders.
4. **Match the demo data.** Update the mock order in demo mode so it mirrors the confirmed live shape, and remove the temporary debug view.

## Technical notes

- Files touched: `src/lib/vendre/account.ts` (normalisation), `src/pages/AccountPage.tsx` (rendering + temp debug), `src/types/vendre-account.ts`, `src/mock/vendreAccount.ts`.
- Totals continue to render only from API-provided rows (`totals` / individual total fields); no frontend arithmetic.
- No change to the auth/session flow or the proxy layer.
