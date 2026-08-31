# Live Vendre-data när butiken är kopplad

När uppstartsguiden är grön (Live Mode) hämtas kategorier, produkter, priser och varukorg från Vendre Surface v2 i stället för dummy-data. Demo Mode med dummy-data ligger kvar oförändrat tills anslutningen är verifierad.

## Beteende

- Demo Mode (okonfigurerad): exakt som idag, lokal dummy-data och demo-banner.
- Live Mode: startsida, kategorisidor, produktsidor, navigation, priser och varukorg kommer från butiken.
- Fel i Live Mode (CORS, 401, 429, tomt svar): sidan visar ett tydligt felkort med orsak och en knapp "Öppna uppstartsguiden". Ingen tyst återgång till dummy-data.

## Datalager

Nytt sessions- och datalager under `src/lib/vendre/` och `src/lib/storefront/`:

- `session.ts`: `POST session/bootstrap` exakt en gång vid appstart, sparar mutation-token i en modulvariabel, delad `ready`-promise som alla andra anrop väntar på. `GET session/context` ger butiksnamn, valuta, språk och `prices_include_vat`.
- `catalog.ts`: `GET navigation/menus` (header/footer), `GET categories/{id}` (kategorisida med underkategorier, produkter, sortering, paginering), produktdetalj via `POST vql` med fallback till kategori-payload om VQL returnerar 500.
- `cart.ts`: `GET shopping-cart` (aldrig cachad), `POST shopping-cart/products` och `DELETE shopping-cart` med `Surface-Mutation-Protection-Token`. Optimistisk lokal uppdatering, debounce ~500 ms, ett inflight-anrop i taget, reconcile mot serverns svar, rollback vid fel. Vid session-401: en re-bootstrap, nytt token, retry.
- Kassaknappen flushar pending-synk, gör en färsk `GET shopping-cart`, jämför och navigerar sedan med riktig webbläsarnavigering till butikens checkout.

`src/lib/storefront/data.ts` blir en switch: samma funktionssignaturer som idag, men de läser från Vendre när `isConfigured` är sant och från `src/mock/dummyData.ts` annars. Sidorna behåller sina nuvarande props-former, så UI-komponenterna ändras minimalt.

## Sidor

- Startsida: hero och utvalda produkter från butikens rotkategori/menyer i Live Mode.
- Kategorisida: server-sidig sortering och paginering via query-parametrar i URL:en, antal produkter från svaret.
- Produktsida: varianter, lagerstatus, bildgalleri och pris från butiken; "Lägg i varukorg" mot shopping-cart.
- Header/footer: butiksnamn, valuta och menyer från session context respektive `navigation/menus` i Live Mode.

## Teknisk detalj

- Alla Surface-anrop går direkt från webbläsaren via befintlig `surfaceFetch` med `credentials: "include"`; endast `oauth/token` ligger kvar serverside.
- Priser formateras utifrån `currency.code` och `prices_include_vat` från session context — inga hårdkodade antaganden.
- Cachning: menyer och kategorier cachas per språk/valuta/marknad; varukorg och session cachas aldrig. Alla priscacher invalideras efter `POST session`.
- Rutter använder slug i URL:en; slug-till-id-mappning görs via meny-/kategoripayloaden och sparas i en modulcache.
- Setup-invarianten rörs inte: `npm run verify:setup` körs och ska passera.
