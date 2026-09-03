# Sidtyper i Vendre – vad datan faktiskt säger

## Vad jag hittade (live mot butiken)

**1. På menynivå (`navigation/menus`)**
Alla CMS-sidor kommer som `menu_type: "information_page"` / `source: "information_page"`.
Det finns alltså ingen undertyp här — skillnaden mellan sidtyper syns först i sidträdet och i innehållsblocken.

**2. I sidträdet (`galleries/pagetree`)**
Svaret har två nycklar: `tree` (nästlad) och `pages` (platt). Varje nod:
`id`, `parent_id`, `title`, `href`, `is_menu`, `children`.

Tre tydliga sidtyper framträder:

| Typ | Kännetecken | Exempel |
| --- | --- | --- |
| Rubrik-/samlingssida | `is_menu: true`, `href` = `gallery.php?id=X`, har barn, **noll content-blocks** | Information (17), Kundservice (16) |
| Vanlig innehållssida | `is_menu: false`, pretty href, innehållsblock av text-typ | Om oss (25), Köpvillkor (79) |
| Listnings-/blogg-sida | Har blocket `list-pages-in-cards` som listar andra sidor | Inspiration (76) med barnen 77, 78 |

**3. I innehållsblocken (`galleries/{id}/content-blocks`)**
Blocktyperna (`key`) i butiken just nu: `margin`, `text`, `large-text`, `columns`,
`list-pages-in-cards`, `flex1`, `2col-text-img`.
Alla block har utöver sina egna fält en uppsättning styr-fält:
`background`, `_date_from`, `_date_to`, `_show_desktop`, `_show_phone`, `_show_tablet`, `_viewport_label`.
Sidan 17 returnerar `content_blocks: []` — en ren rubriksida utan eget innehåll.

## Konsekvenser för frontend (förslag)

1. **Rubriksidor får inte rendera tomt.** Sidor utan block (t.ex. 17) ska istället visa titel + länklista över sina barnsidor från `pagetree`.
2. **Blockrenderare per `key`** i stället för dagens generella HTML-utskrift: `text`/`large-text` (rik text), `columns` (content1–4 i kolumnrutnät), `2col-text-img`, `flex1` (hero), `margin` (avstånd), `list-pages-in-cards` (kortlista med underliggande sidor). Okänd `key` faller tillbaka till rik text.
3. **Respektera styr-fälten:** hoppa över block utanför `_date_from`/`_date_to`, och göm block där `_show_desktop`/`_show_phone`/`_show_tablet` är av (via CSS-klasser).
4. **Använd `pagetree`** som källa för sidtitel, förälder/barn och brödsmulor på `/sida/$id` — den datan finns inte i content-blocks.
5. **Länka aldrig till `href`/`target`** (absolut gammal storefront-URL) — använd `/sida/{id}`.

## Teknisk omfattning om vi bygger det

- `src/types/vendre.ts`: typer för pagetree (`tree`/`pages`) och block-styrfält.
- `src/lib/vendre/api.ts`: `getPageTree()` (cachad, statisk data) + mock.
- `src/pages/ContentPage.tsx`: block-mappning per `key`, barnsidelista för tomma sidor, brödsmulor.
- `src/mock/vendreResponses.ts`: demo-data för de tre sidtyperna.
- `.vendre/skills/cms-pages.md`: dokumentera sidtyperna och blocklistan.
