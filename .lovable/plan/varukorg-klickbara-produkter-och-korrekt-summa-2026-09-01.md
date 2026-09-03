# Varukorg: klickbara produkter och korrekt summa

Två justeringar i varukorgs-panelen (`src/components/store/cart-sheet.tsx`). Ingen förändring av API-anrop eller cart-logik.

## 1. Klickbara produkter

Bild och produktnamn i varje varukorgsrad blir länkar till produktsidan (`/produkt/$id`), med `productId` från raden. Panelen stängs vid klick så att användaren landar på produktsidan. Plus/minus och papperskorgen förblir egna knappar utanför länken.

## 2. Korrekt summa

Summan ska alltid komma från Vendre — ingen uträkning i frontend.

Dagens kod visar `cart.cart_total` rått med ett hårdkodat " kr", vilket blir fel när butiken returnerar totalen i ett annat fält eller redan formaterad.

Ny logik:
- Först inspekteras det faktiska svaret från `GET /surface/2/shopping-cart` för att se exakt vilket/vilka totalfält butiken returnerar (t.ex. formaterad total och rått belopp).
- Cart-typen i `src/types/vendre.ts` utökas med de fält som faktiskt finns, och varukorgen visar butikens formaterade total som den är. Finns bara ett rått belopp formateras det på samma sätt som övriga priser.
- Mockdatan i demo-läge får samma fält så demo och live ser likadana ut.

## Teknisk detalj

- `cart-sheet.tsx`: wrappa bild + namn i `<Link to="/produkt/$id" params={{ id: String(line.productId) }}>` och anropa `onOpenChange(false)` vid klick.
- Totalen läses direkt från cart-svaret; ingen summering över raderna.
- `useCart`/`useCartMutations` och API-anropen rörs inte.

