# Verifieringslista för importerad template

Skapa en tydlig checklista som en kund kan gå igenom direkt efter att de hämtat
ner templaten från GitHub, för att bekräfta att butiken fungerar mot deras
Vendre-konto.

## Vad som byggs

En ny fil `.vendre/verifiering.md` med en punktlista i två delar, plus en kort
länk till den från `README.md`.

### Del 1 — Innan anslutning (demo-läge)
- Startsidan visas med exempeldata direkt, aldrig tom.
- Toppbanner för uppstartsguiden syns och guiden öppnas automatiskt.
- Guiden frågar efter butiksadress, klient-id och klienthemlighet i ett formulär.
- Länkarna till Vendre-administrationen blir klickbara först när uppgifterna sparats.
- Guidens gröna bockar ligger kvar efter omladdning och på andra adresser.

### Del 2 — Efter godkänd anslutning (skarpt läge)
- Exempeldata byts automatiskt mot butikens riktiga innehåll, utan omladdning.
- Logga och butiksnamn hämtas från butiken.
- Huvudmeny med kategorier och utfällbar meny i full bredd (mobil: sidopanel).
- Kategorisida: bild, beskrivning, underkategorier, filter och sortering från Vendre, sidbrytning, mobil filter-/sorteringspanel.
- Produktsida: bild, beskrivning, specifikationer, varianter (inaktiva val gråas ut), pris.
- Priser: nedsatt pris i rött med överstruket ordinarie pris, annars svart.
- Sök: förslag efter tre tecken och en sökresultatsida.
- Varukorg: lägga till, ändra antal, ta bort enskild rad, klickbara produkter, totalsumma från Vendre.
- Konto: skapa konto, logga in, mina sidor med ordrar, orderdetaljer, adresser (endast visning) och profil, logga ut.
- Sidor/footer: endast innehållssidor i sidfoten, sidinnehåll visas från sidans beskrivning.

Varje punkt skrivs som "gör så här → detta ska hända", i klarspråk och på svenska.

## Kända begränsningar som listas separat
- Varukorgens totalsumma inklusive/exklusive moms hanteras i Vendres backend.
- Bild och pris i orderdetaljer beror på vad orderendpointen returnerar.
- Innehållsblock på CMS-sidor är avstängt som standard.

## Teknisk detalj
Endast dokumentation läggs till (`.vendre/verifiering.md` + en rad i `README.md`).
Ingen kod eller funktion i butiken ändras.
