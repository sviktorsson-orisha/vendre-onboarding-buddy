# Login, registrering och Mitt konto

Bygger kundinloggning och ett komplett kontoområde i butiken, i samma stil som resten av templaten och med samma demo/live-växling som produkter och kundvagn.

## Vad du får

**Header**
- Kontoikon bredvid kundvagnen. Utloggad: klick går till `/logga-in`. Inloggad: dropdown med kundens namn, länkar till Mitt konto, Ordrar, Adresser och Logga ut.

**/logga-in**
- Flikar för Logga in och Skapa konto på samma sida.
- Logga in: e-post + lösenord, felmeddelanden på fältnivå, "Glömt lösenord" som skickar återställningsmail.
- Skapa konto: hela fältuppsättningen som butiken kräver (namn, e-post, lösenord + bekräftelse, kundtyp/företag, adress, telefon, personnummer/momsnr, nyhetsbrev, GDPR-samtycke). Valideringsfel från butiken mappas till rätt fält.
- Redan inloggad → skickas vidare till kontosidan.

**/mitt-konto** (skyddad, med vänstermeny + underflikar)
- Översikt: hälsning, senaste ordern, snabblänkar.
- Ordrar: orderlista med datum, nummer, status, summa; klick öppnar orderdetalj med rader och totaler.
- Adresser: leverans-/fakturaadress, redigerbar och sparbar.
- Användare: sub-användare för företagskonton (döljs om butiken inte returnerar några).
- Redigera konto: profilfält (namn, e-post, telefon m.m.) med spara.
- Logga ut.

**Demoläge**
- Innan Vendre-anslutningen är grön fungerar allt mot dummy-data: en demokund, två exempelordrar, adresser och en sub-användare. Ingen inloggning krävs för att titta runt — kontoytan visas med demodata och samma banner som resten av butiken. När anslutningen är grön går allt mot riktiga butiken.

## Teknisk del

Nya filer:
- `src/types/vendre-account.ts` — `Account`, `Address`, `OrderSummary`, `OrderDetail`, `SubUser`.
- `src/lib/vendre/account.ts` — auth- och kontoadapter med samma demo/live-mönster som `api.ts`: `useAuth()`, `login`, `logout`, `register`, `forgotPassword`, `useAccount`, `useAddresses`, `useOrders`, `useOrder(id)`, `useSubUsers`, `updateAccount`, `updateAddress`.
- `src/mock/vendreAccount.ts` — demodata.
- `src/components/store/account-menu.tsx` — headerikon/dropdown.
- `src/pages/LoginPage.tsx`, `src/pages/AccountPage.tsx` + vyer under `src/components/account/`.
- Routes: `src/routes/logga-in.tsx`, `src/routes/mitt-konto.tsx` (+ `mitt-konto.$view.tsx` för underflikar), egen `head()` med titel/description per route.

Endpoints enligt `.vendre/knowledge/api-reference.md` (source of truth):
`POST login/email` med `{ email, password }`, `POST logout`, `POST accounts`,
`GET/PUT accounts/me`, `GET/PUT accounts/me/addresses`,
`GET accounts/me/order-history[/{id}]`, `GET accounts/me/users`,
`GET accounts/me/forgot-password`.

Regler som följs:
- Auth-state läses från `GET session/context`, aldrig enbart från login-svaret; mutation-token byts ut efter login/logout och kundscopade queries invalideras.
- `Surface-Mutation-Protection-Token` på alla mutationer, inklusive GET `forgot-password`.
- `accounts*` ligger under CORS-policyn `default` — anropen faller tillbaka på server-proxyn om origin inte är allowlistad; inget CORS-fel visas för användaren.
- Kontodata och orderhistorik cachas aldrig (`staleTime: 0`, `gcTime: 0`).
- `accounts/me` normaliseras från flat/nested/alias-former innan formulären fylls.
- Inga workspace-skills används — bara `.vendre/` i det här projektet.

Ingen befintlig butiksfunktion ändras utöver att kontoikonen läggs till i headern och i18n-nycklar utökas för svenska och engelska.
