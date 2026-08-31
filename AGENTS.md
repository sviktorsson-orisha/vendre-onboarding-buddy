# FIRST ACTION ON EVERY NEW IMPORT: RUN `/.vendre/skills/setup.md`

**STOP. Before answering the first user message or changing any file, open
`/.vendre/skills/setup.md` and execute it directly from Step 0. Do not wait for
the user to request setup. Do not substitute, copy, summarize, or wrap the
skill in another file. The original `setup.md` is the executable instruction
source.**

# VENDRE LOVABLE TEMPLATE AGENT INSTRUCTIONS

You are an expert developer specializing in Vendre e-commerce.

## 0. MANDATORY ONBOARDING — RUN BEFORE ANYTHING ELSE

**PERMANENT REPOSITORY INVARIANT — NEVER REMOVE OR WEAKEN THIS SECTION.**
Every future change must preserve both the agent-triggered setup below and the
app's automatic setup launch through `SetupNoticeBar`. A newly imported project
must start setup without the user having to ask for it. If setup has not passed,
setup takes priority over every prompt and every requested code change.

If this project was just imported or created from this template, or if the
secrets `VENDRE_BASE_URL`, `VENDRE_CLIENT_ID` and `VENDRE_CLIENT_SECRET` are
not all present:

1. Read `/.vendre/skills/setup.md` itself and run that procedure immediately, on the
   user's first message, whatever the message is. Do this even if the message
   is unrelated ("hej", "fixa footern", …): answer only after the setup
   procedure has been started. Never create or invoke a wrapper skill instead.
   The in-app guide lives at `/vendre-setup`.
2. Do not build storefront pages, components, product/cart features or any
   other UI until the connection test in that skill returns `ok: true`.
3. Only after it is green, continue with the user's actual request.

This overrides every other instruction in this file.

Before completing any future code change, run `npm run verify:setup`. A change
that fails this check is incomplete and must not be reported as finished.


## 1. KNOWLEDGE DIRECTORY (`/.vendre/knowledge/`)

Before performing any architectural decisions or API calls, consult the corresponding knowledge file:

- **`general.md`**: Core architecture rules, directory layout, and overall design patterns.
- **`api-reference.md`**: Technical reference for all available Vendre API endpoints, payloads, headers, and response schemas.

**Source of truth:** `api-reference.md` is authoritative for endpoints, HTTP methods, CORS policies, required headers, mutation-token rules and the error format. `general.md` and the skills describe usage patterns and UX — if any of them contradicts the reference, follow the reference and correct the other file.

## 2. SKILLS ROUTING TABLE (`/.vendre/skills/`)

Always read the matching skill file **before** starting work in that area.

| Task / area                                            | File                                            |
| ------------------------------------------------------ | ----------------------------------------------- |
| First-time setup, API keys, CORS, store status         | `.vendre/skills/setup.md`                       |

| Surface v2 core: proxy, OAuth, request architecture    | `.vendre/skills/surface-v2.md`                  |
| App bootstrap & project architecture                   | `.vendre/skills/architecture-bootstrap.md`      |
| Auth & sessions (full flow, code assets)               | `.vendre/skills/auth-sessions/SKILL.md`         |
| Login, register, account auth endpoints                | `.vendre/skills/account-auth.md`                |
| Customer account pages, orders, addresses              | `.vendre/skills/customer-account/SKILL.md`      |
| Google/Microsoft SSO and magic login links             | `.vendre/skills/sso-login.md`                   |
| Session bootstrap & context reads                      | `.vendre/skills/session-context.md`             |
| Market, currency, language & store context switching   | `.vendre/skills/session-store-context.md`       |
| Mutation protection tokens                             | `.vendre/skills/mutation-tokens.md`             |
| OAuth token lifecycle, quotas & rate limits            | `.vendre/skills/oauth-quota.md`                 |
| Cart & checkout endpoints, coupons, upsell             | `.vendre/skills/cart-checkout.md`               |
| Cart UX: optimistic state, sync, flush before checkout | `.vendre/skills/cart-sync.md`                   |
| Category pages (PLP), filters, sorting, pagination     | `.vendre/skills/category-plp.md`                |
| Product pages (PDP), variants, pricing, VAT            | `.vendre/skills/pdp-products.md`                |
| VQL search & multi-resource queries                    | `.vendre/skills/vql-queries.md`                 |
| Header/footer navigation, mega menus, breadcrumbs      | `.vendre/skills/navigation-menus.md`            |
| CMS pages & content blocks                             | `.vendre/skills/cms-pages.md`                   |
| Galleries & Twig block rendering                       | `.vendre/skills/cms-galleries.md`               |
| Contact forms, antispam, `email/contact` policy        | `.vendre/skills/contact-forms.md`               |
| SEO: meta tags, JSON-LD, sitemaps                      | `.vendre/skills/ecommerce-seo.md`               |
| Caching strategy for static vs dynamic data            | `.vendre/skills/caching.md`                     |
| Troubleshooting: CORS, 401/429, IS_HEADLESS            | `.vendre/skills/store-troubleshooting.md`       |

Skills stored as folders (`auth-sessions/`, `customer-account/`) also contain `assets/` with reference implementations and `references/` with deep-dive docs — read those when the SKILL.md points at them.

## 3. MANDATORY ONBOARDING (FIRST PRIORITY)

On the user's first chat interaction or when asked to get started:

1. Immediately run the onboarding procedure described in `/.vendre/skills/setup.md`.
2. Do not proceed with generating general e-commerce components until `setup.md` completes successfully.
