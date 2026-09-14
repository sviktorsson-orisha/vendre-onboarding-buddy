# Checkout handover via session/handover

Today the checkout button just sends the visitor to `<store>/checkout` and relies on the
session cookie surviving the jump. The new endpoint gives us a proper handover token, so
the cart follows the customer even when the cookie does not.

Since the response shape is undocumented, the work starts by calling the endpoint once and
reading the actual answer, then building on what it returns.

## Step 1 — Probe the endpoint

Call `POST /surface/2/session/handover` through our own proxy with a live session and a
mutation token, log the full JSON, and record the field names (token, expiry, and possibly a
ready-made URL).

If the call fails (400/401), report exactly what came back and stop before changing the
storefront, so we do not guess.

## Step 2 — Use it for checkout

- Before navigating, flush pending cart changes and refetch the cart (current behaviour kept).
- Then request a handover token and build the checkout destination:
  - If the response contains a complete URL, navigate to it.
  - Otherwise append the token to `<store base>/checkout` using the parameter name the
    response reveals in step 1.
- If the handover call fails, fall back to today's plain `<store>/checkout` link so the button
  never dead-ends.
- Keep the checkout button in its short pending state while this runs.

## Step 3 — Documentation

Add the endpoint to `.vendre/knowledge/api-reference.md` (method, mutation-token requirement,
observed response) and update `.vendre/skills/cart-checkout.md` so the checkout hand-off
section describes the handover flow instead of the bare navigation.

## Technical notes

- New `session/handover` call goes through the existing same-origin proxy
  `src/routes/api/vendre/surface/$.ts`; no client-side store URL or credentials.
- It is a POST, so it carries `Surface-Mutation-Protection-Token` via the shared client
  (`guarded()` handles the 401 re-bootstrap and retry).
- `checkoutUrl()` in `src/lib/vendre/api.ts` becomes the place that mints the handover token;
  the demo adapter keeps returning `null`.
- `src/components/store/cart-sheet.tsx` keeps a real browser navigation (`window.location.href`),
  never `fetch`.
