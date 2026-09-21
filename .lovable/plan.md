# Byte av kundtyp slår inte igenom i admin

Du växlade en företagskund till privatperson och sparade, men kundkortet i Vendre admin ligger kvar som företagskund.

## Vad vi vet i dag

- Formuläret skickar kundtypen som `type: 0` (privatperson) eller `type: 1` (företag) i `PUT accounts/me`, samma nyckel och värden som vid registrering, där den fungerar.
- Butikens fältlista (`GET accounts/form`) innehåller både `type` och `customers_group_id`. I Vendre styrs privat/företag ofta av kundgruppen, så det är troligt att kundkortet läser `customers_group_id` och att enbart `type` inte flyttar kunden mellan grupperna.
- Detta är ännu inte bekräftat — sparningen svarar OK, så butiken tar emot kroppen men verkar ignorera eller inte tolka `type` vid uppdatering.

## Steg 1 – bekräfta orsaken mot butiken

Med ett testkonto (skapas som företagskund) körs en kontrollerad serie uppdateringar och avläsningar:

1. `PUT accounts/me` med `type: 0` → läs tillbaka `GET accounts/me` och se om kundtypen ändras.
2. Samma test med `customers_group_id` satt till privatkundgruppen (gruppens id läses ut från kontot före/efter).
3. Samma test med båda nycklarna samtidigt.

Den kombination som faktiskt ändrar kundtypen på kontot är svaret.

## Steg 2 – rätta sparningen

- Om en annan nyckel (t.ex. kundgrupp) krävs: kontobygget skickar den nyckeln tillsammans med `type`, så växlingen slår igenom både i vårt gränssnitt och på kundkortet.
- Om butiken helt saknar stöd för att byta kundtyp efter registrering: växlaren på Redigera konto visas som låst med en kort förklaring att kundtypen bara kan ändras av butiken, i stället för att låtsas spara något. Registreringens växlare påverkas inte.

## Steg 3 – verifiera och dokumentera

- Testa i webbläsaren: logga in som företagskund, växla till privatperson, spara, ladda om och kontrollera att värdet står kvar och att fälten för företagsnamn och momsregistreringsnummer försvinner.
- Uppdatera `.vendre/knowledge/api-reference.md` och `.vendre/skills/account-auth.md` med vad butiken faktiskt kräver för att byta kundtyp.

## Tekniska detaljer

- `buildAccountBody()` i `src/lib/vendre/account.ts` bygger `PUT accounts/me`-kroppen; där läggs den korrekta nyckeln till.
- `normalizeAccount()` läser i dag `type` via `["type", "customer_type"]`; behöver eventuellt även kundgruppens id så formuläret visar rätt förvalt läge.
- Växlaren ligger i profilformuläret i `src/pages/AccountPage.tsx`.
- Inga ändringar i registreringsflödet, som redan sätter kundtypen korrekt.
