# Varför dummydatan blir kvar efter att guiden är klar

Jag hittade felet i koden — jag behöver ingen data från ditt nya projekt.

## Vad som händer

Butiken byter från dummydata till riktig data först när servern svarar "allt är verifierat". Det svaret hämtas **en enda gång, när sidan laddas**. När du blir klar i guiden (CORS ibockat + grönt anslutningstest) uppdateras aldrig det svaret — sidan fortsätter därför visa dummydata tills något annat tvingar fram en omladdning. Ber du chatten köra testet igen så laddas sidan om i samband med det, och då slår riktig data på. Det är därför det ser ut som att chatten "fixar" något.

Dessutom finns en andra fälla i ett nyimporterat projekt: guidens bockar sparas i en databastabell som följer med templaten som en migreringsfil. Om den tabellen inte finns i det nya projektets backend misslyckas sparandet tyst, och då kan guiden aldrig bli "helt klar" — oavsett hur många gånger man klickar. Butiken fastnar då permanent i dummyläge.

## Vad som ska ändras

1. **Uppdatera direkt när guiden blir klar.** När anslutningstestet blir grönt och CORS är ibockat hämtas statusen om på en gång, så butiken byter till riktig data utan att man behöver ladda om eller be chatten om något.
2. **Reservlagring när tabellen saknas.** Om guidens tabell inte finns i det nya projektet ska framstegen ändå sparas (i serverns minne + i webbläsaren) i stället för att tyst försvinna, och guiden ska visa en tydlig varning i stället för att bara vägra bli grön.
3. **Skapa tabellen automatiskt vid uppstart.** Guiden ser till att lagringen finns första gången den används i ett nytt projekt.
4. **Guiden säger till.** Om något av stegen inte kunde sparas visas det i guiden i stället för att felet döljs.
5. **Uppdatera `.vendre/skills/setup.md` och `AGENTS.md`** så det framgår att guiden kräver en fungerande lagring och att butiken ska byta läge direkt när testet blir grönt.

## Tekniska noteringar

- `src/components/vendre/setup-wizard.tsx`: efter `update({ connectionOk })` och när `verified` blir sant, kör `useRouter().invalidate()` så rot-loadern (`getStorefrontStatus`) körs om och `setServerConfigured`/`setServerVerified` får nya värden. Testet anropar även status med `force=1` så 60-sekunderscachen i `getVendreStatus` inte ger gammalt svar.
- `src/lib/vendre/setup-progress.server.ts`: `readSetupProgress`/`writeSetupProgress` fångar idag fel implicit via anroparen; lägg till en `globalThis`-baserad fallbacklagring när Supabase-anropet felar (t.ex. tabellen saknas) och returnera en `storageOk`-flagga i svaret.
- `src/routes/api/vendre/setup-progress.ts`: skicka med `storageOk` i GET/POST-svaret.
- `src/lib/vendre/status.functions.ts`: oförändrad logik för `verified`, men den ska inte tyst svälja fel — `corsDone`/`connectionOk` läses via samma fallback.
- Ny migrering som skapar `public.vendre_setup_progress` idempotent (`CREATE TABLE IF NOT EXISTS`, `GRANT ALL ... TO service_role`, RLS + service-role-policy, `INSERT ... ON CONFLICT DO NOTHING`) så en nyimporterad kopia får tabellen.
- Ingen ändring i butiks-, varukorgs- eller API-logik.
