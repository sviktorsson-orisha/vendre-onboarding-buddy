# FIRST ACTION ON EVERY NEW IMPORT: RUN `/.vendre/skills/setup.md`

Before answering the first user message or changing any file, open
`/.vendre/skills/setup.md` and execute it directly from Step 0.

This rule is mandatory and has priority over all requested code changes while
the Vendre connection is not verified. Do not replace the procedure with a
summary or wrapper.

If the first message asks to start setup, connect Vendre, or enter credentials,
it already confirms the setup flow. Check existing secret names and immediately
open Lovable's secure Secrets form for all missing values:

- `VENDRE_BASE_URL`
- `VENDRE_CLIENT_ID`
- `VENDRE_CLIENT_SECRET`

Never ask the customer to paste credentials into chat, a normal question field,
source code, or a committed environment file.

The app-level `SetupNoticeBar` must also keep opening the setup wizard on every
unconfigured page load. Before completing any change, run
`npm run verify:setup` and fix any failed setup invariant.
## Plan mode

The secure Secrets form cannot be opened in plan mode. Produce a one-step plan
covering only the Vendre connection (secure Secrets form + connection test).
Immediately after approval, open the secure Secrets form as the first action,
before any file change or other approved task. Never collect credentials in a
plan, a question field, or chat text.
