# Prefill all fields in "Edit account"

## Problem

In My account -> Edit account, first name, last name, email and country are
prefilled, but street address, postcode and city are empty.

The form is filled from the profile endpoint alone. That endpoint returns the
customer's name and email, but the street address, postcode and city live on
the customer's main address, which the account page already fetches separately
for the Addresses view. Since the profile payload has no address fields, those
three inputs start empty.

## Solution

Fill the edit form from both sources: the profile for name, email and country,
and the main address for street address, postcode and city (and country when
the profile does not carry it). Every field the form shows is then prefilled
with the customer's own data.

If a value is genuinely missing on the customer, the field stays empty — no
invented placeholders.

Saving keeps working exactly as today: the same field set is sent, with the
numeric country id.

## Technical details

- `src/pages/AccountPage.tsx` (`ProfileView`): also read the addresses query
  (already available through `useAddresses`) and seed the form state by merging
  the main address into the account object — profile value wins when non-empty,
  main address fills the blanks. Re-seed when either source arrives, without
  overwriting edits the user has already typed.
- No changes to `updateAccount` in `src/lib/vendre/account.ts`; the submitted
  payload and mutation-token handling stay as they are.
