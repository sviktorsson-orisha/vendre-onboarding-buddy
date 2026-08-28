# Stäm av api-reference.md mot general.md och alla skills

`api-reference.md` innehåller idag bara avsnitt 1.1–1.7 (globala regler) och nämner tre endpoints. Skills-filerna beskriver ca 35 endpoints med policyer, headers och felkoder som referensen saknar. På flera punkter säger filerna dessutom olika saker.

## Motsägelser som behöver rättas

| Punkt | api-reference.md | general.md / skills | Åtgärd |
| --- | --- | --- | --- |
| Var CORS konfigureras | "Admin → Headless → CORS" | general.md: "Admin → Configuration → Surface"; setup.md: "Meny → Apps & Integrations → Headless → CORS (`/Admin/configuration?gID=232`)" | Använd setup.md:s formulering som facit i alla tre filer |
| Felformat | `id, status, code, title, detail, source` | `code, status, public, title, source.parameter` | Slå ihop till ett fält-schema där `public` och `detail` båda dokumenteras som valfria |
| API-version | Dokumenterar både v1 och v2 | "uteslutande v2, aldrig v1" | Behåll v1-noteringen men markera tydligt att storefronten endast använder v2 |
| Mutationstoken | Nämner bara att den valideras "om controllern anropar valideringen" | surface-v2/mutation-tokens: alla POST/PUT/DELETE + undantagen `shopping-cart/coupons/check` (behövs ej) och `GET accounts/me/forgot-password` (behövs) | Lägg in undantagslistan i §1.6 |
| Bearer på bootstrap | Otydligt om `session/bootstrap` kräver bearer | Skills: bootstrap görs med bearer men utan cookie | Förtydliga i §1.2/§1.3 |

## Det som läggs till i api-reference.md

- **§1.8 Rate limits** – `RateLimit-Limit/Remaining/Reset`, `Retry-After`, `concurrencylimit-remaining` på `oauth/token`, samt 429-hantering.
- **§1.9 Query-konventioner** – arrayparametrar med hakparenteser (`tags[]=64`), paginering/sortering (`page`, `limit`, `sort_by`, `sort_order`, `filter`/`f`, `pfrom`, `pto`).
- **§2 Endpointkatalog** – tabell per område med metod, path, CORS-policy, om mutationstoken krävs, och länk till rätt skill-fil:
  - OAuth: `oauth/token`, `oauth/revoke`
  - Session: `session/bootstrap`, `session`, `session/context`, `session/end`
  - Konto/auth: `accounts`, `accounts/me`, `accounts/me/addresses`, `accounts/me/order-history[/{id}]`, `accounts/me/users`, `accounts/me/forgot-password`, `customers/current`, `login/email`, `login/google-sso`, `login/microsoft-sso`, `login-link`, `logout`
  - Kundvagn/checkout: `shopping-cart`, `shopping-cart/products`, kuponger (`activate`/`deactivate`/`reset`/`check`), `checkout/upsell/get-prices`, `checkout/upsell/add-products`
  - Katalog: `categories/{id}`, `vql`
  - Innehåll: `navigation/menus`, `galleries/pagetree`, `galleries/{id}/pages`, `galleries/{id}/content-blocks`, `galleries/boxes`, `twig/render`, `sitemap`
  - Övrigt: `contact`
- **§3 CORS-policymatris** – vilken policy varje endpointgrupp löser till, med de kända fällorna (`accounts*` och `twig/render` → `default`, `contact` → `email/contact`, `login-link` saknar CORS helt och måste gå via serverproxyn).
- **§4 Vanliga felkoder** – `SURFACE_SESSION_UNAUTHORIZED`, `SURFACE_ACCOUNT_MALFORMED_BODY`, samt när 401 betyder session vs bearer.

## Små följdändringar i övriga filer

- `general.md`: rätta CORS-sökvägen till samma formulering som setup.md, och lägg till `public`/`detail` i felformatet så det matchar referensen.
- `store-troubleshooting.md`: lägg till en rad som pekar på §2-katalogen för policy/tokenkrav.
- `AGENTS.md`: notera under knowledge-avsnittet att `api-reference.md` nu är facit för endpoints, policyer och tokenkrav, medan skills beskriver användningsmönster.

Inga ändringar i `src/` – detta rör enbart dokumentationen under `.vendre/` och `AGENTS.md`.
