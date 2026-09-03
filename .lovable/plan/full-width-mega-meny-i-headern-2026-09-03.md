# Full-width mega meny i headern

Dropdownen från huvudkategorierna byggs om till en mega meny som täcker hela skärmens bredd istället för dagens smala panel med utfällbara undernivåer.

## Så ska det fungera

- Huvudkategorierna (t.ex. Clothing) ligger kvar som länkar i header-raden.
- Hover eller tangentbordsfokus på en huvudkategori öppnar en panel i full viewport-bredd direkt under headern.
- I panelen listas nivå 2 (t.ex. Men, Women) som kolumner bredvid varandra. Varje kolumnrubrik är en länk till den underkategorin.
- Under varje kolumnrubrik listas nivå 3 (underkategorierna till Men/Women) som länkar.
- Längst ned (eller överst) i panelen finns en länk till huvudkategorin: "Visa allt i Clothing".
- Panelen stängs vid mouse leave, Escape, eller när man klickar på en länk.
- Mobilmenyn lämnas oförändrad.

## Layout

```text
|=============== header (max-w-6xl) ===============|
| vendre   [sök]                  [språk][konto][kundvagn] |
| Clothing   Home & House   Shoes                          |
|==========================================================|
|  helbredds panel (innehåll centrerat i max-w-6xl)        |
|  Men            Women           Accessories              |
|   - T-shirts     - Dresses       - Belts                 |
|   - Jeans        - Tops          - Hats                  |
|                                                          |
|  -> Visa allt i Clothing                                 |
|==========================================================|
```

Kolumner i responsivt rutnät (2-5 kolumner beroende på antal och skärmbredd), scroll om innehållet blir högt.

## Teknisk beskrivning

- Endast `src/components/store/store-header.tsx` ändras (plus ev. en ny textnyckel i `src/lib/i18n.tsx` för "Visa allt i {kategori}").
- `DesktopMenuItem` ersätts av en meny där aktivt öppet id hålls i state på nav-nivå (`openId`), så bara en panel är öppen åt gången och hover mellan toppnivålänkar byter panel direkt.
- Panelen renderas som ett absolut positionerat element på `<nav>` (som får `relative`), med `left-0 right-0 w-full` så den spänner hela viewporten; innehållet ligger i en `mx-auto max-w-6xl`-container.
- Data kommer fortsatt från `useCategoryMenu()` — inga API-ändringar, ingen ny hämtning, nivå 2 och 3 finns redan i `MenuNode.children`.
- Tillgänglighet: toppnivålänkarna får `aria-expanded` och `aria-haspopup`, panelen stängs på Escape och blur ut ur menyn.
