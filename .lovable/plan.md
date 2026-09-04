# Logga från butiken + rensad startsida

## 1. Riktig logga i headern

Idag visar headern alltid textloggan "vendre". Butikens egen logga finns redan i
svaret från butiken (`SHOP_LOGO` i sessionens kontext) men används inte.

Så här ska det bli:

- När riktig data hämtas visas butikens egen logga som bild, länkad till startsidan.
- Butiksnamnet används som alt-text (faller tillbaka till "Vendre" om namn saknas).
- Saknas logga (eller körs demoläget) visas textloggan precis som idag, så headern
  aldrig blir tom.
- Bildens höjd begränsas så headern inte hoppar.

## 2. Ta bort "Kategorier"-sektionen på startsidan

Sektionen med rubriken "Kategorier" och rutorna under den tas bort helt från
startsidan. Hero-blocket och "Utvalda produkter" står kvar.

## Tekniska detaljer

- `src/components/store/store-header.tsx`: läs `useSessionContext()`, plocka
  `SHOP_LOGO` och `STORE_NAME`, kör sökvägen genom `resolveImageUrl()` från
  `src/lib/vendre/api.ts` (absoluta URL:er lämnas orörda), rendera `<img>` annars
  nuvarande wordmark.
- `src/pages/Index.tsx`: ta bort kategori-sektionen; `useMenuTree()` behålls bara
  om hero-knappen fortfarande behöver första kategorin.
- Ingen förändring i demo-data eller API-anrop utöver befintlig sessionshämtning.
