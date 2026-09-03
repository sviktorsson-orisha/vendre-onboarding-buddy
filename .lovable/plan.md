# Footern: bara riktiga menyrubriker med undersidor

## Problem

Footern byggs idag enbart från `navigation/menus` (`menu_type === "information_page"`).
Den payloaden saknar fältet `is_menu`, så "Inspiration" (id 76) — som är en vanlig
listningssida och inte en menyrubrik — hamnar i footern tillsammans med sina
undersidor 77/78.

Informationen finns i `GET /surface/2/galleries/pagetree`, som returnerar
`tree` + platt `pages` med `id`, `parent_id`, `title`, `href`, `is_menu`, `children`.
Där är 17 (Information) och 16 (Kundservice) `is_menu: true`, medan 76 (Inspiration)
är `is_menu: false`.

## Lösning

Footern får hämta sin struktur från `pagetree` istället för menypayloaden och visa
**endast** grupper som uppfyller alla tre villkor:

1. toppsida (`parent_id` saknas eller är `0`),
2. `is_menu === true`,
3. har minst en undersida som finns i sidträdet (aktiva undersidor).

Undersidorna länkas som idag till den interna rutten `/sida/{id}` — aldrig till
`href`/`target` (gammal absolut storefront-URL). Sidor utan sådan grupp visas inte,
så "Inspiration" försvinner ur footern. Headern påverkas inte.

## Teknisk omfattning

- `src/types/vendre.ts`: typer `PageTreeNode` (`id`, `parent_id`, `title`, `href`, `is_menu`, `children`) och `PageTreeResponse` (`tree`, `pages`).
- `src/lib/vendre/api.ts`:
  - `getPageTree()` i `VendreApi`, live via `guarded(() => surfaceJson("galleries/pagetree"))`, demo via mock.
  - `usePageTree()` med samma cachning som andra statiska reads (staleTime ~10 min).
  - `usePageMenu()` skrivs om att bygga grupperna ur sidträdet med filtret ovan (fallback till tom lista om trädet saknas).
- `src/mock/vendreResponses.ts`: `mockPageTree` som speglar strukturen — två menyrubriker med barn plus en icke-meny-sida med barn, så demoläget visar samma filtrering.
- `src/components/store/store-footer.tsx`: rendera bara grupperna; ta bort "loose"-kolumnen som annars skulle visa lösryckta sidor.
- `.vendre/skills/navigation-menus.md` och `.vendre/skills/cms-pages.md`: dokumentera att footern styrs av `pagetree` + `is_menu`, inte av `navigation/menus`.
