# Flytta in workspacens skills i projektet

Idag finns 23 Vendre-skills bara på workspace-nivå. De ska in i projektet under `.vendre/skills/` så att allt projektet behöver ligger i repot (och följer med till GitHub), och `AGENTS.md` ska få en routing-tabell som pekar på rätt fil per uppgift.

## Vad som skapas

En fil per skill i `.vendre/skills/`, med samma innehåll som workspace-versionen:

- `setup-vendre.md`, `surface-v2.md`, `architecture-bootstrap.md`
- `auth-sessions.md`, `account-auth.md`, `customer-account.md`, `sso-login.md`
- `session-context.md`, `session-store-context.md`, `mutation-tokens.md`, `oauth-quota.md`
- `cart-checkout.md`, `cart-sync.md`
- `category-plp.md`, `pdp-products.md`, `vql-queries.md`
- `navigation-menus.md`, `cms-pages.md`, `cms-galleries.md`
- `contact-forms.md`, `ecommerce-seo.md`, `caching.md`, `store-troubleshooting.md`

Befintlig `.vendre/skills/setup.md` (projektets egna onboarding-script) lämnas orörd och ligger kvar överst i tabellen.

Två av skillsen (`auth-sessions`, `customer-account`) har medföljande kodexempel och referensfiler. De läggs i mappar bredvid: `.vendre/skills/auth-sessions/` respektive `.vendre/skills/customer-account/`, med `SKILL.md` plus `assets/` och `references/` intakta.

## AGENTS.md

Sektion 2 byts ut mot en routing-tabell med tre kolumner: uppgift, skill-fil, kort beskrivning. Exempel på rader:

```text
| Uppgift                        | Fil                                   |
| Första uppsättning, API-nycklar| .vendre/skills/setup.md               |
| Proxy, OAuth, API-arkitektur   | .vendre/skills/surface-v2.md          |
| Produktsida (PDP)              | .vendre/skills/pdp-products.md        |
| Kategori/listning (PLP)        | .vendre/skills/category-plp.md        |
| Varukorg och checkout          | .vendre/skills/cart-checkout.md       |
```

Övriga sektioner (knowledge-katalogen och den obligatoriska onboardingen) behålls, med en tillagd regel: läs alltid rätt skill-fil innan arbete i det området påbörjas.

## Avgränsning

Ingen kod i `src/` ändras och inget UI byggs om. Skillsen kopieras ordagrant — ingen omskrivning av innehållet.
