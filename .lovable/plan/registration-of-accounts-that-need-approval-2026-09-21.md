# Registration of accounts that need approval

When the store is set to review new customers manually, the account is created but the storefront still behaves as if the customer was signed in: it jumps to "My account", which then fails, and the console fills with errors.

## What happens today

- After the registration form is submitted, the code only treats the answer as "awaiting approval" when the store answers with the exact word `pending`. Anything else sends the visitor straight to the account area.
- Because there is no session for an unapproved customer, the account area immediately asks for profile, address and address-book data and gets three "not signed in" errors (the 401 lines in the screenshot).
- The registration form asks the store which fields to show. That list is not available in this store yet, so it answers "not found" (404). The request is made from two places and both addresses are tried every time, which is why the same 404 appears five times.

## What will change

1. **Recognise an unapproved account reliably.** Read the store's answer more broadly: a `pending`/`inactive`/`awaiting approval` status wherever it appears in the answer (top level or inside an `account`/`customer` block), or an explicit "not active" flag. If the answer does not clearly say the customer is active, confirm with the store whether a session actually exists before going anywhere — no session means the account needs approval.
2. **Show a clear message instead of a broken page.** The visitor stays on the registration step and sees a confirmation that the account was created and must be approved before sign-in is possible, with a short note that they will be notified. Existing wording keys are reused and the Swedish/English texts are reviewed so they say this plainly.
3. **Stop the failed account calls.** The account area will not request profile, addresses or orders until the visitor is confirmed signed in, so an unapproved or signed-out visitor gets a clean "please sign in" state rather than three errors in the console.
4. **Ask for the field list once.** The result of the field-list lookup (including "this store does not have it") is remembered for the session and shared by the form and the submit step, so the 404 happens at most once instead of five times, and it is logged quietly rather than as an error.

## Technical notes

- `src/lib/vendre/account.ts`: broaden the `register` result detection (nested status, alias values, boolean `active`/`is_active`); on an ambiguous answer, read `session/context` and return `pending` when `authenticated` is false. Cache `getRegisterConstraints` in a module-level promise (including the fallback) so `register` and `useRegisterConstraints` share one lookup per page load.
- `src/pages/LoginPage.tsx`: keep the existing `pending` branch, and only navigate to `/mitt-konto` for a confirmed active account.
- `src/pages/AccountPage.tsx`: pass the `enabled` flag that `useAccount`, `useAddresses`, `useOrders` and `useSubUsers` already accept, gated on `isAuthenticated || mode === "demo"`, so no customer call fires while signed out.
- `src/lib/i18n.tsx`: review `account.pendingTitle` / `account.pendingBody` in both languages.
- No change to the proxy, session bootstrap or mutation-token handling.

## Verification

Run a registration against the store with manual approval enabled and confirm: the confirmation message appears, no redirect to the account area, and the console shows no 401s and at most one constraints 404.
