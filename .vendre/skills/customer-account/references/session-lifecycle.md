# Session lifecycle

## Bootstrap

On app start, `POST /surface/2/session/bootstrap` through the server proxy.
Response gives `session_id`, `authenticated`, `customer`, `cart_item_count`,
and `surface_mutation_protection_token` (valid ~1h or until session end).

Keep the token in React state. Do **not** put it in `localStorage`.

## The cookie

The store's session cookie lives on the store's domain, so the browser cannot
own it. The server mirrors it into a first-party cookie:

```
vendre_sid=<urlencoded>; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=None; Partitioned
```

`SameSite=None; Partitioned` is required — a `SameSite=Lax` cookie is dropped
inside the Lovable preview iframe, which is exactly the "refreshing signs me
out" bug.

## Who may write the cookie

```ts
// bootstrap: always establishes
writeSessionCookie(res.cookie);

// every other call: only refresh an existing session
if (incoming) writeSessionCookie(res.cookie);
```

Without the `if (incoming)` guard, menus/cart/context calls that race bootstrap
each receive a brand-new visitor session from the store and the last response
wins — silently discarding the authenticated session.

## The ready-gate

`VendreProvider` holds a `readyRef` promise resolved when bootstrap completes.
Every `call()` other than bootstrap awaits it first:

```ts
async function call(input) {
  if (input.path !== BOOTSTRAP_PATH) await readyRef.current;
  ...
}
```

## Refreshing after auth changes

Login and logout both rotate the mutation token. After either:

1. store `mutationProtectionToken` from the response,
2. call `refreshSession()` → `GET /surface/2/session/context`,
3. derive `authenticated` / `customer` from that context response.

## 401 handling

`surfaceRequest` returns `{ status: 401, ... }` instead of throwing for
`SURFACE_SESSION_UNAUTHORIZED`. The provider treats it as signed-out and
triggers at most one re-bootstrap per throttle window (e.g. 5s) so a stale
session cannot loop.

## Ending a session

`POST /surface/2/session/end` with the mutation token clears the customer
identity but keeps an anonymous visitor session. Re-bootstrap afterwards and
clear the account query cache.
