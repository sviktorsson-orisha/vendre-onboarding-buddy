# Fix: kontoregistrering skickar fel payload

Butiken förväntar sig ett exakt payload-format. Nuvarande kod skickar hela formuläret rakt av, inklusive fält butiken inte vill ha (`type`, tomma `company`, `mobile`, `vat_identification_number`) och `country` som landskod-sträng (`"SE"`) i stället för numeriskt land-ID (`203`). Det ger "Unable to create account with provided payload".

## Målformat:

```text
gender: "m"
firstname, lastname
email_address, password, confirmation
street_address, postcode, city, state
country: 203            (nummer, inte "SE")
telephone
personnummer
newsletter: true
consent_personal_data_policy: true
```

## Vad som ändras

1. **Payload-byggare i `src/lib/vendre/account.ts**`
  - Ny funktion som mappar formulärdata till exakt fältuppsättningen ovan.
  - `country` konverteras till nummer (SE = 203) via en liten kodtabell; redan numeriska värden skickas som de är.
  - `newsletter` och `consent_personal_data_policy` skickas som riktiga booleans.
  - Tomma valfria fält utelämnas i stället för att skickas som tomma strängar.
  - Företagsfälten (`company`, `vat_identification_number`) tas bara med när kontotypen är företag; `type` skickas inte alls eftersom butiken inte förväntar sig det.
2. **Formuläret i `src/pages/LoginPage.tsx**`
  - Lägg till fältet `state` (län/region) som saknas idag.
  - `gender` blir en riktig väljare med värdena `m` / `f` i stället för fri text.
  - `country` väljs i en lista som lagrar det numeriska ID:t.
  - `type` behålls enbart som UI-växling mellan privat/företag, inte som API-fält.
3. **Fel från butiken**
  - Behåll mappningen av `source.parameter` till rätt formulärfält och visa butikens `title` överst, så nästa avvikelse pekar ut fältet direkt.
4. **Typer i `src/types/vendre-account.ts**`
  - `RegisterInput` uppdateras: `country: number`, nytt `state`, företagsfält blir valfria.

## Verifiering

Skapa ett privatkonto i live-läge och bekräfta att registreringen går igenom och att inloggning fungerar direkt efteråt.