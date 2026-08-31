# Fixa registrering av konto

Felet "Unable to create account with provided payload" kommer från butiken, inte
från appen. Vilket fält den klagar på är ännu inte bekräftat — därför börjar
planen med att läsa butikens riktiga svar innan något skrivs om.

## Steg 1 – Läs butikens exakta svar (diagnos)

Gör ett testanrop mot `POST /surface/2/accounts` med en avsiktligt ogiltig
e-postadress, så att inget riktigt konto skapas, och logga hela svarskroppen:
felkod, `title` och `source.parameter` för varje fel. Det talar om exakt vilket
fält som avvisas.

## Steg 2 – Rätta payloaden efter svaret

Troliga orsaker, i den ordning de kontrolleras mot svaret i steg 1:

- Tomma strängar skickas med för fält som kunden inte fyllt i (`gender`,
  `company`, `mobile`, `personnummer`, `vat_identification_number`). Många
  installationer avvisar tom sträng men accepterar att fältet utelämnas.
- `type: "private"` – butiken kan förvänta sig ett annat värde (t.ex. `person`
  eller ett numeriskt id) för privatkund.
- `country: "SE"` – butiken kan vilja ha landsnamn i stället för landskod.
- `newsletter` / `consent_personal_data_policy` som boolean där butiken vill ha
  `1` / `0`.

Payloaden byggs om i `src/lib/vendre/account.ts` (registreringsanropet) så att
den matchar det butiken faktiskt accepterar, med hela det dokumenterade
fältsetet kvar för de fält som är obligatoriska.

## Steg 3 – Bättre felvisning i formuläret

I dag visas bara en generisk mening. Felhanteringen i `src/pages/LoginPage.tsx`
uppdateras så att:

- varje fel med `source.parameter` hamnar vid rätt fält,
- fel utan `source.parameter` visas som en läsbar toppnivåtext med butikens
  egen text i stället för en tom generisk rad.

## Steg 4 – Verifiera

Kör igenom registreringen som privatperson mot butiken och bekräfta att kontot
skapas och att inloggning fungerar direkt efteråt.

## Tekniska detaljer

- Berörda filer: `src/lib/vendre/account.ts` (payload + felparsning),
  `src/pages/LoginPage.tsx` (fältfel), ev. `src/types/vendre-account.ts` om
  fälten behöver bli valfria.
- Inget i demo-läget ändras; mockregistreringen fortsätter fungera som i dag.
- Anropet behåller `Surface-Mutation-Protection-Token` och `default`-policyn
  enligt `.vendre/knowledge/api-reference.md`.
