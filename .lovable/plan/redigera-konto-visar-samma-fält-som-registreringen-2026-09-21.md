# Redigera konto visar samma fält som registreringen

Kontosidans redigeringsformulär har en fast fältlista (namn, e-post, gatuadress, postnummer, ort, land). Den tar ingen hänsyn till butikens fältinställningar, så personnummer, telefon, mobil, adressrad 2, företagsnamn och momsregistreringsnummer saknas helt – trots att de är påslagna i admin och används vid registrering.

## Vad som ändras

- Fälten på "Redigera konto" hämtas från samma fältlista som registreringen, så exakt de fält butiken har påslagna visas, med samma obligatorier och längdgränser.
- Kundtypen (Privatperson / Företagskund) visas högst upp och går att byta, precis som vid registrering.
- Företagsnamn och momsregistreringsnummer visas bara för företagskunder.
- Identitetsnumret byter etikett mellan "Personnummer" och "Organisationsnummer" beroende på kundtyp.
- Lösenord och lösenordsbekräftelse ingår inte.
- Formuläret förifylls med kontots nuvarande värden, inklusive de fält som idag inte visas.
- Sparningen skickar med de nya fälten, och företagsnamnet skrivs vid behov till kundens adress på samma sätt som vid registrering.

## Tekniska detaljer

- `src/pages/AccountPage.tsx`: profilformuläret använder `useRegisterConstraints()` och en `shown()/needed()/limit()`-hjälp likt `LoginPage.tsx`, plus kundtypsväxlaren; `Account`-state utökas med `street_address2`.
- `src/lib/vendre/account.ts`: `normalizeAccount` plockar upp `personnummer`, `company`, `vat_identification_number`, `telephone`, `mobile`, `street_address2` och `type` från alla kända nyckelvarianter; `updateAccount` bygger kroppen efter samma regler som `buildRegisterBody` (endast synliga fält, tomma optionals utelämnade, `type` 0/1, företag/moms bara för företagskund) och återanvänder `saveCompanyOnAddress` när butiken kastar företagsnamnet.
- Landsnyckeln för `PUT accounts/me` verifieras live (`country` kontra `country_id`) innan den fastställs, eftersom `POST accounts` kräver `country_id`.
- `src/types/vendre-account.ts`: `Account` får `street_address2`.
- i18n-nycklar återanvänds från registreringen; nya läggs till på svenska och engelska vid behov.
- Dokumentation uppdateras i `.vendre/knowledge/api-reference.md` och `.vendre/skills/customer-account/SKILL.md`.
