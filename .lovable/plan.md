# Loggade priser: rätt parameter och rätt svarsformat

## Vad testet visade

Anropet fungerar — men vår nuvarande hjälpfunktion använder fel parameternamn
och fel antagande om svaret.

Verifierat mot butiken för produkt 36-7246 (internt id 222, ordinarie 99 kr,
nedsatt 29 kr):

```text
GET /surface/1/products/price_log_prices?id[]=222
{"222":{"product_id":222,"price_list_id":null,"currency_id":null,
        "products_tax_class_id":2,"price_log_price_ex_vat_raw":39.2,
        "price_log_price_raw":49,"price_log_price":"49 kr"}}
```

Flera id i samma anrop fungerar (`id[]=222&id[]=271`) och svaret innehåller då
en post per id. Med andra parameternamn (`products_id`, `product_id`, `ids`)
svarar butiken tomt — det var därför inget syntes tidigare.

Två fel i nuvarande kod:

1. Parametern heter `id[]`, inte något godtyckligt namn anroparen hittar på.
2. Svaret är ett objekt med produkt-id som nyckel, inte en lista. Vår
   hjälpfunktion returnerar tom lista när svaret inte är en lista, så den
   kastar bort all data.

## Det som ändras

1. **`src/lib/vendre/price-log.ts`**
   - `getPriceLogPrices(ids)` tar en lista med produkt-id och skickar dem som
     `id[]=...`.
   - Svaret typas som en uppslagning `Record<string, PriceLogPrice>` med fälten
     ovan, och en `getPriceLogPrice(id)` som ger posten för en enskild produkt
     eller `null`.
   - `usePriceLogPrices(ids, { enabled })` fortsätter vara avstängd som standard
     så ingen befintlig sida får ett extra anrop.

2. **Proxyn** (`src/routes/api/vendre/surface1/products/price-log-prices.ts`)
   ändras inte i sak — den skickar redan vidare query-strängen oförändrad.

3. **Dokumentation**
   - `.vendre/skills/price-log.md`: rätt parameter `id[]`, exempelsvar ovan,
     att svaret är nyckelat på produkt-id, och att `price_log_price` redan är
     formaterad i sessionens valuta.
   - `.vendre/knowledge/api-reference.md`: samma korrigering i v1-avsnittet.

Inget visas i butiken — funktionen förblir tillgänglig men opåslagen.

## Teknisk detalj

Svarsfält: `product_id`, `price_list_id`, `currency_id`,
`products_tax_class_id`, `price_log_price_ex_vat_raw`, `price_log_price_raw`,
`price_log_price`. Produkter utan loggat pris utelämnas ur svaret, så en saknad
nyckel betyder "inget loggat pris" och ska inte renderas.
