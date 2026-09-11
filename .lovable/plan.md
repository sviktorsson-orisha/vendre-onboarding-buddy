# First name and last name are not saved when updating the account

## Cause (confirmed by the documentation)

The documentation for "Update authenticated account" shows that the update body
uses `firstname` and `lastname`, while the profile the store sends back uses
`first_name` and `last_name`.

Today the save reuses whichever spelling appeared in the profile response, so it
sends `first_name` / `last_name` — names the update does not recognise, and they
are silently ignored. Every other field happens to use the same spelling in both
directions, which is why only the name fails to save.

## Solution

Always send the documented field names when saving the account:
`firstname`, `lastname`, `email_address`, `street_address`, `postcode`, `city`
and the numeric `country`. No more guessing the key from the response.

After a successful save, re-read the profile so the form shows exactly what the
store stored.

## Technical details

- `src/lib/vendre/account.ts`, `updateAccount`: drop the
  `keys.find(candidate => candidate in account.raw)` alias lookup and build the
  `PUT accounts/me` body from fixed documented keys. Mutation-protection token
  handling and error mapping stay unchanged.
- Reading stays as it is: `normalizeAccount` keeps accepting both `first_name`
  and `firstname` from `GET accounts/me`.
- Ensure the account query is invalidated after the update (the mutation
  already runs through `useAccountMutations`), so the form reflects the stored
  values.
- Update `.vendre/knowledge/api-reference.md` and the customer-account skill
  notes: read aliases, but always write the documented keys — never echo back
  the response spelling.

## Verification

Change the first name in My account -> Account, save, reload the page and
confirm the new name is still shown.
