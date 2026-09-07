# "Läs mer" i produktboxarna

I produktlistningarna (kategorisida, sökresultat, startsida) ska köpknappen bytas mot en **Läs mer**-länk till produktsidan när produkten inte går att köpa direkt från listan.

## När visas "Läs mer"

- Produkten har varianter (butiken svarar med `child_count > 0`),   
eller
- Produkten är slut i lager och får inte köpas när den är slut (`stock_total` = 0 och `stock_allow_checkout` är falskt)

I alla andra fall visas köpknappen precis som idag. Produktsidan påverkas inte.

## Verifierat i butiken

Kategorisvaret innehåller fältet `child_count` per produkt: produkt 188 ("Off Shoulder Button Dress") har `child_count: 3` och dess tre varianter (267–269) har `child_count: 0`. Fältet finns inte i vår typdefinition idag, så det behöver läggas till.

## Teknisk genomförande

- `src/types/vendre.ts`: lägg till `child_count?: number | null` på `Product`.
- `src/components/store/product-card.tsx`: räkna fram `canBuy`; rendera antingen befintlig köpknapp eller en `Link` till `/produkt/$id` med samma knappstil (ghost/sekundär) och texten "Läs mer".
- `src/lib/i18n.tsx`: nya nycklar `store.readMore` ("Läs mer" / "Read more").
- `src/mock/vendreResponses.ts`: sätt `child_count` i mockproduktfabriken (0 som standard, >0 för produkter med attribut) så demoläget visar samma beteende.
- Ingen ändring av API-anrop, filtrering eller produktsidan.