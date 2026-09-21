# Finish the sign-up fix: personal ID number field

## How the cause was found

I sent test registrations straight to your store and compared the answers:

- Only the fields the form collects: rejected (422).
- Same fields plus the full documented list with blank extras: rejected.
- Same fields plus a personal ID number: **account created (200)**.
- Same fields plus only a company name, or only gender: rejected again.

So the single field that decides it is the personal ID number
(`personnummer`), which your store has set as mandatory in admin. The form
never asked for it, which is why sign-up started failing.

## Already done

- The registration request no longer strips fields; blank optional values are
  left out because the store rejects them.
- Personal ID number added to the registration data model, field list and
  Swedish/English labels.

## Remaining

1. Add the "Personnummer / Personal ID number" input to the create-account form,
   placed after the password fields and marked as required.
2. Run a real test sign-up through the form and confirm the account is created.
3. Note in the API documentation that this store requires the personal ID
   number at sign-up, and that blank optional fields are rejected.

## Technical notes

- `src/pages/LoginPage.tsx`: new `shown("personnummer")` block with
  `required={needed("personnummer")}`, bound to `form.personnummer`, plus the
  empty string in the initial `RegisterInput` state.
- `buildRegisterBody` already sends `personnummer` only when filled.
- Docs: `.vendre/knowledge/api-reference.md` registration-body section.
