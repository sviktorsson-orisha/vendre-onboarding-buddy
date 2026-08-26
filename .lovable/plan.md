# Vendre setup-wizard + eget `src/lib/vendre/`

Kort svar: **nej, inget behöver lyftas över.** `.vendre/knowledge/general.md` och
`.vendre/skills/setup.md` specificerar allt som behövs för setup-flödet: server-side
OAuth, session bootstrap, mutation-token, CORS-policies, felkonventioner och exakt
vilka steg testet ska rapportera (token / cors / session / read). Jag bygger lib:et
här i projektet utifrån dessa två filer.

Enda sak jag inte kan hämta ur filerna är dina faktiska credentials
(`VENDRE_BASE_URL`, `VENDRE_CLIENT_ID`, `VENDRE_CLIENT_SECRET`) — de läggs in som
Secrets när wizarden är på plats, och sparas aldrig i kod.

## Vad som byggs

### 1. Server-sida (client_secret lämnar aldrig servern)

- `src/routes/api/vendre/token.ts` — `POST /surface/2/oauth/token` med
  `application/x-www-form-urlencoded`, cachead token på `globalThis` (~1 h, förnyas
  60 s före utgång, de-duplicerade parallella mints, 429 propageras med
  `Retry-After`). Returnerar `{ access_token, base_url }` med `cache-control: no-store`.
- `src/routes/api/vendre/$.ts` — same-origin proxy-fallback för när origin inte är
  allowlistad, samt för `login-link` som saknar CORS. Cookie skrivs om till
  `Path=/; Secure; SameSite=None; Partitioned`; bara `session/bootstrap` får sätta
  sessionscookien.
- `src/routes/api/vendre/status.ts` — svarar bara vilka av de tre env-varsen som
  saknas (aldrig värdena), så steg 2 kan visa status.

### 2. `src/lib/vendre/`

- `config.ts` — `/surface/2/`-prefix, CORS-policylistan och Admin-länkarna
  (`/Admin/headless/auth/oauth-clients`, `/Admin/configuration?gID=232`).
- `errors.ts` — parsar `{ errors: [{ code, status, title }] }` till typad
  `VendreApiError`; 401 är ett tillstånd, inte en krasch.
- `client.ts` — direkt-mot-butik först (`credentials: "include"`, Bearer), tyst
  fallback till proxyn vid CORS-fel; mutation-token i modulvariabel (aldrig
  localStorage) och skickas på alla POST/PUT/DELETE; en re-bootstrap vid session-401.
- `origins.ts` — härleder de stabila hostarna
  `https://project--<id>-dev.lovable.app` och `https://project--<id>.lovable.app`
  (aldrig `id-preview--`) och genererar båda JSON-blocken.
- `test-connection.ts` — `testVendreConnection()` med stegen **token → cors →
  session → read** (`navigation/menus`) och `ok`/`missing`, precis som setup.md
  förutsätter.
- `index.ts` — publika exporter.

### 3. Wizard-UI (din spec)

Sidan flyttas till `src/routes/index.tsx` (TanStack använder `src/routes/`, inte
`src/pages/`), och `/vendre-setup` läggs till som redirect dit så setup.md:s länk
fungerar.

- Header med Vendre-branding, progress bar ("Steg X av 4 · 25 % klart") och callout
  med aktivt steg.
- Ett steg i taget, Föregående/Nästa; Nästa låst tills steget verifierats, bakåt
  fritt, inga hopp framåt, tydlig låst/upplåst-markering.
- **Steg 1 — Admin prep:** OAuth-klient + CORS-instruktioner, dina live-origins och
  båda JSON-blocken med Copy-knapp. Bekräftelseruta låser upp steg 2.
- **Steg 2 — Credentials:** förklarar de tre secrets; "Kontrollera credentials"
  läser `missing` och låser upp steg 3 när alla tre finns.
- **Steg 3 — Testa anslutning:** kör `testVendreConnection()`, badges för Token,
  CORS, Session och Läsrättigheter, felmeddelanden mappade mot tabellen i setup.md
  (401/400, 429, cors-varning = degraderat proxyläge). `ok: true` låser upp steg 4.
- **Steg 4 — Klar:** base URL, allowlistad origin, bekräftelse att session och
  mutation-token fungerar, och frågan vad som ska byggas först.

## Utanför scope

Inga storefront-sidor (home/PLP/PDP/cart/account) byggs — gaten i setup.md gäller
tills testet är grönt. Ingen mockdata.
