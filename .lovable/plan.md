# Orderdetaljer: produktbild och pris per rad

## Vad API:et faktiskt svarar

Jag loggade in som saraviktorsson@hotmail.com och h�mtade order 27.
Svaret ligger under `order` och inneh�ller:

- Orderfakta: `id`, `status`, `date`, kund- och leveransadress, `status_history`
- `products`: en rad per produkt med
  `id`, `product_id`, `name`, `model`, `quantity`, `price_each`, `price_total`, `tax`
- `totals`: f�rdiga rader med `title` och formaterad `text` (Sub Total, frakt, avrundning, moms, Total)

Tv� saker saknas d�rf�r idag i vyn:

1. **Ingen bild.** Orderraden har ingen bildsl�ngd alls � bara `product_id`.
   Bilden m�ste h�mtas separat. Jag har verifierat att ett VQL-anrop med flera
   produkt-id:n ger tillbaka r�tt bilder.
2. **Priset visas tomt.** Raden anv�nder `price_each` / `price_total`, men
   koden letar bara efter namn som `price`, `final_price`, `total`. Priserna �r
   dessutom exklusive moms (399,20 med `tax: 21`), medan ordertotalen �r inklusive moms.

## L�sning

- H�mta produktbilder f�r orderns rader i ett enda extra anrop och visa dem i tabellen.
- L�sa in `price_each` / `price_total` och visa priset **inklusive moms** som huvudpris,
  med priset **exklusive moms** i mindre text under.
- Totalraderna forts�tter komma direkt fr�n API:et utan ber�kning.

## Tekniskt

**`src/lib/vendre/account.ts`**
- `normalizeOrderDetail`: l�gg till `price_total`, `price_each` i pris-uppslagningen,
  spara `product_id`, `tax`, samt r�a v�rden f�r inkl./exkl. moms.
- Ny hj�lpare som, efter att ordern h�mtats, g�r ett VQL-anrop:
  `POST vql` med `query.products.filters.where.id = [product_id, ...]` och
  `fields: ["id", { image: { fields: ["id","name","href"] } }]`, och mappar
  `image.href` till respektive rad. Fel i anropet f�r inte f�lla ordervyn � d� visas raden utan bild.
- Demo-datan (`src/mock/vendreAccount.ts`) f�r samma f�ltupps�ttning.

**`src/types/vendre-account.ts`**
- `OrderLine` ut�kas med `product_id`, `price_incl` och `price_excl` (formaterade str�ngar)
  ut�ver befintliga `price` och `image`.

**`src/pages/AccountPage.tsx`**
- Priskolumnen visar priset inkl. moms och exkl. moms som mindre, d�mpad text under.
- Bildkolumnen anv�nder befintliga `StoreImage` med den h�mtade bildl�nken.

**Dokumentation**
- `.vendre/knowledge/api-reference.md` och `.vendre/skills/customer-account/references/account-pages.md`
  uppdateras med det verifierade svarsformatet f�r `accounts/me/order-history/{id}`
  och med att bilder m�ste h�mtas via VQL p� `product_id`.
