# Category / product listing page (PLP)

Beskriver den fungerande implementationen i detta projekt. Källa: `GET /surface/2/categories/{id}`.
Enskild produkt: `pdp-products.md`. Frågespråk: `vql-queries.md`. Endpoint-sanning: `.vendre/knowledge/api-reference.md`.

## Filer

```text
src/routes/kategori.$id.tsx            route + validateSearch + head()
src/pages/CategoryPage.tsx             state, URL-styrning, layout
src/components/store/category-filters.tsx        filterlogik + desktop-sidebar
src/components/store/category-toolbar.tsx        antal + desktop-sortering + sort-helpers
src/components/store/category-mobile-controls.tsx mobil filter/sort i Sheet
src/lib/vendre/api.ts                  useCategory + categoryQuery-serialisering
src/mock/vendreResponses.ts            mockCategory (demo-läge)
src/types/vendre.ts                    CategoryResponse m.fl.
```

## Data-fält som faktiskt används

Från `CategoryResponse`:

- `header.name`, `header.text` (HTML, renderas med `dangerouslySetInnerHTML`), `header.image`
- `subcategory_list[]` → `id`, `name` (renderas som knapp-länkar)
- `product_list[]` → renderas av `ProductCard`
- `product_count` (visas en gång, i toolbaren)
- `page_index`, `page_count` (paginering; `page_limit`/`page_limits` används inte i UI:t)
- `sort_by`, `sort_order` (för att markera aktivt sorteringsval)
- `sort_options` / `sorts` (fallback-ordning) → `name`, `value` eller `sort_by`+`sort_order`, `selected`
- `filters[]` → `id`, `name`, `type`, `options[] (id, name, count)`, samt `min`/`max` för type 2

Allt annat som butiken returnerar ignoreras medvetet.

### Filtertyper

| type | Betydelse | Rendering | Skickas som |
| ---- | --------- | --------- | ----------- |
| 0 | Kategori-filter | Renderas **inte** (finns som subkategorilänkar) | – |
| 1 | Tag-filter | Kryssrutor på `option.id` | `tags[]=<id>` |
| 2 | Prisintervall (`min`/`max`, inga options) | Dubbelhandtags-slider | `pfrom` / `pto` |
| 4 | Spec-filter (options identifieras med **namn**, inte id) | Kryssrutor på `option.name` | `f[{filterId}][]=<namn>` |

`visibleFilters()` döljer type 0 samt filter utan användbara värden (tomma `options`, eller type 2 utan `min`/`max`).

## State, sortering, filtrering, paginering

All listningsstate ligger i URL:en — inget lokalt filter-state utom sliderns dragvärde.

`validateSearch` i `kategori.$id.tsx` normaliserar:

- `page` (positivt tal)
- `sort_by`, `sort_order` (endast `ASC`/`DESC`)
- `tags` – kommaseparerad sträng, t.ex. `m,xl`
- `specs` – `44:Bomull,44:Lin`, parsas till `{ "44": ["Bomull","Lin"] }`
- `pfrom`, `pto` – tal

`setSearch(patch, resetPage = true)` i `CategoryPage` navigerar med en ny search-funktion, tar bort tomma värden och nollställer `page` — utom vid sidbyte, där `resetPage = false`.

Sortering: **endast** alternativ som butiken returnerar. Finns inga `sort_options`/`sorts` visas ingen sorteringskontroll alls. Helpers: `sortOptionsOf`, `sortKeyOf`, `currentSortKey`, `applySort`.

Responsivt: desktop (`lg:`) har filtersidebar till vänster + sort-select i toolbaren. Under `lg` visas `CategoryMobileControls` — knapparna Filter (med badge för antal aktiva) och Sortera ovanför produktrutnätet, som öppnar Sheet från vänster respektive botten. Samma `FiltersContent` återanvänds i båda lägena via det delade `FilterProps`-objektet.

## Hur anropet görs

```tsx
const { data, isLoading, isFetching, error } = useCategory(id, query);
```

`useCategory` (i `src/lib/vendre/api.ts`) väljer adapter med `useVendreApi()`:
`isConfigured` från onboarding-contexten → `liveApi`, annars `demoApi` (`mockCategory`).
Anropa aldrig `liveApi`/mock direkt från en komponent.

- queryKey: `["vendre", api.mode, "category", id, query ?? null, scope]` där `scope` = market, valuta, språk och `prices_include_vat` från session-contexten.
- `staleTime` 5 min, `placeholderData: previous` → gammal lista ligger kvar och dimmas via `isFetching`.
- Live: `guarded(() => surfaceJson('categories/{id}' + categoryQuery(query)))`; `guarded` gör en re-bootstrap vid `SURFACE_SESSION_UNAUTHORIZED`/401.
- `categoryQuery` serialiserar: `page`, `limit`, `sort_by`, `sort_order`, `pfrom`, `pto`, `tags[]`, `f[{id}][]`.
- Demo: `mockCategory(id, query)` gör samma filtrering, sortering och paginering lokalt så UI:t beter sig identiskt.

## Edge-cases och fallgropar

- **Hitta aldrig på filter eller sorteringsalternativ.** Prisfilter och sort-listor renderas bara om butiken returnerar dem.
- **Spec-filter (type 4) har inga stabila option-id:n** — matcha på `option.name`, både i URL och i `f[..][]`.
- **Nullbara listor:** `product_list`, `subcategory_list`, `filters` kan vara `null` i live-svar. Använd alltid `?? []` / `?.length ?? 0`.
- **Filtrera aldrig i browsern** när listan är paginerad — `product_count` och `page_count` kommer från butiken.
- **Nollställ `page` vid varje filter-/sortändring**, annars landar man på en tom sida.
- **Prisslider:** commit sker på `onValueCommit`, och värden lika med `min`/`max` skickas som `undefined` så att URL:en inte fylls med default-intervall. Filtret döljs om `max <= min`.
- **Cachenyckeln måste innehålla market/valuta/språk/VAT** — priser ändras vid kontextbyte.
- **Visa produktantalet på ett ställe** (toolbaren), inte även under rubriken.
- **CORS:** `categories` är en egen policy i Surface-konfigurationen; 401 utan CORS-headers ser ut som ett generiskt CORS-fel.
- **Serverfel** visar felruta endast när ingen tidigare data finns — annars behålls senaste lyckade listning.
