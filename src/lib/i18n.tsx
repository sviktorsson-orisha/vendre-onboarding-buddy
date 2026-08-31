/** Minimal language layer for the setup guide (Swedish default, English option). */
import { useEffect, useMemo, useSyncExternalStore } from "react";

export type Language = "sv" | "en";

const STORAGE_KEY = "vendre.setup.language";

const dictionary = {
  sv: {
    "brand.tagline": "Storefront setup",
    "brand.footer": "Headless storefront setup",
    "hero.eyebrow": "Vendre Surface API v2",
    "hero.title": "Vendre Headless Storefront",
    "hero.titleAccent": "Setup",
    "hero.intro": "Koppla din butik, verifiera anslutningen och gör projektet redo att byggas.",
    "lang.label": "Språk",

    "panel.title": "Setup-guide",
    "panel.step": "Steg {current} av {total}",
    "panel.verified": "Anslutningen är verifierad och klar.",
    "panel.progress": "{done} av {total} steg klara.",
    "panel.next": "Nästa:",
    "panel.retest": "Testa igen",
    "panel.testing": "Testar",

    "state.done": "Klar",
    "state.current": "Aktuell",
    "state.pending": "Väntar",
    "action.copy": "Kopiera",
    "action.copied": "Kopierat",

    "step1.title": "Skapa OAuth-nycklar",
    "step1.verdictDone": "OAuth-förberedelser bekräftade",
    "step1.verdict": "Skapa en OAuth-klient i Vendre Admin",
    "step1.body": "Skapa klienten innan credentials läggs in. Din",
    "step1.bodyEnd": "visas bara en gång.",
    "step1.adminPath": "Appar & Integrationer → Headless → OAuth",
    "step1.check": "Jag har skapat OAuth-klienten och sparat nycklarna.",

    "step2.title": "Lägg in credentials",
    "step2.verdictDone": "Alla credentials är tillgängliga",
    "step2.verdict": "Lägg in tre värden under Secrets",
    "step2.body":
      "Credentials används endast på serversidan och ska aldrig skrivas i kod eller chatten.",
    "step2.check": "Kontrollera credentials",
    "step2.checking": "Kontrollerar",
    "step2.missing": "Saknas:",

    "step3.title": "Publicera och välj ett enklare domännamn",
    "step3.verdictDone": "Använder {origin}",
    "step3.verdict": "Publicera och ange din valda adress",
    "step3.body1a": "Publicera projektet i Lovable och välj ett läsbart domännamn, till exempel",
    "step3.body1b": "istället för den långa",
    "step3.body1c": "-adressen.",
    "step3.body2":
      "Ange adressen här — den läggs automatiskt först i CORS-blocken i nästa steg, så att koden du kopierar redan innehåller din domän.",
    "step3.manual": "Detta är ett manuellt steg — inget tekniskt test körs här.",
    "step3.fieldLabel": "Publicerad Lovable-adress",
    "step3.use": "Använd adressen",
    "step3.clear": "Rensa",
    "step3.parseError": "Kunde inte tolka adressen — ange ett namn eller en https-adress.",
    "step3.saved": "Sparad adress:",

    "step4.title": "Konfigurera CORS",
    "step4.verdictDone": "Origins och policyer bekräftade",
    "step4.verdict": "Allowlista storefrontens adresser",
    "step4.body1": "Klistra in adresserna under Appar & Integrationer → Headless → CORS. Använd inte den tillfälliga",
    "step4.body1End": "-adressen.",
    "step4.settings": "CORS-inställningar",
    "step4.originsJson": "Surface CORS Origins JSON",
    "step4.policiesJson": "Surface CORS Policies JSON",
    "step4.check": "Jag har lagt in origins och policyer i Vendre Admin.",

    "step5.title": "Verifiera anslutningen",
    "step5.verdictDone": "Token, CORS, session och läsrättigheter fungerar",
    "step5.verdict": "Kör det tekniska anslutningstestet",
    "step5.body":
      "Testet verifierar OAuth-token, CORS, session/bootstrap och läsning av navigation/menus.",
    "step5.run": "Kör anslutningstest",
    "step5.running": "Testar anslutningen",

    "step6.title": "Redo att börja bygga",
    "step6.verdictDone": "Butiksanslutningen är verifierad",
    "step6.verdict": "Låst tills anslutningen är grön",
    "step6.done": "Setupen är klar. Projektet är redo för storefront-arbete.",
    "step6.baseUrl": "Base URL",
    "step6.origin": "Allowlistad origin",
    "step6.pending": "Slutför föregående steg och kör anslutningstestet.",
  },
  en: {
    "brand.tagline": "Storefront setup",
    "brand.footer": "Headless storefront setup",
    "hero.eyebrow": "Vendre Surface API v2",
    "hero.title": "Vendre Headless Storefront",
    "hero.titleAccent": "Setup",
    "hero.intro": "Connect your store, verify the connection and get the project ready to build.",
    "lang.label": "Language",

    "panel.title": "Setup guide",
    "panel.step": "Step {current} of {total}",
    "panel.verified": "The connection is verified and ready.",
    "panel.progress": "{done} of {total} steps completed.",
    "panel.next": "Next:",
    "panel.retest": "Test again",
    "panel.testing": "Testing",

    "state.done": "Done",
    "state.current": "Current",
    "state.pending": "Pending",
    "action.copy": "Copy",
    "action.copied": "Copied",

    "step1.title": "Create OAuth keys",
    "step1.verdictDone": "OAuth preparation confirmed",
    "step1.verdict": "Create an OAuth client in Vendre Admin",
    "step1.body": "Create the client before adding credentials. Your",
    "step1.bodyEnd": "is only shown once.",
    "step1.adminPath": "Apps & Integrations → Headless → OAuth",
    "step1.check": "I have created the OAuth client and saved the keys.",

    "step2.title": "Add credentials",
    "step2.verdictDone": "All credentials are available",
    "step2.verdict": "Add three values under Secrets",
    "step2.body": "Credentials are used server-side only and must never appear in code or chat.",
    "step2.check": "Check credentials",
    "step2.checking": "Checking",
    "step2.missing": "Missing:",

    "step3.title": "Publish and pick a simpler domain name",
    "step3.verdictDone": "Using {origin}",
    "step3.verdict": "Publish and enter your chosen address",
    "step3.body1a": "Publish the project in Lovable and choose a readable domain name, for example",
    "step3.body1b": "instead of the long",
    "step3.body1c": "address.",
    "step3.body2":
      "Enter the address here — it is placed first in the CORS blocks in the next step, so the code you copy already contains your domain.",
    "step3.manual": "This is a manual step — no technical test runs here.",
    "step3.fieldLabel": "Published Lovable address",
    "step3.use": "Use address",
    "step3.clear": "Clear",
    "step3.parseError": "Could not parse the address — enter a name or an https address.",
    "step3.saved": "Saved address:",

    "step4.title": "Configure CORS",
    "step4.verdictDone": "Origins and policies confirmed",
    "step4.verdict": "Allowlist the storefront addresses",
    "step4.body1": "Paste the addresses under Apps & Integrations → Headless → CORS. Do not use the temporary",
    "step4.body1End": "address.",
    "step4.settings": "CORS settings",
    "step4.originsJson": "Surface CORS Origins JSON",
    "step4.policiesJson": "Surface CORS Policies JSON",
    "step4.check": "I have added origins and policies in Vendre Admin.",

    "step5.title": "Verify the connection",
    "step5.verdictDone": "Token, CORS, session and read access work",
    "step5.verdict": "Run the technical connection test",
    "step5.body": "The test verifies OAuth token, CORS, session/bootstrap and reading navigation/menus.",
    "step5.run": "Run connection test",
    "step5.running": "Testing connection",

    "step6.title": "Ready to start building",
    "step6.verdictDone": "The store connection is verified",
    "step6.verdict": "Locked until the connection is green",
    "step6.done": "Setup is complete. The project is ready for storefront work.",
    "step6.baseUrl": "Base URL",
    "step6.origin": "Allowlisted origin",
    "step6.pending": "Complete the previous steps and run the connection test.",
  },
} as const;

export type TranslationKey = keyof (typeof dictionary)["sv"];

type I18nValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

let currentLanguage: Language = "sv";
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setLanguage(next: Language) {
  currentLanguage = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }
  emit();
}

function translate(
  language: Language,
  key: TranslationKey,
  vars?: Record<string, string | number>,
) {
  const raw: string = dictionary[language][key] ?? dictionary.sv[key] ?? key;
  if (!vars) return raw;
  return Object.entries(vars).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    raw,
  );
}

/** Reads the current language without React context (SSR-safe, always "sv" on the server). */
export function useI18n(): I18nValue {
  const language = useSyncExternalStore(
    subscribe,
    () => currentLanguage,
    () => "sv" as Language,
  );

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if ((stored === "sv" || stored === "en") && stored !== currentLanguage) {
      setLanguage(stored);
    }
  }, []);

  return useMemo(
    () => ({
      language,
      setLanguage,
      t: (key, vars) => translate(language, key, vars),
    }),
    [language],
  );
}
