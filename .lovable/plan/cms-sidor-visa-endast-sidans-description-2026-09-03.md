# CMS-sidor: visa endast sidans description

Idag renderas CMS-sidan (`/sida/{id}`) från innehållsblocken i
`GET galleries/{id}/content-blocks`. Det ska bort — sidan ska bara visa
titeln och sidans egen `description`.

## Vad som ändras

- Sidinnehåll hämtas från `GET /surface/2/galleries/{id}/pages` i stället för
  `content-blocks`. Där ligger sidposten med titel och description.
- Sidan renderar rubriken plus description-HTML:en, inget annat.
- Om description saknas visas befintlig "sidan är tom"-text.
- Demo-läget får motsvarande mockdata med description i stället för block.

## Tekniska detaljer

- `src/types/vendre.ts`: ersätt `PageContent`/`ContentBlock`-användningen med
  en `GalleryPage`-typ (`id`, `title`, `description`) och en
  `GalleryPagesResponse`.
- `src/lib/vendre/api.ts`: `getPageContent(id)` anropar
  `galleries/{id}/pages`, plockar posten som matchar `id` (annars första),
  och returnerar `{ id, title, description }`. Cachning som idag
  (statiskt CMS-innehåll).
- `src/pages/ContentPage.tsx`: ta bort `Block`-komponenten och
  block-sorteringen; rendera `description` genom befintliga
  `prepareCmsHtml` (sanitering + relativa bildvägar mot butikens bas-URL).
  Rubrik: sidans `title`, med menytiteln som fallback.
- `src/mock/vendreResponses.ts`: byt blockmocken mot description-text.
- Uppdatera `.vendre/skills/cms-pages.md` och `cms-galleries.md` så de
  beskriver att endast description används, och att `content-blocks` inte
  längre anropas.

Första steget i implementationen är att verifiera fältnamnet i det riktiga
svaret från `galleries/{id}/pages` (t.ex. `description` vs `content`) och
följa det som faktiskt returneras.
