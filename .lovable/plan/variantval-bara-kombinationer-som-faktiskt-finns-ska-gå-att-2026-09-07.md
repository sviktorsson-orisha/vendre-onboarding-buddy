# Variantval: bara kombinationer som faktiskt finns ska gå att klicka på

## Problemet

På produktsidan går alla variantval att klicka på, även kombinationer som inte
existerar eller som pekar på en produkt som inte är aktiv. Har man valt Blå ska
Large vara utgråad om Blå/Large inte finns — och står man på Grön/Large ska Blå
inte gå att klicka på.

## Så här löser vi det

1. **Hämta aktiv-status per variantprodukt.** Variantfrågan mot butiken utökas
   med produktens aktiv-flagga (utöver lagerfälten som redan hämtas). Saknas
   fältet i svaret behandlas produkten som aktiv, precis som idag för lager.
2. **Räkna ut vilka val som är möjliga utifrån de andra valen.** För varje
   knapp: ta produkterna bakom valet, filtrera bort inaktiva, och kontrollera
   att minst en av dem också finns bakom alla val som gjorts i de *andra*
   variantgrupperna. Finns ingen sådan produkt är knappen utgråad och
   inaktiverad.
3. **Behåll dagens lagerregel.** Ett val gråas också ut när alla produkter bakom
   det är slut och inte får köpas vid nollager (`stock_allow_checkout === false`).
   Slut i lager men köpbart förblir klickbart.
4. **Byt val utan att fastna.** Klickar man på en färg som inte finns i den redan
   valda storleken låser vi inte in användaren: valet i den gruppen behålls bara
   om det fortfarande är möjligt, annars nollställs det så man kan välja om.
5. **Landning direkt på en variant** fungerar som idag: variantväljaren visas med
   den variantens val förvalda, och övriga knappar följer samma regler.

Köpknappen fortsätter kräva ett val i varje grupp och en giltig, köpbar produkt.

## Teknisk detalj

- `src/lib/vendre/api.ts`: lägg till aktiv-fältet i `products`-fältlistan i
  VQL-frågan för `product_variant_types` och normalisera det (`null`/saknat =
  aktivt).
- `src/types/vendre.ts`: utöka `ProductVariantChoice["products"]` med fältet.
- `src/pages/ProductPage.tsx`: ersätt `choiceBlocked` med en funktion som tar
  hänsyn till valen i övriga typer (snittet av produkt-id:n), plus befintlig
  lager- och aktiv-kontroll; rensa ogiltiga val i `setSelection`.
- `src/mock/vendreResponses.ts`: spegla fältet i demodatan så demoläget beter sig
  likadant.
- Uppdatera `.vendre/skills/pdp-products.md` med regeln.
