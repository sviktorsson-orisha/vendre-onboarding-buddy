# Account area

## Routes

```text
/account                 layout with a top tab menu + auth guard
  /account               profile edit form
  /account/addresses     main address + list of saved addresses
  /account/users         sub-users on the account
  /account/orders        order list
  /account/orders/$id    order detail
```

The layout route renders the tabs and `<Outlet />`, and redirects to `/login`
when the session context says unauthenticated (after the ready-gate resolves —
never before, or a reload bounces the user out).

## Endpoints

| View | Call |
| --- | --- |
| Profile read | `GET /surface/2/accounts/me` |
| Profile update | `PUT /surface/2/accounts/me` (mutation token) |
| Addresses | `GET`/`PUT /surface/2/accounts/me/addresses` |
| Orders | `GET /surface/2/accounts/me/order-history` |
| Order detail | `GET /surface/2/accounts/me/order-history/{id}` |

Never cache account data across sessions. React Query with
`staleTime: 0` and cache clearing on logout.

## Normalization

The API is inconsistent about key naming across stores and endpoints. Normalize
once at the boundary rather than in components:

```ts
function normalizeAccount(raw) {
  return {
    id: raw.id ?? raw.account_id,
    firstname: raw.firstname ?? raw.first_name,
    lastname: raw.lastname ?? raw.last_name,
    email: raw.email_address ?? raw.email,
    ...
  };
}
```

Do the same for orders: the list may arrive as an array, as `{ data: [...] }`,
or as `{ order_history: [...] }`, and order ids appear as `id`, `order_id`, or
`increment_id`. A missing normalizer is why "orders don't show up" even though
the account has orders.

## Profile update

`PUT /surface/2/accounts/me` generally rejects partial bodies — send the full
required field set (same shape as registration, minus `password`), merging the
edited fields over the current account.
