# Kategorisida (PLP) enligt .vendre-instruktionerna

Bygger ut `/kategori/$id` från dagens enkla produktgrid till en fullständig PLP:
serverstyrd sortering, paginering och filter, URL-state, breadcrumbs,
underkategorier och SEO — precis som `.vendre/skills/category-plp.md`,
`caching.md` och `ecommerce-seo.md` beskriver.

## Vad sidan får

- **Header**: kategorinamn, beskrivningstext, antal produkter, bild om den finns.
- **Breadcrumbs**: byggs från menyträdet (`navigation/menus`) upp till startsidan.
- **Underkategorier**: kort/chips från `subcategory_list`, aktiv kategori markerad.
- **Sortering**: dropdown som skickar `sort_by` + `sort_order` till API:t.
- **Antal per sida**: väljare från `page_limits`.
- **Filter**: sidopanel (mobil: utfällbar) från `filters` i svaret — kryssrutor
  per värde plus prisintervall (`pfrom`/`pto`). Allt skickas till servern.
- **Paginering**: sidknappar från `page_index` / `page_count`.
- **Tomt läge**: tydligt meddelande + "rensa filter" när träfflistan är tom.
- **Laddning**: skelettkort istället för enbart spinner.

## URL-state

Allt filter-, sorterings- och sidläge ligger i query-parametrar
(`?page=2&sort_by=price&sort_order=ASC&tags[]=64&pfrom=100`), så länkar kan delas,
bakåtknappen fungerar och cache-nyckeln matchar länken. Filterändring nollställer
sidan till 1.

## Teknik

- `src/routes/kategori.$id.tsx`: `validateSearch` för query-parametrarna, samt
  `head()` som använder `meta_title`/`meta_description` från kategorin plus
  canonical, og/twitter och `BreadcrumbList` JSON-LD.
- `src/types/vendre.ts`: `CategoryQuery` utökas med `tags`, `pfrom`, `pto`.
- `src/lib/vendre/api.ts`: `categoryQuery()` serialiserar de nya parametrarna
  (arrayer som `tags[]=`), och `useCategory` får dem i sin query-nyckel
  tillsammans med marknad/valuta/språk/moms från `session/context` (enligt
  caching-skillen). Live-anropet är fortfarande `GET categories/{id}`.
- Demoläget: `mockCategory` filtrerar, sorterar och paginerar lokalt så att
  UI:t går att prova utan koppling till butiken.
- Nya presentationskomponenter under `src/components/store/`:
  `category-filters.tsx`, `category-toolbar.tsx` (sort + antal), `pagination.tsx`,
  `breadcrumbs.tsx`.
- Alla texter läggs in i `src/lib/i18n.tsx` (sv + en).

## Det jag saknar / antar

Vendres exakta filter-syntax (`filter` vs `f`) står inte i
`.vendre/knowledge/api-reference.md`. Jag implementerar `tags[]`, `pfrom` och
`pto` som dokumenterat i skillen, och verifierar filterparametrarna mot din
liveanslutning innan de aktiveras — om butiken inte svarar med `filters` visas
bara sortering och paginering.
