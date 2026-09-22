# Utvalda produkter syns inte på startsidan

## Vad som händer

Startsidan ber butiken om 8 produkter. Butiken tillåter bara vissa antal per sida och svarar med ett fel:

```text
"Invalid query parameter: limit. Expected one of: 12, 15, 20, 0."
```

Anropet misslyckas därför helt och listan under "Utvalda produkter" blir tom.

Samma problem finns på ett ställe till: när butiken hämtar en hel kategori i bakgrunden (används bland annat av sökningen) ber koden om 500 produkter per sida, vilket butiken också avvisar.

## Åtgärd

1. Låt startsidan begära ett antal butiken accepterar (12) och visa de första åtta av dem, så designen med två rader om fyra behålls.
2. Byt bakgrundshämtningen av hela kategorier från 500 till ett tillåtet värde, så sökning och produktuppslag inte heller tyst misslyckas.
3. Skydda mot framtida fel: begränsa sidstorleken till butikens tillåtna värden på ett ställe i API-lagret, så att inget anrop kan skicka ett ogiltigt värde.
4. Verifiera live: ladda startsidan i testwebbläsaren och bekräfta att produktkorten visas och att inga 400-svar återstår i nätverksloggen.

## Tekniska detaljer

- `src/lib/vendre/api.ts`: inför `ALLOWED_PAGE_SIZES` (12, 15, 20 samt 0 = alla) och en hjälpfunktion som avrundar upp till närmaste tillåtna värde i `categoryQuery()`; ersätt `MAX_PAGE_SIZE = 500` i `allCategoryProducts()` med ett tillåtet sidvärde och behåll siduppräkningen tills en kort sida kommer.
- `useFeaturedProducts(count)`: hämta med ett tillåtet `limit` och behåll `slice(0, count)` för visningen.
- `src/pages/Index.tsx` behöver ingen ändring (anropar redan `useFeaturedProducts(8)`).
- Inga ändringar i proxy, sessionshantering eller mutation-tokens.
