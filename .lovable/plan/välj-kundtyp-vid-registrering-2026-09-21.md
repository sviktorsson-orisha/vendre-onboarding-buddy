# Välj kundtyp vid registrering

Registreringsformuläret får en växling mellan **Privatperson** och **Företagskund**, och identitetsfältet byter namn efter valet.

## Så fungerar det

- Överst i formuläret ligger ett val mellan Privatperson och Företagskund. Privatperson är förvalt.
- Privatperson: fältet heter "Personnummer" (visas och krävs enligt butikens inställningar, precis som idag).
- Företagskund: samma fält heter i stället "Organisationsnummer" – samma krav och samma längdgränser.
- Företagskund visar dessutom alltid fältet "Företagsnamn", och det måste fyllas i, även om butiken har det avstängt.
- Kundtypen skickas med i registreringen som 0 för privatperson och 1 för företag.
- Övriga fält (adress, telefon, momsreg.nr osv.) styrs fortsatt av butikens fältlista.

## Tekniskt

- `src/types/vendre-account.ts`: `RegisterInput` får `customer_type: 0 | 1`.
- `src/lib/vendre/account.ts`: `buildRegisterBody` skickar `type: 0 | 1`; när typen är företag inkluderas `company` som obligatoriskt fält oavsett vad `accounts/form` säger. Identitetsnumret skickas fortsatt i nyckeln `personnummer`.
- `src/pages/LoginPage.tsx`: en tvåvalsknapp (Tabs/ToggleGroup i befintlig stil) ovanför namnfälten styr `customer_type`; etiketten för personnummer-fältet och synligheten/kravet för företagsnamn härleds från valet. Validering före submit: företagsnamn tomt vid företagskund ger fältfel.
- `src/lib/i18n.tsx`: nya nycklar `account.customerType`, `account.private`, `account.business`, `account.orgnumber` på svenska och engelska.
- Dokumentation: `.vendre/knowledge/api-reference.md` och `.vendre/skills/account-auth.md` noterar att `type` skickas som 0/1 och att organisationsnummer använder `personnummer`-nyckeln.

## Verifiering

Efter bygget testas en registrering av vardera typen mot butiken med en ny e-postadress, för att bekräfta att `type: 1` + `company` accepteras.
