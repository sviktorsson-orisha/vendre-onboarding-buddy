# Alla butiksanrop går via vår egen server

## Mål

Webbläsaren ska bara prata med vår egen adress (`/api/...`). Ingen nyckel, ingen åtkomsttoken och ingen butiksadress skickas längre ut till besökarens webbläsare. Vår server sköter kontakten med butiken.

## Så blir det

1. **Ny genomgångspunkt på servern.** En adress hos oss tar emot alla butiksanrop (produkter, kategorier, sök, kundvagn, konto, sessioner, CMS) och skickar dem vidare till butiken med rätt nyckel.
2. **Sessionen följer med.** Serverns svar sätter en kaka på vår egen domän i stället för butikens, och skickar tillbaka den till butiken vid varje anrop, så inloggning och kundvagn fungerar som förut.
3. **Token-adressen tas bort.** Butikens åtkomsttoken lämnar aldrig servern. Uppstartsguiden och statuskontrollen får bara ja/nej-svar samt butiksadressen där den behövs för länkar.
4. **Kassan lämnas som den är nu**, enligt ditt val. Om kassan skulle starta med tom korg tar vi det som ett separat steg.
5. **Uppstartsguiden justeras.** Anslutningstestet körs via servern i stället för direkt från webbläsaren. CORS-steget blir inte längre nödvändigt för att butiken ska visa data, men står kvar som rekommendation för kassan; guidens gröna markeringar och live-läget fungerar som idag.

## Teknisk detalj

- Ny catch-all route `src/routes/api/vendre/surface/$.ts` med `GET/POST/PUT/PATCH/DELETE`-handlers. Den vidarebefordrar till `${VENDRE_BASE_URL}/surface/2/${params._splat}` inklusive querysträng, sätter `Authorization: Bearer` från `getVendreServerToken()`, vidarebefordrar `content-type`, `accept` och `Surface-Mutation-Protection-Token`, och returnerar butikens statuskod och body oförändrat.
- Cookie-hantering: inkommande `cookie` skickas vidare till butiken; butikens `set-cookie` skrivs om till vår origin (`Domain` strippas, `Path=/`, `HttpOnly`, `Secure` i produktion, `SameSite=Lax`). Flera `set-cookie` hanteras via `getSetCookie()`.
- Guards: `isBrowserSameOrigin` + `rateLimit` från `request-guard.server.ts` på alla metoder; ingen tokenläckage i felsvar; `cache-control: no-store`.
- `src/lib/vendre/client.ts`: `surfaceFetch` anropar `/api/vendre/surface/<path>` med `credentials: "same-origin"`, utan Bearer-header. `getVendreToken`/`fetchToken` tas bort; mutation-token-hanteringen behålls oförändrad. Ny liten `getStoreBaseUrl()` som läser `baseUrl` från `/api/vendre/status` (behövs för checkout-URL i `api.ts`).
- `src/routes/api/vendre/token.ts` tas bort. `status.ts` behålls (returnerar redan bara booleans + baseUrl till betrodda anrop). `token.server.ts` behålls som servertoken-cache.
- `src/lib/vendre/api.ts`: `storeBaseUrl`/checkout-URL hämtas via `getStoreBaseUrl()`; övriga anrop är oförändrade eftersom de går genom `surfaceFetch`.
- `src/lib/vendre/test-connection.ts`: token-steget frågar `/api/vendre/status?force=1`, session/read-stegen går via proxyn; CORS-steget nedgraderas till en informationsrad om kassan i stället för ett blockerande fel.
- Dokumentation som beskriver direktanrop uppdateras: `.vendre/knowledge/general.md`, `.vendre/knowledge/api-reference.md`, `.vendre/skills/surface-v2.md`, `.vendre/skills/setup.md`, `AGENTS.md`.
- Verifiering: typecheck och build, samt anrop mot proxyn (navigation, kategori, produkt, kundvagns-GET) och kontroll att inga token- eller nyckelvärden syns i klientsvaren.
