---
name: vendre-session-store-context
description: Vendre Surface v2 session lifecycle and store branding - bootstrap once, ready-gate every call, read store name/logo/currency/VAT from session context, switch market or currency, and cookie rules for preview iframes. Use when wiring app startup, branding, or price/VAT display for a Vendre storefront.
---

# Session and store context (Surface v2)

All endpoints below are under `/surface/2/`. The session is the source of both
the visitor identity **and** the store's own settings.

## Lifecycle

1. **`POST session/bootstrap`** exactly once at app start. It sets the store
   session cookie and returns `surface_mutation_protection_token`
   (valid ~1h). Only this call may establish the session cookie — if any other
   response's `Set-Cookie` is written back, concurrent first-paint requests each
   mint their own visitor session and the user appears randomly signed out.
2. **Gate every other call on a shared `ready` promise.** Without it the first
   paint races bootstrap and those requests run session-less and 401.
3. **`GET session`** — compact status (authenticated, cart item count).
4. **`GET session/context`** — extended context, see below.
5. **`POST session`** — change `market`, `currency`, `language`
   (`{id}` or `{code}`), `prices_include_vat`. Requires the mutation token.
   Invalidate price-dependent caches (categories, products, cart) afterwards.
6. **`POST session/end`** — clears the customer identity, keeps the visitor
   session. Requires the mutation token.

## Store details come from the session — never hardcode

`GET session/context` exposes the store's own configuration:

- `STORE_NAME` and `SHOP_LOGO` → header, footer, page titles, favicon alt text
- `currency.code`, `language.code`, `market.id` → formatting and switchers
- `prices_include_vat` → whether displayed prices include VAT
- `customer` (`first_name`, `last_name`, …) when authenticated

Never hardcode a brand name, logo asset, currency or VAT assumption. If the
storefront shows it, it should come from session context.

## Cookie rules

The store sets its session cookie as `Secure; SameSite=None`. When the
same-origin proxy fallback re-scopes it to the app origin, rewrite it to:

```text
Path=/; Secure; SameSite=None; Partitioned
```

`Partitioned` (CHIPS) is mandatory — inside an embedded preview iframe the
cookie is otherwise dropped and every session-scoped call 401-loops.
`SameSite=Lax` is dropped too. Keep a `localStorage` mirror only as a fallback
for environments without cookies.

## 401 handling

A `SURFACE_SESSION_UNAUTHORIZED` 401 means the session died — re-bootstrap once
(de-duplicated promise), replace the mutation token, retry the original request.
It must **not** trigger an OAuth token renew (see `vendre-oauth-quota`).
Throttle re-bootstraps so a permanently stale session cannot loop.
