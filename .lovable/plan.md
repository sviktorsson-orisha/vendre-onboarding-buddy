# Kör setup-skillen (.vendre/skills/setup.md)

## Steg 0 — Vendre Admin först

Innan något körs i projektet måste detta finnas på plats i Vendre Admin:

1. **OAuth-klient**: Meny → Apps & Integrations → Headless → OAuth
   (`/Admin/headless/auth/oauth-clients`). Kräver behörigheten "Store configuration".
   `client_secret` visas bara en gång — är den borttappad måste den roteras.
2. **CORS-allowlist**: Meny → Apps & Integrations → Headless → CORS
   (`/Admin/configuration?gID=232`). Lägg in de stabila Lovable-adresserna
   (inte den tillfälliga `id-preview--`-adressen):
   - `https://project--b680686f-4945-4ee5-a18e-4b6fffe4e625-dev.lovable.app` (preview)
   - `https://project--b680686f-4945-4ee5-a18e-4b6fffe4e625.lovable.app` (publicerad)
   - eventuellt eget domännamn

   Guiden på startsidan skriver ut exakt denna lista plus färdig JSON att klistra in
   i både **Surface CORS Origins JSON** och **Surface CORS Policies JSON**.

## Steg 1 — Samla in nycklarna

Jag frågar efter alla tre på en gång och sparar dem som hemligheter
(aldrig i kod, `.env` eller chatt):

- `VENDRE_BASE_URL` (schema + host, ingen avslutande slash)
- `VENDRE_CLIENT_ID`
- `VENDRE_CLIENT_SECRET`

## Steg 2 — Verifiera anslutningen

Kör anslutningstestet (`testVendreConnection()` — samma som knappen i guiden på
startsidan) och läs status för varje steg: `token`, `cors`, `session`, `read`.

## Steg 3 — Tolka resultatet

| Utfall | Åtgärd |
| --- | --- |
| `token` fail + `missing` | Saknade env-variabler — samla in igen |
| `token` 401/400 | Fel client id/secret — verifiera i Admin |
| `token` 429 | Butiken rate-limitar — vänta en minut, ingen loop |
| `cors` warning | Skriv ut origin verbatim + färdig JSON, peka på CORS-sidan |
| `session` fail | Kontrollera `bootstrap`/`session`-policyerna |
| `read` fail | Kontrollera `navigation_menus`-policyn och att en meny är publicerad |

## Steg 4 — Gate

Inga butikssidor, komponenter eller produkt-/kundvagnsfunktioner byggs förrän
testet returnerar `ok: true`. Proxy-läge (cors-varning) räknas som degraderat:
checkout startar då en tom session.

## Steg 5 — Bekräfta

När allt är grönt sammanfattar jag butikens base-URL, vilken origin som är
allowlistad och att session + mutation protection token fungerar. Därefter frågar
jag vad du vill bygga först (hem, PLP, PDP, kundvagn, konto).

## Att notera

Ingen kod i `src/lib/vendre/` skrivs om — helpers och `/vendre-setup`-guiden finns
redan. Enda ändringen i projektet är att hemligheterna sparas.
