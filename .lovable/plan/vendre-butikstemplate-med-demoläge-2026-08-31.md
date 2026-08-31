# Vendre-butikstemplate med demoläge

Bygger en komplett, klickbar butiksfront som kör på mockad Vendre-data tills kunden kopplat sitt konto, plus en global demoläge-banner som startar uppstartsguiden.

Allt baseras enbart på repots egna filer: `AGENTS.md`, `.vendre/knowledge/api-reference.md` (source of truth), `.vendre/knowledge/general.md` och `.vendre/skills/`.

## Viktig avstämning om schemat

`api-reference.md` är normativ för **endpoints, metoder, CORS-policyer, headers, felformat och query-konventioner** — den innehåller däremot inga fältnivå-scheman för produkt-, kategori- eller kundvagnssvar. Typerna byggs därför så här:

- Fält som referensen och skills faktiskt namnger används exakt: `surface_mutation_protection_token`, `mutationProtectionToken`, `prices_include_vat`, `product_count`, `currency.code`, `language.code`, `market.id`, `STORE_NAME`, `SHOP_LOGO`, `errors[].{status,code,title,detail,public,source}`, listparametrar `page`, `limit`, `sort_by`, `sort_order`, `filter`/`f`, `pfrom`, `pto`, `tags[]`.
- Övriga fält (produkt-/kategori-/radnivå) modelleras i snake_case i samma stil och märks i koden som "härledda, verifieras mot live-svar vid första riktiga anslutningen". Adaptern isolerar detta så bytet till live bara sker på ett ställe.

## Vad som byggs

### 1. Demoläge och dataadapter

- `src/types/vendre.ts` — typer för session/context, navigation, kategori (PLP), produkt (PDP + varianter), kundvagn och felformat.
- `src/mock/vendreResponses.ts` — hela svarsobjekt (inte lösa listor) för `GET session/context`, `GET navigation/menus`, `GET categories/{id}`, produktdata och `GET shopping-cart`, med svenska produkter, priser i SEK och bilder.
- `src/lib/vendre/onboarding-context.tsx` — `OnboardingProvider` med `isConfigured` (default `false`), styrt av `GET /api/vendre/status` (finns redan) plus lyckat anslutningstest; guiden kan öppnas manuellt.
- `src/lib/vendre/use-vendre-api.ts` — `useVendreApi()`: samma funktionssignaturer oavsett läge. `isConfigured === false` → mockdata; `true` → `surfaceFetch` mot `/surface/2/*` enligt reglerna (bearer, `credentials: "include"`, mutationstoken på POST/PUT/DELETE, en re-bootstrap vid `SURFACE_SESSION_UNAUTHORIZED`).
- Cache enligt `caching.md`: menyer/kategorier/produkter cachas, kundvagn och session hämtas alltid färskt (`staleTime: 0`).

### 2. Demo Mode-banner

- Fast rad högst upp på alla sidor när `isConfigured === false`: varningsfärgad bakgrund, badge `Demo Mode (Dummy Data)`, texten "Du kör just nu med dummy-data. Koppla ditt Vendre-konto för att aktivera din live-butik." och knappen "Starta Uppstartsguide".
- Knappen öppnar en dialog/drawer som kör den befintliga uppstartsguiden (nuvarande `src/pages/Index.tsx`-innehåll flyttas till `src/components/vendre/setup-wizard.tsx` och återanvänds både i modalen och på `/setup`).

### 3. Butiksdelar

- **Header**: logga från `STORE_NAME`/`SHOP_LOGO`, sökfält (placeholder), kategorimeny med fleranivåers dropdown från menysvaret, kundvagnsikon med antalsbadge.
- **Cart slide-over**: `sheet` från höger — rader med bild, antalssteppare, ta bort, prissummering som respekterar `prices_include_vat`, checkout-knapp. Optimistisk lokal state med debouncad synk och flush före checkout enligt `cart-sync.md`; i demoläge sker allt lokalt.
- **Startsida** `/`: hero med CTA, utvalda produkter, kategoriblock.
- **PLP** `/kategori/$slug`: kategoribanner, filter-/sorteringskontroller kopplade till URL-query (`page`, `sort_by`, `tags[]`), produktgrid, `product_count`.
- **PDP** `/produkt/$slug`: bildgalleri, titel, lagerstatus, pris med VAT-flagga, variantväljare som byter SKU/pris/bild i samma vy, "Lägg i varukorg" som uppdaterar cart-drawern.
- **Footer**: Kundservice, Om oss, Information, Betalsätt och sociala ikoner.
- Egen `head()` med titel/description/og på varje ny rutt.

### 4. Övrigt

- Lägger till `.lovable/plan.md` och `.lovable/plan/` i `.gitignore` så planfiler inte hamnar i GitHub-repot.

## Teknik

TanStack Router-filrutter under `src/routes/`, shadcn/ui-komponenter som redan finns (`sheet`, `navigation-menu`, `badge`, `dialog`), Tailwind-tokens från `src/styles.css`. Befintlig uppstartsguide, `src/lib/vendre/client.ts` och API-rutterna lämnas funktionellt orörda — guiden flyttas bara till en återanvändbar komponent.
