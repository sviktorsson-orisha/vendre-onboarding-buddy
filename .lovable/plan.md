# Snabbare produktsida – sluta leta igenom alla kategorier

## Problemet

När en produktsida öppnas hämtas produkten genom att butikens kategorier gås igenom
en i taget, med *alla* produkter i varje kategori (`categories/90?limit=0`,
`categories/163?limit=0`, ...) tills produkten hittas. Det ger tiotals tunga anrop
i rad – precis det som syns i nätverksloggen – och sidan står och laddar under tiden.

Sökvägen via VQL, som hämtar produkten i ett enda anrop, används idag bara som
sista utväg (för variantbarn), efter att hela kategoriletandet redan körts.

## Lösning

Vänd på ordningen: hämta produkten direkt med ett anrop, och behåll kategoriletandet
bara som nödlösning för butiker där den vägen inte fungerar.

1. Produktsidan gör ett direktanrop för produkt-id:t först.
2. Ger det träff visas sidan direkt – inga kategorianrop alls.
3. Bara om direktanropet inte ger någon produkt görs den gamla genomsökningen,
   och då först i den kategori man kom ifrån (om den är känd).
4. Kommer man från en kategorilistning skickas kategorin med, så nödlösningen
   i värsta fall blir ett anrop i stället för tiotals.

## Teknisk detalj

- `liveApi.getProduct` i `src/lib/vendre/api.ts` skrivs om till ordningen:
  `vqlProduct(id)` → `fromCategory(categoryId)` (om angivet) → loop över
  `menu_type === "category"`. Loopen behålls oförändrad som fallback.
- `vqlProduct` returnerar redan namn, bild, pris, lager, `parent_id`,
  `stock_allow_checkout`, `status` och specifikationer, dvs. samma fält som PDP:n
  läser från kategoriträffen. Fält som saknas i VQL-svaret (t.ex. `child_count`)
  kontrolleras och normaliseras så att variantväljare och köpknapp beter sig lika.
- `vqlDisabled`-flaggan återanvänds: om VQL svarar 500 på installationen sätts den
  och efterföljande produktsidor går direkt på kategorivägen utan onödigt försök.
- `ProductPage`/`produkt.$id` skickar vidare kategori-id från listningen när det
  finns (search-param `from`), som andrahandsväg – ingen ändring i UI.
- Verifiering: öppna en produktsida i preview och bekräfta i nätverksloggen att
  inga `categories/*?limit=0`-anrop görs och att pris, lager, varianter och
  specifikationer visas som idag – både för huvudprodukt (188) och variant (271).
