# Vendre Setup Wizard — steg-för-steg med progress bar

Allt som byggs baseras uteslutande på projektets egna filer under `.vendre/`
(`knowledge/general.md` och `skills/setup.md`). Ingen workspace-knowledge eller
externa skills används, och inget lyfts in från ett annat projekt.

Projektet har idag ingen Vendre-kod (ingen `src/lib/vendre/`, ingen server-route,
inga sparade credentials). För att "Test & Verify" ska vara äkta och inte fejk
byggs även den minimala anslutningslogik som wizarden verifierar mot.

## Vad som byggs

### 1. Anslutningslager (minimalt, bara för verifiering)

- Server-route `/api/vendre/token`: hämtar OAuth-token mot
  `POST /surface/2/oauth/token` (form-urlencoded, client credentials).
  `VENDRE_CLIENT_SECRET` lämnar aldrig servern. Token cachas på `globalThis`
  ~1 h med de-duplicering och 429-backoff.
- Server-route `/api/vendre/status`: svarar om `VENDRE_BASE_URL`,
  `VENDRE_CLIENT_ID` och `VENDRE_CLIENT_SECRET` är satta (bara ja/nej, aldrig
  värden).
- `src/lib/vendre/`: browser-klient (direktanrop med `credentials: "include"`,
  Bearer-token, mutation protection token i modulvariabel) plus
  `testVendreConnection()` som kör stegen `token` → `cors` → `session`
  (`POST /surface/2/session/bootstrap`) → `read`
  (`GET /surface/2/navigation/menus`) och returnerar
  `{ ok, steps[], missing[], origin, baseUrl }`.

### 2. Wizard-UI (`src/pages/Index.tsx`)

Header med Vendre-branding, progress bar ("Steg X av 4 · 25% klart") och en
callout-banner med aktivt steg. Ett steg i taget, Föregående/Nästa längst ner.
Gating: Nästa är låst tills steget är verifierat; man får gå bakåt fritt men
inte hoppa framåt. Låsta steg visas tydligt som låsta i stepper-indikatorn.

- **Steg 1 — Vendre Admin prep (OAuth & CORS):** instruktioner + länkar till
  `/Admin/headless/auth/oauth-clients` och `/Admin/configuration?gID=232`.
  Live-origins (`project--<id>-dev.lovable.app`, `project--<id>.lovable.app`)
  och båda JSON-blocken (Origins + Policies) med Copy-knapp. Låses upp av
  kryssrutan "Jag har konfigurerat CORS och skapat OAuth-nycklar".
- **Steg 2 — Credentials:** förklarar att `VENDRE_BASE_URL`,
  `VENDRE_CLIENT_ID` och `VENDRE_CLIENT_SECRET` läggs in under Secrets. Knappen
  "Kontrollera credentials" anropar `/api/vendre/status`; saknade namn listas,
  alla tre satta låser upp steg 3.
- **Steg 3 — Anslutningstest:** knappen "Kör Vendre-anslutningstest" kör
  `testVendreConnection()`. Statusbadges för Token, Session och Läsrättigheter.
  CORS-varning visas som degraderat proxy-läge med exakt origin och åtgärd.
  `ok: true` låser upp steg 4.
- **Steg 4 — Klar:** success-state, sammanfattning av base URL och allowlistad
  origin, samt uppmaning att gå tillbaka till chatten för att bygga
  Home / PLP / PDP / Cart.

Wizardens framsteg hålls i komponentens state (ingen localStorage för
mutation-token; sidstatus kan sparas i sessionState men inga hemligheter).

## Utanför scope

Inga storefront-sidor, produkter eller varukorg byggs — setup-gaten gäller tills
testet är grönt.
