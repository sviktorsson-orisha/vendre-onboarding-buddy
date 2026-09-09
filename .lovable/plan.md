# Adresser under Mitt konto – visa rätt huvudadress

## Problemet

Idag hämtas både `accounts/me/addresses` och `accounts/me/address-book`, och koden behåller bara
den lista som har flest poster. Eftersom `address-book` innehåller de alternativa adresserna vinner
den, huvudadressen från `accounts/me/addresses` slängs bort, och vyn utser då första alternativa
adressen till "huvudadress" och nästa till "Adress 2".

## Lösning

1. **Två separata källor istället för "störst vinner".**
   - `accounts/me/addresses` → huvudadressen.
   - `accounts/me/address-book` → de alternativa adresserna.
2. **Dubbletter tas bort:** om samma adress (gata + postnummer + ort) finns i båda listorna visas
   den bara som huvudadress.
3. **Fallback:** saknas huvudadress helt används en adress i adressboken som är flaggad som standard
   (`is_default_shipping` / `is_default_billing` och varianterna `default`, `is_default`, `primary`).
   Finns ingen sådan visas ingen huvudadress alls – resten listas som alternativa.
4. **Ny layout – två kolumner.** Vänster kolumn: huvudadressen med rubriken "Huvudadress".
   Höger kolumn: alla alternativa adresser under varandra med butikens egen etikett per adress
   (ingen påhittad numrering när butiken har ett riktigt namn). På mobil staplas kolumnerna med
   huvudadressen först.
5. Adresserna förblir enbart läsbara – ingen redigering läggs till.

## Teknisk del

- `src/lib/vendre/account.ts`
  - `getAddresses` slutar jämföra listornas längd. Istället hämtas `accounts/me/addresses`
    (huvudadress) och `accounts/me/address-book` (alternativ) parallellt och returneras som
    `{ main: Address | null; alternatives: Address[] }`.
  - Från `addresses` används den flaggade standardadressen om en sådan finns, annars första posten,
    som `main`.
  - Alternativen dedupliceras mot `main` med nyckeln gata + postnummer + ort (befintlig
    `dedupeAddresses` återanvänds/utökas).
  - Saknas huvudadress helt plockas `main` från en standardflaggad post i adressboken;
    `normalizeAddress` utökas med nycklarna `default`, `is_default`, `primary`, `is_primary`
    och `type: "primary"`.
  - Etiketten `Adress N` sätts inte längre som fallback när butiken saknar namn – fältet lämnas tomt
    och vyn avgör rubriken.
  - `useAddresses` (React Query) behåller `staleTime: 0` men får den nya returtypen.
- `src/lib/vendre/account.ts` (demo-läget): motsvarande demo-implementation returnerar samma
  `{ main, alternatives }`-form.
- `src/mock/vendreAccount.ts`: demo-datan delas i en huvudadress och en eller flera alternativa.
- `src/pages/AccountPage.tsx`: `AddressesView` renderar `grid gap-6 lg:grid-cols-2` – vänster kolumn
  huvudadressen med rubriken "Huvudadress", höger kolumn alternativen staplade. Tomt läge visas när
  varken main eller alternativ finns.
- `src/types/vendre-account.ts`: eventuell ny typ för adressresultatet.
- `.vendre/skills/customer-account/references/account-pages.md` och
  `.vendre/skills/auth-sessions/references/account-pages.md`: notera att `accounts/me/addresses` ger
  huvudadressen och `accounts/me/address-book` de alternativa.

