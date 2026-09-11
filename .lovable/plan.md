# Skapa konto – formulär enligt ny API-dokumentation

## Mål

Registreringsformuläret byggs om så att det speglar exakt vad dokumentationen
säger är obligatoriskt. Inget hittas på i frontend, och inga extra fält skickas
med i detta steg.

## Fält i formuläret

Endast de obligatoriska fälten enligt dokumentationen, plus samtycke:

1. E-postadress
2. Lösenord
3. Bekräfta lösenord
4. Förnamn
5. Efternamn
6. Gatuadress
7. Postnummer
8. Ort
9. Land (val i lista)
10. Samtycke till personuppgiftspolicy (kryssruta, måste kryssas i)

Alla nio fälten är obligatoriska i formuläret och kan inte lämnas tomma.
Fälten som togs bort i detta steg: kön, företag, telefon, mobil, personnummer,
momsregistreringsnummer, län/region, privat/företag-växeln och nyhetsbrev. De
kan byggas tillbaka senare som frivilliga fält.

## Land

Dokumentationen beskriver ingen egen adress för att hämta länder, och de
adresser jag testade mot din butik svarar inte. Landlistan blir därför kvar som
den är just nu tills du har rätt källa från Vendre — då byter vi till den utan
att röra resten av formuläret. Landfältet fortsätter skicka butikens numeriska
land-id, som dokumentationen kräver.

## Beteende

- Klientkontroll innan skick: e-postformat, lösenorden måste matcha, samtycke
  ikryssat. Felen visas vid respektive fält.
- Butikens valideringsfel visas fortsatt vid rätt fält.
- Vid lyckad registrering loggas kunden in och skickas till Mitt konto, som nu.

## Teknisk del

- `src/types/vendre-account.ts`: `RegisterInput` snävas till
  `email_address`, `password`, `confirmation`, `firstname`, `lastname`,
  `street_address`, `postcode`, `city`, `country` (numeriskt id) och
  `consent_personal_data_policy`.
- `src/lib/vendre/account.ts`: `buildRegisterBody` skickar exakt dessa fält —
  inga `gender`, `state`, `telephone`, `newsletter`, `personnummer`, `mobile`,
  `company`, `vat_identification_number` längre. `countryId()` och
  `COUNTRY_IDS` behålls som landkälla tills API-listan finns.
- `src/pages/LoginPage.tsx`: registreringsfliken byggs om till de tio raderna
  ovan, med `required` på alla input-fält och samlad validering före `submit`.
  `COUNTRY_OPTIONS` ligger kvar tills vidare.
- Mock-läget (`src/mock/vendreAccount.ts`) justeras vid behov så demo-flödet
  fortsätter fungera med den mindre payloaden.
- Ingen ändring av login, mutation-token-hantering eller kontosidorna.
