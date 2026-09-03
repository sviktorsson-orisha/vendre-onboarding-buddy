---
name: vendre-cms-pages
description: Vendre Surface v2 galleries are CMS text/information pages, not product collections - page tree, page description rendering, opt-in content blocks, boxes, Twig rendering, menu routing and relative image paths. Use when building content pages, footer links or navigation items of type information_page.
---

# Galleries are CMS pages (Surface v2)

**Galleries in Vendre are CMS pages** — text and information pages (about,
shipping, terms, guides). They are not product collections. Treating them as
categories or products is a recurring, hard-to-spot bug.

## Endpoints

- `GET /surface/2/galleries/pagetree` — the CMS page tree (navigation/sitemap)
- `GET /surface/2/galleries/{id}/pages` — the pages in a gallery, including each
  page's `title` and `description`
- `GET /surface/2/galleries/{id}/content-blocks` — structured page content
  (**opt-in only**, see below)
- `GET /surface/2/galleries/boxes` — reusable content boxes
- `POST /surface/2/twig/render` — Twig block rendering (resolves to the
  `default` CORS policy)

## Routing

Navigation menu items with type `information_page` point at galleries. Route
them to the CMS page route (`/sida/{id}` in this project), **never** to the
category or product view. Check the menu item type when building header, mega
menu and footer links.

**`pagetree` is the only source of page type.** It returns `tree` + a flat
`pages` list with `id`, `parent_id` (root = `0`), `title`, `href`, `is_menu`,
`children`. `is_menu: true` marks a real menu heading (Information,
Kundservice); `is_menu: false` is an ordinary content/listing page
(Inspiration). Footer groups = root nodes with `is_menu: true` and at least one
child. Never link to `href` — it is a legacy absolute storefront URL; use
`/sida/{id}`.

## Rendering — description only (default)

By default a CMS page renders **only the page's own `description`**. Content
blocks are deliberately not fetched.

- A page is listed inside its **parent** gallery, not its own. Resolve the
  parent from `galleries/pagetree`, then read `galleries/{parent_id}/pages` and
  pick the entry whose `id` matches the route param. Fall back to
  `galleries/{id}/pages` if the parent lookup finds nothing.
- Use `description`, falling back to `short_description`.
- **Sanitise the HTML** before injecting it, and resolve relative image paths
  against the store base URL or images silently break.
- Give each CMS route its own `head()` title/description from the page data, and
  include CMS pages in the sitemap (`GET sitemap?type=galleries`).

## Content blocks — opt-in only

Only fetch and render `GET galleries/{id}/content-blocks` when the user
explicitly asks for content blocks on the pages. Never add it as the default
page rendering.

When it is requested:

- Map each block type to a dedicated UI component: hero, rich text, image,
  image grid, CTA. Unknown block types degrade to plain rich text rather than
  disappearing.
- Block image paths are relative — resolve them against the store base URL.
- Sanitise all HTML coming from blocks.
- Decide with the user whether blocks replace the `description` or render below
  it; do not silently drop the description.

## Caching

CMS content is static and read-heavy — cache it aggressively. Never mix
customer data into a cached CMS response.
