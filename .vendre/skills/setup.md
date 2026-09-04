---
name: vendre-setup
description: Run FIRST in any newly imported/created Vendre project, and whenever the user says "get started", "hur börjar jag", "kom igång", "connect to Vendre", or mentions API keys, OAuth client, CORS or store credentials. Collects VENDRE_BASE_URL / VENDRE_CLIENT_ID / VENDRE_CLIENT_SECRET, configures CORS and verifies the connection before any storefront work.
---

# Vendre connection setup

Run this script exactly. Do not skip steps, do not build UI early, and do not
rewrite anything in src/lib/vendre/ — those helpers already exist.

Step 0 — Order of operations

Vendre Admin comes first: create the OAuth client, then allowlist the
storefront origins under CORS, and only then collect the keys and run the test.
Do not tell the user to run this skill before Admin is configured.

Allowlist every host the storefront can be served from — in practice all of
these are needed, including the id-preview-- and lovableproject.com hosts:

https://project--<project-id>-dev.lovable.app — stable preview

https://project--<project-id>.lovable.app — stable published

https://<published-name>.lovable.app and https://preview--<published-name>.lovable.app

https://id-preview--<project-id>.lovable.app and https://<project-id>.lovableproject.com

any custom domain, added later

The stable hosts exist before publishing, so CORS can be configured up front.
The setup screen lists every origin with copy buttons.

Step 1 — Collect credentials (do this immediately)

This is the FIRST thing to do in a new project, in the very first reply, before
any greeting, analysis, suggestion or question. Do not suggest alternatives,
do not offer to build anything, do not ask what the user wants to do — open the
secrets form for the credentials right away and ask for the values.

Ask for all three values in ONE single secrets form, in one call:

VENDRE_BASE_URL — store URL, scheme + host. A pasted value with a trailing
slash is accepted, but strip the trailing slash before saving it.

VENDRE_CLIENT_ID

VENDRE_CLIENT_SECRET

Do not split this into two rounds. The secrets form masks every field, which
is expected — the values are verified by the connection test, not by reading
them back.

The setup modal stays open until the guide is fully verified (credentials +
CORS confirmed + green connection test). The storefront keeps serving demo data
until that same point: some reads (VQL) work without CORS, but session, cart
and account calls are blocked by CORS, so credentials alone do not mean the
store is connected. The storefront is never empty — dummy data until live data
can be fetched.


Keys are created in Menu → Apps & Integrations → Headless → OAuth
(/Admin/headless/auth/oauth-clients), which requires the "Store configuration"
permission. The client_secret is shown only once — if it was lost, it must be
rotated, not read again.

Save them with the secrets tool. Never write them into code, .env in the
repo, or chat. If any value is missing, stop and ask again.

Step 2 — Run the connection test

Tell the user to open /vendre-setup in the preview, or run
testVendreConnection() from @/lib/vendre. Read every step's status.

Step 3 — Interpret the result

Result

What to tell the user

token failed, missing non-empty

Which env vars are missing; re-collect them.

token failed HTTP 401/400

Client id/secret rejected — verify them in Vendre Admin.

token failed HTTP 429

The store is rate limiting; wait a minute and retry. Do not mint tokens in a loop.

cors warning

Print every origin verbatim and point at Admin → Apps & Integrations → Headless → CORS (/Admin/headless/cors) → "Tillåtna domäner". Add one row per origin (published, preview--, project--<id>, project--<id>-dev, id-preview--<id>, <id>.lovableproject.com, custom domains) and tick all feature checkboxes on each row.

session failed

Check the bootstrap and session policies on the CORS page and that the credentials are enabled for this store.

read failed

Check the navigation_menus policy and that a menu is published.

CORS is configured under Admin → Apps & Integrations → Headless → CORS
(/Admin/headless/cors), in the "Tillåtna domäner" (Allowed domains) section.
There is no JSON field any more: each origin is added as its own row via
"Lägg till domän", with one checkbox per feature/policy on that row
(Applikation, Bank id, Bootstrap, Categories, Checkout, Checkout get prices,
Customer, Custom report, Default, Email / contact, Extended data field,
Galleries, Internal, Login, Navigation menus, Oauth, Product, Product list,
Session, Shopping cart, Sitemap, Store notification, Subscription,
Vendre query language, Voucher). Tick them all, then press "Spara".

Add a row for EVERY origin the storefront is served from — they are separate
origins and all of them are needed in practice:

https://<published-name>.lovable.app
https://preview--<published-name>.lovable.app
https://project--<project-id>.lovable.app
https://project--<project-id>-dev.lovable.app
https://id-preview--<project-id>.lovable.app
https://<project-id>.lovableproject.com
any custom domain

default is where all accounts\* calls and Twig rendering resolve — it is the
one people forget. login-link has no CORS support at all and must always go
through the server proxy. /vendre-setup lists every origin with copy buttons
and the exact click path in Admin.


Optional, later: session TTL and rate limits under
Menu → Apps & Integrations → Headless → Surface settings, and IS_HEADLESS
under Menu → Configuration → General product settings to retire the old
storefront.

Step 4 — Gate

Do not create any storefront pages, components, or product/cart features
until the test returns ok: true. Proxy-mode (a cors warning) is a
degraded state: the app works, but checkout will start an empty session. Say so
explicitly and keep pushing for the allowlist fix.

Step 5 — Confirm

When the test is green, summarise: store base URL, which origin is allowlisted,
and that the session and mutation protection token work. Then ask what the user
wants to build first (home, PLP, PDP, cart, account).

Hard rules

Only oauth/token and oauth/revoke run server-side.

Everything else is called from the browser with credentials: "include".

Mutation protection token lives in a module variable, never localStorage.

Never add mock or placeholder product data.

Never fork the client in src/lib/vendre/.
