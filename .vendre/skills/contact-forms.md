---
name: vendre-contact-forms
description: Vendre Surface v2 contact and inquiry forms - POST contact, the email/contact CORS policy, mutation token, antispam/captcha payloads and field-level 422 handling. Use when building a contact or inquiry form against Vendre.
---

# Contact forms (Surface v2)

## Endpoint

`POST /surface/2/contact` — CORS policy is **`email/contact`** (note the slash),
not `default`.

## Requirements

- Header `Surface-Mutation-Protection-Token: <token>`.
- Any captcha/antispam token the store configuration requires must be included
  in the payload.
- **Ready-gate the submit button** until the session is bootstrapped and a
  mutation token exists, or the first submit after a cold load fails silently.

## Errors and UX

- `422` → map each error's `source.parameter` to the matching field.
- `429` → respect `Retry-After` and tell the user the store is busy.
- On success, show immediate confirmation and reset the form state.
