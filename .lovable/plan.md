# Vendre-butikstemplate med Demo Mode

Målet: templaten visar en färdig butik direkt, med dummy-data tills Vendre-kontot är kopplat. Uppstartsguiden flyttas in i en modal som nås från en toppbanner.

## En viktig avstämning först

`.vendre/knowledge/api-reference.md` är normativ för endpoints, CORS-policies, headers, felformat och query-konventioner — men den innehåller bara ett komplett fältschema för `session/bootstrap`. Den listar inte fältnamnen i produkt-, kategori- eller kundvagnssvar. Mockdatan byggs därför så här:

1. Alla anrop, paths, headers och felobjekt följer referensen exakt.
2. Fältnamn för produkt/kategori/cart hämtas skarpt från den anslutna butiken (`https://sara_phoenix.testavendre.se`) via serverproxyn — ett `GET categories/{id}` och `GET shopping-cart` — och mockfilen skrivs från de riktiga svaren.
3. Om butiken inte svarar (CORS/gate) används referensens konventioner (snake_case, `prices_include_vat`, `product_count`, `errors[]`) och varje osäkert fält markeras i en kommentar.

Steg 2 kräver bara serverproxyn, inte CORS-allowlisten, så det bör gå även i nuvarande läge.

## Vad som byggs

### Läge och datalager
- `src/context/onboarding-context.tsx`: `isConfigured` (default `false`), sparas i localStorage, sätts `true` när anslutningstestet är grönt.
- `src/lib/vendre/api.ts` + hook `useVendreApi`: en adapter med samma funktionssignaturer i båda lägen (`getMenus`, `getCategory`, `getProduct`, `getCart`, `addToCart`, `updateQty`, `removeLine`, `getSessionContext`).
  - Demo: läser från `src/mock/vendreResponses.ts`, cart hålls i minnet.
  - Live: `surfaceFetch` mot `/surface/2/*` med Bearer + `credentials: "include"`, mutationstoken på alla POST/PUT/DELETE, en re-bootstrap vid `SURFACE_SESSION_UNAUTHORIZED`.
  - Cache enligt `caching.md`: menyer/kategorier cachas, cart och session cachas aldrig.

### Toppbanner + guide-modal
- `SetupNoticeBar` överst på varje sida när `isConfigured === false`: badge `Demo Mode (Dummy Data)`, texten "Du kör just nu med dummy-data. Koppla ditt Vendre-konto för att aktivera din live-butik." och knappen "Starta Uppstartsguide".
- Knappen öppnar en dialog som kör den befintliga 6-stegsguiden (nuvarande `src/pages/Index.tsx`) oförändrad i innehåll — den flyttas till `src/components/vendre/setup-wizard.tsx`.
- Grönt test → `isConfigured = true` → bannern försvinner och adaptern går över till live.

### Butiksytor (Tailwind + shadcn, responsivt)
- Header: logga, sökfält (placeholder), kategorimeny med flernivås-dropdown, kundvagnsikon med antalsbadge.
- Cart slide-over (`Sheet` från höger): rader med bild, antal, radera, prissummering som respekterar `prices_include_vat`, checkout-knapp (riktig webbläsarnavigation i live-läge).
- Startsida `/`: hero med CTA, utvalda produkter, kategorisektion.
- PLP `/kategori/$id`: kategoribanner, filter/sortering (placeholders i demo, serverparametrar i live), produktgrid.
- PDP `/produkt/$id`: bildgalleri, titel, lagerstatus, pris, variantväljare, "Lägg i varukorg" som uppdaterar cart-drawern.
- Footer: kundservice, informationslänkar, betalsätt, sociala ikoner.
- Egen `head()` med unik titel/description per route.

### Filer
- Nya: `src/types/vendre.ts`, `src/mock/vendreResponses.ts`, `src/context/onboarding-context.tsx`, `src/lib/vendre/api.ts`, `src/components/store/*`, `src/components/vendre/setup-notice-bar.tsx`, `src/components/vendre/setup-wizard.tsx`, routes för start, PLP, PDP.
- Ändras: `src/routes/__root.tsx` (provider, banner, header/footer), `src/routes/index.tsx`, `src/lib/i18n.tsx` (nya texter, sv/en).
- Oförändrat: `src/lib/vendre/client.ts`, `test-connection.ts`, `/api/vendre/token`, `/api/vendre/status`.

## Utanför scope
Konto-/inloggningssidor, CMS-sidor, kuponger och upsell byggs inte nu.
