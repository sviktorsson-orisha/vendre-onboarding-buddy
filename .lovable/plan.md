# Visa alla adresser i adressboken

## Vad vi vet

Adressvyn hämtar `GET accounts/me/addresses` och plockar ut listan endast om svaret är en array eller har en av nycklarna `addresses`, `address_list` eller `data`. Rendering av huvudadress + övriga adresser i två kolumner fungerar redan, så problemet ligger i hur svaret tolkas — inte i vyn.

Vilken form butiken faktiskt returnerar är inte bekräftat (endpointen kräver inloggad kundsession). Så första steget är att se det råa svaret, inte att gissa.

## Steg 1 — Bekräfta svarets form

Logga (tillfälligt, endast i utvecklingsläge) det råa JSON-svaret från `accounts/me/addresses` och läs av:

- är svaret en array, ett objekt med en listnyckel, eller ett objekt med adress-objekt per nyckel?
- vilken nyckel heter listan (t.ex. `address_book`, `items`, `entries`, `results`)?
- innehåller svaret bara huvudadressen, dvs. saknas de alternativa adresserna redan i API-svaret?

Om svaret visar att Vendre bara skickar en adress är det ett butiks-/behörighetsproblem och vi rapporterar det istället för att koda runt det.

## Steg 2 — Gör listuttaget robust

Utifrån bekräftad form:

- utöka listuttaget med den faktiska nyckeln plus vanliga varianter (`address_book`, `items`, `entries`, `results`, `rows`)
- stöd ett inkapslat objekt (t.ex. `data.addresses`) genom att leta en nivå djupare
- stöd formen "objekt med numeriska nycklar" genom att ta objektets värden när ingen array hittas
- deduplicera på `id` så att huvudadressen inte dubbleras

## Steg 3 — Verifiera

Ladda om `/mitt-konto/adresser` med testkontot och kontrollera att huvudadressen visas överst med badge och att övriga adresser listas i två kolumner. Ta bort loggningen från steg 1.

## Teknisk detalj

Berörda filer: `src/lib/vendre/account.ts` (`asArray`-uttaget i `getAddresses`, ev. `normalizeAddress`). Inga ändringar i `AccountPage.tsx` behövs om inte svaret visar sig sakna `is_default_shipping`/`is_default_billing`.
