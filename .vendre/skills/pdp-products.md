---
name: vendre-pdp-products
description: Vendre Surface v2 product detail pages - fetching product data and variant trees, variant switching, stock, dynamic pricing and the prices_include_vat flag, related products, and add-to-cart. Use when building a PDP, a variant selector or a buy box against Vendre.
---

# Product detail page (Surface v2)

Scope: the single-product view. Listings live in `vendre-category-plp`, query
syntax in `vendre-vql-queries`, cart behaviour in `vendre-cart-checkout`.

## Data fetching

- Primary source: `POST /surface/2/vql` for flexible product data, attributes,
  variant trees and related products (`vendre-vql-queries` for the query shape).
- Fallback: if `POST vql` returns 500 on the install, read the product from
  `GET /surface/2/categories/{id}` payloads and keep the data layer switchable.

## Pricing and VAT

Respect `prices_include_vat` from `GET session/context` when displaying prices,
and re-render after a market/currency/language switch. Never assume VAT mode.

## Variants and stock

Variant switches must update the active SKU, price, stock status and image
gallery in place — no full page reload, no route change unless the variant has
its own URL. Out-of-stock variants stay selectable but disable the buy button.

## Add to cart

`POST /surface/2/shopping-cart/products` with the selected variant id, quantity
and the `Surface-Mutation-Protection-Token` header. Feed it through the shared
cart layer so the optimistic update, invalidation and header badge behave the
same as everywhere else (`vendre-cart-checkout`).

## Caching

Cache base product details per product id/slug, keyed by market, currency,
language and VAT mode. Stock and dynamic prices are refetched on view.

## SEO

Product schema, canonical and dynamic meta belong to `vendre-ecommerce-seo`.
