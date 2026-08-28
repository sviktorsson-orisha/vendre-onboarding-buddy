---
name: vendre-surface-v2
description: Core platform layer for a headless Vendre Surface API v2 storefront - request topology (server-side OAuth, direct browser calls, same-origin proxy fallback), bearer token caching and 429 quota, the Surface-Mutation-Protection-Token rule, error conventions, CORS allowlisting and checkout hand-off. Use when starting a Vendre frontend, wiring the proxy or token layer, or when every request suddenly fails with 429, 401 or CORS errors.
---

# Vendre Surface v2 platform layer

Scope: transport and platform only — how requests are made, authorised and
retried. Page-level endpoints live in the feature skills (`vendre-session-context`,
`vendre-customer-account`, `vendre-cart-checkout`, `vendre-pdp-products`,
`vendre-category-plp`, `vendre-cms-galleries`, `vendre-navigation-menus`,
`vendre-vql-queries`, `vendre-contact-forms`).

We work **exclusively against Surface API version 2** — every path is
`/surface/2/<endpoint>`. Never v1, never other Vendre APIs.

## Request topology

```text
browser ──GET /api/vendre/token──> server route (client_secret stays here)
   │                                    └─ POST /surface/2/oauth/token, cached ~1h
   ├──direct──> https://<store>/surface/2/*   (Bearer + credentials:"include")
   │              └─ Set-Cookie: session cookie → visitor's own cookie jar
   └──fallback──> /api/vendre/*   (same-origin proxy, only when CORS blocks)
```

1. **Only `oauth/token` and `oauth/revoke` run server-side** — they need
   `client_secret`. A tiny route returns `{ access_token, base_url }` with
   `cache-control: no-store`. The secret never reaches the browser.
2. **Everything else is called directly from the browser** with
   `credentials: "include"`, `mode: "cors"` and `Authorization: Bearer <token>`.
   This is the only way the store session cookie lands in the visitor's own
   cookie jar for the store domain.
3. **Keep a same-origin catch-all proxy as a silent fallback.** If a direct call
   throws (origin not allowlisted), flip a module flag to proxy mode and retry
   there. Never surface a CORS error to the user.
4. **Checkout is a real browser navigation** (`window.location.href`, `<a>`, or
   a form submit) to the store's own checkout page — never `fetch`/XHR. Passing
   the session id as a query parameter does **not** work; only the cookie does.
   If the app is stuck in proxy mode, checkout starts a fresh empty session —
   that is the signal the origin needs allowlisting.
5. **Env vars:** `VENDRE_BASE_URL`, `VENDRE_CLIENT_ID`, `VENDRE_CLIENT_SECRET`
   (secret, server-only). Read them inside handlers, not at module scope.
6. **Array query params use brackets**: `tags[]=64&tags[]=81`.

## OAuth token lifecycle and quota

`POST /surface/2/oauth/token` is protected by both a rate limit and an adaptive
concurrency limit. Minting a token per request burns the quota in seconds and
takes the whole storefront down with 429/502.

1. **One token, ~1 hour.** Fetch once, keep until expiry, renew 60s before
   `expires_in` runs out. Never one token per request or per page load.
2. **Cache on `globalThis`**, not module scope — HMR and separate route bundles
   otherwise each mint their own:

   ```ts
   type TokenCache = { state: TokenState | null; inflight: Promise<TokenState> | null; cooldownUntil: number; lastRenewAt: number };
   const g = globalThis as typeof globalThis & { __vendreToken?: TokenCache };
   const cache = (g.__vendreToken ??= { state: null, inflight: null, cooldownUntil: 0, lastRenewAt: 0 });
   ```
3. **De-duplicate concurrent mints** with the `inflight` promise.
4. **At most one retry on 429**, honouring `Retry-After` (clamp 1–5s), then a
   **60s cooldown** during which the existing token is reused. A stale token
   that still works beats failing every request.
5. **Minimum renew interval 60s.** A forced renew right after a successful one
   is almost always a *session* 401, not an expired token.
6. **Distinguish session 401 from token 401.** `SURFACE_SESSION_UNAUTHORIZED`
   triggers `session/bootstrap`, never a bearer renew.
7. **Request format**: `Content-Type: application/x-www-form-urlencoded` with
   `client_id`, `client_secret`, `grant_type=client_credentials`. Renew with
   `grant_type=refresh_token`, falling back to `client_credentials` when the
   refresh token is rejected or reused. `oauth/revoke` uses the same encoding.
8. **Propagate 429 honestly** — return 429 with `Retry-After` and the
   `RateLimit-*` headers instead of collapsing it into a 502.

`concurrencylimit-remaining: 0` on the token response means the store is
throttling, not that the credentials are wrong.

## Surface-Mutation-Protection-Token

The most common source of silent failures in Vendre frontends.

- The token comes from `POST /surface/2/session/bootstrap`
  (`surface_mutation_protection_token`, ~1h). Keep it in a module-level variable
  or app state — **not** `localStorage` — so a re-bootstrap always wins over
  stale React state.
- **Every POST/PUT/DELETE carries it**: `shopping-cart/*`, coupons
  (`activate` / `deactivate` / `reset`), `login/*`, `logout`, `accounts`,
  `accounts/me` (PUT), `accounts/me/addresses` (PUT), `session`, `session/end`,
  `contact`, `checkout/upsell/*`.
- Exceptions both ways: `shopping-cart/coupons/check` does **not** need it;
  `GET accounts/me/forgot-password` **does**, despite being a GET — a client
  that only attaches it on non-GET calls must special-case this.
- **Replace the stored token** with the fresh one returned by login
  (`mutationProtectionToken`), logout, and any re-bootstrap after a session 401.
- Attach it in the shared client, never per call site.

## Errors and resilience

- Errors are
  `{ "errors": [{ "code", "status", "public", "title", "source": { "parameter" } }] }`.
  Parse into a typed `VendreApiError`.
- **401 is a state, not a crash** — the proxy returns it softly so the UI can
  show "signed out"; throttle re-bootstraps so a stale session cannot loop.
- **422** → map each error's `source.parameter` to the matching form field.
- **429** → respect `Retry-After` and `RateLimit-*`, back off, say the store is
  busy.

## CORS allowlist (Admin → Headless → CORS, `/Admin/configuration?gID=232`)

Add every frontend origin (scheme + host, no trailing slash: dev, preview and
production) to the policies: `oauth`, `bootstrap`, `session`, `customer`,
`shopping_cart`, `default` (this is where `accounts*` **and** Twig rendering
resolve), `categories`, `navigation_menus`, `sitemap`, `vendre_query_language`,
`galleries`, `login`, `email/contact`.

## Build order

1. Server token helper + `/api/vendre/token` route + `/api/vendre/*` proxy
   fallback with cookie rewrite (`vendre-session-context`).
2. Browser client: direct-first request, proxy fallback, mutation token, retry
   and backoff, one-shot re-bootstrap on session 401.
3. Session provider that bootstraps once and gates every other call.
4. Feature routes: home, category (PLP), product (PDP), cart, account, CMS.

Related: `vendre-caching`, `vendre-store-troubleshooting`.
