# Få setup-guiden att starta automatiskt i nya projekt

## Vad som är fel idag

Filen `.vendre/skills/setup.md` följer mycket riktigt med i repot — problemet är inte att den saknas, utan att inget får agenten att *köra* den först i ett nyimporterat projekt.

Tre saker motverkar det:

1. **README.md** inleds fortfarande med den gamla engångsinstruktionen: "Ignorera all eventuell Workspace Knowledge... Bygg INGENTING annat på sajten." Det är det första en agent läser i ett importerat repo, och det motsäger direkt onboardingen.
2. **AGENTS.md** har onboarding-regeln längst ned, som avsnitt 3, efter en lång routing-tabell — svag och lätt att missa som "gör detta först".
3. **`.vendre/skills/setup.md`** saknar frontmatter (`name`/`description`), till skillnad från `setup-vendre.md`. Utan den läses filen som ett vanligt dokument som agenten hittar först när den redan letar — inte som en skill som triggar på "kom igång" eller "connect to Vendre".

## Vad som ändras

**1. Skriv om README.md**
Ta bort den gamla scope-instruktionen. Ersätt med en kort beskrivning av templaten och en tydlig "Kom igång"-sektion: öppna projektet i Lovable och skriv t.ex. "starta setup", plus var nycklarna skapas i Vendre Admin. Behåll Lovable-standardavsnitten längre ned.

**2. Gör onboardingen till det första i AGENTS.md**
Flytta upp "MANDATORY ONBOARDING" till avsnitt 1, före knowledge- och skills-tabellerna, och formulera den som ovillkorlig:

- Vid första meddelandet i projektet, oavsett vad användaren frågar om: läs `.vendre/skills/setup.md` och kör den.
- Bygg inga storefront-komponenter förrän anslutningstestet är grönt.
- Undantag: om användaren uttryckligen ber om något annat, kör det men nämn att setup inte är klar.

**3. Ge `.vendre/skills/setup.md` frontmatter**
Lägg till `name` + `description` överst (samma stil som `setup-vendre.md`), så filen är igenkännbar som en skill och inte bara ett dokument.

**4. Lägg setup som riktig skill i repot**
Skapa `.agents/skills/vendre-setup/SKILL.md` — en tunn wrapper med frontmatter vars description triggar på "kom igång", "connect to Vendre", "setup", API-nycklar och CORS/401-fel, och en kropp som pekar vidare till `.vendre/skills/setup.md` och `.vendre/knowledge/api-reference.md`. Den mappen ligger i repot och följer med vid import, och gör setup aktiverbar som skill i det nya projektet i stället för att bara vara en fil att hitta.

## Att notera

Ingen av dessa filer påverkar appens UI eller kod under `src/` — guiden i webbläsaren fungerar som tidigare. Ändringarna gäller enbart hur agenten i ett nyimporterat projekt förstår att setup ska köras först.
