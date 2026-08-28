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
| POST | `session` | `session` | yes | change market / currency / language / VAT |
| POST | `session/end` | `session` | yes | clear customer identity, keep visitor session |

Skills: `session-context.md`, `session-store-context.md`, `mutation-tokens.md`.

### 2.3 Accounts and Authentication

All `accounts*` endpoints resolve to the **`default`** CORS policy, not `customer`.

| Method | Path | CORS policy | Token | Purpose |
| --- | --- | --- | --- | --- |
| POST | `accounts` | `default` | yes | registration (full field set required) |
| GET | `accounts/me` | `default` | – | profile (flat / nested / alias shapes) |
| PUT | `accounts/me` | `default` | yes | update profile |
| GET | `accounts/me/addresses` | `default` | – | address book |
| PUT | `accounts/me/addresses` | `default` | yes | update address |
| GET | `accounts/me/order-history` | `default` | – | order list |
| GET | `accounts/me/order-history/{id}` | `default` | – | single order |
| GET | `accounts/me/users` | `default` | – | sub-users (B2B) |
| GET | `accounts/me/forgot-password` | `default` | yes | password reset mail |
| GET | `customers/current` | `default` | – | current customer record |
| POST | `login/email` | `login` | yes | login with `{ email, password }` |
| GET | `login/google-sso` | `login` | – | Google SSO redirect |
| GET | `login/microsoft-sso` | `login` | – | Microsoft SSO redirect |
| POST | `login-link` | **no CORS** | yes | magic login link — server proxy only |
| POST | `logout` | `login` | yes | logout, rotates the mutation token |

Auth state is read from `GET session/context`, never from the login response
alone. Skills: `account-auth.md`, `customer-account/SKILL.md`,
`auth-sessions/SKILL.md`, `sso-login.md`.

### 2.4 Shopping Cart and Checkout

| Method | Path | CORS policy | Token | Purpose |
| --- | --- | --- | --- | --- |
| GET | `shopping-cart` | `shopping_cart` | – | lines, totals, coupons (never cache) |
| POST | `shopping-cart/products` | `shopping_cart` | yes | add / set quantity, batch `{ products: [...] }` |
| DELETE | `shopping-cart` | `shopping_cart` | yes | remove line |
| POST | `shopping-cart/coupons/activate` | `shopping_cart` | yes | apply coupon |
| POST | `shopping-cart/coupons/deactivate` | `shopping_cart` | yes | remove coupon |
| POST | `shopping-cart/coupons/reset` | `shopping_cart` | yes | clear coupons |
| POST | `shopping-cart/coupons/check` | `shopping_cart` | **no** | validate coupon code |
| POST | `checkout/upsell/get-prices` | `checkout` | yes | upsell pricing |
| POST | `checkout/upsell/add-products` | `checkout` | yes | add upsell products |

Checkout itself is a **browser navigation** to the store's checkout page, never
`fetch`. Skills: `cart-checkout.md`, `cart-sync.md`.

### 2.5 Catalogue

| Method | Path | CORS policy | Token | Purpose |
| --- | --- | --- | --- | --- |
| GET | `categories/{id}` | `categories` | – | category tree, product listing, filters |
| POST | `vql` | `vendre_query_language` | – | multi-resource query language |

`POST vql` returns `500` for every body shape on installs where it is not
enabled — fall back to `categories/{id}`. Skills: `category-plp.md`,
`pdp-products.md`, `vql-queries.md`.

### 2.6 Navigation, CMS and SEO

| Method | Path | CORS policy | Token | Purpose |
| --- | --- | --- | --- | --- |
| GET | `navigation/menus` | `navigation_menus` | – | header, mega menu, footer |
| GET | `galleries/pagetree` | `galleries` | – | CMS page tree |
| GET | `galleries/{id}/pages` | `galleries` | – | pages in a gallery |
| GET | `galleries/{id}/content-blocks` | `galleries` | – | content blocks |
| GET | `galleries/boxes` | `galleries` | – | boxes / widgets |
| POST | `twig/render` | `default` | – | render a Twig block |
| GET | `sitemap` | `sitemap` | – | sitemap data |

Menu items of type `information_page` point to galleries, not products.
Content-block image paths are relative and must be resolved against the store
base URL. Skills: `navigation-menus.md`, `cms-pages.md`, `cms-galleries.md`,
`ecommerce-seo.md`.

### 2.7 Contact

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
