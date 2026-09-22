# Lägg till i varukorgen ska summera med befintligt antal

## Problemet

När en produkt som redan ligger i varukorgen läggs till igen händer ingenting i antalet.
Anropet till butiken sätter ett **absolut** antal, inte ett tillägg: om raden redan har 1 st
och vi skickar "1", blir resultatet fortfarande 1. Samma sak om man anger 3 i antalsfältet
på produktsidan när raden redan har 3 — antalet står still.

## Lösning

Innan produkten läggs till läses den aktuella varukorgen från butiken. Finns produkten
redan som en rad skickas summan av befintligt antal plus det angivna antalet. Finns den
inte skickas antalet som vanligt.

- Gäller både knappen på produktkorten (+1) och antalsfältet på produktsidan.
- Rader matchas på produkt-id och samma varianter/attribut, så två olika varianter av
  samma produkt fortsätter vara skilda rader.
- Efter tillägget läses varukorgen om som idag, så antal och summa alltid kommer från
  butiken.
- Demoläget beter sig redan så här och påverkas inte.

## Tekniskt

`addToCart` i `src/lib/vendre/api.ts` (live-klienten) hämtar `getCart()` först, letar upp
raden med samma `productId` och matchande `attributes`, och skickar
`quantity: existing.quantity + quantity` i `PUT shopping-cart/products`. Misslyckas
läsningen faller den tillbaka på nuvarande beteende. `useCartMutations().add` är oförändrad
i sitt gränssnitt, så inga anropsställen behöver ändras.
