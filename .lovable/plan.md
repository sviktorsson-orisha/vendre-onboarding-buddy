# Butikstemplate med Demo Mode

Bygger en komplett, klickbar e-handelstemplate som kör på lokal dummy-data tills Vendre-anslutningen är klar. Uppstartsguiden flyttas från startsidan till en modal som nås via en banner högst upp.

## 1. Demo Mode-state

`src/lib/store/onboarding-state.ts` — global store (samma `useSyncExternalStore`-mönster som `src/lib/i18n.tsx`, som fungerar med route code-splitting):

- `isConfigured: boolean` — false = Demo Mode (dummy-data), true = Live Mode.
- Sätts till true när anslutningstestet i guiden returnerar `ok: true`; persistas i localStorage (`vendre.setup-complete`).
- `src/lib/store/cart-state.ts` — lokal varukorg (rader, antal, summa) för Demo Mode.

Ingen Vendre-anrop görs i Demo Mode. Live Mode kopplas in i ett senare steg — datalagret bakom sidorna får ett tydligt gränssnitt (`getCategories`, `getProducts`, `getProduct`, `getNavigation`) som idag alltid returnerar dummy-data.

## 2. Setup Notice Bar + guide-modal

- `src/components/vendre/setup-notice-bar.tsx`: fast banner högst upp på alla sidor när `isConfigured === false`. Badge "Demo Mode (Dummy Data)", text "Du kör just nu med dummy-data. Koppla ditt Vendre-konto för att aktivera din butik." och knapp "Starta Uppstartsguide".
- Knappen öppnar en `Dialog` (shadcn) som renderar den befintliga 6-stegsguiden — dagens `src/pages/Index.tsx` bryts ut till `src/components/vendre/setup-wizard.tsx` utan att stegen eller logiken ändras (`/api/vendre/status`, `testVendreConnection()`, CORS-JSON, publicerad domän).
- Bannern och modalen ligger i `__root.tsx` så de finns på alla routes.
- När testet blir grönt: bekräftelse i modalen, `isConfigured` sätts true, bannern försvinner.

## 3. Butikssidor (routes)

| Fil | URL | Innehåll |
| --- | --- | --- |
| `src/routes/index.tsx` | `/` | Hero med CTA, utvalda produkter, kategoripuffar |
| `src/routes/kategori.$slug.tsx` | `/kategori/$slug` | PLP: produktgrid, filter-/sorteringskontroller (placeholder) |
| `src/routes/produkt.$slug.tsx` | `/produkt/$slug` | PDP: bildgalleri, titel, pris, beskrivning, variantval, "Lägg i varukorg" |

Varje route får egen `head()` med unik title/description/og.

## 4. Komponenter

- `src/components/storefront/store-header.tsx` — logotyp, kategorimeny med dropdown för underkategorier (shadcn `navigation-menu`), sökfält (placeholder), varukorgsikon med antalsbadge.
- `src/components/storefront/cart-drawer.tsx` — höger slide-over (shadcn `sheet`): rader, antalsjustering, borttag, totalsumma, "Till kassan".
- `src/components/storefront/product-card.tsx`, `product-grid.tsx`, `category-tiles.tsx`, `hero.tsx`.
- `src/components/storefront/store-footer.tsx` — länkkolumner (Kundservice, Om oss, Betalsätt, Följ oss).
- `src/components/storefront/store-shell.tsx` — header + `<Outlet/>` + footer, används i `__root.tsx`.

Befintlig Vendre-branding i `src/styles.css` återanvänds; inga hårdkodade färger.

## 5. Dummy-data

`src/mock/dummyData.ts`: 4–6 kategorier med underkategorier, ~20 produkter (namn, slug, pris, jämförpris, beskrivning, varianter, kategori-id, bilder), navigationsträd och footer-länkar. Bilder pekar mot genererade assets i `src/assets/` (placeholder-fria, importeras som ES6-moduler). Typerna speglar Vendre Surface v2-fälten (id, name, slug, price inkl./exkl. moms) så att bytet till live-data blir en ren utbyte av datalagret.

## 6. Gitignore

`.gitignore` är skrivskyddad i den här miljön, så jag kan inte lägga till raderna åt dig. Lägg till manuellt i GitHub eller din editor:

```text
.lovable/plan.md
.lovable/plan/
```

`.lovable/project.json` ska ligga kvar i repot.

## Teknisk not

Vendre-lagret (`src/lib/vendre/`, `/api/vendre/token`, `/api/vendre/status`) rörs inte — det används fortfarande av guiden. Ingen mock-data skickas någonsin till Vendre-anrop; Demo Mode är helt frikopplat.
