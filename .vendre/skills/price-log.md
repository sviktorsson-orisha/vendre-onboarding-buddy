---
name: vendre-price-log
description: Reference for logged prices (price history) via the single allowed Surface v1 endpoint GET /surface/1/products/price_log_prices - request shape, session requirement and response format. Not implemented in this template; use when a customer asks for lowest/previous price display.
---

# Logged prices (Surface v1) — reference only

**Nothing in this template implements this.** There is no proxy route, no
helper, no hook and no UI for logged prices. This file documents how to call the
endpoint so it can be built when a customer asks for it.

This is the **only** Surface v1 endpoint that may ever be used. Everything else —
products, categories, cart, account, VQL, CMS — stays on Surface v2.

## Endpoint

`GET /surface/1/products/price_log_prices`

- **No OAuth bearer.** v1 never uses the `Authorization` header.
- **Session cookie required.** Without the store session cookie it returns
  `401 SURFACE_SESSION_UNAUTHORIZED`. That cookie is the one
  `POST /surface/2/session/bootstrap` established, so bootstrap must have run.
- **No mutation protection token** (it is a GET).
- **Parameters:** repeated `id[]=<products_id>`, one per product, several per
  call. Other parameter names return an empty result instead of an error.
- **Response:** an object keyed by product id (verified live against product
  222 / model `36-7246`):

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

  Products without a logged price are omitted from the object.
  `price_log_price` is already formatted in the session currency — render it as
  is, never compute a fallback in the frontend.

## If it is implemented again

- The browser must never call the store directly. Add a same-origin proxy route
  (for example `/api/vendre/surface1/products/price-log-prices`) that mirrors the
  v2 proxy: same-origin guard, per-IP rate limit, cookie forwarding, `Set-Cookie`
  rewritten to our origin, `cache-control: no-store`, and **no** bearer header.
- Batch ids into one call per page instead of one call per price row, and cache
  a few minutes client-side; logged prices change rarely.
- Only show the value for discounted products, and never in demo mode.
- CORS is not applicable — the browser only talks to our own origin.
