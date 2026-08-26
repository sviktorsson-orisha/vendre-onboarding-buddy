# Lyft Vendre Kickstarts setup-UI till startsidan

## Mål

Återskapa setup-startsidans visuella uttryck och komposition från projektet **Vendre Kickstart** så nära som möjligt, utan att ersätta eller utöka detta projekts befintliga Vendre-integration.

## Det som lyfts över

- Kickstarts Vendre-brandade sidram: vit sticky toppbar, `vendre`-ordmärke, ljus lavendelfärgad canvas och enkel footer.
- Samma visuella hero: eyebrow, stor displayrubrik med färgaccent och kort introduktion.
- Samma setup-komposition: sticky status-/progresspanel, segmenterad progress, tydlig nästa åtgärd samt vertikala expanderbara stegkort med statusmarkörer.
- Samma visuella system för kort, badges, statusprickar, tips, kodblock och primära/sekundära knappar.
- Kickstarts färg-, typografi-, radie- och skuggtokens som behövs för att sidan ska se likadan ut. Externa fonter laddas korrekt i root-head.
- Responsiv anpassning för den nuvarande mobilvyn och desktop.

## Anpassning till detta projekt

- `src/pages/Index.tsx` byggs om till Kickstarts visuella setupflöde och använder fortsatt projektets befintliga `testVendreConnection()`, `/api/vendre/status` och CORS-data.
- Nuvarande innehåll mappas till Kickstarts visuella stegstruktur: OAuth/Admin, credentials, origins/CORS, anslutningskontroll och klart-status.
- Status, fel, saknade secrets och testresultat fortsätter att komma från den redan byggda lokala anslutningslogiken; inga resultat fejkas.
- Sidan behåller svenska texter direkt i komponenterna. Kickstarts kompletta i18n-lager kopieras inte.
- Endast små presentationskomponenter som faktiskt behövs bryts ut under `src/components/vendre/`; ingen generell komponentportning görs.

## Filer

- Bygg om `src/pages/Index.tsx`.
- Lägg endast till nödvändiga presentationskomponenter, exempelvis branded shell och setup-steg.
- Uppdatera `src/styles.css` med de relevanta Kickstart-tokens och brand utilities.
- Uppdatera `src/routes/__root.tsx` enbart för fontlänkar och för att ta bort generisk root-metadata som krockar med sidans befintliga metadata.

## Det som uttryckligen inte lyfts över

- Ingen storefront, shop-route, produkt- eller varukorgskod.
- Ingen launch-dialog eller "launch storefront"-state.
- Ingen språkväxlare, i18n-katalog eller översättningsmotor.
- Ingen extra Vendre-klient, proxy, token-, origin- eller konfigurationslogik från Kickstart.
- Inga nya dependencies om samma UI kan byggas med projektets befintliga React, Tailwind och Lucide.

## Verifiering

- Kontrollera att credentials-kontrollen och `testVendreConnection()` fortfarande fungerar från den nya UI:n.
- Kontrollera låsta/öppna steg, progress, kopiering av CORS-JSON och samtliga statuslägen.
- Jämför visuellt mot Kickstarts startsida i desktop och mot den aktuella previewstorleken på cirka 795×727, samt verifiera att sidan inte har överlapp eller avklippt text.
- Bekräfta att bygget är grönt och att startsidans metadata är unik och app-specifik.
