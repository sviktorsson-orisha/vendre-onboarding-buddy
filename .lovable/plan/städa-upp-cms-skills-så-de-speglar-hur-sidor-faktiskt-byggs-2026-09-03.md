# Städa upp CMS-skills så de speglar hur sidor faktiskt byggs

Footern och sidvisningen fungerar nu som vi vill. Två skill-filer under `.vendre/skills/` beskriver dock fortfarande en äldre lösning och innehåller dubblerade rader, vilket riskerar att leda fel nästa gång något byggs.

## Vad som stämmer redan

- `.vendre/skills/navigation-menus.md` — beskriver korrekt: kategorier i headern, CMS-sidor i footern via `galleries/pagetree`, `is_menu` + aktiva undersidor, interna `/sida/{id}`-länkar.
- `.vendre/skills/caching.md` — listar rätt CMS-endpoints att cacha.

Dessa lämnas oförändrade.

## Vad som ska uppdateras

### 1. `.vendre/skills/cms-pages.md`
- Ta bort den dubblerade `galleries/{id}/pages`-punkten i endpointlistan.
- Flytta ut förklaringen (att en sida ligger i sitt *förälder*-galleri, att parent hämtas ur `pagetree`, att endast `description` renderas) till ett eget avsnitt "Rendering" istället för mitt i endpointlistan.
- Gör description-only till standardregeln: endast sidans `description` renderas, sanerad, med relativa bildvägar upplösta mot butikens bas-URL.
- Behåll content-blocks som ett tydligt märkt **opt-in-avsnitt**: hur `galleries/{id}/content-blocks` hämtas och hur blocktyper (hero, rich text, bild, bildrutnät, CTA) mappas till komponenter, med okända typer som rik text — men bara när användaren uttryckligen ber om content blocks på sidorna. Aldrig som standard.
- Behåll routingreglerna, `pagetree`-avsnittet om sidtyp/`is_menu` och SEO/`head()`-punkten.

### 2. `.vendre/skills/cms-galleries.md`
- Samma uppstädning: ta bort dubblerad endpointrad, gör description-only till standard och behåll content-blocks-beskrivningen som samma opt-in-avsnitt.
- Behåll CORS-noteringen om `galleries`-policy och Twig.
- Peka vidare till `cms-pages.md` som primär källa så filerna inte glider isär igen.

## Teknisk not

Endast markdown under `.vendre/skills/` ändras — ingen applikationskod, inga API-anrop och inget beteende i butiken påverkas.
