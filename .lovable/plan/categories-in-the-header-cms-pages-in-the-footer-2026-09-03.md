# Categories in the header, CMS pages in the footer

Today both the header and the footer are built from the same menu list, and every
item is linked as if it were a category (`/kategori/{id}`). The store's menu
actually returns two different kinds of items:

- `menu_type: "category"` — product categories (e.g. Clothing), belong in the header
- `menu_type: "information_page"` — CMS pages (About us, Contact us, Privacy Policy,
  Availability …), belong in the footer and must link to a content page, not a category

The footer also shows hardcoded dummy links ("Shipping and delivery", "Returns",
"Contact us") that are not from the store at all.

## What changes

**Header**
- Renders only category items (desktop mega menu, mobile drawer). Information pages
  disappear from the header entirely.

**Footer**
- Renders only information pages, grouped into columns by their top-level parent
  ("Information", "Customer service", …), matching the store's own page tree.
- The hardcoded dummy list is removed, as is the category column.
- The brand wordmark and the short note stay.

**New content page**
- New route `/sida/{id}` that renders a CMS page from the store: heading, text and
  image blocks, with relative image paths resolved against the store URL and HTML
  sanitised before rendering.
- Page title and description feed the route's own `head()` metadata.
- Unknown block types fall back to plain rich text instead of vanishing.
- Friendly not-found and error states when a page id does not exist.

**Demo mode**
- Mock data gains a couple of information pages and their content so the demo
  storefront shows the same structure before the store is connected.

## Technical notes

- `buildMenuTree` currently keys nodes by `id` only; category and information_page
  ids overlap in the same list, so nesting can attach a page under a category. Keys
  become `source:id` and the tree is built per menu type.
- `useMenuTree()` gets two consumers: `useCategoryMenu()` (header) and
  `usePageMenu()` (footer), both filtering on `menu_type`.
- New adapter method `getPageContent(id)` → live: `GET /surface/2/galleries/{id}/content-blocks`
  (verified: returns `{ gallery_id, content_blocks: [{ id, key, sort_order, fields }] }`,
  e.g. `key: "2col-text-img"` with `img`/`text` HTML fields); demo: local mock.
  Cached like other static content; the page title comes from the menu item.
- Links use `<Link to="/sida/$id" params={{ id: String(item.entity_id) }}>` — the
  store's `target` field is an absolute legacy URL (`/gallery.php?id=17`) and is not used.
- Files touched: `src/components/store/store-header.tsx`,
  `src/components/store/store-footer.tsx`, `src/lib/vendre/api.ts`,
  `src/types/vendre.ts`, `src/mock/vendreResponses.ts`, `src/lib/i18n.tsx`
  (remove dummy strings), new `src/routes/sida.$id.tsx`.
- `.vendre/skills/navigation-menus.md` is updated to state the header/footer split
  and the `information_page` → `/sida/$id` routing explicitly.
