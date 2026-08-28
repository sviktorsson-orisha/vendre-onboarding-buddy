---
name: vendre-navigation-menus
description: Vendre Surface v2 navigation - navigation/menus for header, mega menu, drawer and footer, menu item types and routing, breadcrumbs from the category hierarchy, and active state. Use when building site navigation or breadcrumbs against Vendre.
---

# Navigation and breadcrumbs (Surface v2)

## Endpoints

- `GET /surface/2/navigation/menus` — header, mega menu, drawer, footer.
- `GET /surface/2/categories/{id}` — category details for breadcrumb chains.

## Routing by menu item type

Menu items carry a type. Route them accordingly:

- category items → the PLP route (`vendre-category-plp`)
- `information_page` items → the CMS page route (`vendre-cms-galleries`) —
  never the category or product view
- external/URL items → plain links

## UX

Accessible, responsive mega menu and drawer; breadcrumbs built from the Vendre
category hierarchy; the active category/page highlighted from the current route
params.

## Caching

Menus and category trees change rarely — cache aggressively with
stale-while-revalidate, keyed by language/market (`vendre-caching`).
