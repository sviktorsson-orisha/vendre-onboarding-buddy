# Brödsmulor på produktsidan

## Mål
Produktsidan ska visa samma brödsmulor som kategorisidan: Hem > Kategori > Underkategori > Produktnamn, med samma utseende och placering (överst, ovanför rubriken/innehållet).

## Så fungerar det
- Produkten levererar sin kategori (`category_id`) från Vendre — kontrollerat mot butiken (produkt 188 ligger i kategori 162).
- Kategorikedjan byggs på exakt samma sätt som idag på kategorisidan, utifrån menyträdet.
- Sista steget är produktens namn och är inte klickbart.
- Väljer man en variant följer brödsmulan produktens kategori (variantens egen kategori om den finns, annars huvudproduktens).
- Saknas kategori på produkten visas bara Hem > Produktnamn.

## Teknisk del
- Flytta `buildTrail` från `src/pages/CategoryPage.tsx` till en delad modul (t.ex. `src/lib/vendre/breadcrumbs.ts`) och använd den i båda sidorna.
- Utöka `Crumb` i `src/components/store/breadcrumbs.tsx` med ett valfritt fält som markerar en icke-länkad slutpunkt (produktnamnet), så att JSON-LD inte pekar på `/kategori/<produktid>`. Övrig rendering och styling lämnas orörd.
- `src/pages/ProductPage.tsx`: hämta menyerna med befintliga `useMenus()`, bygg kedjan från `activeProduct.categories_id ?? product.categories_id`, lägg till produktnamnet sist och rendera `<Breadcrumbs />` överst i `StoreShell`, före produktlayouten.
- Inga nya API-anrop mot Vendre (menyerna är redan cachade och används av headern).
- Uppdatera `.vendre/skills/pdp-products.md` och `.vendre/skills/ecommerce-seo.md` kort med att PDP nu renderar brödsmulor med BreadcrumbList-JSON-LD.
