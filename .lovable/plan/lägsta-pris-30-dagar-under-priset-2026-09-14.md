# Lägsta pris 30 dagar under priset

Ja — det finns redan en gemensam priskomponent (`ProductPrice`) som används på
produktkort (kategorisidor, sök, utvalda), produktsidan, sökförslagen i headern
och varukorgsraderna. Orderrader på Mitt konto använder den inte, och rörs inte.

## Vad som byggs

Under det vanliga priset (eller nedsatt + överstruket ordinarie) visas en extra
rad i liten grå text:

```text
299 kr  399 kr
Lägsta pris 30 dagar: 49 kr
```

Regler:

- Raden visas **bara när produkten är nedsatt** (samma rea-regel som i dag:
  `price_special_raw < price_raw`).
- Raden visas bara när butiken faktiskt har ett loggat pris för produkten.
  Saknas det, visas ingenting — inget beräknas i frontend.
- Beloppet skrivs ut precis som butiken formaterat det (`price_log_price`).
- Demo-läget visar ingen sådan rad (mockdatan har inga loggade priser).

## Så undviks massa extra anrop

Loggade priser hämtas inte per prisrad. En liten samlare läggs runt butiken:
varje prisrad som är nedsatt anmäler sitt produkt-id, samlaren slår ihop alla
id:n som dykt upp under samma ögonblick och gör **ett** anrop för hela sidan,
och svaret cachas några minuter. En kategorisida med 24 reaprodukter ger alltså
ett anrop, inte 24.

## Teknisk detalj

1. **Ny `PriceLogProvider`** (`src/components/store/price-log-provider.tsx`),
   monterad en gång i `store-shell.tsx`:
   - context med `register(id)` och `get(id)`.
   - samlar id:n i ett set, debouncar ~50 ms, anropar
     `getPriceLogPrices(ids)` från `@/lib/vendre` via react-query
     (`queryKey: ["vendre", "price-log", sorterade ids]`, `staleTime` 5 min).
   - hämtar bara i live-läge (`useOnboarding`/status som storefronten redan
     använder för demo/live), aldrig i demo-läge.

2. **`product-price.tsx`**
   - ny valfri prop `productId?: string | number`; `PriceFields` utökas med
     inget nytt (id skickas separat).
   - när `onSale && productId` → `register(productId)` i en `useEffect` och läs
     `get(productId)`; rendera `Lägsta pris 30 dagar: {price_log_price}` i
     `text-xs text-muted-foreground` under prisraden.
   - roten blir `inline-flex flex-col` med prisraden som egen rad, så befintlig
     layout (baseline + gap-2) behålls i prisraden.

3. **Anropsställen** skickar `productId`:
   - `product-card.tsx`: `product.id`
   - `ProductPage.tsx`: `(buyableProduct ?? product).id`
   - `search-box.tsx`: `product.id`
   - `cart-sheet.tsx`: `line.product_data?.id` (hoppas över om saknas)

4. **Text** läggs i `src/lib/i18n.tsx` som nyckel
   `store.lowestPrice30Days` (sv: "Lägsta pris 30 dagar", en: "Lowest price
   30 days"), renderas som `{label}: {belopp}`.

5. **Dokumentation**: `.vendre/skills/price-log.md` och
   `.vendre/skills/product-price.md` uppdateras — hooken är inte längre
   "oanvänd", och visningsregeln (endast vid rea, batchad hämtning) beskrivs.

Ingen ändring i proxyn eller i `src/lib/vendre/price-log.ts` transportlogik.
