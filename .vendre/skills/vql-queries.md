---
name: vendre-vql-queries
description: Vendre Query Language on Surface v2 - POST vql for multi-resource queries over products, categories, manufacturers and tags, field selection, caching and the fallback when VQL is disabled on an install. Use when building search, brand grids, tagged collections or custom cross-resource data fetching.
---

# Vendre Query Language (Surface v2)

Scope: the query mechanism itself. Page behaviour lives in
`vendre-pdp-products` and `vendre-category-plp`.

## Endpoint

`POST /surface/2/vql` — CORS policy `vendre_query_language`.

## Resources

Query products, categories, manufacturers/brands, tags and related entities via
the resource map. Batch related resources into one request instead of firing one
call per widget.

## Field selection

Request only the fields the view renders. Over-fetching product payloads is the
main cause of slow PLP and search pages.

## Fallback

`POST vql` returns 500 for every body shape on installs where it is not enabled.
Detect this once and fall back to `GET /surface/2/categories/{id}` for product
data; keep the data layer switchable rather than hardcoding VQL everywhere.

## Caching

VQL results for static collections (brands, tags, curated lists) cache
aggressively, keyed by the full query **and** market/currency/language/VAT.
Never run customer-scoped data through a cached VQL query.
