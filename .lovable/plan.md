# Varukorg: klickbara produkter och korrekt summa

Två justeringar i varukorgs-panelen (`src/components/store/cart-sheet.tsx`). Ingen förändring av API-anrop eller cart-logik.

## 1. Klickbara produkter

Bild och produktnamn i varje varukorgsrad blir länkar till produktsidan (`/produkt/$id`), med `productId` från raden. Panelen stängs vid klick så att användaren landar på produktsidan. Plus/minus och papperskorgen förblir egna knappar utanför länken.

## 2. Korrekt summa

Dagens summa visar `cart.cart_total` rått med ett hårdkodat " kr", vilket blir fel när butiken returnerar ett annat/oformaterat värde eller när rader är nedsatta i pris.

Ny logik:
- Summan räknas ut från raderna: för varje rad används det gällande priset (specialpris om raden är nedsatt, annars ordinarie) gånger antal — samma regel som `resolvePrice` i `src/components/store/product-price.tsx`, så priset i raden och summan alltid stämmer överens.
- Summan formateras på samma sätt som övriga priser i butiken.
- Om butiken skickar med en egen formaterad totalsumma används den i första hand (butiken är sanningen för rabatter och frakt); den lokala uträkningen är fallback när fältet saknas eller inte går att tolka.

## Teknisk detalj

- `cart-sheet.tsx`: wrappa bild + namn i `<Link to="/produkt/$id" params={{ id: String(line.productId) }}>` och anropa `onOpenChange(false)` vid klick.
- Exponera en liten hjälpfunktion (i `product-price.tsx`) som ger radens gällande pris som tal, och summera `pris * quantity` över raderna.
- Endast presentationskod ändras; `useCart`/`useCartMutations` rörs inte.
