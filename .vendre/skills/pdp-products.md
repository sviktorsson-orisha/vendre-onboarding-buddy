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

## Verified variant implementation (this project)

Variants are read with `POST /surface/2/vql`:

```json
{ "query": { "product_variant_types": {
  "filters": { "where": { "product_id": "<PRODUCT_ID>" } },
  "fields": ["id","name","sort_order",
    { "product_variant_choices": { "fields": ["_all",
      { "products": { "fields": ["id","in_stock","quantity"] } } ] } } ] } } }
```

- The response is `{ query: { product_variant_types: [...] } }` (no `data` wrapper on
  Surface v2). `quantity` is not returned by this install — rely on `in_stock`.
- Drop choices whose `products` array is empty/null, sort types and choices by
  `sort_order`.
- **`choice.products[0].id` is the product added to cart** — never the parent id
  from the URL.
- **Out of stock does not mean unbuyable.** A choice is only greyed out and
  disabled when every product carrying it has `in_stock: false` **and**
  `stock_allow_checkout === false`. `null`/`0`-style values inherit the parent or
  store default, which allows checkout. Request `stock_allow_checkout` in the
  `products` field list. No restock form is rendered.
- **A variant child is a product of its own.** On every selection the PDP re-reads
  the whole record with a `products` VQL query and renders it: name, short
  description, description, image, price and stock all follow the selected variant.

```json
{ "query": { "products": {
  "filters": { "where": { "id": <CHILD_ID> } },
  "fields": ["_all", { "image": { "fields": ["id","name","href"] } }] } } }
```

  Variant children are not listed in any category, so VQL is the only source.
  The image relation is `image` (not `images`); `image.href` is the store-relative
  path. Price lives in `pricing` (`original/special/final_excl_raw`), stock in
  `in_stock` plus `stock_allow_checkout` (`null` = store default = checkout allowed).
- **The variant tree lives on the parent.** A variant child carries `parent_id`
  (e.g. product 271 → `parent_id: 188`), and `product_variant_types` filtered on a
  child id returns an empty result. Always query `product.parent_id ?? product.id`,
  so a PDP entered directly on a variant still renders the selector — with the
  child's own choices preselected from `choice.products[].id`.
- **With several variant types, intersect.** Every choice lists all products
  carrying it, so the real variant is the id shared by all selected choices
  (`lists.reduce((acc, ids) => acc.filter(id => ids.includes(id)))`). The buy button
  enables only when every type is selected, the intersection is non-empty and the
  resolved product is not blocked by the stock rule above.
- Listings never add a variant parent to the cart: a product with
  `child_count > 0` (or blocked by the stock rule) shows a "Läs mer" link to the
  PDP instead of an add-to-cart button.
