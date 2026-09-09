# Orderdetaljer: produktbild och pris per rad

## Vad API:et faktiskt svarar

Jag loggade in som kunden och hämtade order 27. Svaret ligger under `order` och innehåller:

- Orderfakta: `id`, `status`, `date`, faktura- och leveransadress, `status_history`
- `products`: en rad per produkt med
  `id`, `product_id`, `name`, `model`, `quantity`, `price_each`, `price_total`, `tax`
- `totals`: färdiga rader med `title` och formaterad `text`
  (Sub Total, frakt, avrundning, moms, Total)

Två saker saknas därför i vyn idag:

1. **Ingen bild.** Orderraden innehåller ingen bild alls, bara `product_id`.
   Bilden måste hämtas separat. Jag har verifierat att ett VQL-anrop med flera
   produkt-id:n ger tillbaka rätt bilder.
2. **Tomt pris.** Raden har `price_each` / `price_total`, men koden letar bara
   efter namn som `price`, `final_price`, `total`. Priserna är dessutom
   exklusive moms (399,20 med `tax: 21`), medan ordertotalen är inklusive moms.

## Lösning

- Hämta produktbilder för orderns rader i ett extra anrop och visa dem i tabellen.
- Läs in `price_each` / `price_total` och visa priset **inklusive moms** som
  huvudpris, med priset **exklusive moms** i mindre text under.
- Totalraderna fortsätter komma direkt från API:et utan uträkning i frontend.

## Tekniskt

**`src/lib/vendre/account.ts`**
- `normalizeOrderDetail`: lägg till `price_total` och `price_each` i
  prisuppslagningen, spara `product_id` och `tax`, och ta fram både
  inkl.- och exkl.-momsvärde per rad.
- Ny hjälpare som efter orderhämtningen gör ett VQL-anrop:
  `POST vql` med `query.products.filters.where.id = [product_id, ...]` och
  `fields: ["id", { image: { fields: ["id","name","href"] } }]`, och mappar
  `image.href` till respektive rad. Ett fel i anropet får inte fälla ordervyn,
  raden visas då utan bild.
- Demodatan i `src/mock/vendreAccount.ts` får samma fältuppsättning.

**`src/types/vendre-account.ts`**
- `OrderLine` utökas med `product_id`, `price_incl` och `price_excl`
  (formaterade strängar) utöver befintliga `price` och `image`.

**`src/pages/AccountPage.tsx`**
- Priskolumnen visar priset inkl. moms med exkl. moms som mindre, dämpad text under.
- Bildkolumnen använder befintliga `StoreImage` med den hämtade bildlänken.

**Dokumentation**
- `.vendre/knowledge/api-reference.md` och
  `.vendre/skills/customer-account/references/account-pages.md` uppdateras med
  det verifierade svarsformatet för `accounts/me/order-history/{id}` och med att
  bilder måste hämtas via VQL på `product_id`.
