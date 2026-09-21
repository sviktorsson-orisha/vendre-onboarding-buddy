# Färre konsolfel på "Skapa konto"

De två röda felen kommer från att butiken ännu inte har en lista över vilka fält registreringen kräver. Webbläsaren loggar alltid ett "hittades inte"-fel när en fråga ställs och butiken saknar svaret, så enda sättet att bli av med dem är att fråga mer sällan.

## Vad som ändras

- Butiken tillfrågas bara en gång — svaret (eller att svaret saknas) sparas i webbläsaren i 24 timmar.
- Efter första besöket blir det noll fel i konsolen, oavsett hur många gånger sidan laddas om.
- När butiken börjar svara plockas fältlistan upp automatiskt senast nästa dygn — och direkt om besökaren tömmer webbläsarlagringen.
- Registreringsformuläret fungerar exakt som nu, med standardfälten så länge butiken inte svarar.

## Tekniskt

I `src/lib/vendre/account.ts`:

- `loadRegisterConstraints()` läser först en cache i `localStorage` (nyckel `vendre:register-constraints`, `{ value, savedAt }`, TTL 24 h). Träff → returnera direkt utan nätverksanrop.
- Vid miss: nuvarande loop över `CONSTRAINT_PATHS` körs som idag. Resultatet skrivs till cachen — både ett riktigt svar och "saknas" (fallback till `DEFAULT_REGISTER_CONSTRAINTS`), så att en 404 inte upprepas.
- Bara ett lyckat svar från butiken får ersätta standardfälten; övrigt beteende och `buildRegisterBody` är oförändrat.
- All `localStorage`-åtkomst try/catch-as (privat läge/SSR), med befintlig promise-cache per sidladdning kvar som första lager.
