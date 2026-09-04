# Fixes to the startup guide

Three things change: how the store URL is asked for, when the demo data is replaced, and how the last step looks.

## 1. Store URL must be visible, never masked

The store URL is not a secret and should be typed into a normal, readable field. Going forward it is asked for in a plain visible text field (never the hidden/secret field), a pasted trailing slash is accepted and removed before saving, and only the client id and client secret go into the hidden secrets form.

This rule is written into `.vendre/skills/setup.md` and `AGENTS.md` so it is followed every time a new project starts, including wording that makes it explicit that the URL field must not be masked.

## 2. Demo data stays until the connection is verified

Today the storefront switches away from demo data the moment the three credentials exist and a token can be fetched. That happens before CORS is configured, so the shop can end up empty.

New rule: the storefront keeps showing demo content until the guide is fully verified, i.e. CORS confirmed **and** the connection test green. Only then does real store data take over.

The setup popup also stops closing by itself. It stays open while the guide is unfinished, and only closes when the person closes it or presses the finish button in the last step.

## 3. Last step

When step 6 turns green it opens automatically instead of staying collapsed, and the two boxes showing the store URL and the allowlisted origin are removed. The success text and the "start building" button remain.

## Technical notes

- `src/routes/__root.tsx`: the root loader also reads the stored setup progress (`readSetupProgress`) and passes `ok && corsDone && connectionOk` to `setServerConfigured`, so live mode requires verified setup, not just working credentials. Read it through the existing status server function path rather than importing the server helper into client code.
- `src/lib/vendre/status.functions.ts`: extend the returned status with `corsDone` / `connectionOk` from the server-side progress store.
- `src/components/vendre/setup-notice-bar.tsx`: keep the dialog open while unconfigured — remove the "auto-open once" ref so a reopen is not suppressed, and do not auto-dismiss on credential save; dismissal still only happens via the close control or `markConfigured()`.
- `src/components/vendre/setup-wizard.tsx`: when `verified` flips true, set `open` to 5 (auto-expand step 6); delete the `<dl>` with `step6.baseUrl` / `step6.origin` and their now-unused translation keys in `src/lib/i18n.tsx`.
- No API, cart, or storefront logic changes.
