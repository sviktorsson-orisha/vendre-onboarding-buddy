---
name: vendre-account-auth
description: Vendre Surface v2 customer auth and account data - login/logout, deriving auth state from session context, normalising the many shapes of accounts/me, address book, registration, order history and password reset. Use when building sign-in, profile forms or account pages against Vendre.
---

# Customer auth and account data (Surface v2)

## Login and logout

- **Login:** `POST /surface/2/login/email` with `{ "email": "...", "password": "..." }`.
  The field is `email`, **not** `email_address`. Mutation token required.
- **Logout:** `POST /surface/2/logout`, mutation token required.
- **Auth state is read from `GET /surface/2/session/context`**, never from the
  login response alone. After both login and logout: refresh the session, replace
  the stored mutation token, and invalidate all customer-scoped queries.
- Alternative logins if the store enables them: `login/google-sso`,
  `login/microsoft-sso`, BankID (`bankid/qr-token`, `bankid/status`,
  `bankid/login`), and the magic link `login-link` (no CORS support — must go
  through the server proxy).

## Reading the profile correctly

`GET /surface/2/accounts/me` does not have one fixed shape. Depending on the
store it returns fields:

- **flat** (`firstname`, `postcode`, …)
- **nested** under `account`, `customer`, `address` or `data`
- **with alias keys**: `email` / `email_address`, `phone` / `telephone` /
  `mobile`, `zip` / `postcode`, `street` / `street_address`

A profile reader must normalise all three forms into one typed object, then
merge in the address book (`GET /surface/2/accounts/me/addresses`) for the
address fields before populating the form. Symptom of getting this wrong: login
works and saving works, but the form renders empty.

Writing back: `PUT /surface/2/accounts/me` and
`PUT /surface/2/accounts/me/addresses`, sending the store's canonical key names
(the ones it returned), with the mutation token.

## Registration

`POST /surface/2/accounts` with the full documented field set —
`firstname`, `lastname`, `email_address`, `password`, `confirmation`, `type`,
`gender`, `company`, `street_address`, `postcode`, `city`, `country`,
`telephone`, `mobile`, `personnummer`, `vat_identification_number`,
`newsletter`, `consent_personal_data_policy`. Map validation errors from each
error's `source.parameter` to the matching field.

## Orders and password reset

- `GET /surface/2/accounts/me/order-history` and `/order-history/{id}`.
- `GET /surface/2/accounts/me/forgot-password` — requires the mutation token
  even though it is a GET.
- `GET /surface/2/customers/current` is a lightweight logged-in check when the
  full profile is not needed.

## Non-negotiables

- **Never cache** account data or order history — fetch fresh on every view.
- All `accounts*` endpoints resolve to the **`default`** CORS policy, not
  `customer`. Allowlist the frontend origin there or the calls fall back to the
  proxy.
