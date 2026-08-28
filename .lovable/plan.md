# Stäm av api-reference.md mot general.md och alla skills

`api-reference.md` innehåller idag bara avsnitt 1.1–1.7 (globala regler) och nämner tre endpoints. Skills-filerna beskriver ca 35 endpoints med policyer, headers och felkoder som referensen saknar. På flera punkter säger filerna dessutom olika saker.

## Motsägelser som behöver rättas

Vid konflikt gäller `api-reference.md` — övriga filer rättas efter den, inte tvärtom.

| Punkt | api-reference.md (facit) | general.md / skills | Åtgärd |
| --- | --- | --- | --- |
| Var CORS konfigureras | "Admin → Headless → CORS" (`SURFACE_CORS_ORIGINS` / `SURFACE_CORS_POLICIES`) | general.md: "Admin → Configuration → Surface"; setup.md: "Meny → Apps & Integrations → Headless → CORS" | Rätta general.md och setup*.md till referensens formulering; behåll `/Admin/configuration?gID=232` som kompletterande direktlänk |
| Felformat | `id, status, code, title, detail, source{pointer,parameter,header}` | `code, status, public, title, source.parameter` | Referensens schema gäller; `public` dokumenteras som valfritt tillägg och skills-texterna rättas till samma fältnamn |
| API-version | Dokumenterar både v1 och v2 | "uteslutande v2, aldrig v1" | Referensen behåller v1-avsnittet; general.md förtydligas till att storefronten *använder* v2 (inte att v1 saknas) |
| Mutationstoken | Valideras endast när controllern anropar valideringen; same-origin passerar utan token | surface-v2/mutation-tokens: alla POST/PUT/DELETE + undantagen `shopping-cart/coupons/check` (behövs ej) och `GET accounts/me/forgot-password` (behövs) | Referensregeln står kvar som normativ; undantagslistan läggs till i §1.6 som praktisk klientregel (skicka alltid) |
| Bearer på bootstrap | §1.3: bearer krävs alltid utom `oauth/token` och `oauth/revoke` → bootstrap kräver bearer | Skills är otydliga | Referensen gäller; förtydliga i §1.2/§1.3 att bootstrap kräver bearer men inte cookie |


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
