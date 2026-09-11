# Ett anrop i stället för två på produktsidan

## Varför det är två i dag

De två anropen hämtar olika saker:

1. själva produkten (namn, bild, pris, lager, specifikationer)
2. variantträdet (färg/storlek och vilka kombinationer som finns)

De görs var för sig eftersom de skrivs som två separata frågor i koden. Frågespråket
kan dock ta emot flera resurser i samma fråga, så i normalfallet går det att slå ihop
dem till ett enda anrop.

Ett undantag finns: om besökaren landar direkt på en variant (t.ex. "Blue M") ligger
variantträdet på huvudprodukten, och huvudproduktens id är inte känt förrän produkten
har hämtats. Då krävs fortfarande ett litet extra anrop.

## Vad som görs

- Slå ihop produkt + variantträd till en fråga vid första laddningen av produktsidan.
- Om det visar sig att den landade produkten är en variant: gör ett kompletterande
  anrop för huvudproduktens variantträd (bara i det fallet).
- Byte av variant fortsätter som i dag: ett anrop för den valda varianten, och redan
  besökta varianter återanvänds utan nytt anrop.

Resultat: en vanlig produktsida gör ett anrop i stället för två. En direktlänk till en
variant gör två.

## Teknisk del

- `src/lib/vendre/api.ts`
  - Ny funktion som skickar en kombinerad VQL-body:
    `{ query: { products: {...}, product_variant_types: { filters: { where: { product_id } } } } }`
    med samma fältval som i dag (`_all`, `image`, `specifications` respektive
    `product_variant_choices` med `products`-fälten inkl. `status`).
  - Återanvänd befintlig normalisering: produktmappningen från `vqlProduct` och
    `normalizeVariantTypes` bryts ut/anropas på delarna av det kombinerade svaret.
  - `getProduct` använder den kombinerade frågan; variantträdet läggs i React Query-cachen
    under nyckeln `["vendre", mode, "product-variants", "status-filter-v2", id, scope]` så
    att `useProductVariants` inte hämtar det igen.
  - Behåll `getProductVariants` och `vqlProduct` som de är — de används vid variantbyte
    och vid child→parent-fallet.
  - Behåll `vqlDisabled`-fallbacken till kategoriskanning oförändrad.
- `src/pages/ProductPage.tsx`: ingen ändrad logik; hookarna anropas som i dag och
  variantträdet läses ur cachen när det redan följde med produktsvaret.
- Verifiering med Playwright på `/produkt/188` (parent) och på en variant-URL: räkna
  VQL-anrop vid laddning och vid variantval, samt kontrollera att variantväljare,
  utgråade kombinationer och specifikationer fortfarande fungerar.
