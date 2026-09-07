# Varianter på produktsidan

Produktsidan ska visa riktiga variantval (t.ex. storlek) hämtade från butiken, och köpknappen ska lägga rätt variant i varukorgen.

## Så fungerar det för kunden

- Under produktnamnet visas en rubrik per varianttyp (t.ex. "Size") med en knapp per val (S, M, L), sorterade i butikens ordning.
- Val som är slut i lager visas utgråade och går inte att klicka på.
- När ett val är valt uppdateras pris och lagerstatus till den valda variantens värden.
- Köpknappen är avstängd tills ett val gjorts i varje varianttyp, och lägger sedan den valda varianten i varukorgen.
- Har produkten inga varianter ser sidan ut precis som idag.
- I demoläget (innan butiken är kopplad) visas samma upplägg med exempelvarianter.

## Verifierat mot butiken

Frågan fungerar mot den kopplade butiken. Produkt 188 svarar med varianttypen "Size" och tre val (S/M/L) som pekar på produkterna 267, 268 och 269, var och en med `in_stock`. Svaret ligger direkt under `query` (inte `data.query`), och fältet `quantity` returneras inte — därför används endast `in_stock`.

## Teknisk genomförande

- `src/types/vendre.ts`: nya typer `ProductVariantType`, `ProductVariantChoice` (id, name, sort_order, products[{ id, in_stock, quantity? }]).
- `src/lib/vendre/api.ts`:
  - `getProductVariants(productId)` i live-adaptern: `POST vql` med den angivna frågan; läser `query.product_variant_types` och tolererar även `data.query.*`. Filtrerar bort val utan produkter, sorterar på `sort_order`. Fel/500 → tom lista (ingen variantsektion visas), sätter inte den globala VQL-flaggan för sök.
  - Motsvarande mock i demo-adaptern som återanvänder befintlig storleks-mock.
  - `useProductVariants(productId)` — cachad likt `useProduct` (5 min, nyckel inkl. cache-scope för marknad/valuta/språk).
- `src/pages/ProductPage.tsx`:
  - Ersätter dagens `product.attributes`-baserade knappar med variantdata från VQL (attribut-fallbacken behålls om VQL inte ger något).
  - State: valt `choice.id` per varianttyp. Vid flera typer filtreras övriga typers val till de som fortfarande ger en giltig produkt (val vars `products` är tomt döljs/inaktiveras).
  - När alla typer är valda: hämtar den valda variantens produktdata via `useProduct(valdProduktId)` och visar dess pris (`ProductPrice`) och lagerstatus i stället för huvudproduktens.
  - Köpknappen skickar den valda variantens produkt-id till `add.mutate` (inga extra variantparametrar).
- `src/lib/i18n.tsx`: nya nycklar för "Välj variant"-hjälptext och sluts åld-etikett (sv/en).
- `.vendre/skills/pdp-products.md` uppdateras med den verifierade VQL-frågan, svarsformen och regeln att `choice.products[0].id` är produkten som läggs i varukorgen.
