# Produktsök med autocomplete och sökresultatsida

## Vad du får

- Sökfältet i headern (desktop + en sökikon på mobil) blir aktivt.
- Efter 3 inskrivna tecken visas en dropdown med upp till 5 produktförslag: bild, namn och pris.
- Tangentbordsstöd: pil upp/ner, Enter för att öppna produkt, Escape för att stänga.
- Längst ner i dropdownen en rad "Visa alla resultat för …" som leder till `/sok?q=…`.
- Ny sökresultatsida `/sok` med rubrik, träffantal, produktrutnät (samma produktkort som PLP), paginering och tomt-läge.
- Fungerar i både demoläge (mockdata) och live-läge (Vendre), precis som resten av butiken.

## Datakälla

Surface v2 har ingen dedikerad sök-endpoint i projektets API-referens. Sök byggs därför i två steg i adaptern:

1. **VQL först** – `POST /surface/2/vql` mot produktresursen med fritextfilter, endast de fält kortet renderar.
2. **Fallback** – installationer där VQL är avstängd svarar 500 på alla body-varianter. Då upptäcks det en gång per session och sök faller tillbaka på `GET /surface/2/categories/{id}` för kategorimenyns kategorier, med namn-/modellmatchning och deduplicering på produkt-id.

Demoläget filtrerar mockprodukterna på samma sätt, så UI:t är identiskt.

## Teknisk plan

- `src/lib/vendre/api.ts`: ny `searchProducts(query, { limit, page })` i `VendreApi` (live + demo), plus `useProductSearch`-hook. Cachas med `staleTime` och samma cache-scope som PLP (marknad/valuta/språk/moms); debounce 250 ms, körs först vid ≥3 tecken.
- `src/lib/vendre/client.ts`: används oförändrat via `guarded()`/`surfaceJson` så sessionsgrind, mutation-token och 401-återbootstrap gäller även sök.
- `src/types/vendre.ts`: typer för VQL-svar och `SearchResult { products, product_count, page_count }`.
- `src/mock/vendreResponses.ts`: `mockSearch(query, limit, page)` över befintliga mockprodukter.
- Ny `src/components/store/search-box.tsx`: input + dropdown (Popover/Command-mönstret som redan finns i ui-mappen), a11y med `role="listbox"`, klick-utanför och Escape.
- `src/components/store/store-header.tsx`: ersätter det statiska input-fältet med `SearchBox`; på mobil en sökikon som fäller ut fältet.
- Ny route `src/routes/sok.tsx` med `validateSearch` för `q` och `page`, egen `head()` (titel/description/og), och `src/pages/SearchPage.tsx` som återanvänder `ProductCard` och `Pagination`.
- `src/lib/i18n.tsx`: nya nycklar på svenska och engelska (platshållare, "Visa alla resultat", "Inga träffar", "träffar").

## Utanför scope

Ingen ändring av PLP, PDP, kundvagn eller uppstartsguiden.
