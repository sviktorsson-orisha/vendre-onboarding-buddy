# Företagsnamn följer butikens inställning

Idag tvingas fältet "Företagsnamn" fram för företagskunder även när butiken har det avstängt. Butiken kastar då bort värdet, vilket blir inkonsekvent mot alla andra fält som styrs av butikens fältlista.

## Vad som ändras

- Företagsnamn visas bara när butiken har fältet påslaget i admin.
- Är det påslaget och markerat som obligatoriskt gäller det som vanligt; annars är det frivilligt.
- Är det avstängt syns inget fält, ingen validering körs och inget företagsnamn skickas med.
- Den extra sparningen av företagsnamnet på kundens adress behålls, men körs bara när fältet faktiskt visats och fyllts i.
- Övrig kundtypslogik är oförändrad: privatperson/företag, etikettbytet mellan personnummer och organisationsnummer, och att momsregistreringsnummer bara visas för företag.

## Tekniska detaljer

- `src/pages/LoginPage.tsx`: ta bort `force`/`forceRequired` för `company`, rendera det som ett vanligt fält från butikens fältlista, och ta bort den hårdkodade valideringen "företagsnamn krävs".
- `src/lib/vendre/account.ts`: `buildRegisterBody` slutar lägga till `company` utanför fältlistan; `saveCompanyOnAddress` anropas bara när ett företagsnamn faktiskt finns i input.
- i18n-nyckeln `account.companyRequired` tas bort om den inte används någon annanstans.
- Dokumentation i `.vendre/knowledge/api-reference.md` och `.vendre/skills/account-auth.md` uppdateras så den beskriver att företagsnamn följer `accounts/form`.
