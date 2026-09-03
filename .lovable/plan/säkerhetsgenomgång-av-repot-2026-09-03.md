# Säkerhetsgenomgång av repot

## Resultat: inget känsligt läcker till GitHub

- `.env` innehåller endast publika värden: projekt-URL, projekt-ID och `sb_publishable_…`-nyckeln. Dessa är avsedda att ligga i webbläsaren och skyddas av databasens säkerhetsregler.
- Sökning genom hela repot efter hårdkodade nycklar (OAuth-secrets, service role-nycklar, JWT-strängar, `sk-`/`AIza`-nycklar) gav noll träffar. Alla träffar var variabelnamn, inte värden.
- Vendre-credentials (`VENDRE_BASE_URL`, `VENDRE_CLIENT_ID`, `VENDRE_CLIENT_SECRET`) och service role-nyckeln finns bara som miljövariabler i secrets-lagringen och läses uteslutande i server-filer (`token.server.ts`, `client.server.ts`). De finns inte i repot.
- Automatisk säkerhetsskanning av backend (tabeller, åtkomstregler) hittade inga problem.

## Tre svagheter som är värda att åtgärda

Inget av detta rör GitHub – det handlar om publikt exponerade API-endpoints på den driftsatta sajten.

1. **`/api/vendre/token` är helt öppen.** Vem som helst kan hämta en giltig Vendre-access-token från din sajt och använda den mot din butik utanför webbläsaren, utan CORS-begränsning. Detta följer visserligen den nuvarande arkitekturen (browsern behöver token), men endpointen bör i alla fall skyddas.
2. **`/api/vendre/setup-progress` (POST) skyddas bara av en `Origin`-header.** Den kontrollen stoppar bara webbläsare – ett skript kan sätta valfri `Origin` och skriva över uppstartsguidens sparade status.
3. **`/api/vendre/status` avslöjar butikens bas-URL** och vilka secrets som är satta för vem som helst som anropar den. Låg risk, men onödigt öppet.

## Föreslagna åtgärder

- **Steg 1 – lås token-endpointen.** Kräv samma origin/`Referer` från den egna sajten, lägg på enkel per-IP-strypning (rate limit) och sätt `Cache-Control: no-store` (finns redan). Alternativt, mer robust: gör om anropen till en ren server-proxy (`/api/vendre/proxy/*`) så att access-token aldrig lämnar servern.
- **Steg 2 – skydda setup-progress-skrivningar.** Tillåt POST endast när uppstartsguiden inte är slutförd, eller kräv en delad hemlighet/inloggning innan progress får skrivas om.
- **Steg 3 – slimma status-svaret.** Returnera bara boolska värden (`ok`, `secretsOk`, `tokenOk`) publikt, och skicka med `baseUrl` bara när guiden körs.
- **Steg 4 – kommentar i `.env`** som tydliggör att endast publika värden får ligga där, så att Vendre-secrets aldrig råkar hamna i GitHub.

## Teknisk detalj

Berörda filer: `src/routes/api/vendre/token.ts`, `src/routes/api/vendre/status.ts`, `src/routes/api/vendre/setup-progress.ts`, `src/lib/vendre/client.ts` (om proxyvarianten väljs), `.env`.

Steg 1 i den enkla varianten och steg 2–4 är små, isolerade ändringar. Full server-proxy (alternativet i steg 1) är en större omskrivning av datahämtningen och görs bara om du vill ha det.
