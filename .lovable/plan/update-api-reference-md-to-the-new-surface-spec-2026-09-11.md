# Update api-reference.md to the new Surface spec

Refresh `.vendre/knowledge/api-reference.md` so the endpoint catalogue matches the uploaded OpenAPI document (51 paths). Structure, headings and all global rules (proxy topology, bearer/session rules, mutation-token rule, error format, rate limits, CORS matrix) stay as they are.

## What changes in the catalogue

New endpoints to document:

- Catalogue: `GET products` (params `id`, `order_by`, `mode`, `include_variants`, `fill_variant_products`) and `GET products/associated` (`product_id` required, `type_id`, `order_by`, `replace_variants`). Note that a direct product endpoint now exists, so product lookup no longer needs a category scan or VQL-only path.
- Cart: `GET shopping-cart/products`, `PUT shopping-cart/products` (body `{ products, empty }`, POST kept as legacy alias), `GET shopping-cart/coupons`, `POST accounts/me/shopping-cart/products`.
- Checkout: `POST checkout/upsell/finalize` (body `{ order_id }`).
- Account: `GET accounts/me/quotations`, `GET accounts/me/quotations/{quotationId}`, `PUT accounts/me/address-book` (body `{ addresses }`).
- Favorites: `GET favorites/lists`, `PUT`/`POST favorites/lists/products` (body `{ products, empty }`).
- BankID: `GET bankid/status`, `GET bankid/qr-token`, `POST bankid/login`.
- Localisation: `GET language-strings` and `GET translations` (both take `locale`).
- CMS: `POST galleries/twig/render` alongside the existing `POST twig/render`.
- Customers: `POST customers` (legacy v1-backed registration alias).

Corrections to existing rows:

- Registration body for `POST accounts` documented from the spec: required `email_address`, `password`, `confirmation`, `firstname`, `lastname`, `street_address`, `postcode`, `city`, `country`; optional `type`, `gender`, `company`, `street_address2`, `suburb`, `personnummer`, `state`, `telephone`, `fax`, `mobile`, `alias`, `customers_group_id`, `vat_identification_number`, `newsletter`, `consent_personal_data_policy`.
- `POST session` body fields: `market`, `currency`, `language`, `prices_include_vat`.
- `GET categories/{id}` query params: `sort_by`, `sort_order`, `page`, `limit`, `filter`, `f`, `pfrom`, `pto`, `tags`.
- `GET sitemap` query params: `type`, `language`, `page`.
- `GET galleries/{id}/pages` path shown as it appears in the spec.
- Note that the spec exposes `Surface-Mutation-Protection-Token` as an explicit header parameter on the mutating account endpoints; the existing client rule (attach on every POST/PUT/DELETE, plus the `forgot-password` GET exception) stays unchanged.

## Notes

- Documentation only — no application code changes, no behaviour changes.
- Endpoints already in the file that are absent from the spec are kept but flagged as unverified rather than deleted, unless you prefer them removed.
- Sections 1 (global rules), 3 (CORS matrix) and 4 (error codes) keep their current text; only the catalogue in section 2 is rewritten, with the spec noted as the source.
