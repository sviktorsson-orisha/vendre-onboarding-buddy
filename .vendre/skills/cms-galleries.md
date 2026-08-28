---
name: vendre-cms-galleries
description: Vendre Surface v2 galleries are CMS text/information pages, not product collections - page tree, pages, content blocks, reusable boxes, Twig rendering, information_page menu routing, relative image paths and CMS SEO. Use when building content pages, landing pages, promotional banners, footer links or menu items of type information_page.
---

# Galleries are CMS pages (Surface v2)

**Galleries in Vendre are CMS pages** — text and information pages (about,
shipping, terms, guides). They are not product collections. Treating them as
categories or products is a recurring, hard-to-spot bug.

## Endpoints

- `GET /surface/2/galleries/pagetree` — the CMS page tree (navigation/sitemap)
- `GET /surface/2/galleries/{id}/pages` — pages in a gallery
- `GET /surface/2/galleries/{id}/content-blocks` — the actual page content
- `GET /surface/2/galleries/boxes` — reusable content boxes and banners
- `POST /surface/2/galleries/twig/render` — Twig block rendering

CORS: gallery reads use the `galleries` policy; Twig rendering resolves to the
`default` policy. If a store install exposes Twig at `/surface/2/twig/render`
instead, keep the path configurable — both spellings exist in the wild.

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

## Caching

CMS content is static and read-heavy — cache it aggressively
(`vendre-caching`). Never mix customer data into a cached CMS response.
