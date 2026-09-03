---
name: vendre-cms-pages
description: Vendre Surface v2 galleries are CMS text/information pages, not product collections - page tree, content blocks, boxes, Twig rendering, menu routing and relative image paths. Use when building content pages, footer links or navigation items of type information_page.
---

# Galleries are CMS pages (Surface v2)

**Galleries in Vendre are CMS pages** — text and information pages (about,
shipping, terms, guides). They are not product collections. Treating them as
categories or products is a recurring, hard-to-spot bug.

## Endpoints

- `GET /surface/2/galleries/pagetree` — the CMS page tree (navigation/sitemap)
- `GET /surface/2/galleries/{id}/pages` — pages in a gallery
- `GET /surface/2/galleries/{id}/pages` — the pages in a gallery, including each
  page's `title` and `description`

The `/sida/{id}` route renders ONLY the page's `description`. Content blocks
(`galleries/{id}/content-blocks`) are deliberately not fetched or rendered.
A page is listed inside its *parent* gallery, so resolve the parent from
`galleries/pagetree` and then read `galleries/{parent_id}/pages`.
- `GET /surface/2/galleries/boxes` — reusable content boxes
- `POST /surface/2/twig/render` — Twig block rendering (resolves to the
  `default` CORS policy)

## Routing

Navigation menu items with type `information_page` point at galleries. Route
them to the CMS page route (e.g. `/pages/$galleryId`), **never** to the category
or product view. Check the menu item type when building header, mega menu and
footer links.

## Rendering

- Map each content-block type to a dedicated UI component: hero, rich text,
  image, image grid, CTA. Unknown block types degrade to plain rich text rather
  than disappearing.
- **Image paths in content blocks are relative** — resolve them against the
  store base URL or images silently break.
- Sanitise HTML coming from blocks before injecting it.
- Give each CMS route its own `head()` title/description from the page data, and
  include CMS pages in the sitemap (`GET sitemap?type=galleries`).
- **`pagetree` is the only source of page type.** It returns `tree` + flat
  `pages` with `id`, `parent_id` (root = `0`), `title`, `href`, `is_menu`,
  `children`. `is_menu: true` marks a real menu heading (Information,
  Kundservice); `is_menu: false` is an ordinary content/listing page
  (Inspiration). Footer groups = root nodes with `is_menu: true` and at least one
  child. Never link to `href` — it is a legacy absolute storefront URL; use
  `/sida/{id}`.

## Caching

CMS content is static and read-heavy — cache it aggressively. Never mix
customer data into a cached CMS response.
