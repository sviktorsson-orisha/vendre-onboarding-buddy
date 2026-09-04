# Justeringar i uppstartsguiden

## 1. Guiden öppnas direkt
Modalen öppnas automatiskt vid sidladdning så länge butiken inte är kopplad och användaren inte har stängt guiden. Stänger man den kan man alltid öppna den igen från toppbannern.

## 2. Formuläret för nycklar startar direkt
Instruktionerna för hur mallen startas skrivs om så att första åtgärden alltid är att öppna formuläret och be om butiksadress, klient-id och klient-hemlighet – inga förslag, inga alternativa vägar först.

## 3. Butiksadressen visas i klartext
Butiksadressen frågas efter i ett vanligt synligt textfält (inte maskerat), medan klient-id och klient-hemlighet fortsatt hanteras i det skyddade formuläret. Klistrar man in en adress med avslutande snedstreck accepteras det och strecket tas bort innan värdet sparas. (Servern städar redan bort avslutande snedstreck – det behålls och kompletteras med samma städning i det synliga fältet.)

## 4. Länkarna i steg 1 och steg 4
Innan butiksadressen är sparad visas sökvägarna `/Admin/headless/auth/oauth-clients` och `/Admin/headless/cors` som vanlig grå text, inte som länkar. Så snart adressen finns byggs full adress ihop och båda blir klickbara länkar som öppnas i ny flik.

## 5. Godkänn inte stegen innan CORS är klart
Steg 5 (verifiera anslutning) och steg 6 (redo att bygga) kan i dag bli gröna innan CORS-rutan är ikryssad, eftersom knappen "testa igen" högst upp i panelen bara kräver att nycklarna finns. Den knappen får samma spärr som steg 5, och båda stegen räknas som klara först när CORS-steget är bekräftat och testet gått igenom.

## 6. Kopieringsknappar i CORS-steget
Den översta knappen som kopierar alla adresser på en gång tas bort. Varje adress behåller sin egen knapp, och när en adress kopierats byts texten permanent till "Kopierad" så man ser vilka man redan tagit.

## Teknisk sammanfattning
- `src/components/vendre/setup-notice-bar.tsx`: initialt öppet läge när `isConfigured` är falskt och guiden inte är avfärdad.
- `src/components/vendre/setup-wizard.tsx`:
  - `AdminLink` renderar `<span>` när `adminBaseUrl` saknas, `<a>` annars.
  - Panelens retest-knapp: `disabled={testing || !corsDone}`.
  - `done`-arrayen för steg 5/6 blir `corsDone && connectionOk`.
  - Ta bort `CopyButton value={origins.join("\n")}` i rubrikraden.
  - `CopyButton` får ett läge där "Kopierad" står kvar (ingen timeout-återställning).
- `src/lib/i18n.tsx`: ev. ny nyckel för kvarstående "Kopierad".
- `.vendre/skills/setup.md` + `AGENTS.md`: förtydliga att formuläret för credentials öppnas omedelbart, att butiksadressen efterfrågas synligt och att avslutande snedstreck trimmas.
