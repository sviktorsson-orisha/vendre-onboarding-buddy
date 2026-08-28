---
name: vendre-architecture-bootstrap
description: Request topology for a headless Vendre Surface API v2 storefront - server-side OAuth only, direct browser-to-store calls with credentials include, same-origin proxy fallback, and checkout hand-off by real navigation. Use when starting a new Vendre frontend or when the store session or cart does not follow the visitor into checkout.
---

# Vendre Surface v2 storefront architecture

We work **exclusively against Surface API version 2** — every path is
`/surface/2/<endpoint>`. Never v1, never other Vendre APIs.

This is the single most expensive thing to get wrong. Build it this way from
day one.

```text
browser ──GET /api/vendre/token──> server route (client_secret stays here)
   │                                    └─ POST /surface/2/oauth/token, cached ~1h
   ├──direct──> https://<store>/surface/2/*   (Bearer + credentials:"include")
   │              └─ Set-Cookie: session cookie → visitor's own cookie jar
   └──fallback──> /api/vendre/*   (same-origin proxy, only when CORS blocks)
```

## Rules

1. **Only `oauth/token` and `oauth/revoke` run server-side** — they need
   `client_secret`. A tiny route returns `{ access_token, base_url }` with
   `cache-control: no-store`. The secret never reaches the browser.
2. **Everything else is called directly from the browser** —
   `session/bootstrap`, `session`, `login/*`, `shopping-cart/*`, `accounts/*` —
   with `credentials: "include"`, `mode: "cors"` and
   `Authorization: Bearer <token>`. This is the only way the store session
   cookie lands in the visitor's own cookie jar for the store domain.
3. **Keep a same-origin catch-all proxy as a silent fallback.** If the direct
   call throws (origin not CORS-allowlisted), flip a module flag to proxy mode
   and retry there. Never surface a CORS error to the user.
4. **Checkout is a real browser navigation** (`window.location.href`, `<a>`, or
   a form submit) to the store's own checkout page — never `fetch`/XHR. Passing
   the session id as a query parameter does **not** work; only the cookie does.
   If the app is stuck in proxy mode, checkout starts a fresh empty session —
   that is the signal the origin needs allowlisting.
5. **Env vars:** `VENDRE_BASE_URL`, `VENDRE_CLIENT_ID`, `VENDRE_CLIENT_SECRET`
   (secret, server-only). Read them inside handlers, not at module scope.
6. **Mutation token** lives in a module-level variable (not `localStorage`) so a
   re-bootstrap always beats stale React state — see `vendre-mutation-tokens`.
7. **Array query params use brackets**: `tags[]=64&tags[]=81`.
8. **Errors**: parse `{ errors: [{ code, status, title }] }` into a typed error;
   401 is a state, not a crash.

## Build order

1. Server token helper + `/api/vendre/token` route + `/api/vendre/*` proxy
   fallback (with cookie rewrite, see `vendre-session-store-context`).
2. Browser client: direct-first request, proxy fallback, mutation token, retry
   and backoff, one-shot re-bootstrap on session 401.
3. Session provider that bootstraps once and gates every other call on a shared
   `ready` promise.
4. Feature routes: home, category (PLP), product (PDP), cart, account, CMS.

## CORS allowlist (Admin → Configuration → Surface)

Add every frontend origin (scheme + host, no trailing slash: dev, preview and
production) to the policies: `oauth`, `bootstrap`, `session`, `customer`,
`shopping_cart`, `default` (this is where `accounts*` resolves!), `categories`,
`navigation_menus`, `sitemap`, `vendre_query_language`, `galleries`,
`email/contact`.

Related: `vendre-oauth-quota`, `vendre-session-store-context`,
`vendre-mutation-tokens`, `vendre-store-troubleshooting`.
