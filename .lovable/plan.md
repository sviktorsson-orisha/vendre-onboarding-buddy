# Företagsnamnet sparas inte vid företagsregistrering

## Vad vi vet

Butikens fältlista (`GET /surface/2/accounts/form`) svarar just nu:

- `company`: `display: false`, `required: false`
- `type`: `display: true`
- `vat_identification_number`: `display: true`
- `personnummer`: `display: false` men `required: true`

Registreringen skickar redan med `company` för företagskunder, även när butiken
har fältet avstängt. Kundtypen (`type: 1`) sparas korrekt, företagsnamnet inte.
Den mest sannolika förklaringen är att butiken ignorerar `company` eftersom
fältet är avstängt i admin — men det är **inte verifierat ännu**, så planen
börjar med att bekräfta orsaken innan något ändras.

## Steg

1. **Bekräfta orsaken.** Skapa ett testkonto som företagskund med ifyllt
   företagsnamn och läs tillbaka kontot (`accounts/me` + adressboken) för att se
   om `company` finns kvar någonstans. Testa i samma runda två varianter:
   företagsnamnet enbart i registreringskroppen, och företagsnamnet skrivet till
   adressen efter registrering.
2. **Om butiken ignorerar fältet när det är avstängt:** be dig slå på
   "Tillåt kunderna att skriva in företag" i admin och verifiera om igen — då
   räcker nuvarande kod, och formuläret visar fältet automatiskt.
3. **Om fältet accepteras men hamnar på adressen:** komplettera registreringen
   med en uppföljande sparning av företagsnamnet mot kontots adress, så värdet
   alltid finns kvar oavsett adminväxeln.
4. **Om butiken förväntar sig en annan nyckel** (t.ex. företagsnamn i ett annat
   fältnamn) — anpassa registreringskroppen till den nyckel som faktiskt
   fastnar.
5. Uppdatera dokumentationen (`.vendre/knowledge/api-reference.md` och
   `.vendre/skills/account-auth.md`) med det verifierade beteendet.

## Tekniska detaljer

- Registreringskroppen byggs i `buildRegisterBody` i `src/lib/vendre/account.ts`;
  där tvingas `company` med när `type === 1`, och tomma valfria fält utelämnas.
- Formulärets synlighet styrs av `optionalField` i `src/pages/LoginPage.tsx`,
  som redan tvingar fram företagsnamn som obligatoriskt för företagskund.
- Eventuell efterföljande adressuppdatering går via
  `PUT /surface/2/accounts/me/addresses` med mutation-token.
- Ingen förändring görs i kundtypslogiken, som fungerar som den ska.
