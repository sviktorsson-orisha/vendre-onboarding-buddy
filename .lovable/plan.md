# Rebuild the "Edit account" form

## Goal

The edit form under My account > Account should show exactly the fields the new
API documentation lists as required when creating an account — minus password
and confirmation. Extra fields can be added later.

## Fields shown (none required)

- First name
- Last name
- Email
- Street address
- Postcode
- City
- Country (dropdown)

Removed from the current form: phone, mobile, company, VAT number, personal ID
number and the newsletter checkbox. They can be re-added later as optional fields.

The country dropdown uses the same country choices as the create-account form,
since the documentation still exposes no country-list endpoint in the store API.

## Behaviour

- The form is pre-filled from the customer's current profile.
- Saving is blocked until every field has a value; email must look like an email.
- Saving sends the update to the store and shows the existing "saved" confirmation.
- Errors from the store are shown in the form, per field when the store points at one.

## Technical notes

- `src/pages/AccountPage.tsx` — `ProfileView` rebuilt around the seven fields,
  country rendered as a select reusing the country options from `LoginPage`'s
  register form (moved to a shared constant so both forms use one list).
- `src/lib/vendre/account.ts` — `updateAccount` sends exactly
  `firstname`, `lastname`, `email_address`, `street_address`, `postcode`, `city`,
  `country` (numeric id via the existing `countryId` helper) to
  `PUT accounts/me`, keeping the mutation-protection token handling and the
  existing canonical-key write-back for those fields only. The demo adapter is
  updated to the same shape.
- `src/types/vendre-account.ts` — add a `ProfileInput` type for this field set;
  `Account` keeps its wider shape for display elsewhere.
- No changes to login, registration, addresses, orders or session handling.
