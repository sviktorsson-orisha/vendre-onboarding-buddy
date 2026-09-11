# First name and last name are not saved when updating the account

## What we can see in the code

When the account form is saved, most fields are sent under the exact names the
API documentation lists, but the first name and last name are sent under
whichever spelling happened to appear in the profile we read back from the
store. If the store returns the name as `first_name` / `last_name` (an
alternative spelling it does use in some responses), we send those names back,
while the documented update expects `firstname` / `lastname`. A field the store
does not recognise is silently ignored — which matches exactly what you see:
everything else saves, the name does not.

This is the most likely cause, but it is not confirmed yet: it depends on which
spelling your store returns, and that requires one signed-in call to check.

## Plan

1. Verify first: sign in with a test account, read the profile, and look at
   which key holds the name. Then send an update and read the profile again to
   confirm whether the name changed. This tells us whether the wrong field name
   is really the cause, or whether the store keeps the name somewhere else
   (for example on the address record).
2. Fix based on that result:
   - If the field name is the problem, always send the documented names
     (`firstname`, `lastname`, `email_address`, `street_address`, `postcode`,
     `city`, `country`) instead of guessing from the response.
   - If the store stores the name elsewhere, also write the name to that place
     as part of the same save, and re-read the profile afterwards so the form
     shows the saved values.
3. Re-check in the app: change the first name, save, reload the page, and
   confirm the new name is still there.

## Technical details

- `src/lib/vendre/account.ts`, `updateAccount`: today the payload key for each
  field is picked with `keys.find(candidate => candidate in account.raw)`, so an
  alias present in the `GET accounts/me` payload wins over the documented key.
  The fix is to build the `PUT accounts/me` body from the documented keys only.
- Diagnosis uses the proxy route `/api/vendre/surface/...` with a logged-in
  session: `POST login/email`, `GET accounts/me`, `PUT accounts/me`,
  `GET accounts/me` — mutation-protection token handling stays as it is.
- After a successful update, ensure the account query is invalidated so the
  form reflects what the store actually stored.

## What I need from you

A test account (email + password) on the connected store that I may change the
name on, so I can run the verification in step 1. Without it I can only apply
the likely fix blind.
