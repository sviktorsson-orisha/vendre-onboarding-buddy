# Loggade priser via Surface v1

## Mål

Göra loggade priser (prishistorik) tillgängliga i templaten via
`GET /surface/1/products/price-log-prices` — utan att visa något i butiken.
Allt annat fortsätter gå mot Surface v2.

## Vad jag verifierat mot butiken

- Endpointen finns i v1-specen (`/surface/1/products/price-log-prices`, GET).
- Utan sessionskaka svarar den `401 SURFACE_SESSION_UNAUTHORIZED`.
- Med samma sessionskaka som v2 använder svarar den `200` och `[]` i testbutiken
  (ingen bearer-token behövs för v1). Inga prisloggposter fanns att inspektera,
  och specen dokumenterar inga parametrar — därför byggs anropet så att valfria
  query-parametrar kan skickas vidare oförändrade.

## Det som byggs

1. **Server-proxy för v1 (endast denna endpoint)**
   Ny route `/api/vendre/surface1/products/price-log-prices` som speglar
   befintliga v2-proxyn: same-origin-skydd, rate limiting, vidarebefordran av
   sessionskakan och `Set-Cookie`-omskrivning. Den är låst till just den här
   sökvägen — ingen generell v1-passthrough.

2. **Hämtfunktion i frontend**
   `getPriceLogPrices(params)` i `src/lib/vendre/` som anropar proxyn med valfria
   query-parametrar och returnerar svaret typat, plus en enkel
   `usePriceLogPrices(params, { enabled })`-hook. Inget renderas någonstans i
   butiken och inga befintliga sidor ändras.

3. **Uppdaterad dokumentation**
   - `.vendre/knowledge/api-reference.md`: eget avsnitt för det enda tillåtna
     v1-anropet — sökväg, sessionskrav, att bearer inte används, observerat svar
     och proxysökvägen.
   - Ny skill `.vendre/skills/price-log.md` med användningsmönster, cachning och
     hur man kopplar på det i en produktvy när en kund efterfrågar det.
   - Routingtabellen i `AGENTS.md` pekar på den nya skillen.

## Tekniska detaljer

- Proxyn återanvänder `request-guard.server.ts` (`isBrowserSameOrigin`,
  `rateLimit`) och bygger mål-URL som `${VENDRE_BASE_URL}/surface/1/products/price-log-prices`.
- Ingen `Authorization`-header sätts på v1-anropet; endast `cookie`, `accept`
  och inkommande query vidarebefordras.
- Svar cachas inte (`cache-control: no-store`) eftersom det är sessionsberoende.
- Hooken är avstängd som standard (`enabled: false` tills den anropas med
  produkt-id) så inga extra nätverksanrop sker på befintliga sidor.
