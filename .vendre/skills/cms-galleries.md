---
name: vendre-cms-galleries
description: Vendre Surface v2 galleries are CMS text/information pages, not product collections - page tree, pages, description-only rendering, opt-in content blocks, reusable boxes, Twig rendering, information_page menu routing, relative image paths and CMS SEO. Use when building content pages, landing pages, promotional banners, footer links or menu items of type information_page.
---

# Galleries are CMS pages (Surface v2)

**Galleries in Vendre are CMS pages** — text and information pages (about,
shipping, terms, guides). They are not product collections. Treating them as
categories or products is a recurring, hard-to-spot bug.

`vendre-cms-pages` is the primary skill for CMS page behaviour — follow it when
the two disagree. This file adds gallery-level details (boxes, banners, Twig,
CORS).

## Endpoints

- `GET /surface/2/galleries/pagetree` — the CMS page tree (navigation/sitemap)
- `GET /surface/2/galleries/{id}/pages` — the pages in a gallery, including each
  page's `title` and `description` (this is the rendered content by default)
- `GET /surface/2/galleries/{id}/content-blocks` — structured page content
  (**opt-in only**)
- `GET /surface/2/galleries/boxes` — reusable content boxes and banners
- `POST /surface/2/galleries/twig/render` — Twig block rendering

CORS: gallery reads use the `galleries` policy; Twig rendering resolves to the
`default` policy. If a store install exposes Twig at `/surface/2/twig/render`
instead, keep the path configurable — both spellings exist in the wild.

## Routing

Navigation menu items with type `information_page` point at galleries. Route
them to the CMS page route (`/sida/{id}`), **never** to the category or product
view. Check the menu item type when building header, mega menu and footer links.

## Rendering — description only (default)

- Render only the page's own `description` (fallback `short_description`) from
  `galleries/{parent_id}/pages`; a page is listed inside its **parent** gallery,
  so resolve the parent from `galleries/pagetree` first.
- Sanitise the HTML and resolve relative image paths against the store base URL.
- Give each CMS route its own `head()` title/description from the page data, and
  include CMS pages in the sitemap (`GET sitemap?type=galleries`).

## Content blocks — opt-in only

Fetch `galleries/{id}/content-blocks` only when the user explicitly asks for
content blocks on the pages — never as the default. When requested, map each
block type to a dedicated component (hero, rich text, image, image grid, CTA),
degrade unknown types to rich text, sanitise the HTML and resolve relative image
paths against the store base URL.

## Caching

CMS content is static and read-heavy — cache it aggressively
(`vendre-caching`). Never mix customer data into a cached CMS response.
