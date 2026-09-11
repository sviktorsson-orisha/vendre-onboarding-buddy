# Justeringar av headern på mobil och surfplatta

## Vad som ändras

1. **Språkväljaren flyttas** ut ur headern på små skärmar och läggs i slide-in-menyn, under kategorilistan. På desktop ligger den kvar som idag.
2. **Menyknappen flyttas** till högerkanten av headern, sist bland ikonerna (efter konto och varukorg).
3. **Loggan hamnar längst till vänster** och blir något mindre på mobil och surfplatta; oförändrad storlek på desktop.
4. **Kategorierna i slide-in-menyn blir dragspel:** en toppnivåkategori med underkategorier visas som en rad med en pil som fäller ut/ihop underkategorierna. Kategorier utan underkategorier är enkla länkar. Underkategorier med egen nivå under sig fungerar likadant. Varje rad har också en länk till själva kategorin, så man kan både öppna och gå in i den.

## Teknisk del

Allt sker i `src/components/store/store-header.tsx` (presentationslager, ingen datalogik ändras):

- Flytta `<button>`-knappen med `Menu`-ikonen från vänster till slutet av ikongruppen (`ml-auto`-diven), behåll `lg:hidden`.
- Loggans `<Link>` blir första elementet i raden; bildens klasser går från `h-8 max-w-[180px]` till t.ex. `h-6 max-w-[130px] lg:h-8 lg:max-w-[180px]`, wordmark-varianten skalas motsvarande (`text-xl lg:text-2xl`).
- `<LanguagePicker />` i headern får `hidden lg:flex`-beteende (wrappas i en `div` med `hidden lg:block`), och en instans läggs in i `SheetContent` under kategorinavigationen, avdelad med en `border-t` och rubrik via `t("lang.label")`.
- Kategorilistan i sheet:en byts mot shadcn `Accordion` (`@/components/ui/accordion`, `type="multiple"`, `collapsible`): noder med barn renderas som `AccordionItem` där `AccordionTrigger` innehåller kategorinamnet och `AccordionContent` listar barnen (inklusive nivå 3 som nästlad accordion eller indenterad lista). Noder utan barn renderas som vanlig `Link` i samma visuella stil. Alla länkar stänger sheet:en via `setMobileOpen(false)`.
- Om `@/components/ui/accordion` saknas i projektet läggs standardkomponenten från shadcn till.
