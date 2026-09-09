# Adresser under Mitt konto – visa rätt huvudadress

## Problemet

Adressvyn hämtar bara adressboken (`accounts/me/address-book` / `accounts/me/addresses`) och plockar
"huvudadress" med `is_default_shipping` / `is_default_billing`. När butiken inte skickar de flaggorna
faller koden tillbaka på **första posten i listan** – därför visas en av de alternativa adresserna som
"huvudadress" och nästa som "Adress 2". Kundens egentliga huvudadress ligger på kundprofilen
(`accounts/me`, ofta som `default_address`) och används inte alls idag.

## Lösning

1. **Hämta huvudadressen från kundprofilen.** Vid sidan av adressboken används kunduppgifterna från
   `accounts/me` (namn, företag, gatuadress, postnummer, ort, land, telefon) som huvudadress. Finns
   en post i adressboken som är flaggad som standard (`is_default_shipping`, `is_default_billing`,
   och även varianterna `default`, `is_default`, `primary`, `is_primary`, `type: "primary"`) används
   den istället.
2. **Inget mer "gissa första posten".** Om varken profiladress eller flaggad adress finns visas ingen
   huvudadress – då listas alla adresser som alternativa.
3. **Ta bort dubbletten.** Om huvudadressen också finns i adressboken (samma gata + postnummer + ort)
   visas den inte en gång till bland de alternativa.
4. **Ny layout – två kolumner.** Vänster kolumn: huvudadressen med etiketten "Huvudadress".
   Höger kolumn: alla alternativa adresser under varandra, med butikens egen etikett per adress
   (ingen påhittad numrering "Adress 2" när butiken har ett riktigt namn). På mobil staplas
   kolumnerna: huvudadressen först, alternativa under.
5. Adresserna förblir enbart läsbara – ingen redigering läggs till.

## Teknisk del

- `src/lib/vendre/account.ts`: utöka flagg-igenkänningen i `normalizeAddress`, och exponera adressen
  från kundprofilen (via befintlig `normalizeAccount`) så vyn kan använda den som huvudadress.
- `src/pages/AccountPage.tsx`: `AddressesView` kombinerar profil + adressbok, väljer huvudadress
  enligt regeln ovan, filtrerar bort dubbletten och renderar `grid gap-6 lg:grid-cols-2`.
- Demo-datan i `src/mock/vendreAccount.ts` justeras så att demo-läget speglar samma struktur
  (en flaggad huvudadress + alternativa adresser).
