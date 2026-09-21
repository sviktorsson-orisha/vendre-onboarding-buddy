# Fix "Unable to create account with provided payload"

Creating an account fails with a 422 from the store
(`SURFACE_ACCOUNT_MALFORMED_BODY`). The form itself is fine — the store rejects
the data we send along with it.

## What changed

Earlier the sign-up sent the store's complete documented field list. In the last
round of API updates we trimmed it down to only the fields the form shows. The
store still expects the full list, so it now refuses the registration.

## Fix

1. Send the store's complete registration field list again: the filled-in
   values from the form, plus empty/neutral defaults for the fields the form
   does not ask for (company, phone, personal ID number, VAT number, newsletter,
   customer type, and so on).
2. Keep the form exactly as it looks today — no new visible fields.
3. Keep the friendly "your account is awaiting approval" message working for
   stores that require manual activation.
4. Verify by creating a real test account against the store and confirming it
   returns success instead of 422, then check the account appears in the store.
5. If the store still answers 422, read which field it names in the error and
   correct just that one; the error carries the field name.

## Technical notes

- `buildRegisterBody` in `src/lib/vendre/account.ts` currently filters the body
  through `RegisterConstraints.visible`. Restore the full documented payload as
  the base and use the constraints only to decide which inputs the form renders,
  not which keys are sent.
- Required set per `.vendre/knowledge/api-reference.md`: `email_address`,
  `password`, `confirmation`, `firstname`, `lastname`, `street_address`,
  `postcode`, `city`, numeric `country`. Optional keys sent as defaults:
  `type`, `gender`, `company`, `telephone`, `mobile`, `personnummer`,
  `vat_identification_number`, `newsletter`, `consent_personal_data_policy`.
- 422 field errors already map to form fields via `source.parameter`; leave that
  path untouched.
