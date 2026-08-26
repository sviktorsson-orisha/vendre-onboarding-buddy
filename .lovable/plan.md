# Vendre Setup Wizard — lyft in `src/lib/vendre/` från Vendre Kickstart

Ja, det går. Jag har läst en skrivskyddad kopia av projektet **Vendre Kickstart**
och det innehåller hela platform-lagret som saknas här.

## Källor

- Projektets egna filer: `.vendre/skills/setup.md` och `.vendre/knowledge/general.md`.
- Kod som kopieras oförändrad från Vendre Kickstart (ingen fork, inga omskrivningar).

## Vad som finns i Kickstart och kopieras hit

Filerna nedan flyttas över exakt som de är:

- `src/lib/vendre/` — `client.ts`, `errors.ts`, `index.ts`, `origins.ts`,
  `published-origin.ts`, `query.ts`, `session.tsx`, `test-connection.ts`
  (`testVendreConnection()`), `token.server.ts`.
- `src/config/vendre.ts` och `src/config/vendre-admin.ts` — Surface-prefix,
  cache-tider, CORS-policylista och Admin-länkar som lib:et importerar.
- `src/routes/api/vendre/token.ts`, `cors-check.ts`, `$.ts` — server-routen för
  OAuth (`client_secret` stannar på servern) och proxy-fallbacken.
- `src/lib/i18n.tsx` — `test-connection.ts` bygger sina meddelanden via `msg()`
  härifrån, så den följer med för att slippa ändra i lib-koden.

Dessutom: mounta `VendreSessionProvider` (och i18n-providern) i
`src/routes/__root.tsx`, precis som i Kickstart. Saknade npm-paket installeras
vid behov (t.ex. `@radix-ui/react-progress` för progress bar).

Inget av Kickstarts storefront (`shop.*`-routes, `src/lib/storefront`,
`src/components/storefront`) kopieras.

## Wizard-UI (nytt, enligt din spec)

Kickstarts egen setup-sida (`components/vendre/setup-guide.tsx`) kopieras **inte** —
du vill ha en annan design. Ny wizard byggs i `src/pages/Index.tsx` ovanpå det
inlyfta lib:et:

- Header med Vendre-branding, progress bar ("Steg X av 4 · 25 % klart") och en
  callout med aktivt steg.
- Ett steg i taget, Föregående/Nästa längst ner. Nästa låst tills steget
  verifierats; bakåt fritt, framåthopp omöjligt; låst/upplåst tydligt markerat.
- **Steg 1 — Admin prep (OAuth & CORS):** instruktioner, länkar till
  `/Admin/headless/auth/oauth-clients` och `/Admin/configuration?gID=232`,
  live-origins (`project--<id>-dev.lovable.app`, `project--<id>.lovable.app`,
  aldrig `id-preview--`) samt båda JSON-blocken med Copy-knapp — genererade via
  `origins.ts` / `vendre-admin.ts`. Kryssruta låser upp steg 2.
- **Steg 2 — Credentials:** förklarar `VENDRE_BASE_URL`, `VENDRE_CLIENT_ID`,
  `VENDRE_CLIENT_SECRET` under Secrets. "Kontrollera credentials" läser
  `missing`-listan från anslutningstestet; alla tre satta låser upp steg 3.
- **Steg 3 — Anslutningstest:** "Kör Vendre-anslutningstest" kör
  `testVendreConnection()`. Badges för Token, Session och Läsrättigheter,
  CORS-varning som degraderat proxy-läge med exakt origin och åtgärd.
  `ok: true` låser upp steg 4.
- **Steg 4 — Klar:** "Store connection verified!", base URL + allowlistad origin,
  och uppmaning att gå tillbaka till chatten för Home / PLP / PDP / Cart.

Sidan flyttas samtidigt till `src/routes/index.tsx` som komponent (TanStack
använder `src/routes/`, inte `src/pages/`), och `/vendre-setup` läggs till som
redirect till `/` så setup-skillens länk fungerar.

## Utanför scope

Inga storefront-sidor byggs — gaten i `setup.md` gäller tills testet är grönt.
Ingen mockdata.
