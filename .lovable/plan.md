# Onboarding-wizard + eget `src/lib/vendre/`

Inget behöver lyftas in från ett annat projekt. `.vendre/knowledge/general.md` och
`.vendre/skills/setup.md` specificerar allt som krävs, så jag bygger anslutnings-
lagret här och bygger om onboarding-sidan till en riktig wizard ovanpå det.

Enda som inte kan hämtas ur filerna är dina credentials — de läggs in som Secrets
i steg 2 och hamnar aldrig i kod.

## Del 1 — Anslutningslagret (byggs från projektets egna filer)

### Server-sida (client_secret lämnar aldrig servern)

- `src/routes/api/vendre/token.ts` — `POST /surface/2/oauth/token` med
  `application/x-www-form-urlencoded`, token cachead på `globalThis` (~1 h, förnyas
  60 s före utgång, parallella mints de-dupliceras, 429 propageras med `Retry-After`).
  Returnerar `{ access_token, base_url }`, `cache-control: no-store`.
- `src/routes/api/vendre/$.ts` — same-origin proxy som tyst fallback när origin inte
  är allowlistad (och för `login-link`, som saknar CORS). Cookie skrivs om till
  `Path=/; Secure; SameSite=None; Partitioned`; bara `session/bootstrap` får sätta
  sessionscookien.
- `src/routes/api/vendre/status.ts` — rapporterar bara vilka av de tre env-varsen som
  saknas, aldrig värdena.

### `src/lib/vendre/`

- `config.ts` — `/surface/2/`-prefix, CORS-policylistan, Admin-länkar
  (`/Admin/headless/auth/oauth-clients`, `/Admin/configuration?gID=232`).
- `errors.ts` — parsar `{ errors: [{ code, status, title }] }` till typad
  `VendreApiError`; 401 är ett tillstånd, inte en krasch.
- `client.ts` — direkt mot butiken först (`credentials: "include"`, Bearer), tyst
  fallback till proxyn vid CORS-fel; mutation-token i modulvariabel (aldrig
  localStorage), skickas på alla POST/PUT/DELETE; en re-bootstrap vid session-401.
- `origins.ts` — härleder de stabila hostarna `https://project--<id>-dev.lovable.app`
  och `https://project--<id>.lovable.app` (aldrig `id-preview--`) och genererar båda
  JSON-blocken (Origins JSON + Policies JSON).
- `test-connection.ts` — `testVendreConnection()` med stegen **token → cors → session
  → read** (`navigation/menus`), plus `ok` och `missing`.
- `index.ts` — publika exporter.

## Del 2 — Wizard-UI (`src/pages/Index.tsx`, renderas av `src/routes/index.tsx`)

**Header & global progress:** Vendre-branding, progress bar ("Step 2 of 4 · 50 %
complete") och en callout under den: "Current Step: 1. Vendre Admin Prep (CORS &
OAuth)".

**Stepper:** exakt ett steg på skärmen. Previous/Next längst ner. Next är låst tills
steget är verifierat; tillbaka till avklarade steg är fritt, hopp framåt omöjligt.
Låst vs upplåst markeras tydligt (lås-ikon, dämpad stil, gröna bockar i stegraden).

**Steg 1 — Vendre Admin Prep (CORS & OAuth)**
Förklarar OAuth-klienten (Menu → Apps & Integrations → Headless → OAuth) och att
client_secret bara visas en gång. Interaktiv ruta med dina live-origins för preview
och published, plus båda JSON-blocken med "Copy JSON"-knapp och länk till
`/Admin/configuration?gID=232`. Kryssrutan "I have configured CORS & created OAuth
keys" låser upp steg 2.

**Steg 2 — Enter API Credentials**
Instruerar att lägga `VENDRE_BASE_URL`, `VENDRE_CLIENT_ID`, `VENDRE_CLIENT_SECRET`
under Secrets. Knappen "Check Credentials" anropar status-routen och visar per-variabel
status; alla tre satta låser upp steg 3.

**Steg 3 — Test Connection & Policies**
Knappen "Run Vendre Connection Test" kör `testVendreConnection()`. Badges för Token
Status, Session Policy och Read Permissions. CORS-varning visas som degraderat
proxyläge med exakt origin och åtgärd. Fel mappas mot tabellen i setup.md (401/400 =
fel nycklar, 429 = vänta, session/read = policies). `ok: true` låser upp steg 4.

**Steg 4 — Complete & Next Steps**
"Store connection verified!", sammanfattning av base URL och allowlistad origin, samt
uppmaning att gå tillbaka till chatten för Home, PLP, PDP och Cart.

Dessutom: `/vendre-setup` läggs till som redirect till `/` så länken i setup.md
fungerar. UI byggs med befintliga shadcn-komponenter (progress installeras om det
saknas).

## Utanför scope

Inga storefront-sidor byggs — gaten i setup.md gäller tills testet är grönt. Ingen
mockdata.
