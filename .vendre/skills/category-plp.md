---
name: vendre-category-plp
description: Vendre Surface v2 category and product listing pages - category payload, subcategory grids, server-side filtering, sorting, pagination, URL state and cache keys. Use when building a PLP, faceted filters or category navigation, or when filter counts and pagination disagree.
---

# Category / product listing page (Surface v2)

Scope: listings. Single-product view is `vendre-pdp-products`; query syntax is
`vendre-vql-queries`.

## Data fetching

- `GET /surface/2/categories/{id}` returns the category header, subcategories,
  product list, available filters, sort options and pagination.
- For search, brand grids or cross-resource listings use `POST /surface/2/vql`.

## Filter, sort and paginate on the server

Send `sort_by`, `sort_order`, `page`, `limit`, `tags[]`, `filter`/`f`, `pfrom`,
`pto` to the API and render the list, `product_count` and page count from the
response. Filtering an already-paginated list in the browser makes counts and
paging wrong the moment a filter is active.

## URL state

Keep filters, sort and page in URL query params so listings are shareable,
indexable and back-button correct — and so the cache key and a shared link
always agree. Array params use brackets: `tags[]=64&tags[]=81`.

## Subcategories and active state

Render subcategory cards/grids from the category payload for deep browsing, and
highlight the active category from the route params.

## Caching

Cache category responses keyed by category id, page, sort, filters **and**
market/currency/language/VAT from session context. Invalidate on filter change
and after `POST session` (`vendre-caching`).
