# Sign-up fields driven by the store's own settings

## Confirmed

`GET /surface/2/accounts/form` now answers on your store. It returns every
registration field with whether it should be shown, whether it is required and
its length limits — including `personnummer` (shown, required, 10–15 chars),
`company`, `vat_identification_number`, `telephone`, `mobile`, `fax` and
`street_address2` (hidden today).

## What I will build

1. The create-account page fetches this list when it opens and builds the form
   from it: only fields marked for display appear, and only those marked
   required are mandatory. Turning a setting on or off in admin is then
   reflected in the form with no code change.
2. Add the inputs the list can now switch on: personal ID number, company,
   VAT/organisation number, phone, mobile, fax, second address line — each with
   Swedish and English labels.
3. Apply the length limits from the response as field limits, so the customer
   gets a clear message instead of a rejected submission.
4. If the call ever fails, keep the current fixed field list as a fallback so
   sign-up still works.
5. Update the documentation with the new path and its response shape.

## Technical notes

- `src/lib/vendre/account.ts`: `getRegisterConstraints()` becomes an async proxy
  fetch of `accounts/form`, normalising `{ field: { display, required,
  min_length, max_length } }` into `RegisterConstraints`
  (`shown`/`required`/`minLength`/`maxLength` per key), falling back to
  `DEFAULT_REGISTER_CONSTRAINTS` on error. `useRegisterConstraints` keeps its
  10-minute cache and current return shape.
- `buildRegisterBody` keeps sending only displayed fields plus `email_address`,
  and keeps omitting blank optional keys (the store rejects empty strings).
  `confirmation` stays tied to whether a password was entered.
- `src/pages/LoginPage.tsx`: extend the existing `shown()` / `needed()` blocks
  with the new field keys and pass `minLength` / `maxLength`; add the keys to
  the initial `RegisterInput` state and to `src/types/vendre-account.ts`.
- i18n keys for the new labels in `src/lib/i18n.tsx` (sv + en).
- Docs: `.vendre/knowledge/api-reference.md` and
  `.vendre/skills/account-auth.md`.
