# Enhetlig prisvisning via en Price-komponent

## Mål
Priser ska se likadana ut överallt:
- Nedsatt pris: nya priset i rött, gamla priset överstruket i grått bredvid.
- Ordinarie pris (ingen rabatt): svart/vanlig textfärg.
- Saknat pris: fallback-tecken i vanlig textfärg.

## Ny komponent
`src/components/store/product-price.tsx` med en `<ProductPrice />` som tar produkten (eller pris-fälten) plus en storleksvariant (`sm` / `md` / `lg`).

Logik:
- Rabatt gäller när `price_original_raw` och `price_raw` finns och `price_original_raw > price_raw`.
- Rabatterat pris får röd färg (befintlig `destructive`-token), gamla priset grått och överstruket (`muted-foreground` + `line-through`).
- Utan rabatt renderas bara priset i `foreground`.
- Använder befintlig `formatPrice` för formatering.

## Ställen som byts till komponenten
- `src/components/store/product-card.tsx` (produktbox i kategori/sök/start)
- `src/pages/ProductPage.tsx` (produktsidan, stor variant)
- `src/components/store/search-box.tsx` (autocomplete-förslag, liten variant)
- `src/components/store/cart-sheet.tsx` (radpris i varukorgen, liten variant)

Sökresultatsidan och kategorisidan använder redan `ProductCard` och får det automatiskt.

## Tekniska detaljer
- Endast presentation; ingen ändring i API-lager, mock-data eller typer.
- Färger tas från befintliga design-tokens, inga hårdkodade färgklasser.
- Överstruket originalpris får `aria-label`-vänlig markup (t.ex. `<s>`) så att skärmläsare inte läser det som gällande pris.
