---
name: vendre-price-log
description: Logged prices (price history) from the single allowed Surface v1 endpoint GET /surface/1/products/price-log-prices - proxy route, fetch helper, hook, caching and how to surface price history on a product view. Use when a customer asks for lowest/previous price display.
---

# Logged prices (Surface v1)

This is the **only** Surface v1 endpoint the template uses. Everything else —
products, categories, cart, account, VQL, CMS — stays on Surface v2. Never add
another v1 path without an explicit decision.

## Endpoint

`GET /surface/1/products/price-log-prices`

- **No OAuth bearer.** v1 never uses the `Authorization` header.
- **Session cookie required.** Without the store `visitorid` cookie it returns
  `401 SURFACE_SESSION_UNAUTHORIZED`. The cookie is the same one
  `POST /surface/2/session/bootstrap` established, so bootstrap must have run.
- **No mutation protection token** (it is a GET, and not one of the documented
  GET exceptions).
- **Parameters:** repeated `id[]=<products_id>` — one per product, several per
  call. No other parameter name works; the store answers with an empty result
  instead of an error.
- **Response:** an object keyed by product id, verified live:

  ```json
  {
    "222": {
      "product_id": 222,
      "price_list_id": null,
      "currency_id": null,
      "products_tax_class_id": 2,
      "price_log_price_ex_vat_raw": 39.2,
      "price_log_price_raw": 49,
      "price_log_price": "49 kr"
    }
  }
  ```

  Products without a logged price are omitted. `price_log_price` is already
  formatted in the session currency — render it as is.

## How the app reaches it

The browser never calls the store. It calls the same-origin proxy:

```text
GET /api/vendre/surface1/products/price-log-prices[?...]
   -> ${VENDRE_BASE_URL}/surface/1/products/price-log-prices[?...]
```

Route: `src/routes/api/vendre/surface1/products/price-log-prices.ts`. It mirrors
the v2 proxy: same-origin guard, per-IP rate limit, cookie forwarding,
`Set-Cookie` rewritten to our origin, `cache-control: no-store`, and **no**
bearer header.

## Client helpers

`src/lib/vendre/price-log.ts` (re-exported from `@/lib/vendre`):

```ts
import { getPriceLogPrice, getPriceLogPrices, usePriceLogPrices } from "@/lib/vendre";

// imperative — one product, or many in one call
const entry = await getPriceLogPrice(product.id);
const map = await getPriceLogPrices(products.map((p) => p.id));

// react-query; disabled by default so no page gains a call by accident
const { data } = usePriceLogPrices([product.id], { enabled: Boolean(product.id) });
const logged = data?.[String(product.id)];
```

- Ids are serialised as repeated `id[]=...` pairs.
- `getPriceLogPrices` returns a `PriceLogMap` keyed by product id; a missing key
  means the product has no logged price. `getPriceLogPrice` returns `null` then.
- Non-2xx responses throw `VendreError` with the store's error `title`/`code`.

## Rendering in the storefront

The storefront renders logged prices as a "Lägsta pris 30 dagar: <amount>" line
under the price, everywhere `ProductPrice` is used (product cards, PDP, search
autocomplete, cart lines). Order lines under My account are excluded — they show
the prices captured when the order was placed.

Rules:

1. The line is shown **only when the product is on sale** (the shared rule in
   `.vendre/skills/product-price.md`).
2. Only when the store returns a logged price for that id; a missing key renders
   nothing. Never compute a fallback in the frontend.
3. `price_log_price` is already formatted — print it as is.
4. Demo mode never fetches: the batching provider is live-mode only.

### Batching

`src/components/store/price-log-provider.tsx` (mounted once in `StoreShell`)
collects the ids of discounted price rows, debounces ~50 ms and issues **one**
`getPriceLogPrices(ids)` call per page, cached 5 minutes via react-query. Price
rows opt in through `usePriceLogEntry(id, onSale)` — never fetch per row.
`ProductPrice` takes an optional `productId` prop; without it no logged price is
requested or shown.

## Caching

Logged prices change rarely: `staleTime` of a few minutes is fine client-side.
The proxy response itself is `no-store` because it depends on the session.

## CORS

Not applicable — the browser only talks to our own origin. The store side needs
no extra CORS policy for this call.
