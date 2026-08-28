---
name: vendre-oauth-quota
description: OAuth bearer token caching and 429 rate/concurrency limits on Vendre Surface v2 oauth/token. Use when the store returns 429, when every request fails at once, or when implementing bearer token handling for a Vendre frontend.
---

# Vendre OAuth token lifecycle and quota (Surface v2)

`POST /surface/2/oauth/token` is protected by both a rate limit and an adaptive
concurrency limit. Minting a token per request burns the quota in seconds and
takes the whole storefront down with 429/502.

## Rules

1. **One token, ~1 hour.** Fetch it once, keep it until it expires, and only
   then request a new one. Renew 60s before `expires_in` runs out. Never one
   token per request or per page load.
2. **Cache on `globalThis`**, not module scope — HMR and separate route bundles
   otherwise each mint their own:

   ```ts
   type TokenCache = { state: TokenState | null; inflight: Promise<TokenState> | null; cooldownUntil: number; lastRenewAt: number };
   const g = globalThis as typeof globalThis & { __vendreToken?: TokenCache };
   const cache = (g.__vendreToken ??= { state: null, inflight: null, cooldownUntil: 0, lastRenewAt: 0 });
   ```
3. **De-duplicate concurrent mints** with the `inflight` promise.
4. **At most one retry on 429**, honouring `Retry-After` (clamp 1–5s), then a
   **60s cooldown** during which the existing token is reused and no new mint is
   attempted. A stale token that still works beats failing every request.
5. **Minimum renew interval 60s.** A forced renew right after a successful one
   is almost always a *session* 401, not an expired token — keep the current token.
6. **Distinguish session 401 from token 401.** `SURFACE_SESSION_UNAUTHORIZED`
   triggers `session/bootstrap`, never a bearer renew.
7. **Request format**: `Content-Type: application/x-www-form-urlencoded` with
   `client_id`, `client_secret`, `grant_type=client_credentials`. Renew with
   `grant_type=refresh_token`, falling back to `client_credentials` when the
   refresh token is rejected or reused. `oauth/revoke` uses the same encoding.
8. **Propagate 429 honestly** — return status 429 with `Retry-After` and the
   `RateLimit-*` headers instead of collapsing it into a 502, so the UI can back
   off and say "the store is busy" rather than "something went wrong".

## Diagnosing

`concurrencylimit-remaining: 0` on the token response means the store is
throttling, not that the credentials are wrong. Wait out `Retry-After`, then
verify with a single manual token call before hunting for a code bug.
