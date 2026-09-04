# Adresser: endast listning, ingen redigering

## Mål
Under Mitt konto → Adresser ska adresserna bara visas, inte kunna redigeras. Huvudadressen visas först i full bredd, övriga adresser listas därefter i två kolumner.

## Så ska vyn se ut
- Rubrik "Adresser".
- Huvudadress överst, markerad med en liten etikett (t.ex. "Huvudadress"), i ett eget kort över hela bredden.
- Resterande adresser under, i ett rutnät med två kolumner på desktop och en kolumn på mobil.
- Varje kort visar namn/företag, gatuadress, postnummer och ort, land samt telefon — som ren text, utan fält, spara-knapp eller sparat-status.
- Tomt läge: kort text när inga adresser finns.

## Teknisk plan
- Endast `src/pages/AccountPage.tsx` ändras (plus eventuella nya översättningsnycklar i `src/lib/i18n.tsx`).
- `AddressCard` skrivs om till en read-only presentation: bort med `useState`-form, `Input`/`Label`, `updateAddress`-mutationen och spara-knappen.
- `AddressesView` delar upp listan från `useAddresses()`: huvudadress = första adressen med `is_default_shipping` eller `is_default_billing`, annars första i listan. Övriga renderas i `grid sm:grid-cols-2`.
- Datahämtning, normalisering och API-anrop i `src/lib/vendre/account.ts` lämnas orörda; `updateAddress` finns kvar i lib men används inte längre av denna vy.
- Nya i18n-nycklar (sv/en) för "Huvudadress" och tomt läge om de saknas.
