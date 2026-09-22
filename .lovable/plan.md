# Landsfältet vid registrering

## Vad som gäller idag

Registreringen skickar redan `country_id` (numeriskt) till butiken — inte `country`. Nyckeln `country` finns bara internt i formuläret och i fältlistan från butiken, och översätts till `country_id` när kroppen byggs. Detsamma gäller uppdatering av konto och adress.

Det betyder att registrering redan tekniskt fungerar med land i payloaden; landet är låst till ett fast värde (Sverige = 203) tills butiken kan leverera en landslista.

## Föreslagen ändring: gör namngivningen entydig

Byt internt namn från `country` till `country_id` i hela kedjan så att det som syns i koden är exakt det butiken tar emot, och ingen framtida ändring råkar skicka `country`:

- Formulärets fält och state i registrering och Redigera konto heter `country_id`.
- Fältlistan från butiken (`accounts/form`) matchas direkt på `country_id` — aliaset som översätter `country_id` → `country` tas bort.
- Kontots normaliserade data behåller landet som numeriskt id.
- Landsvalet fortsätter använda den befintliga fasta listan och skickas alltid med, även om värdet kan vara "fel" land tills butikens landslista finns.

## Förberedelse för butikens landslista

Landvalet samlas i en enda plats så att bytet till en API-baserad lista senare bara är att byta datakälla: samma select, samma fältnamn, värden hämtas då från butiken i stället för den fasta listan.

## Tekniska detaljer

- `src/lib/vendre/account.ts`: ta bort `FIELD_ALIASES`, döp om fältet i `REGISTER_FIELDS` och `DEFAULT_REGISTER_CONSTRAINTS`, låt `buildRegisterBody`/`buildAccountBody`/`addressBody` läsa `input.country_id`.
- `src/types/vendre-account.ts`: `RegisterInput.country` → `country_id: number`; `Account.country` behålls som visningsvärde där det används.
- `src/pages/LoginPage.tsx` och `src/pages/AccountPage.tsx`: byt formulärnyckel och `shown()/needed()`-anrop till `country_id`.
- Dokumentation (`.vendre/knowledge/api-reference.md`, `.vendre/skills/account-auth.md`): beskriv `country_id` som enda landsnyckel och notera att landslistan ännu inte finns som endpoint.
- Verifiering: `tsgo --noEmit`, build, samt ett live-test av registrering mot butiken.
