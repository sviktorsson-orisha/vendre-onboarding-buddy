# Prova `address-book` som källa för adressboken

## Nuläge

Koden och `.vendre/knowledge/api-reference.md` känner bara till
`GET /surface/2/accounts/me/addresses`. Ingenstans i projektet anropas
`accounts/me/address-book` — den endpointen är alltså inte testad här, och jag
kan inte anropa någon av dem själv eftersom båda kräver en inloggad kundsession
i webbläsaren.

## Steg 1 — Jämför de två endpointerna

Lägg till en tillfällig dev-only diagnostik som, när adressvyn laddas med en
inloggad kund, hämtar både `accounts/me/addresses` och
`accounts/me/address-book` och loggar status + rått JSON för båda. Då ser vi:

- om `address-book` finns (200) eller inte (404)
- vilken av dem som faktiskt innehåller de alternativa adresserna
- vilken listnyckel och vilka fältnamn som används

## Steg 2 — Byt källa efter resultatet

- Om `address-book` returnerar hela adressboken: gör den till primär källa i
  `getAddresses`, med `addresses` som fallback vid 404.
- Om båda ger samma enda adress: då saknas adresserna i API-svaret och det är
  en butiks-/behörighetsfråga i Vendre, inte ett frontend-fel — vi rapporterar
  det istället för att koda runt det.

## Steg 3 — Städa och dokumentera

Ta bort diagnostiken, uppdatera endpoint-tabellen i
`.vendre/knowledge/api-reference.md` och `.vendre/skills/customer-account/SKILL.md`
med det bekräftade beteendet.

## Teknisk detalj

Berörda filer: `src/lib/vendre/account.ts` (`getAddresses` och den befintliga
`extractAddressList`), samt kunskaps-/skillfilerna i steg 3. Inga ändringar i
`AccountPage.tsx`.
