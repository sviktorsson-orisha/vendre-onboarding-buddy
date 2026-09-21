# Anpassa butiken till de nya API-uppdateringarna

Butiken behöver följa med i fyra ändringar från Vendre: nya fältnamn vid inloggning,
striktare regler för sortering och sidindelning i listningar, förbättrade konto-endpoints
(inklusive dynamiska formulärregler och status "pending"), samt borttagna endpoints.

## Vad som görs

### 1. Inloggning (viktigast – kan gå sönder)
Butiken läser idag inloggningssvaret med de gamla fältnamnen. De nya heter
`mutation_protection_token`, `first_name`, `last_name`. Vi läser de nya namnen och
behåller de gamla som reserv, så att inloggning fungerar i både nya och äldre butiker.
Utan detta slutar kundens nästa formulär (adress, kontoändring, kassan) att fungera
efter inloggning.

### 2. Sortering och sidindelning i listningar
Kategorisidan och produktlistningen skickar sorterings- och sidparametrar som butiken nu
validerar hårdare och avvisar om de är felformade. Vi verifierar mot den riktiga butiken
vilka värden som accepteras, ser till att bara giltiga värden skickas, och tar bort
"hämta alla produkter"-anropet där det inte längre är tillåtet (taket är 500 produkter)
genom att hämta sida för sida i stället.

### 3. Skapa konto
- Formuläret byggs om så att fälten och valideringsreglerna hämtas från butikens nya
  endpoint för formulärregler i stället för vår fasta lista. Butiken bestämmer alltså
  själv vilka fält som visas och vad som är obligatoriskt.
- Lösenordsfälten behålls som idag.
- Om butiken svarar att kontot har status "pending" (kräver manuell granskning) visar vi
  ett tydligt meddelande om att kontot väntar på godkännande, i stället för att försöka
  logga in direkt.

### 4. Borttagna endpoints
Butiken anropar inga av de borttagna endpointsen, så ingen funktion påverkas. Vi städar
bort dem ur vår dokumentation så att de inte används i framtiden.

### 5. Dokumentation
`.vendre/knowledge/api-reference.md` och berörda skills uppdateras med de nya
fältnamnen, valideringsreglerna, kontostatusen, formulärregel-endpointen och de
borttagna endpointsen.

## Teknisk del

- Verifieringssteg först (live mot butiken via vår proxy): exakt svarsform för
  `POST login/email`, namnet och svaret för den nya constraints-endpointen under
  `accounts`, samt vilka `sort_by`/`sort_order`/`order_by`, `page` och `limit`-värden
  `GET categories/{id}` nu accepterar. Planens övriga steg följer det svaret.
- `src/lib/vendre/account.ts`: läs `mutation_protection_token ?? mutationProtectionToken`
  i `login`/`logout`; normalisering av `first_name`/`last_name` finns redan och behålls.
- `src/lib/vendre/api.ts`: `categoryQuery()` skickar endast validerade värden; ersätt
  `limit: 0` i produktuppslagets kategori-fallback med paginerad hämtning (max 500/sida).
- Kundvagnen: byt `POST shopping-cart/products` till `PUT` (POST är nu legacy-alias);
  body och kö-logik oförändrade.
- Registrering: ny hämtning av formulärregler (cachas), `RegisterInput` blir fältdriven,
  `buildRegisterBody()` bygger payload utifrån reglerna, och `status: "pending"` i svaret
  ger eget flöde i `src/pages/LoginPage.tsx`.
- Ingen ändring i proxy-arkitekturen: allt går fortsatt via `/api/vendre/surface/*`.
