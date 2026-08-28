---
name: vendre-cart-checkout
description: Vendre Surface v2 shopping cart and checkout hand-off - live cart reads, optimistic local state with debounced background sync, quantity steppers, line removal, discount coupons, checkout upsell, and the mandatory flush-and-verify before navigating to checkout. Use when building a cart drawer or cart page, or when the cart jumps back, shows wrong totals, or arrives empty at checkout.
---

# Cart and checkout (Surface v2)

The cart must feel instant locally **and** always be true in the store before
checkout.

## Live reads

- `GET /surface/2/shopping-cart` — lines, totals, coupons.
- **Never cache**: `staleTime: 0`, `gcTime: 0`, refetch on view load. The
  optimistic layer below is the only client-side state, and it is always
  reconciled against the store.

## Optimistic local state

- Quantity changes, line removals and totals update **immediately** in the UI.
  No spinner on plus/minus, no waiting for the network.
- Local state is a layer on top of the server cart, keyed per line item.

## Debounced background sync

- Every change schedules an async sync to
  `POST /surface/2/shopping-cart/products` (add / set quantity) or
  `DELETE /surface/2/shopping-cart` (remove), always with
  `Surface-Mutation-Protection-Token`.
- **Debounce ~400–600 ms** and coalesce: rapid consecutive changes to the same
  line collapse into **one** request carrying the latest state. Last write wins.
- Keep at most **one inflight sync**; queue the newest pending state and fire it
  when the current request resolves. Never build a backlog of intermediate
  quantities — it wastes quota and can race into wrong totals.
- Add payloads may carry `attributes`, `comments` and `data`, and support the
  batch form `{ "products": [...] }`.

## Reconcile

- On success: invalidate the cart query and replace the local view with the
  store's response. Prices, discounts, coupon effects and stock adjustments are
  the server's truth, not the client's arithmetic. Item counts and totals must
  update everywhere at once (header badge, drawer, cart page).
- On failure: roll back the optimistic change, show a discreet message, refetch.
- Session 401 during sync: re-bootstrap once, replace the mutation token, retry.

## Coupons

- `POST shopping-cart/coupons/check` — validate (no mutation token needed).
- `POST shopping-cart/coupons/activate`, `/deactivate`, `/reset` — all require
  the mutation token. Any coupon change invalidates the cart like a line change.

## Upsell

`POST /surface/2/checkout/upsell/get-prices` and
`POST /surface/2/checkout/upsell/add-products`, both with the mutation token.

## Flush and verify before checkout

The checkout button must not navigate immediately:

1. Flush all pending/debounced mutations and await them.
2. Fresh `GET /surface/2/shopping-cart`.
3. Compare lines and quantities with local state.
   - Match → **real browser navigation** to the store's checkout page (never
     `fetch`; the session cookie is what carries the cart over).
   - Mismatch → update the view and let the customer confirm instead of sending
     them into checkout with the wrong order.

Show the button in a short pending state while this runs; it is the one place
where waiting is correct. An empty cart at checkout means the session cookie
lives only in the proxy's jar — see `vendre-store-troubleshooting`.
