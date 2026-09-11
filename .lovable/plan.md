# Butiken tappade kopplingen till Vendre

## Vad jag ser

Dina tre uppgifter (butiksadress, klient-id och klient-hemlighet) finns kvar sparade och är oförändrade. Problemet är att den körande förhandsvisningen inte längre läser in dem: när jag frågar butikens statuskontroll svarar den att alla tre saknas, trots att de finns i projektets säkra lagring. Därför faller sajten tillbaka till demodata.

Med andra ord: inget är borttaget eller felaktigt inskrivet — det är själva servern bakom förhandsvisningen som startades utan värdena och behöver läsa in dem på nytt.

## Åtgärd

1. Läs in de sparade uppgifterna i den körande miljön igen och starta om förhandsvisningen.
2. Kör statuskontrollen på nytt och bekräfta att alla tre uppgifter hittas och att inloggningen mot din butik lyckas.
3. Kontrollera att butiken visar riktig produktdata igen istället för demodata, både i förhandsvisningen och på den publicerade adressen.
4. Om inloggningen mot butiken fortfarande nekas efter omstarten: felsök svaret från butiken (t.ex. spärrad nyckel eller tillfällig gräns) och återkom med vad som behöver göras i administrationen.

## Teknisk detalj

- `readVendreEnv()` i `src/lib/vendre/token.server.ts` läser `VENDRE_BASE_URL`, `VENDRE_CLIENT_ID`, `VENDRE_CLIENT_SECRET` från `process.env`. Variablerna finns i sandboxens skal men inte i vite-processens miljö.
- `GET /api/vendre/status?force=1` returnerar just nu `{"ok":false,"secretsOk":false,"missing":["VENDRE_BASE_URL","VENDRE_CLIENT_ID","VENDRE_CLIENT_SECRET"]}` och `GET /api/vendre/token` svarar `400 missing_credentials`.
- Åtgärd: bind om projektets secrets till körmiljön (`supabase--rebind_secrets` vid behov) och starta om dev-servern, verifiera sedan status + token-route och att `verified` blir sann i setup-status så live-läget slår på.
- Inga kodändringar planeras; om verifieringen visar ett fel i statusflödet återkommer jag med ett separat förslag.
