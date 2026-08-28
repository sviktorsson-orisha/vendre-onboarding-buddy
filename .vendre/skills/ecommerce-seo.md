---
name: vendre-ecommerce-seo
description: SEO for a Vendre Surface v2 storefront - dynamic title/description/canonical per PDP, PLP and CMS page, Product and BreadcrumbList JSON-LD, OpenGraph/Twitter tags, the sitemap endpoint and image semantics. Use when implementing storefront metadata, structured data or sitemaps.
---

# Storefront SEO (Surface v2)

## Dynamic metadata

Every category page, PDP and CMS page renders its own `<title>`,
`<meta name="description">`, canonical link and OpenGraph/Twitter tags built
from API data — never a shared static head. Use the route `head()` option.

## Structured data (JSON-LD)

- **PDP:** `Product` with `name`, `image`, `description`, `sku` and `offers`
  (`price`, `priceCurrency`, `availability`). Prices must match the VAT mode
  from session context.
- **PLP and CMS:** `BreadcrumbList` from the category/page hierarchy.
- **Store:** `Organization`/`WebSite` on the home route.

## Sitemap

`GET /surface/2/sitemap` (supports `?type=` — e.g. `galleries`) backs dynamic
sitemap routes. Include categories, products and CMS pages.

## Images

Product and gallery images need semantic `alt` text and explicit width/height or
aspect ratio, with lazy loading below the fold. Resolve relative CMS image paths
against the store base URL.
