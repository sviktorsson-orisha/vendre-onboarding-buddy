# Komplettera uppstartsguiden med Kickstarts saknade steg

## Varför saknas stegen idag

Förra lyftet gällde uttryckligen bara det *visuella* uttrycket från Vendre Kickstart
(brandad ram, hero, sticky progresspanel och stegkort). Stegens innehåll behölls
från detta projekts egen guide — därför blev det fem steg med vår egen struktur
istället för Kickstarts. Ingen av Kickstarts stegspecifika funktioner (domänfält,
per-steg-kontroll, "Vad vill du bygga först?", go-live-noteringar) kom med.

## Kickstarts faktiska stegordning

1. Skapa OAuth-nycklar i Vendre Admin
2. Lägg in nycklarna i projektet (credentials)
3. Publicera och välj ett enklare domännamn
4. Allowlista storefrontens adresser för CORS
5. Verifiera sessionen

Plus två block utanför stegen: "Vad vill du bygga först?" (visas när anslutningen
är grön) och go-live-noteringar längst ner.

## Vad som byggs

### Nytt steg 3 — "Publicera och välj ett enklare domännamn"

- Förklarar att kunden publicerar i Lovable och väljer ett läsbart domännamn
  (t.ex. `spring-board.lovable.app`) istället för den långa `project--<uuid>`-adressen.
- Inmatningsfält som accepterar `spring-board`, `spring-board.lovable.app` eller
  full https-adress, med Använd/Rensa-knappar och tydligt fel vid ogiltigt värde.
- Adressen sparas lokalt i webbläsaren och visas som bekräftelse i steget.
- Steget markeras som klart när en adress är sparad (eller när anslutningen redan
  är verifierad). Det är ett manuellt steg — inget tekniskt test.

### CORS-steget uppdateras

- Den sparade domänen läggs automatiskt först i listan över origins, och ingår i
  båda kopierbara JSON-blocken (Origins JSON och Policies JSON) tillsammans med
  de stabila preview- och publish-adresserna. Så är koden som kopieras redan
  uppdaterad med kundens domän när hen når steget.

### Övriga saknade delar från Kickstart

- Panelen "Vad vill du bygga först?" med förslagskort (Startsida, PLP, PDP,
  Varukorg/checkout, Konto) och kopierbara prompts, visad när anslutningen är
  grön; varning visas om anslutningen bara är i proxy-läge.
- Go-live-noteringar längst ner på sidan (eget/anpassat domännamn, IS_HEADLESS m.m.).
- Per-steg statuskontroll ("check") direkt i varje stegkort, som idag bara visas
  i verifieringssteget.
- Guiden minns var kunden var (öppet steg och högsta klara steg) mellan
  omladdningar, med "börja om"-länk.

Guidens nuvarande "Redo att börja bygga"-steg tas bort som eget steg, eftersom
Kickstart täcker det med panelen "Vad vill du bygga först?". Slutresultat: fem
steg i Kickstarts ordning.

## Teknisk detalj

- Nya presentationsfiler under `src/components/vendre/` (publiceringsfält,
  nästa-steg-panel, go-live-block) och små hjälpmoduler under `src/lib/vendre/`
  för origin-normalisering och sparad publicerad domän.
- `src/pages/Index.tsx` byggs om till fem steg i ovan ordning; befintlig
  anslutningslogik (`/api/vendre/token`, `/api/vendre/status`,
  `testVendreConnection()`) är oförändrad.
- Texterna hålls på svenska direkt i komponenterna — Kickstarts i18n-lager
  kopieras fortfarande inte.

## Verifiering

- Domänfältet accepterar slug/host/URL, avvisar skräp och överlever omladdning.
- CORS-JSON innehåller den valda domänen först och kopieras korrekt.
- Steglåsning, progress och samtliga statuslägen fungerar; bygget är grönt.
