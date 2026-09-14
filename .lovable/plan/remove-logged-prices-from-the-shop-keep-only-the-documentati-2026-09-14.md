# Remove logged prices from the shop, keep only the documentation

## Goal

No logged-price ("Lägsta pris 30 dagar") display and no logged-price code in the
project. The only thing that remains is documentation describing which endpoint
to call and how to call it, so it can be built again when a customer asks.

## What changes for the visitor

- Only the normal price is shown (with the struck-through old price when
  discounted) on product cards, product page, search suggestions, search results
  and in the cart.
- No extra requests are made while browsing.

## Technical details

Remove:
- `src/components/store/price-log-provider.tsx` (deleted).
- `src/lib/vendre/price-log.ts` (deleted) and its re-export in
  `src/lib/vendre/index.ts`.
- `src/routes/api/vendre/surface1/products/price-log-prices.ts` (deleted); the
  `surface1` folder goes with it if it becomes empty.
- In `src/components/store/product-price.tsx`: the `productId` prop, the
  price-log hook and the extra price line; `resolvePrice` and the existing price
  rendering stay untouched.
- `PriceLogProvider` from `src/components/store/store-shell.tsx`.
- The `productId` prop passed from `product-card.tsx`, `ProductPage.tsx`,
  `search-box.tsx` and `cart-sheet.tsx`.
- The `store.lowestPrice30Days` key from `src/lib/i18n.tsx`.

Keep as documentation only:
- `.vendre/skills/price-log.md`: rewritten as a reference — this is the only
  Surface v1 call, `GET /surface/1/products/price_log_prices?id[]=<id>` with
  repeated `id[]` parameters, requires an active session cookie, no bearer or
  mutation token, response is an object keyed by product id with
  `price_log_price`, `price_log_price_raw`, `price_log_price_ex_vat_raw`, plus a
  note that it must be proxied same-origin like all other store traffic and that
  no implementation currently exists.
- `.vendre/knowledge/api-reference.md`: keep the endpoint entry, note it is not
  implemented.
- `.vendre/skills/product-price.md`: remove the logged-price section.
- `AGENTS.md`: keep the routing row pointing at the price-log skill.

Verification: typecheck, build, and a preview check that a discounted product
renders only the sale price and the struck-through original.
