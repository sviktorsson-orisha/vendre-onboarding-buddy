# Fix: "kunde inte skapa konto" – utgången skyddskod

## Vad som händer

När sidan laddas hämtas en säkerhetskod från butiken. Den koden gäller ungefär en timme.
Om du har haft fliken öppen längre än så – eller om butiken har startat om sessionen –
är koden gammal, och butiken svarar med "Invalid mutation protection token" när du
försöker skapa ett konto. Idag hämtas ingen ny kod automatiskt i det läget, så felet
blir kvar tills sidan laddas om helt.

## Vad som orsakar det i koden (verifierat)

- `src/lib/vendre/api.ts` – `guarded()` hämtar bara ny session igen när felet är
  `SURFACE_SESSION_UNAUTHORIZED` **och** felet är av typen `VendreError`.
- `src/lib/vendre/account.ts` – alla konto-anrop går genom `call()`, som kastar
  `VendreAccountError` (utan felkod). Den fångas därför aldrig av återförsöket.
- Koden `SURFACE_MUTATION_PROTECTION_TOKEN_INVALID` hanteras inte någonstans.

## Åtgärd

1. `src/lib/vendre/account.ts`: låt `VendreAccountError` bära med sig butikens `code`.
2. `src/lib/vendre/api.ts`: utöka återförsöket i `guarded()` så det även gäller
   - fel av typen `VendreAccountError`, och
   - felkoden `SURFACE_MUTATION_PROTECTION_TOKEN_INVALID` (utöver session-401).
   Vid sådant fel: hämta ny session/kod via `session/bootstrap` och kör om anropet en gång.
3. Behåll dagens beteende i övrigt: bara ett återförsök, ingen loop, och äkta
   valideringsfel (t.ex. 422 på registreringsfält) visas som vanligt i formuläret.
4. Uppdatera `.vendre/skills/mutation-tokens.md` med regeln: en ogiltig skyddskod ska
   alltid utlösa en ny bootstrap plus ett tyst omförsök.

## Verifiering

- Typkontroll och bygge.
- Testa registrering i preview: formuläret ska gå igenom utan omladdning, och ett
  framtvingat ogiltigt token ska resultera i ett automatiskt omförsök i stället för fel.
