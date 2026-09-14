# Remove the logged-price line from the storefront (keep the capability)

## Goal

The "Lägsta pris 30 dagar" line should no longer show anywhere in the shop by
default. The ability to fetch logged prices stays in the project, documented, so
it can be switched on later when a customer asks for it.

## What changes for the visitor

- Product cards, product page, search suggestions, search results and the cart
  show only the normal price (and the struck-through old price when discounted).
- No extra request is made for logged prices while browsing.

## What stays in the project

- The server proxy for the logged-price endpoint.
- The data helper and React hook that fetch logged prices.
- The documentation describing how to fetch and display them again.

## Technical details

Remove from the render path:
- `src/components/store/product-price.tsx`: drop the `productId` prop, the
  `usePriceLogEntry` call and the logged-price line; keep `resolvePrice` and the
  existing price rendering untouched.
- `src/components/store/store-shell.tsx`: unmount `PriceLogProvider`.
- Delete `src/components/store/price-log-provider.tsx`.
- Remove the now-unused `productId` prop passed from `product-card.tsx`,
  `ProductPage.tsx`, `search-box.tsx` and `cart-sheet.tsx`.
- Remove the `store.lowestPrice30Days` key from `src/lib/i18n.tsx`.

Keep unchanged:
- `src/routes/api/vendre/surface1/products/price-log-prices.ts` (same-origin,
  GET-only, session cookie forwarded, rate limited, `no-store`).
- `src/lib/vendre/price-log.ts` (`getPriceLogPrice`, `getPriceLogPrices`, hook)
  and its re-export in `src/lib/vendre/index.ts`.

Documentation:
- `.vendre/skills/price-log.md`: state that logged prices are opt-in and off by
  default, and describe the batching/provider pattern to reintroduce the display.
- `.vendre/skills/product-price.md`: remove the logged-price section from the
  default price component behaviour and point to the price-log skill instead.

Verification: typecheck, build, and a preview check that a discounted product
renders only the sale price and the struck-through original.
