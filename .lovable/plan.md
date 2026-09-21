# Registration fields: wait for a real store endpoint

## Situation

Your store requires a personal ID number at sign-up, but nothing in the API
tells the app that. The session response only returns the store name and logo,
and every path I probed for a field/validation list returns 404. So the app
cannot currently read which registration fields are switched on in admin.

Decision: wait for the real endpoint instead of guessing or auto-detecting.

## What happens now

1. Keep the create-account form on the current fixed field list so sign-up keeps
   working: name, e-mail, password, address, postcode, city, country and
   personal ID number (required, since your store demands it).
2. Add the personal ID number input to the form and verify a real sign-up
   completes.
3. Document clearly that the field list is hard-coded only because no endpoint
   exposes it yet, and what the app expects that endpoint to return.

## When the endpoint exists

Send me the path and an example response. The form already builds itself from a
field-rules object, so connecting it is a small change: fetch the rules, map
them onto that object, and every switched-on field (company name,
organisation number, personal ID number, etc.) appears or disappears
automatically with no further work.

## Technical notes

- `src/pages/LoginPage.tsx`: add the `personnummer` input after the password
  fields, `required={needed("personnummer")}`, plus the key in the initial
  `RegisterInput` state.
- `DEFAULT_REGISTER_CONSTRAINTS` in `src/lib/vendre/account.ts` stays the single
  source of the field list until a real endpoint replaces it;
  `getRegisterConstraints` is the one function to swap over later.
- `buildRegisterBody` already omits blank optional keys, which the store rejects.
- Docs to update: `.vendre/knowledge/api-reference.md` and
  `.vendre/skills/account-auth.md` — required body for this store plus the
  expected shape of the future field-rules endpoint.
