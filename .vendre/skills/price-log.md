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
- **Parameters:** the generated spec declares none. Verified against a live
  store the endpoint answers `200` with `[]` when no logged prices exist, both
  with and without query parameters. Pass product identifiers through and read
  the response defensively.

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
import { getPriceLogPrices, usePriceLogPrices } from "@/lib/vendre";

// imperative
const entries = await getPriceLogPrices({ products_id: product.id });

// react-query; disabled by default so no page gains a call by accident
const { data } = usePriceLogPrices(
  { products_id: product.id },
  { enabled: Boolean(product.id) },
);
```

- Array values are serialised as repeated `key[]=value` pairs.
- Entries are returned as `Record<string, unknown>[]` — the store's field names
  are not fixed by the spec, so map them where you render.
- Non-2xx responses throw `VendreError` with the store's error `title`/`code`.

## Rendering guidance

Nothing in the storefront shows price history today. When a customer asks for
it (typically "lowest price in the last 30 days" next to a discounted price):

1. Call the hook on the product page for the **active** product or variant id,
   so the value follows variant selection.
2. Show it only when the product is actually on sale — the shared price rules
   live in `.vendre/skills/product-price.md`.
3. Treat an empty array as "no logged price" and render nothing; never compute
   a fallback in the frontend.

## Caching

Logged prices change rarely: `staleTime` of a few minutes is fine client-side.
The proxy response itself is `no-store` because it depends on the session.

## CORS

Not applicable — the browser only talks to our own origin. The store side needs
no extra CORS policy for this call.
