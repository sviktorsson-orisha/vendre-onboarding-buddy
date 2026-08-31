# Live-läge ska gälla alla besökare — inte sparas per webbläsare

## Problemet

Två saker sparas idag bara i besökarens egen webbläsare (`localStorage`):

1. Flaggan "setup klar" (`vendre.setup-complete`) som styr om butiken visar demodata eller
   riktig data. Det betyder att en ny besökare — eller du själv efter en rensning — får demodata
   trots att butiken är korrekt kopplad.
2. Guidens framsteg (bockar, testresultat). Därför nollställs guiden vid omladdning.

Punkt 1 är den allvarliga: demoläge får aldrig visas för kunder när kopplingen fungerar.

## Lösningen

Butikens läge (demo eller live) ska avgöras av servern, inte av besökarens webbläsare.

- En serverkontroll svarar på frågan "är butiken kopplad?" genom att läsa in nycklarna och hämta
  ett OAuth-token mot Vendre. Svaret cachas kort på servern så att varje sidvisning inte kostar
  ett anrop.
- Butiken frågar den kontrollen vid start. Svarar den "kopplad" körs live-data för **alla**
  besökare, direkt vid första sidvisningen och redan i serverrenderingen — ingen blink av demodata.
- Demodata visas bara när butiken faktiskt inte är kopplad (nycklar saknas eller token nekas).
- Knappen "Börja bygga" i guiden stänger guiden och tar dig till butiken, men den styr inte längre
  om butiken är live. Toppbannern visas bara i demoläge.
- Om kopplingen fungerar men CORS ännu inte är öppnat för besökarens adress går anropen via
  serverproxyn i stället för att falla tillbaka till demodata.

Guidens framsteg (bockarna för Admin och CORS, testresultat, valt domännamn) får fortsätta sparas
lokalt — det är personliga arbetsanteckningar för den som konfigurerar, inte butikens läge. Det
löser även omladdningsproblemet: guiden återupptas där du var.

## Teknisk detalj

- `src/routes/api/vendre/status.ts` utökas: utöver nyckelkontrollen görs ett tokenanrop via
  befintlig serverlogik (`/api/vendre/token`-hjälparen) och svaret blir
  `{ ok, secretsOk, tokenOk, missing }`, med `cache-control: no-store` mot klienten men en
  minnescache på ~60 s i modulen så OAuth-kvoten inte bränns.
- Ny serverfunktion/loader-läsning av samma status i `src/routes/__root.tsx` (eller en delad
  `queryOptions` som butiksytorna använder) så att `isConfigured` finns redan vid SSR.
- `src/context/onboarding-context.tsx` skrivs om: `isConfigured` kommer från serverstatusen
  i stället för `localStorage`. `markConfigured()` blir enbart "stäng guiden" och sparas lokalt
  under en ny nyckel (`vendre.guide-dismissed`), utan att påverka demo/live.
- `src/lib/vendre/api.ts` och `src/lib/vendre/account.ts` behåller sitt demo/live-val men läser
  läget från den nya källan.
- Ny modul `src/lib/vendre/setup-progress.ts` (samma mönster som `published-origin.ts`) som sparar
  `{ adminDone, corsDone, secretsOk, missing, connection }` i `localStorage` under
  `vendre.setup-progress`, SSR-säkert och med try/catch. `setup-wizard.tsx` läser/skriver via den
  och öppnar automatiskt första ofärdiga steget. Inga nycklar eller tokens sparas — bara status.
