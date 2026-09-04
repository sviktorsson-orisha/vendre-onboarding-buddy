# Fyra rättningar i uppstartsguiden

## 1. Formuläret för nycklar startar direkt igen

Instruktionen till Lovable skärps så att det allra första som händer i ett nyimporterat projekt är att formuläret för butiks-URL, klient-id och klienthemlighet öppnas — inga förslag, inga frågor om vad man vill bygga först.

## 2. Rätt text i toppbannern

Bannern säger "anslutningen är verifierad och klar" först när hela guiden är genomförd (nycklar + CORS + grönt anslutningstest). Innan dess står det att butiken visar dummy-data.

## 3. Dummy-datan ligger kvar tills riktig data kan hämtas

Dummy-datan byts ut först när guiden är helt verifierad, eftersom riktig data i webbläsaren kräver att CORS är korrekt upplagt. Att bara ha sparat nycklarna räcker inte längre för att slå över.  Butiken ska aldrig bli tom utan har antingen dummy data eller riktig data.

## 4. "Börja bygga butiken" tar bort bannern

Klick på knappen stänger popupen och tar bort toppbannern direkt, oavsett hur guiden ser ut i övrigt. Den kommer inte tillbaka vid reload. Klick på denna knapp ska endast vara möjligt ifall alla steg i guiden är verifierade och klara och riktig data visas i butiken.

VIKTIGT

Det går idag att hämta viss data via vql även fast CORS inte är uppsatt korrekt. Denna data räknas dock inte som att anslutningen är klar. CORS måste vara uppsatt och verifierats för att det ska räknas som att det är färdigt och riktig data hämtas. Exempel på något som inte går att hämta via vql och som är blockat utav cors är sessionen. Det går tex inte att registrera en kund via registreringsformuläret utan att CORS är uppsatt rätt. DÅ kommer bara dummy data för account att kunna visas. 

## Tekniska noteringar

- `src/routes/__root.tsx`: tillbaka till `setServerConfigured(status?.verified === true)`.
- `src/components/vendre/setup-notice-bar.tsx`: texten styrs av `verified` i stället för `isConfigured`; komponenten returnerar `null` så snart `guideDismissed` är sant (utan krav på `verified`); auto-öppning av popupen behålls så länge guiden varken är verifierad eller stängd.
- `AGENTS.md` och `.vendre/skills/setup.md`: steg 1 formuleras om — öppna hemlighetsformuläret med alla tre värdena som allra första åtgärd, före all annan dialog.
- Inga ändringar i API-, varukorgs- eller butikslogik.