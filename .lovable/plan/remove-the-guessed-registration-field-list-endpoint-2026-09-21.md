# Remove the guessed registration field-list endpoint

The two paths `accounts/constraints` and `accounts/create/constraints` were my guess at the "dynamic validation rules" endpoint mentioned in the API update. They do not exist, so the store answers "not found" and the browser logs an error on every first visit to the create-account page. Remove them until backend confirms the real path.

## What changes

1. **No more calls to those paths.** The create-account form stops asking the store which fields to show; it uses the documented field set directly (first name, last name, email, password + confirmation, street, postcode, city, country, consent). The form itself looks and behaves exactly as today.
2. **Remove the saved answer** in the browser (the day-long remembered result) and the retry-through-two-paths logic, since there is nothing to ask any more.
3. **Clean the documentation** — remove both paths from the API reference and the account/session notes, replacing them with a short line saying the field-list endpoint is not known yet and company / organisation number therefore stay hidden.

Result: no failed requests and no console errors on the create-account page.

## Technical notes

- `src/lib/vendre/account.ts`: drop `CONSTRAINT_PATHS`, `loadRegisterConstraints`, the `localStorage` cache (`vendre:register-constraints`), `normalizeRegisterConstraints` and `FIELD_ALIASES`. Keep `RegisterConstraints`, `DEFAULT_REGISTER_CONSTRAINTS`, `buildRegisterBody` and `useRegisterConstraints` so `LoginPage.tsx` is untouched; `getRegisterConstraints` simply resolves the defaults.
- Registration keeps the pending/active status detection added earlier.
- Docs: `.vendre/knowledge/api-reference.md`, `.vendre/skills/account-auth.md`, `.vendre/skills/session-context.md`.
- Verify with a typecheck and a load of the create-account page with the console open.

## When backend answers

Once the real path is known, re-add a single lookup that fills `RegisterConstraints`; the form already renders whatever fields that object lists, so company and organisation number appear automatically.
