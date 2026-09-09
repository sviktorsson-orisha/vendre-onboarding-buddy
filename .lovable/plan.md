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

- `src/lib/vendre/account.ts`: `getAddresses` byter till att returnera
  `{ main: Address | null, alternatives: Address[] }` – `addresses` för main, `address-book` för
  alternativen, med dedupe. Flagg-igenkänningen i `normalizeAddress` utökas med fler nyckelnamn.
  Motsvarande demo-implementation uppdateras.
- `src/pages/AccountPage.tsx`: `AddressesView` renderar `grid gap-6 lg:grid-cols-2` med main till
  vänster och listan av alternativ till höger.
- `src/mock/vendreAccount.ts`: demo-datan delas upp i en huvudadress och alternativa adresser.
- `.vendre/skills/customer-account/references/account-pages.md` noteras med att `addresses` ger
  huvudadressen och `address-book` de alternativa.
