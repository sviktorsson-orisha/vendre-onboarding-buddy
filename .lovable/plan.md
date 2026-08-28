# Från setup-guide till färdig butik

När alla sex steg i guiden är gröna visas en popup: "Allt klart – butiken är ansluten". Knappen "Börja bygga" markerar setupen som klar, guiden försvinner helt och en färdig storefront tar över hela sajten. Butiken finns färdigbyggd i templaten och hämtar allt innehåll live från kundens egen Vendre-butik – inga credits går åt till att bygga upp den.

## Så fungerar övergången

- Guiden räknas som klar när anslutningstestet är grönt. En flagga sparas lokalt (`vendre.setup-complete`) tillsammans med butikens bas-URL och valt domännamn.
- Popupen (modal) visas automatiskt första gången testet blir grönt, med sammanfattning (bas-URL, origin, verifierade steg) och knappen "Börja bygga".
- Efter klick: `/` renderar butiken i stället för guiden. Guiden ligger kvar som kod men nås inte från navigationen (kan återställas via att rensa flaggan).
- Popup och all butikstext finns på både svenska och engelska via befintlig i18n-store.

## Butiken som ingår i templaten

Alla sidor läser riktig data från Surface v2. Ingen demo- eller platshållardata: saknas innehåll visas ett tydligt tomt läge eller felmeddelande.

- **Startsida** – hero, utvalda kategorier, produktgrid från butikens toppkategori.
- **Kategori (PLP)** – produktlista med paginering, sortering, filter och underkategorier.
- **Produkt (PDP)** – bilder, pris (med VAT-flagga), varianter, lagerstatus, lägg-i-varukorg.
- **Infosidor / CMS** – innehållssidor och gallerier som menyn pekar på.
- **Navigation** – header-meny, mega-meny och footer byggda på butikens egna menyer, plus brödsmulor.
- **Logga, butiksnamn, valuta, språk och VAT** – hämtas från sessionens store-context, inget hårdkodat.
- **Varukorg** – drawer med antal, ta bort, rabattkod och totalsumma; alltid live-data.
- **Konto** – registrering, inloggning, profil, adresser och orderhistorik.
- **Checkout-start** – riktig webbläsarnavigering till butikens egen checkout så sessionscookien följer med.
- **SEO** – egen titel/description/og per route samt JSON-LD för produkt och kategori.

## Teknisk uppbyggnad

Allt baseras enbart på projektets egna filer `.vendre/knowledge/general.md` och `.vendre/skills/setup.md` samt befintlig `src/lib/vendre/`-kod.

Nya/ändrade delar:

- `src/lib/vendre/setup-state.ts` – flagga för slutförd setup (samma mönster som `published-origin.ts`).
- `src/lib/vendre/session.tsx` – bootstrappar sessionen en gång och gate:ar alla andra anrop på ett delat `ready`-löfte; exponerar store-context (namn, logga, valuta, språk, VAT).
- `src/lib/vendre/api.ts` – typade läsare ovanpå `surfaceJson`: menyer, kategorier, produkter, gallerier, varukorg, konto.
- `src/lib/vendre/cart.tsx` – varukorgsstate; varje mutation skickar `Surface-Mutation-Protection-Token` och hämtar om varukorgen direkt (ingen cachning av varukorg/session/konto).
- `src/components/store/*` – header, mega-meny, footer, produktkort, PLP-filter, PDP-galleri, cart-drawer, kontoformulär.
- Nya routes under `src/routes/`: `index` (butik eller guide), `kategori/$slug`, `produkt/$slug`, `sida/$slug`, `varukorg`, `konto` (+ inloggning/order/adresser).
- `src/pages/Index.tsx` behåller guiden men renderas bara när setup inte är klar; popupen läggs till där.
- Cachning: menyer, kategorier, CMS och produktlistor cachas klientsidan; varukorg, session och konto hämtas alltid färskt.
- 401 → en re-bootstrap och nytt mutation-token; 429 → backoff enligt `Retry-After`.

## Att tänka på

- Konto- och checkout-flödena kräver att fler CORS-policyer är allowlistade i Vendre Admin (bl.a. `default` för `accounts*`, `customer`, `shopping_cart`, `login`, `categories`, `navigation_menus`, `galleries`). Steg 4 i guiden uppdateras så att den kopierbara JSON:en täcker allt butiken använder.
- Butiken speglar kundens sortiment; är butiken tom i Vendre blir sidorna tomma (medvetet, enligt valet "endast riktig data").
