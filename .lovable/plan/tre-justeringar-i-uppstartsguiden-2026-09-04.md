# Tre justeringar i uppstartsguiden

## 1. Ett formulär för alla tre värdena

Butiks-URL, klient-id och klienthemlighet frågas efter i ett enda formulär, samtidigt, i stället för i två omgångar. Alla tre fälten visas maskerade eftersom systemformuläret alltid döljer det man skriver. En avslutande snedstreck i butiks-URL:en tas bort automatiskt innan värdet sparas.

## 2. Riktig data så snart kopplingen fungerar

Dummy-datan byts ut mot butikens riktiga innehåll så fort nycklarna finns och butiken svarar — oavsett hur långt man kommit i guiden. Guiden fortsätter visa vad som återstår (t.ex. CORS), men butiken visar riktig data direkt när den kan hämtas.

## 3. Toppbannern försvinner när man börjar bygga

När man klickar på "börja bygga butiken" stängs popupen och toppbannern tas bort helt, så den inte kan trigga popupen igen. Förutsatt att alla steg i guiden är genomförda och variefierade. 

## Tekniska noteringar

- `AGENTS.md` och `.vendre/skills/setup.md`: skriv om steg 1 så att alla tre värdena samlas in i ett enda anrop till hemlighetsformuläret (base URL + client id + client secret), med instruktion att strippa avslutande slash. Ta bort regeln om ett separat synligt fält för base URL.
- `src/routes/__root.tsx`: `setServerConfigured(status?.ok === true)` i stället för `status?.verified`, så livedata slår på så snart token kan hämtas.
- `src/lib/vendre/status.functions.ts`: `verified` behålls för guidens egen del men styr inte längre demoläget.
- `src/components/vendre/setup-notice-bar.tsx`: rendera inget alls när `guideDismissed` är sant; behåll auto-öppning av popupen så länge guiden varken är klar eller stängd.
- Inga ändringar i API-, varukorgs- eller butikslogik.