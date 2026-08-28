# Ta bort skillen setup-vendre

## Vad som ändras

1. **Radera `.vendre/skills/setup-vendre.md`** — dubblett av `.vendre/skills/setup.md`, som blir enda setup-skillen.
2. **Uppdatera `AGENTS.md`** — ta bort raden "Extended setup & onboarding script → `.vendre/skills/setup-vendre.md`" ur routing-tabellen, så inget pekar på en fil som inte finns.

## Att notera

Inget under `src/` påverkas; guiden i webbläsaren fungerar som tidigare. Innehållet i `setup-vendre.md` (frontmatter, CORS-JSON, gate-regler) finns redan i `setup.md`, så ingen information går förlorad.
