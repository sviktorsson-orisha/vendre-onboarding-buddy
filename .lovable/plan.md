# Adresser under Mitt konto – visa rätt huvudadress

## Problemet

Idag hämtas både `accounts/me/addresses` och `accounts/me/address-book`, och koden behåller bara
den lista som har flest poster. Eftersom `address-book` innehåller de alternativa adresserna vinner
den, huvudadressen från `accounts/me/addresses` slängs bort, och vyn utser då första alternativa
adressen till "huvudadress" och nästa till "Adress 2".

## Lösning

1. Två separata källor istället för "störst vinner":
   - `accounts/me/addresses` → huvudadressen.
   - `accounts/me/address-book` → de alternativa adresserna.
2. Två kolumner: vänster kolumn visar huvudadressen, höger kolumn visar alla alternativa adresser
   under varandra. På mobil staplas kolumnerna med huvudadressen först.
3. Inga rubriker eller etiketter ovanför adresskorten, ingen dubblettfiltrering och ingen fallback –
   det finns alltid en huvudadress.
4. Adresserna förblir enbart läsbara – ingen redigering läggs till.

## Teknisk del

- `src/lib/vendre/account.ts`
  - `getAddresses` slutar jämföra listornas längd. `accounts/me/addresses` och
    `accounts/me/address-book` hämtas parallellt och returneras som
    `{ main: Address | null; alternatives: Address[] }`, där `main` är första posten från
    `addresses` och `alternatives` är hela adressboken orörd.
  - Ingen dedupe mellan listorna; `dedupeAddresses` används fortsatt bara inom respektive svar.
  - Fallback-etiketten `Adress N` i `normalizeAddress` tas bort – label lämnas tom när butiken
    inte skickar något namn.
  - Demo-implementationen returnerar samma `{ main, alternatives }`-form.
- `src/mock/vendreAccount.ts`: demo-datan delas i en huvudadress och en eller flera alternativa.
- `src/pages/AccountPage.tsx`: `AddressesView` renderar `grid gap-6 lg:grid-cols-2` – huvudadressen
  i vänsterkolumnen, alternativen staplade i högerkolumnen. `AddressCard` renderar bara adressraderna
  utan rubrik/badge.
- `src/types/vendre-account.ts`: typ för adressresultatet (`main` + `alternatives`).
- `.vendre/skills/customer-account/references/account-pages.md` och
  `.vendre/skills/auth-sessions/references/account-pages.md`: notera att `accounts/me/addresses` ger
  huvudadressen och `accounts/me/address-book` de alternativa.
