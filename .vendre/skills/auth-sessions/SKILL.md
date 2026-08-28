---
name: vendre-auth-sessions
description: Build Vendre Surface API v2 customer authentication in a headless storefront — session bootstrap, login, registration, logout, staying logged in across reloads, and the account area (profile, address book, users, order history, order detail). Use when a Vendre project needs sign-in, "create account", "my pages", or when users get signed out unexpectedly, hit SURFACE_SESSION_UNAUTHORIZED 401s, SURFACE_ACCOUNT_MALFORMED_BODY 422s, or CORS failures on /surface/2/accounts.
---

# Vendre customer auth & sessions

Working, battle-tested setup for customer auth against Vendre Surface API v2.
Copy the templates in `assets/`, then follow the rules below — they exist
because each one was a real bug that took hours to find.

## Architecture in one picture

```text
browser  ──> createServerFn (vendre.functions.ts)  ──> proxy (vendre.server.ts) ──> store
   |            reads/writes first-party cookie          OAuth token cache
   |            "vendre_sid" (HttpOnly)                  client_secret (server env only)
   |
   └─ VendreProvider (session, mutation token, ready-gate)
        └─ AccountProvider (auth state, login/register/logout, account queries)
```

Env: `VENDRE_BASE_URL`, `VENDRE_CLIENT_ID`, `VENDRE_CLIENT_SECRET` (secret,
server-only).

## The ten rules

1. **Only `POST /surface/2/session/bootstrap` may establish the session cookie.**
   If any other call writes its `Set-Cookie` back, concurrent page-load requests
   (menus, cart, context) each mint their own visitor session and overwrite the
   real one — the user appears randomly signed out. Other calls may only
   *refresh* a cookie that already existed on the request.
2. **Gate every non-bootstrap client call on a shared `ready` promise.** Without
   it, first paint races bootstrap and the first requests run session-less.
3. **Auth state comes from `GET /surface/2/session/context`**, never from the
   login response alone. After login and logout call `refreshSession()` and
   replace the stored `surface_mutation_protection_token`.
4. **Session must survive a hard reload**: mirror the store session into a
   first-party `HttpOnly; Secure; SameSite=None; Partitioned` cookie
   (`SameSite=Lax` is dropped inside the preview iframe). Keep a `localStorage`
   fallback for environments without cookies.
5. **Login body uses `email`**, not `email_address`. Registration needs the full
   field set (see `references/login-register.md`).
6. **Every POST/PUT/DELETE carries `Surface-Mutation-Protection-Token`.**
7. **`client_secret` is server-only**; the OAuth call is
   `application/x-www-form-urlencoded`, cached until expiry, refreshed via
   `grant_type=refresh_token` with a `client_credentials` fallback.
8. **401 is a state, not a crash.** The proxy returns 401 softly so the UI shows
   "signed out"; add a throttled re-bootstrap so a stale session doesn't loop.
9. **Parse Surface errors into a typed `VendreApiError`** so 422 field messages
   reach the form instead of a generic failure.
10. **`/surface/2/accounts*` resolves to the `default` CORS policy.** Preview
    origins are usually not allowlisted, so attempt direct-to-store and fall
    back to the server proxy silently — never surface a CORS error to the user.

## Build order

1. Copy `assets/vendre.server.ts` and `assets/vendre.functions.ts`; add the
   three env vars.
2. Copy `assets/vendre-session.tsx`; mount `<VendreProvider>` in
   `src/routes/__root.tsx`.
3. Copy `assets/vendre-account.tsx`; mount `<AccountProvider>` **inside**
   `VendreProvider`. Import both through the `@/lib/...` alias everywhere —
   mixing relative and alias imports duplicates the module and throws
   "useAccount must be used inside <AccountProvider>".
4. Build `/login` (sign-in + register in one route) per
   `references/login-register.md`.
5. Build the account area per `references/account-pages.md`.
6. When something breaks, go to `references/troubleshooting.md` first.

## References

- `references/session-lifecycle.md` — bootstrap, cookies, race conditions
- `references/login-register.md` — exact payloads and error handling
- `references/account-pages.md` — tabbed account area structure
- `references/troubleshooting.md` — symptom → cause table
