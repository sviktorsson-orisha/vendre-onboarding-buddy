# Fixa summan i varukorgen

## Problemet

Varukorgen visar ibland "8107.967999999999 kr" i stället för "8 108 kr".

Butiken skickar med en färdigformaterad summa i de flesta svar, och den visas då
korrekt. Ibland saknas den, och då skriver varukorgen ut råvärdet precis som det
kommer – med alla decimaler från datorns flyttalsberäkning.

## Lösningen

När den färdiga texten saknas ska summan formateras på samma sätt som priserna i
butiken: tusentalsavgränsare, rätt valuta från sessionen och inga slumpmässiga
decimaler.

- Öre visas bara när summan faktiskt har ören (annars inga decimaler).
- Valutan hämtas från sessionens valutakod, med kronor som fallback.
- Ingen förändring när butiken skickar sin egen formaterade summa – den vinner
  fortfarande, så inget räknas om i frontend.

## Teknisk detalj

Ny hjälpfunktion i `src/lib/vendre/api.ts` (t.ex. `formatAmount(value, currency)`)
som använder `Intl.NumberFormat` med `sv-SE` och `style: "currency"` (eller
motsvarande suffix "kr"), avrundat till 2 decimaler och `maximumFractionDigits`
satt till 0 när beloppet är ett heltal.

`src/components/store/cart-sheet.tsx` rad 28–31 byter fallback från
`${cart.cart_total} kr` till `formatAmount(cart.cart_total, currency)`, där
valutakoden kommer från `useSessionContext()`.

Kontroll efteråt: typkontroll och bygg, samt att summan visas korrekt i
förhandsvisningen.
