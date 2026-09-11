# Surface API Technical Reference

Complete technical reference for all Surface API endpoints (`/surface/1/*` and `/surface/2/*`).

_Source: Static code analysis of `cadre/application/Routes/Http/SurfaceApi/**` and `cadre/application/Http/Controllers/SurfaceApi/**` (branch `2026_project_phoenix`). A machine-generated OpenAPI 3.2 document is also available live at `GET /surface/1/openapi` (use query `?v=1` or `?v=2` to filter by version)._

> **Source of truth.** This document is authoritative for endpoints, HTTP methods,
> CORS policies, required headers, and the error format. The skill files under
> `.vendre/skills/` describe usage patterns and UX; where a skill contradicts this
> reference, this reference wins.

---

## 1. Global Rules

_(Applies to all endpoints unless specified otherwise)_

### 1.1 Base URL and Versioning

- **v1:** Base path `/surface/1/`
- **v2:** Base path `/surface/2/`

Both versions exist in the platform. Storefronts built from this template call
**v2 only** — every path below is `/surface/2/<endpoint>`.

**How this app reaches those paths:** the browser never calls the store. It
calls the same-origin proxy `/api/vendre/surface/<endpoint>`, which maps 1:1 to
`${VENDRE_BASE_URL}/surface/2/<endpoint>` and adds the OAuth bearer token
server-side. Request/response schemas below are unchanged; only the host
differs. The proxy also forwards the `Surface-Mutation-Protection-Token` header
and the session cookie, and rewrites the store's `Set-Cookie` to our origin.
`POST /surface/2/oauth/token` and `oauth/revoke` are called server-side only and
are never reachable from the client.


### 1.2 Session Cookie (`visitorid`)

All Surface requests require a valid store session cookie (`visitorid`) matching a row in the database, **except**:

- `POST /surface/2/oauth/token`
- `POST /surface/2/oauth/revoke`
- `POST /surface/2/session/bootstrap` _(creates the session)_

`session/bootstrap` is the only endpoint that may **establish** the cookie; other
endpoints may only refresh a cookie that already arrived on the request.

### 1.3 OAuth Bearer Token (v2 Only)

- **v1:** Never requires an OAuth bearer token.
- **v2:** Always requires `Authorization: Bearer <token>`, **except**:
  - `POST /surface/2/oauth/token`
  - `POST /surface/2/oauth/revoke`

This includes `POST /surface/2/session/bootstrap`: it needs the bearer, but not a
pre-existing session cookie.

_Validated globally in `includes/application_top.php` (choke point). Invalid or missing token returns `401` before the controller is executed._

OAuth requests (`oauth/token`, `oauth/revoke`) use
`Content-Type: application/x-www-form-urlencoded`.

### 1.4 CORS Policy

Each controller (or its base class) has the attribute `#[CorsPolicy('policy-name')]`. The policy name determines allowed origins configured under **Admin → Headless → CORS** (`SURFACE_CORS_ORIGINS` / `SURFACE_CORS_POLICIES`), reachable via `/Admin/configuration?gID=232`. Having CORS permission is required for cross-origin browser requests, but is distinct from `crights` or mutation tokens.

Origins are scheme + host, no trailing slash. Preview and production are separate
origins and both must be allowlisted. See §3 for the policy matrix.

### 1.5 Crights (Store Feature Flags)

Feature flags checked via the global `crights(CRIGHT_X)` function on two levels:

- **Endpoint level (Router Gate):** Evaluated in the router constructor. If the cright is missing, the route is never registered $\rightarrow$ returns `404`.
- **Field/Behavior level:** Evaluated inside the controller body. Controls specific branches, response fields, or accepted body fields.

### 1.6 Mutation-Protection-Token

- **Header:** `Surface-Mutation-Protection-Token`
- Issued by `POST /surface/2/session/bootstrap` and rotated upon login/logout.
- Validation occurs **only** if the controller explicitly calls `$this->validateMutationProtectionIfCrossOrigin()`. Same-origin (server-to-server or frontend on the same domain) requests pass without a token. If an endpoint does not call this method, cross-origin mutating requests might lack this protection unless explicitly added in code.

**Client rule:** because a cross-origin storefront cannot know which controllers
validate, attach the token to every `POST`, `PUT` and `DELETE`. Two exceptions
matter in practice:

- `POST /surface/2/shopping-cart/coupons/check` does **not** require it.
- `GET /surface/2/accounts/me/forgot-password` **does** require it, despite being
  a `GET` — clients that only attach the header on non-GET calls must special-case it.

Always replace the stored token with the fresh `mutationProtectionToken` returned
by login, logout and any re-bootstrap.

### 1.7 Error Format

Errors are returned using the standard format:

```json
{
  "errors": [
    {
      "id": "string",
      "status": "string",
      "code": "string",
      "title": "string",
      "detail": "string",
      "public": true,
      "source": {
        "pointer": "string",
        "parameter": "string",
        "header": "string"
      }
    }
  ]
}
```

`id`, `detail`, `public` and `source` are optional; `status`, `code` and `title`
are always present. `public: true` marks a message that is safe to show to the
visitor. On `422`, map each error's `source.parameter` to the matching form field.

### 1.8 Rate Limits and Quotas

Responses may carry:

- `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`
- `Retry-After` on `429`
- `concurrencylimit-remaining` on `oauth/token` — `0` means the store is
  throttling, not that the credentials are wrong.

`POST /surface/2/oauth/token` is protected by both a rate limit and an adaptive
concurrency limit. Cache the bearer for its full lifetime (~1h), de-duplicate
concurrent mints, retry at most once on `429` honouring `Retry-After`, then back
off for ~60s and keep using the existing token.

### 1.9 Query Conventions

- **Array parameters use brackets:** `tags[]=64&tags[]=81`.
- **Listing parameters:** `page`, `limit`, `sort_by`, `sort_order`,
  `filter` / `f`, `pfrom`, `pto`. Filter, sort and paginate on the server and
  render counts from the response — never on an already-paginated client list.

---

## 2. Endpoint Catalogue (v2)

`Token` = `Surface-Mutation-Protection-Token` required per the client rule in §1.6.
The catalogue below is synchronised with the current OpenAPI document (51 paths).
Rows marked _unverified_ are used by this app but are not present in that
document — keep them, but re-check before relying on them.

### 2.1 OAuth

| Method | Path | CORS policy | Token | Skill |
| --- | --- | --- | --- | --- |
| POST | `oauth/token` | `oauth` | – | `surface-v2.md`, `oauth-quota.md` |
| POST | `oauth/revoke` | `oauth` | – | `oauth-quota.md` |

Server-side only — they carry `client_secret`.

### 2.2 Session and Store Context

| Method | Path | CORS policy | Token | Purpose |
| --- | --- | --- | --- | --- |
| POST | `session/bootstrap` | `bootstrap` | – | establish session, issue mutation token |
| GET | `session` | `session` | – | compact status (authenticated, cart item count) |
| GET | `session/context` | `session` | – | extended context and store config |
| POST | `session` | `session` | yes | update store context |
| POST | `session/end` | `session` | yes | clear customer identity, keep visitor session |

`POST session` body fields: `market`, `currency`, `language`,
`prices_include_vat`.

Skills: `session-context.md`, `session-store-context.md`, `mutation-tokens.md`.

### 2.3 Accounts and Authentication

All `accounts*` endpoints resolve to the **`default`** CORS policy, not `customer`.

| Method | Path | CORS policy | Token | Purpose |
| --- | --- | --- | --- | --- |
| POST | `accounts` | `default` | yes | registration (full field set required) |
| POST | `customers` | `default` | yes | legacy v1-backed registration alias (same body, plus `email_addresses`) |
| GET | `accounts/me` | `default` | – | profile (flat / nested / alias shapes) |
| PUT | `accounts/me` | `default` | yes | update profile |
| GET | `accounts/me/addresses` | `default` | – | the customer's **main address** only |
| GET | `accounts/me/address-book` | `default` | – | the **alternative** addresses only (never the main one) |
| PUT | `accounts/me/addresses` | `default` | yes | update address |
| PUT | `accounts/me/address-book` | `default` | yes | upsert alternative addresses, body `{ addresses: [...] }` |
| GET | `accounts/me/order-history` | `default` | – | order list |
| GET | `accounts/me/order-history/{orderId}` | `default` | – | single order (see shape below) |
| GET | `accounts/me/quotations` | `default` | – | quotation list (B2B) |
| GET | `accounts/me/quotations/{quotationId}` | `default` | – | single quotation |
| POST | `accounts/me/shopping-cart/products` | `default` | yes | add cart products as the authenticated customer |

**Registration body (`POST accounts`, and `POST customers`)**

Required: `email_address`, `password`, `confirmation`, `firstname`, `lastname`,
`street_address`, `postcode`, `city`, `country`.

Optional: `type`, `gender`, `company`, `street_address2`, `suburb`,
`personnummer`, `state`, `telephone`, `fax`, `mobile`, `alias`,
`customers_group_id`, `vat_identification_number`, `newsletter`,
`consent_personal_data_policy`. `POST customers` additionally accepts
`email_addresses`.

`country` is the numeric country id (e.g. Sweden = `203`). A partial field set
returns `SURFACE_ACCOUNT_MALFORMED_BODY` (422).

**`accounts/me/order-history/{orderId}` response** (verified against a live store):
the payload is wrapped in `order` and contains `id`, `status`, `date`,
`billing_address`, `delivery_address`, `status_history`, `totals`
(`{ class, title, text, value }`, `text` already formatted) and `products`:

```json
{ "id": 172, "product_id": 230, "name": "Blazer Slim fit", "model": "47-0956",
  "quantity": 1, "price_each": 399.2, "price_total": 399.2, "tax": 21 }
```

Order lines carry **no image** and their prices are **excluding VAT** while the
order totals are including VAT. Fetch line images separately with one VQL call
filtering `products` on the collected `product_id` values.

Line amounts arrive raw (`399.2`) while `totals[].text` is already rounded
(`752 kr`). Derive the display format — currency prefix/suffix **and decimal
precision** — from a totals row, so a store that shows whole-unit totals also
shows whole-unit line prices. Never recompute the totals themselves.

**Login, sub-users and password reset**

| Method | Path | CORS policy | Token | Purpose |
| --- | --- | --- | --- | --- |
| GET | `accounts/me/forgot-password` | `default` | yes | password reset mail (token required despite being a GET) |
| GET | `accounts/me/users` | `default` | – | sub-users (B2B) — _unverified_ |
| GET | `customers/current` | `default` | – | current customer record |
| POST | `login/email` | `login` | yes | login with `{ email, password }` |
| GET | `login/google-sso` | `login` | – | Google SSO redirect — _unverified_ |
| GET | `login/microsoft-sso` | `login` | – | Microsoft SSO redirect — _unverified_ |
| POST | `login-link` | **no CORS** | yes | magic login link — server proxy only |
| POST | `logout` | `login` | yes | logout, rotates the mutation token |

**BankID**

| Method | Path | CORS policy | Token | Purpose |
| --- | --- | --- | --- | --- |
| POST | `bankid/login` | `default` | yes | start a BankID login |
| GET | `bankid/status` | `default` | – | poll the BankID order status |
| GET | `bankid/qr-token` | `default` | – | animated QR token for the current order |

Auth state is read from `GET session/context`, never from the login response
alone. Skills: `account-auth.md`, `customer-account/SKILL.md`,
`auth-sessions/SKILL.md`, `sso-login.md`.

### 2.4 Shopping Cart and Checkout

| Method | Path | CORS policy | Token | Purpose |
| --- | --- | --- | --- | --- |
| GET | `shopping-cart` | `shopping_cart` | – | lines, totals, coupons (never cache) |
| DELETE | `shopping-cart` | `shopping_cart` | yes | **clears the whole cart** — remove a single line with a products mutation and `quantity: 0` |
| GET | `shopping-cart/products` | `shopping_cart` | – | cart lines only |
| PUT | `shopping-cart/products` | `shopping_cart` | yes | add / set quantity, body `{ products: [...], empty }` |
| POST | `shopping-cart/products` | `shopping_cart` | yes | legacy alias of the `PUT` above, identical body |
| GET | `shopping-cart/coupons` | `shopping_cart` | – | active coupons |
| POST | `shopping-cart/coupons/activate` | `shopping_cart` | yes | apply coupon |
| POST | `shopping-cart/coupons/deactivate` | `shopping_cart` | yes | remove coupon |
| POST | `shopping-cart/coupons/reset` | `shopping_cart` | yes | clear coupons |
| POST | `shopping-cart/coupons/check` | `shopping_cart` | **no** | validate coupon code |
| POST | `checkout/upsell/get-prices` | `checkout` | yes | upsell pricing |
| POST | `checkout/upsell/add-products` | `checkout` | yes | add upsell products |
| POST | `checkout/upsell/finalize` | `checkout` | yes | finalise the upsell, body `{ order_id }` |

`empty: true` in a products mutation clears the cart before applying the new
lines. Checkout itself is a **browser navigation** to the store's checkout page,
never `fetch`. Skills: `cart-checkout.md`, `cart-sync.md`.

### 2.5 Catalogue

| Method | Path | CORS policy | Token | Purpose |
| --- | --- | --- | --- | --- |
| GET | `products` | `categories` | – | products by id, with optional variant expansion |
| GET | `products/associated` | `categories` | – | associated / related products |
| GET | `categories/{id}` | `categories` | – | category tree, product listing, filters |
| POST | `vql` | `vendre_query_language` | – | multi-resource query language |

- `GET products` query params: `id`, `order_by`, `mode`, `include_variants`,
  `fill_variant_products`. A direct product endpoint now exists, so a product
  lookup must never scan categories and does not depend on VQL being enabled.
- `GET products/associated` query params: `product_id` (required), `type_id`,
  `order_by`, `replace_variants`.
- `GET categories/{id}` query params: `sort_by`, `sort_order`, `page`, `limit`,
  `filter`, `f`, `pfrom`, `pto`, `tags` (array, bracket syntax).
- `POST vql` returns `500` for every body shape on installs where it is not
  enabled — fall back to `products` / `categories/{id}`.

Skills: `category-plp.md`, `pdp-products.md`, `vql-queries.md`.

### 2.6 Navigation, CMS, Localisation and SEO

| Method | Path | CORS policy | Token | Purpose |
| --- | --- | --- | --- | --- |
| GET | `navigation/menus` | `navigation_menus` | – | header, mega menu, footer |
| GET | `galleries/pagetree` | `galleries` | – | CMS page tree |
| GET | `galleries/{id}/pages` | `galleries` | – | pages in a gallery |
| GET | `galleries/{id}/content-blocks` | `galleries` | – | content blocks |
| GET | `galleries/boxes` | `galleries` | – | boxes / widgets |
| POST | `twig/render` | `default` | – | render a Twig block |
| POST | `galleries/twig/render` | `galleries` | – | render a Twig block in a gallery context |
| GET | `language-strings` | `default` | – | translated UI strings, query `locale` |
| GET | `translations` | `default` | – | alias of `language-strings`, query `locale` |
| GET | `sitemap` | `sitemap` | – | sitemap data, query `type`, `language`, `page` |

Menu items of type `information_page` point to galleries, not products.
Content-block image paths are relative and must be resolved against the store
base URL. Skills: `navigation-menus.md`, `cms-pages.md`, `cms-galleries.md`,
`ecommerce-seo.md`.

### 2.7 Favorites

| Method | Path | CORS policy | Token | Purpose |
| --- | --- | --- | --- | --- |
| GET | `favorites/lists` | `default` | – | favorite lists for the current customer |
| PUT | `favorites/lists/products` | `default` | yes | mutate list products, body `{ products: [...], empty }` |
| POST | `favorites/lists/products` | `default` | yes | alias of the `PUT` above |

### 2.8 Contact

| Method | Path | CORS policy | Token | Purpose |
| --- | --- | --- | --- | --- |
| POST | `contact` | `email/contact` | yes | contact form submission |

Note the slash in the policy name. Skill: `contact-forms.md`.


---

## 3. CORS Policy Matrix

Allowlist every storefront origin (dev, preview, production) under each policy
the app uses:

`oauth`, `bootstrap`, `session`, `customer`, `shopping_cart`, `checkout`,
`categories`, `navigation_menus`, `galleries`, `sitemap`,
`vendre_query_language`, `login`, `email/contact`, `default`.

Known traps:

- `accounts*` → **`default`** (not `customer`).
- `twig/render` → **`default`**.
- `contact` → **`email/contact`**.
- `login-link` has **no CORS support** and must go through the server proxy.
- A gateway-level `401` (bad bearer or failed session gate) carries **no CORS
  headers** and shows up in the browser as a generic CORS error — check bearer
  and session before touching the allowlist.

---

## 4. Common Error Codes

| Code / status | Meaning | Handling |
| --- | --- | --- |
| `SURFACE_SESSION_UNAUTHORIZED` (401) | Session cookie missing or rejected | Re-bootstrap once, replace the mutation token, retry. Never renew the bearer for this. |
| `401` without a Surface code | Bearer invalid or missing | Renew the OAuth token (respecting the cooldown in §1.8). |
| `SURFACE_ACCOUNT_MALFORMED_BODY` (422) | Partial field set on registration | Send the full documented body; map `source.parameter` to fields. |
| `404` on a route that should exist | Missing `crights` feature flag (§1.5) | Enable the feature in Admin, or hide it in the UI. |
| `429` | Rate or concurrency limit | Honour `Retry-After`, back off, keep the existing token. |
| `500` on `POST vql` | VQL not enabled on the install | Fall back to `categories/{id}`. |
