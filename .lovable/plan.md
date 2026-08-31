# Spara uppstartsguidens framsteg vid omladdning

## Problemet

Guiden håller allt sitt framsteg i vanlig komponent-state i `src/components/vendre/setup-wizard.tsx`:
bockarna för Admin-steget och CORS-steget, resultatet av hemlighetskontrollen och resultatet av
anslutningstestet. Inget av det sparas. Vid en sidomladdning nollställs de och guiden börjar om från
steg 1. Bara två saker överlever idag: det publicerade domännamnet och flaggan "setup klar" som
växlar över till butiken.

## Lösningen

Spara guidens framsteg lokalt i webbläsaren, precis som domännamnet redan sparas, och läs tillbaka
det när guiden öppnas igen.

- Bockarna för steg 1 (Admin) och steg 4 (CORS) sparas när användaren kryssar i dem.
- Resultatet av hemlighetskontrollen (steg 2) sparas som "godkänd/ej godkänd" plus vilka nycklar som
  saknades.
- Resultatet av anslutningstestet (steg 5) sparas, så att grönt förblir grönt efter omladdning.
- Guiden öppnar automatiskt på första ofärdiga steget istället för alltid steg 1.
- Ingen hemlig information sparas — bara status, aldrig nycklar eller tokens.

När allt är grönt och användaren klickat "Börja bygga" visas butiken som tidigare; guiden går även
då att öppna igen från toppbannern och visar då fortsatt alla steg som klara.

## Teknisk detalj

- Ny modul `src/lib/vendre/setup-progress.ts` med samma mönster som `published-origin.ts`:
  läs/skriv en JSON-post under nyckeln `vendre.setup-progress` i `localStorage`, med try/catch och
  SSR-säker `typeof window`-kontroll, samt en `useSetupProgress()`-hook som hydrerar i `useEffect`
  (undviker hydration mismatch).
- Sparad form: `{ adminDone: boolean, corsDone: boolean, secretsOk: boolean, missing: string[],
  connection: ConnectionResult | null }`. `ConnectionResult` innehåller endast stegstatus, bas-URL
  och origin — inga credentials.
- `setup-wizard.tsx` byter ut `useState` för `adminDone`, `corsDone`, `secretStatus` och `result`
  mot värden från hooken; varje `set*` skriver även till lagringen. Startvärdet för `open` beräknas
  från första ofärdiga steget efter hydrering.
- Ingen ändring i `src/lib/vendre/`-klienten, API-rutterna eller butiksytorna.
