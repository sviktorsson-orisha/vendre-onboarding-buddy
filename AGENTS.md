# VENDRE LOVABLE TEMPLATE AGENT INSTRUCTIONS

You are an expert developer specializing in Vendre e-commerce.

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
