# Use GET accounts/form to drive the sign-up fields

## Status check

I called the new path against your store just now: the session starts fine
(200), but `accounts/form` answers **404**. So on this store it is either not
deployed yet or sits behind a different name. The plan below builds against it
anyway and degrades safely until it answers.

## What I will build

1. Fetch the field list from `accounts/form` when the create-account page opens,
   cached for the session.
2. Map the response onto the form's existing field-rules object, so every field
   the store has switched on is shown and marked required automatically:
   company name, organisation/personal ID number, phone, and the rest.
3. If the call fails (404 today, or the store is offline), fall back to the
   current fixed list so sign-up keeps working exactly as it does now — and log
   nothing noisy in the browser.
4. Add the personal ID number input to the form so today's required field is
   covered even while the endpoint is missing.
5. Update the documentation with the new path, its response shape, and the
   fallback behaviour.

Once the endpoint goes live nothing more is needed from me — the form follows
the admin settings on its own.

## Technical notes

- `src/lib/vendre/account.ts`: `getRegisterConstraints()` becomes an async fetch
  of `accounts/form` through the proxy, normalising both a field array and a
  keyed object into `RegisterConstraints` (`shown` / `required` per field);
  unknown keys are ignored, missing response falls back to
  `DEFAULT_REGISTER_CONSTRAINTS`. `useRegisterConstraints` keeps its 10-minute
  cache and its current return shape, so `LoginPage.tsx` needs no rework.
- `src/pages/LoginPage.tsx`: add the `personnummer` input after the password
  fields with `required={needed("personnummer")}` and the key in the initial
  `RegisterInput` state; existing `shown()` / `needed()` gating covers the rest.
- `buildRegisterBody` already omits blank optional keys, which the store rejects.
- Docs: `.vendre/knowledge/api-reference.md` and
  `.vendre/skills/account-auth.md`.
