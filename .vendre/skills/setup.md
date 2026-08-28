Vendre connection setup

Run this script exactly. Do not skip steps, do not build UI early, and do not
rewrite anything in src/lib/vendre/ — those helpers already exist.

Step 0 — Order of operations

Vendre Admin comes first: create the OAuth client, then allowlist the
storefront origins under CORS, and only then collect the keys and run the test.
Do not tell the user to run this skill before Admin is configured.

The origins to allowlist are the STABLE Lovable hosts, not the ephemeral preview
host (id-preview--<id>.lovable.app) shown in the preview tab:

https://project--<project-id>-dev.lovable.app — preview

https://project--<project-id>.lovable.app — published

any custom domain, added later

They exist before the project is published, so CORS can be configured up front.
The setup screen prints the exact list and the ready-to-paste JSON.

Step 1 — Collect credentials

Ask the user for all three at once (use the questions tool if available):

VENDRE_BASE_URL — store URL, scheme + host, no trailing slash

VENDRE_CLIENT_ID

VENDRE_CLIENT_SECRET

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

Print the exact origin and the ready-to-paste JSON, and point at Admin → Headless → CORS (/Admin/configuration?gID=232). Use the stable project--<project-id> hosts, never the ephemeral id-preview-- host.

session failed

Check the bootstrap and session policies on the CORS page and that the credentials are enabled for this store.

read failed

Check the navigation_menus policy and that a menu is published.

For CORS, always print the origin verbatim and both Admin fields:
Surface CORS Origins JSON and Surface CORS Policies JSON (the policies
field wins on conflict), found under
Admin → Headless → CORS (/Admin/configuration?gID=232).

{
"https://your-project.lovable.app": [
"oauth", "bootstrap", "session", "customer",
"shopping_cart", "checkout",
"vendre_query_language", "default"
]
}

{
"oauth": ["https://your-project.lovable.app"],
"bootstrap": ["https://your-project.lovable.app"],
"session": ["https://your-project.lovable.app"],
"customer": ["https://your-project.lovable.app"],
"shopping_cart": ["https://your-project.lovable.app"],
"checkout": ["https://your-project.lovable.app"],
"vendre_query_language": ["https://your-project.lovable.app"],
"default": ["https://your-project.lovable.app"]
}

default is where all accounts\* calls and Twig rendering resolve — it is the
one people forget. login-link has no CORS support at all and must always go
through the server proxy. Preview and published addresses are different origins:
allowlist both. /vendre-setup renders the
same JSON pre-filled with the live origin, with a copy button.

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
