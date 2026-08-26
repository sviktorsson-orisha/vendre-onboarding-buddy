# Vendre Setup Wizard — steg-för-steg med progress bar

## Källor

Planen bygger **endast** på projektets egna filer:

- `.vendre/skills/setup.md` (enda skillen i projektet) — stegordningen, CORS-JSON,
  origin-regler, `testVendreConnection()`, gaten "bygg inget innan ok: true".
- `.vendre/knowledge/general.md` — `/surface/2/*`, `client_secret` endast server-side,
  form-urlencoded OAuth, `session/bootstrap`, mutation-token i app state (ej localStorage).

Inget från workspace-skills eller tidigare Vendre-regler används.

## Utgångsläge (verifierat)

Projektet har idag ingen Vendre-kod: `src/lib/vendre/` saknas, det finns inga
API-routes och inga sparade credentials. `setup.md` säger "skriv inte om
`src/lib/vendre/` — de hjälparna finns redan", men de finns inte i repot. För att
"Test & Verify" ska vara äkta måste minimal anslutningslogik därför skapas.

## Vad som byggs

### 1. Minimal anslutningslogik (endast för verifiering)
- `/api/vendre/token` (server): `POST /surface/2/oauth/token`, form-urlencoded,
  `client_secret` läses i handlern och lämnar aldrig servern. Token cachas ~1 h.
- `/api/vendre/status` (server): svarar bara ja/nej för `VENDRE_BASE_URL`,
  `VENDRE_CLIENT_ID`, `VENDRE_CLIENT_SECRET` — aldrig värden.
- `src/lib/vendre/`: browser-klient (Bearer + `credentials: "include"`,
  mutation-token i modulvariabel) och `testVendreConnection()` som kör de fyra
  delstegen ur setup.md: `token` → `cors` → `session` (`POST /surface/2/session/bootstrap`)
  → `read` (`GET /surface/2/navigation/menus`) och returnerar
  `{ ok, steps[], missing[], origin, baseUrl }`.

### 2. Wizard-UI (`src/pages/Index.tsx`)
Header med Vendre-branding, progress bar ("Steg X av 4 · 25 % klart") och en
callout med aktivt steg. Ett steg i taget, Föregående/Nästa längst ner.
Nästa är låst tills steget verifierats; bakåt är fritt, framåt-hopp omöjligt.
Tydlig visuell skillnad på låst/upplåst.

- **Steg 1 — Vendre Admin prep (OAuth & CORS):** instruktioner samt
  `/Admin/headless/auth/oauth-clients` och `/Admin/configuration?gID=232`.
  Stabila origins `https://project--<id>-dev.lovable.app` och
  `https://project--<id>.lovable.app` (aldrig `id-preview--`) plus båda
  JSON-blocken (Surface CORS Origins och Surface CORS Policies) med Copy-knapp.
  Kryssruta "Jag har konfigurerat CORS och skapat OAuth-nycklar" låser upp steg 2.
- **Steg 2 — Credentials:** förklarar att de tre värdena läggs in under Secrets.
  Knapp "Kontrollera credentials" → `/api/vendre/status`; saknade namn listas,
  alla tre satta låser upp steg 3.
- **Steg 3 — Anslutningstest:** knapp "Kör Vendre-anslutningstest" kör
  `testVendreConnection()`. Statusbadges för Token, Session och Läsrättigheter.
  CORS-varning visas som degraderat proxy-läge med exakt origin och åtgärd
  (checkout startar tom session). `ok: true` låser upp steg 4.
- **Steg 4 — Klar:** "Store connection verified!", sammanfattning av base URL och
  allowlistad origin, och uppmaning att gå tillbaka till chatten för att bygga
  Home / PLP / PDP / Cart.

## Utanför scope
Inga storefront-sidor, produkter eller varukorg — gaten i setup.md gäller tills
testet är grönt. Ingen mockdata.
