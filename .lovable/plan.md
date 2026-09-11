# Färre sessionsanrop och dold butiksadress för bilder

## Problem 1: två identiska context-hämtningar per sidladdning

Butiken frågar efter sessionsinformationen på två separata ställen samtidigt:

- Headern/prislogiken hämtar den för butiksnamn, logga, valuta och moms.
- Kontomenyn hämtar samma information igen för att avgöra om kunden är inloggad.

Båda är medvetet ocachade (sessionen är levande data), och eftersom de körs som
två olika förfrågningar slås de inte ihop — därav dubbletten på varje sida.

**Lösning:** en enda sessionshämtning som båda delarna läser ifrån. Inloggnings-
statusen och kundens namn plockas ur samma svar som headern redan använder.
Fortfarande ocachad, men bara ett anrop per sidladdning istället för två.

## Problem 2: loggan avslöjar butikens adress och cachas inte

Loggan (och övriga butiksbilder) pekar direkt på butikens egen adress, vilket
både exponerar butiksnamnet i webbläsaren och gör att bilden inte kan cachas av
oss.

**Lösning:** bilder hämtas via vår egen server på samma sätt som alla andra
butiksanrop. Webbläsaren ser bara en adress på vår egen domän, och servern
svarar med en lång cachetid så loggan inte hämtas om i onödan.

## Teknisk beskrivning

**Sessionsanrop**

- `useAuth` i `src/lib/vendre/account.ts` slutar anropa `session/context` i
  live-läge och läser istället `authenticated` + `customer` från den befintliga
  `useSessionContext`-frågan i `src/lib/vendre/api.ts`.
- Demo-läget behåller sin nuvarande mock-session.
- `useAccountMutations` fortsätter invalidera hela `["vendre", mode]`, så
  login/logout uppdaterar den delade frågan.

**Bildproxy**

- Ny route `src/routes/api/vendre/image/$.ts`: same-origin-guard + rate limit
  som övriga proxyn, hämtar `${VENDRE_BASE_URL}/<path>` server-side, strömmar
  tillbaka `content-type` och sätter
  `cache-control: public, max-age=86400, stale-while-revalidate=604800`.
  Ingen OAuth-header behövs för publika bilder; endast bildsvar släpps igenom.
- `resolveImageUrl` i `src/lib/vendre/api.ts` returnerar
  `/api/vendre/image/<path>` för relativa sökvägar och för absoluta URL:er som
  ligger under butikens bas-URL (t.ex. `SHOP_LOGO`). Externa URL:er lämnas orörda.
- Detta gör att `resolveImageUrl` inte längre behöver butikens bas-URL i
  webbläsaren för bilder; `checkoutUrl` behåller sin nuvarande logik.

**Verifiering**

- Ladda om startsidan och en produktsida: exakt ett `session/context`-anrop per
  sidladdning i nätverksfliken.
- Loggan och produktbilder laddas från `/api/vendre/image/...` och visas korrekt.
- Inloggning/utloggning uppdaterar kontomenyn som tidigare.
