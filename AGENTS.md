# VENDRE LOVABLE TEMPLATE AGENT INSTRUCTIONS

You are an expert developer specializing in Vendre e-commerce.

## 0. MANDATORY ONBOARDING & DEMO MODE INITIALIZATION

If this project was just imported, created from this template, or if the Vendre API secrets (`VENDRE_BASE_URL`, `VENDRE_CLIENT_ID`, `VENDRE_CLIENT_SECRET`) are missing:

1. **Serve Storefront in Demo Mode:** Render the storefront template using local mock data from `src/mock/vendreResponses.ts` (`isConfigured: false`).
2. **Launch Top Banner & Setup Modal:** Render the Top Setup Banner (Option 2) on all pages and trigger/highlight the Onboarding Modal/Drawer.
3. **Execute Setup Procedure:** Read `/.vendre/skills/setup.md` and execute its procedure inside the onboarding wizard to guide the user through entering their API keys, testing the connection, and verifying CORS.
4. **Transition to Live Mode:** Only switch `isConfigured` to `true` and begin fetching live Vendre Surface API data once the connection test returns `ok: true`.

This behavior ensures the user can immediately browse the storefront UI with Vendre-structured dummy data while completed onboarding remains the top priority.

---

## 1. KNOWLEDGE DIRECTORY (`/.vendre/knowledge/`)

Before performing any architectural decisions or API calls, consult the corresponding knowledge file:

- **`general.md`**: Core architecture rules, directory layout, and overall design patterns.
- **`api-reference.md`**: Technical reference for all available Vendre API endpoints, payloads, headers, and response schemas.

**Source of truth:** `api-reference.md` is authoritative for endpoints, HTTP methods, CORS policies, required headers, mutation-token rules, and the error format. `general.md` and the skills describe usage patterns and UX — if any of them contradicts the reference, follow the reference and correct the other file.

---

## 2. SKILLS ROUTING TABLE (`/.vendre/skills/`)

Always read the matching skill file **before** starting work in that area.

| Task / area                                            | File                                       |
| :----------------------------------------------------- | :----------------------------------------- |
| First-time setup, API keys, CORS, store status         | `.vendre/skills/setup.md`                  |
| Surface v2 core: proxy, OAuth, request architecture    | `.vendre/skills/surface-v2.md`             |
| App bootstrap & project architecture                   | `.vendre/skills/architecture-bootstrap.md` |
| Auth & sessions (full flow, code assets)               | `.vendre/skills/auth-sessions/SKILL.md`    |
| Login, register, account auth endpoints                | `.vendre/skills/account-auth.md`           |
| Customer account pages, orders, addresses              | `.vendre/skills/customer-account/SKILL.md` |
| Google/Microsoft SSO and magic login links             | `.vendre/skills/sso-login.md`              |
| Session bootstrap & context reads                      | `.vendre/skills/session-context.md`        |
| Market, currency, language & store context switching   | `.vendre/skills/session-store-context.md`  |
| Mutation protection tokens                             | `.vendre/skills/mutation-tokens.md`        |
| OAuth token lifecycle, quotas & rate limits            | `.vendre/skills/oauth-quota.md`            |
| Cart & checkout endpoints, coupons, upsell             | `.vendre/skills/cart-checkout.md`          |
| Cart UX: optimistic state, sync, flush before checkout | `.vendre/skills/cart-sync.md`              |
| Category pages (PLP), filters, sorting, pagination     | `.vendre/skills/category-plp.md`           |
| Product pages (PDP), variants, pricing, VAT            | `.vendre/skills/pdp-products.md`           |
| VQL search & multi-resource queries                    | `.vendre/skills/vql-queries.md`            |
| Header/footer navigation, mega menus, breadcrumbs      | `.vendre/skills/navigation-menus.md`       |
| CMS pages & content blocks                             | `.vendre/skills/cms-pages.md`              |
| Galleries & Twig block rendering                       | `.vendre/skills/cms-galleries.md`          |
| Contact forms, antispam, `email/contact` policy        | `.vendre/skills/contact-forms.md`          |
| SEO: meta tags, JSON-LD, sitemaps                      | `.vendre/skills/ecommerce-seo.md`          |
| Caching strategy for static vs dynamic data            | `.vendre/skills/caching.md`                |
| Troubleshooting: CORS, 401/429, IS_HEADLESS            | `.vendre/skills/store-troubleshooting.md`  |

Skills stored as folders (`auth-sessions/`, `customer-account/`) also contain `assets/` with reference implementations and `references/` with deep-dive docs — read those when the `SKILL.md` points at them.

---

## 3. FIRST INTERACTION PRIORITY

On the user's first chat interaction or initial workspace prompt:

1. Ensure the Top Setup Notice Bar is visible in the application UI.
2. Prompt the user to start the onboarding wizard via the top banner button or assist them directly using `/.vendre/skills/setup.md`.
