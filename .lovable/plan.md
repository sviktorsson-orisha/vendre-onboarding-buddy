# Kategorisidan: bara Vendre-data + ny header-layout

Kontroll mot den anslutna butiken (GET /surface/2/categories/90) visar vad svaret faktiskt innehåller: `page_limits`, `sort_by`, `sort_order`, `filters` (typ 1 = tagg, typ 4 = spec) och `header`. Det finns **inget prisfilter** och **ingen lista med sorteringsalternativ** i svaret.

## Ändringar

### 1. Prisfiltret tas bort
Prisintervallet (från/till + Använd) var byggt på de dokumenterade `pfrom`/`pto`-parametrarna, inte på data från butiken. Det tas bort helt ur filterpanelen, ur URL-state och ur anropet. Endast filter som Vendre returnerar i `filters` renderas.

### 2. "Per sida"-dropdownen tas bort
Den byggde på `page_limits` som faktiskt kommer från Vendre, men eftersom den inte ska finnas tas kontrollen bort. Listan använder butikens `page_limit` som den är.

### 3. Sortering enbart från API:t
Vendre returnerar i dag bara aktuell sortering, inte valbara alternativ. Därför: om svaret innehåller en lista med sorteringsalternativ renderas den; saknas den visas ingen dropdown alls. Inga påhittade alternativ.

### 4. Ny header-layout i två kolumner
Kategorinamn, beskrivning och underkategoriknapparna hamnar i vänsterkolumnen (ca 2/3) och kategoribilden till höger (ca 1/3). Staplas under varandra på mobil. Bilden visas bara när `header.image` finns (den är tom i demo-/testkategorin men finns i andra kategorier).

### 5. Material-filtret (spec, type 4)
Vendre skickar även spec-filter vars alternativ saknar id. De skickas som spec/`f`-parameter i stället för `tags[]`, och filtreringen verifieras mot den riktiga butiken innan det är klart.

## Tekniskt

- `src/components/store/category-filters.tsx`: ta bort pris-fieldset; rendera taggfilter (`type 1`) via `tags[]` och spec-filter (`type 4`) via namnvärde.
- `src/components/store/category-toolbar.tsx`: ta bort per-sida-väljaren; rendera sorteringsselect endast om API-svaret ger alternativ.
- `src/types/vendre.ts`: ta bort `pfrom`/`pto` ur `CategoryQuery`, lägg till valfritt spec-filterfält och valfri `sort_options`-lista.
- `src/lib/vendre/api.ts`: sluta serialisera `pfrom`/`pto`, serialisera spec-filter.
- `src/pages/CategoryPage.tsx` + `src/routes/kategori.$id.tsx`: ta bort pris- och limit-parametrar ur URL-state, ny tvåkolumnsheader med underkategorier i vänsterkolumnen.
- `src/mock/vendreResponses.ts`: spegla verkligt svar (inga prisfilter), spec-filter i demoläge.
- `src/lib/i18n.tsx`: rensa oanvända nycklar (pris/från/till/per sida).
- Verifiering: typecheck + Playwright mot en riktig kategori i liveläge.
