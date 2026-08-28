# Kör setup-vendre-flödet

Inga av de tre Vendre-nycklarna finns i projektets secret-store idag (endast Lovables egna `LOVABLE_API_KEY` och `LOVABLE_CRON_SECRET`). Flödet nedan lägger in dem och verifierar anslutningen — utan att någon kod ändras.

## Steg

1. **Samla in credentials** — jag öppnar ett säkert formulär för:
   - `VENDRE_BASE_URL` (butikens URL, schema + host, ingen avslutande slash)
   - `VENDRE_CLIENT_ID`
   - `VENDRE_CLIENT_SECRET`

   Skapas i Vendre Admin under Apps & Integrations → Headless → OAuth. Secret visas bara en gång.

2. **Kör anslutningstestet** — `testVendreConnection()` via guidens steg "Testa anslutning" (eller direkt mot `/api/vendre/status` och `/api/vendre/token`). Jag läser status för token, CORS, session och read.

3. **Tolka resultatet**
   - Token 401/400 → fel client id/secret, verifiera i Admin
   - Token 429 → butiken strypar, vänta och testa igen
   - CORS-varning → jag skriver ut exakt origin + färdig JSON för Surface CORS Origins/Policies att klistra in i Admin (`/Admin/configuration?gID=232`)
   - Session/read-fel → policy `bootstrap`, `session`, `navigation_menus`

4. **Rapport** — jag sammanfattar butikens base URL, vilken origin som är allowlistad och om mutation protection-token fungerar.

## Påverkar detta templaten?

Nej. Secrets sparas krypterat på projektnivå och hamnar aldrig i repot eller i GitHub-templaten. Ingen fil i `src/` eller `.vendre/` ändras i detta flöde. Domänen i steg 3 ligger kvar i din webbläsares localStorage.
