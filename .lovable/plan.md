# Orderdetaljer: visa produkter och totaler

## Nuläge (verifierat i koden)

- `OrdersView` i `src/pages/AccountPage.tsx` visar orderrader (namn, antal, pris) och totaler, men ingen produktbild.
- `normalizeOrderDetail` i `src/lib/vendre/account.ts` letar rader endast på `products` / `lines` / `items` i en tillplattad payload, där `flatten()` bara plockar upp nycklarna `account`, `customer`, `address`, `data`, `attributes` — alltså inte t.ex. `order`.
- Totalerna läses som enskilda strängfält (`shipping_total`, `tax_total`, `total`). Vendres orderdetaljer levererar i praktiken ofta en `totals`-array med `{ title, text, value }`.
- `OrderLine` i `src/types/vendre-account.ts` saknar bild-fält.

Exakt vilken form butiken returnerar för `GET accounts/me/order-history/{id}` är inte bekräftat ännu, så steg 1 nedan är att titta på det verkliga svaret innan normaliseringen skrivs om.

## Plan

1. **Verifiera svaret.** Logga in i storefronten mot butiken, hämta en riktig order via `accounts/me/order-history/{id}` och notera exakta nycklar för orderrader (namn, bild, antal, styckpris, radtotal) och totaler.
2. **Bredda normaliseringen** i `normalizeOrderDetail`:
   - låt `flatten()` även följa `order`-nyckeln så en order nästlad under `{ order: {...} }` hittas,
   - leta rader på fler alias (`products`, `order_products`, `lines`, `items`, `rows`),
   - per rad: namn (`name`/`product_name`/`title`), antal (`quantity`/`qty`), pris (`total_final_price`/`final_price`/`row_total`/`price`) och bild (`image`/`image_url`/`thumbnail`/`images[0]`), med relativa bild-URL:er upplösta mot butikens bas-URL på samma sätt som övriga bilder i appen.
3. **Totaler**: läs i första hand `totals`-arrayen och rendera varje rad med sin titel och sitt värde precis som butiken skickar dem; fall tillbaka på dagens enskilda fält när arrayen saknas. Inga belopp räknas ut i frontend.
4. **UI**: i orderdetaljvyn visas per rad bild (liten miniatyr med fallback när bild saknas), produktnamn, antal och pris. Totalerna listas under tabellen med ordertotalen markerad.
5. **Typer och demoläge**: utöka `OrderLine` med bildfält och `OrderDetail` med totals-lista, och uppdatera mockdatan i `src/mock/vendreAccount.ts` så demo-läget visar samma vy.
6. **Tomt läge**: om ordern saknar rader visas ett tydligt meddelande i stället för en tom tabell.

## Teknisk detalj

Ändringar sker i `src/lib/vendre/account.ts` (normalisering), `src/types/vendre-account.ts`, `src/pages/AccountPage.tsx`, `src/mock/vendreAccount.ts` och nya översättningsnycklar i `src/lib/i18n.tsx`. Orderdata fortsätter hämtas utan cache (`staleTime: 0`, `gcTime: 0`).
