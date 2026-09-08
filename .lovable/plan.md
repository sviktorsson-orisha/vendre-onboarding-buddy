# Verifieringslista för butiken

En checklista som en kund kan gå igenom när uppstarten är klar och butiken är
kopplad till deras Vendre-konto, för att bekräfta att allt fungerar.
Uppstartsguiden ingår inte i listan.

## Vad som byggs

En ny fil `.vendre/verifiering.md` med checklistan, plus en kort hänvisning
till den från `README.md`.

## Punkter som ska verifieras

Butiksram
- Butikens riktiga innehåll visas (inte exempeldata).
- Logga och butiksnamn hämtas från butiken.
- Huvudmenyn visar butikens kategorier; utfällbar meny i full bredd på dator och sidopanel på mobil.
- Sidfoten visar endast innehållssidor med aktiva undersidor.

Kategorisida
- Kategoribild, namn och beskrivning visas, bilden till höger.
- Underkategorier visas som knappar.
- Filter och sorteringsalternativ kommer från Vendre; prisfilter visas som reglage.
- Sidbrytning fungerar och val ligger kvar i adressfältet vid omladdning.
- På mobil öppnas filter och sortering i varsin panel.

Produktsida
- Bild, namn, beskrivning och pris visas.
- Specifikationer visas när produkten har sådana.
- Variantval fungerar: val som saknar aktiv kombination går inte att klicka på.
- Landar man direkt på en variant är rätt val förvalt.
- Köpknappen är avstängd när varianten är slut och inte får köpas.

Produktlistning
- Produkter med varianter, eller som är slut och inte får köpas, visar "Läs mer" istället för köpknapp.
- Nedsatt pris visas i rött med överstruket ordinarie pris, annars svart pris. Gäller överallt.

Sök
- Förslag visas efter tre tecken, max fem produkter, med länk till fler resultat.
- Sökresultatsidan visar träffar med sidbrytning.

Varukorg
- Lägga till, ändra antal och ta bort en enskild rad fungerar (övriga rader ligger kvar).
- Produkter i varukorgen går att klicka på och leder till produktsidan.
- Totalsumman kommer från Vendre och uppdateras efter varje ändring.

Konto
- Skapa konto och logga in fungerar.
- Kontoikon i sidhuvudet leder till mina sidor.
- Ordrar med orderdetaljer, adresser (endast visning) och profil visas.
- Mobil: vyerna väljs i en rullgardin med rubrik för aktuell vy.
- Utloggning fungerar och man förblir inloggad vid omladdning.

Innehållssidor
- Sidor nås via sidfoten och visar sidans beskrivning.

## Kända begränsningar som listas separat
- Varukorgens totalsumma med/utan moms styrs av Vendres backend.
- Bild och pris i orderdetaljer beror på vad orderendpointen returnerar.
- Innehållsblock på CMS-sidor är avstängt som standard.

## Teknisk detalj
Endast dokumentation läggs till (`.vendre/verifiering.md` + en rad i `README.md`).
Ingen kod eller funktion i butiken ändras.
