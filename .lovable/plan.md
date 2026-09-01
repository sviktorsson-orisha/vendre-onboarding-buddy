# Mobil: filter- och sorteringsknappar med utfällbar panel

På mobil ersätts dagens inbakade filterpanel och sorteringsdropdown av två knappar
ovanför produktrutorna. Varje knapp öppnar en panel som glider in från sidan med
respektive innehåll. Desktop-läget är oförändrat.

## Så fungerar det

- Direkt ovanför produktrutorna (under kategoriheadern) ligger en rad med:
  - **Filter** — visas bara när butiken skickar filter. Aktivt antal visas som
    liten siffra på knappen.
  - **Sortera** — visas bara när Vendre returnerar sorteringsalternativ.
- Klick öppnar en panel (slide-over) med filtren respektive sorteringsvalen.
- Filterpanelen har "Rensa filter" och en "Visa produkter"-knapp som stänger panelen.
- Sorteringspanelen listar alternativen som val; ett klick väljer och stänger.
- Antal produkter fortsätter visas ovanför listan, som idag.
- På desktop (lg och uppåt) ligger filtren kvar i vänsterkolumnen och
  sorteringsdropdownen kvar i toolbaren — inga knappar, ingen panel.

## Tekniskt

- `src/components/store/category-filters.tsx`: bryt ut filterinnehållet till en
  intern `FiltersContent`; komponenten renderar den direkt i `aside` på desktop
  (`hidden lg:block`) och exporterar även innehållet för mobilpanelen. Den nuvarande
  mobila toggle-knappen tas bort.
- Ny `src/components/store/category-mobile-controls.tsx`: raden med de två
  knapparna plus två `Sheet` (befintlig shadcn-komponent, `side="left"` för filter,
  `side="bottom"` eller `right` för sortering). Endast synlig `lg:hidden`.
- `src/components/store/category-toolbar.tsx`: dölj sorteringsselecten under `lg`
  (`hidden lg:flex`), behåll produktantalet synligt i alla storlekar. Exportera
  sorteringsalternativens logik (nyckel/aktuellt värde) så mobilpanelen kan
  återanvända den utan dubblerad kod.
- `src/pages/CategoryPage.tsx`: rendera de nya mobilkontrollerna mellan headern och
  produktgriden och skicka in samma callbacks som idag (`onToggleTag`,
  `onToggleSpec`, `onPriceChange`, `onClear`, `onSortChange`).
- `src/lib/i18n.tsx`: nya nycklar för "Sortera", "Visa produkter" och stäng-etikett
  på sv + en.

Ingen ändring i datahämtning, URL-state eller API-anrop.
