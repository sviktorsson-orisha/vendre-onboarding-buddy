# Variantväljare även på en variants produktsida

Idag visas variantväljaren bara när man landar på huvudprodukten. Kommer man in direkt på en variant (t.ex. "Off Shoulder Button Dress Green M") saknas väljaren helt.

## Så ska det fungera

- Landar man på en variant visas samma variantväljare som på huvudprodukten.
- Variantens egna val är förvalda (t.ex. Färg: Grön, Storlek: M), så man ser direkt var man är.
- Byter man val laddas den nya variantens namn, bild, text, pris och lagerstatus – precis som idag.
- Köpknappen lägger alltid den valda varianten i varukorgen, och är avstängd när varianten är slut och inte får köpas.
- Har produkten inga varianter ser sidan ut som idag.

## Verifierat mot butiken

- En variant har `parent_id` satt till huvudproduktens id (t.ex. produkt 271 → `parent_id: 188`).
- Variantfrågan mot en variants eget id ger tomt svar; den måste ställas mot huvudproduktens id, som svarar med Size och Color och alla val.

## Teknisk genomförande

- `src/types/vendre.ts`: lägg till `parent_id?: number | null` på `Product`.
- `src/lib/vendre/api.ts`: ta med `parent_id` i normaliseringen av VQL-produkter (och kategorilistningen om fältet finns där).
- `src/pages/ProductPage.tsx`:
  - Räkna fram `variantParentId = product.parent_id ?? product.id` och anropa `useProductVariants(variantParentId)`.
  - När sidans produkt är ett barn: initiera `selection` genom att för varje varianttyp välja det val vars `products` innehåller sidans produkt-id (görs en gång när variantdatan laddats, utan att skriva över användarens senare val).
  - Låt `activeProductId` falla tillbaka på sidans egna produkt-id när inget nytt val gjorts, så köpknappen fungerar direkt vid landning.
  - Lager-/köpbarhetslogiken utgår från den aktiva produktens post (samma regler som idag: blockerad bara när slut i lager och `stock_allow_checkout === false`).
- `.vendre/skills/pdp-products.md`: dokumentera att variantträdet alltid läses på `parent_id ?? id` och att en variants eget id ger tomt svar.
