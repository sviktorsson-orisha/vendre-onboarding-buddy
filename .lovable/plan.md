# Olika priser i preview och på den publicerade sajten

## Vad mätningen visar

Jag laddade produkt 222 ("T-shirt with print") på båda adresserna som utloggad
besökare och läste av vad butiken svarade:

- Preview: ordinarie 99 kr, rea 29 kr
- Publicerad: ordinarie 99 kr, rea 29 kr

Alltså identiskt. Skillnaden du ser uppstår när du är **inloggad** på den
publicerade sajten — då svarar butiken med 96 kr / 28 kr. Det är priser som
butiken själv räknar fram för ditt konto (kundgrupp/avtalspris), inte något
butiksgränssnittet räknar om. Sajten visar alltså det pris butiken skickar.

Detta är inte verifierat ännu: att just ditt konto ligger i en kundgrupp med
egen prislista. Första steget i planen är att bekräfta det.

## Steg 1 — Bekräfta orsaken

Logga in med ett testkonto i preview och läs av vad butiken svarar för produkt
222, både utloggad och inloggad. Om inloggat läge ger 96/28 även i preview är
saken klar: priset följer kontot, och preview/published beter sig likadant.

Om inloggat läge i preview fortfarande ger 99/29 finns ett verkligt fel i hur
sessionen skickas vidare, och då tar vi det som nästa steg.

## Steg 2 — Se till att priser aldrig fastnar vid in-/utloggning

Oavsett utfallet i steg 1 finns en svaghet: de sparade (cachade) priserna i
butiksgränssnittet håller reda på marknad, valuta, språk och moms — men inte på
vem som är inloggad. Efter inloggning kan därför gamla priser ligga kvar tills
sidan laddas om.

Åtgärd: lägg in inloggningsläget (och kundtyp) i samma "nyckel" som styr sparade
priser, så att produktlistor, produktsidor och kundvagn automatiskt hämtas om när
någon loggar in eller ut.

## Steg 3 — Dokumentera

Kort notering i prisdokumentationen om att priser är kontoberoende, så att det
inte utreds som en bugg igen.

## Teknisk del

- Verifiering: Playwright mot `localhost:8080` och den publicerade domänen,
  inloggad respektive utloggad, och avläsning av `pricing` i VQL-svaret för
  produkt 222 (`original_raw`, `special_raw`).
- `useCacheScope()` i `src/lib/vendre/api.ts` returnerar idag
  `[market.id, currency.code, language.code, prices_include_vat]`. Utöka med
  `authenticated` och `customer_type` från `GET session/context`.
- Ingen ändring i `resolvePrice()` eller `ProductPrice` — visningsregeln
  (rött reapris, grått överstruket ordinariepris) är oförändrad.
- Dokumentation: `.vendre/skills/product-price.md` (avsnitt om cache-scope).
