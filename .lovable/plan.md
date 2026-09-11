# Färre anrop på produktsidan

## Problemet

Produktsidan gör i dag tre separata anrop till butikens frågetjänst för i praktiken
samma information:

1. produkten (som redan innehåller specifikationerna),
2. varianterna,
3. specifikationerna – igen, i ett eget anrop.

Väljer man sedan en variant hämtas variantens produkt en gång till, på ett eget
ställe i cachen, trots att samma produkt kan ha hämtats tidigare. Det blir extra
väntetid utan att något nytt visas.

## Lösning

1. Specifikationerna läses direkt ur produktsvaret som redan hämtats. Det separata
   specifikationsanropet görs bara om produktuppgifterna undantagsvis kommer från
   en kategorilistning, där specifikationer saknas.
2. Produkt och variantprodukt delar samma plats i cachen, så en produkt som redan
   är hämtad inte hämtas igen när man klickar runt bland varianter (och tillbaka).
3. Variantträdet fortsätter vara ett enda anrop, oförändrat.

Resultat: normal produktsida går från tre anrop till två, och variantklick återanvänder
det som redan hämtats.

## Teknisk detalj

- `src/lib/vendre/api.ts`:
  - `useVariantProduct` byter till samma queryKey-familj som `useProduct`
    (`["vendre", mode, "product", String(id), scope]`) och samma `queryFn`
    (`api.getVariantProduct`), så parent och variantbarn delar cache.
  - `useProduct` får med `scope` i nyckeln och tappar `categoryId` som nyckel-del
    (den påverkar bara fallback-vägen, inte resultatet).
  - `useProductSpecifications` får en `enabled`-styrning från anroparen så den bara
    kör när specifikationer inte redan finns på det laddade produktobjektet.
- `src/pages/ProductPage.tsx`:
  - `const specifications = view?.specifications?.length ? view.specifications : (specificationList ?? [])`.
  - Hooken anropas fortfarande ovillkorligt (inga villkorliga hooks) men med
    `enabled: false`-effekt via ett nytt andra argument när `view.specifications`
    redan är ifyllt.
- Verifiering: öppna produktsida 188 i preview och räkna `vql`-anropen i
  nätverksloggen (ska vara 2: produkt + varianter), välj en variant och kontrollera
  att namn, pris, lager, bild och specifikationer uppdateras och att en redan
  besökt variant inte hämtas om.
