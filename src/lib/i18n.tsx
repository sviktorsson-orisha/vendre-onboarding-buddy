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

    "complete.title": "Allt är klart!",
    "complete.body":
      "Anslutningen mot Vendre är verifierad. Butiken byter nu från demodata till din riktiga katalog.",
    "complete.cta": "Börja bygga butiken",

    "notice.title": "Demoläge",
    "notice.body": "Butiken visar dummy-data tills Vendre-kontot är kopplat.",
    "notice.cta": "Öppna uppstartsguiden",

    "store.search": "Sök produkter",
    "store.cart": "Kundvagn",
    "store.cartEmpty": "Kundvagnen är tom.",
    "store.checkout": "Till kassan",
    "store.checkoutDemo": "Kassan öppnas när butiken är kopplad.",
    "store.total": "Summa",
    "store.addToCart": "Lägg i kundvagn",
    "store.outOfStock": "Slut i lager",
    "store.inStock": "I lager",
    "store.viewAll": "Visa alla",
    "store.heroTitle": "Din butik, redo från dag ett",
    "store.heroBody":
      "Startsida, kategorier, produktsidor och kundvagn finns redan i templaten. Koppla Vendre så fylls allt med din egen katalog.",
    "store.heroCta": "Handla nu",
    "store.categories": "Kategorier",
    "store.featured": "Utvalda produkter",
    "store.products": "produkter",
    "store.subcategories": "Underkategorier",
    "store.remove": "Ta bort",
    "store.loading": "Laddar",
    "store.notFound": "Produkten kunde inte hittas.",
    "store.backToStore": "Tillbaka till butiken",
    "store.description": "Beskrivning",
    "store.footerNote": "Byggd med Vendre Surface API v2.",
    "store.info": "Kundservice",
    "store.infoShipping": "Frakt och leverans",
    "store.infoReturns": "Returer",
    "store.infoContact": "Kontakta oss",
    "store.home": "Start",
    "store.sort": "Sortera",
    "store.filters": "Filter",
    "store.clearFilters": "Rensa filter",
    "store.showProducts": "Visa produkter",
    "store.priceFrom": "Från",
    "store.priceTo": "Till",
    "store.noResults": "Inga produkter matchar ditt urval.",
    "store.loadError": "Kategorin kunde inte laddas. Kontrollera butiksanslutningen.",
    "store.prev": "Föregående",
    "store.next": "Nästa",

    "search.title": "Sökresultat",
    "search.for": "Träffar för “{q}”",
    "search.hits": "{count} träffar",
    "search.viewAll": "Visa alla resultat för “{q}”",
    "search.minChars": "Skriv minst 3 tecken för att söka.",
    "search.searching": "Söker…",
    "search.noHits": "Inga produkter matchade “{q}”.",
    "search.suggestions": "Produktförslag",

    "account.title": "Mitt konto",
    "account.signIn": "Logga in",
    "account.signUp": "Skapa konto",
    "account.signOut": "Logga ut",
    "account.email": "E-post",
    "account.password": "Lösenord",
    "account.confirm": "Bekräfta lösenord",
    "account.forgot": "Glömt lösenord?",
    "account.forgotSent": "Om e-postadressen finns har ett återställningsmail skickats.",
    "account.loginIntro": "Logga in för att se dina ordrar, adresser och uppgifter.",
    "account.registerIntro": "Skapa ett konto för snabbare kassa och koll på dina ordrar.",
    "account.overview": "Översikt",
    "account.orders": "Ordrar",
    "account.addresses": "Adresser",
    "account.users": "Användare",
    "account.profile": "Redigera konto",
    "account.save": "Spara",
    "account.saving": "Sparar",
    "account.saved": "Sparat",
    "account.greeting": "Hej {name}!",
    "account.overviewBody": "Här hanterar du dina ordrar, adresser och kontouppgifter.",
    "account.latestOrder": "Senaste ordern",
    "account.noOrders": "Du har inga ordrar ännu.",
    "account.order": "Order",
    "account.date": "Datum",
    "account.status": "Status",
    "account.total": "Summa",
    "account.orderDetails": "Orderdetaljer",
    "account.quantity": "Antal",
    "account.price": "Pris",
    "account.shipping": "Frakt",
    "account.tax": "Moms",
    "account.noUsers": "Inga ytterligare användare är kopplade till kontot.",
    "account.role": "Roll",
    "account.name": "Namn",
    "account.firstname": "Förnamn",
    "account.lastname": "Efternamn",
    "account.company": "Företag",
    "account.street": "Gatuadress",
    "account.postcode": "Postnummer",
    "account.city": "Ort",
    "account.state": "Län",
    "account.country": "Land",
    "account.phone": "Telefon",
    "account.mobile": "Mobil",
    "account.type": "Kundtyp",
    "account.typePrivate": "Privat",
    "account.typeCompany": "Företag",
    "account.gender": "Kön",
    "account.genderMale": "Man",
    "account.genderFemale": "Kvinna",
    "account.personnummer": "Personnummer",
    "account.vat": "Momsregistreringsnummer",
    "account.newsletter": "Prenumerera på nyhetsbrevet",
    "account.consent": "Jag godkänner integritetspolicyn",
    "account.required": "Fältet är obligatoriskt",
    "account.mismatch": "Lösenorden matchar inte",
    "account.demoNote": "Demodata visas tills Vendre-kontot är kopplat.",
    "account.signedOutBody": "Logga in för att se ditt konto.",
    "account.back": "Tillbaka",
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

    "complete.title": "Everything is ready!",
    "complete.body":
      "The Vendre connection is verified. The storefront now switches from demo data to your real catalogue.",
    "complete.cta": "Start building the store",

    "notice.title": "Demo mode",
    "notice.body": "The storefront shows dummy data until the Vendre account is connected.",
    "notice.cta": "Open the setup guide",

    "store.search": "Search products",
    "store.cart": "Cart",
    "store.cartEmpty": "Your cart is empty.",
    "store.checkout": "Go to checkout",
    "store.checkoutDemo": "Checkout opens once the store is connected.",
    "store.total": "Total",
    "store.addToCart": "Add to cart",
    "store.outOfStock": "Out of stock",
    "store.inStock": "In stock",
    "store.viewAll": "View all",
    "store.heroTitle": "Your store, ready from day one",
    "store.heroBody":
      "Home, categories, product pages and cart already ship with the template. Connect Vendre and it fills up with your own catalogue.",
    "store.heroCta": "Shop now",
    "store.categories": "Categories",
    "store.featured": "Featured products",
    "store.products": "products",
    "store.subcategories": "Subcategories",
    "store.remove": "Remove",
    "store.loading": "Loading",
    "store.notFound": "The product could not be found.",
    "store.backToStore": "Back to the store",
    "store.description": "Description",
    "store.footerNote": "Built with Vendre Surface API v2.",
    "store.info": "Customer service",
    "store.infoShipping": "Shipping and delivery",
    "store.infoReturns": "Returns",
    "store.infoContact": "Contact us",
    "store.home": "Home",
    "store.sort": "Sort",
    "store.filters": "Filters",
    "store.clearFilters": "Clear filters",
    "store.showProducts": "Show products",
    "store.priceFrom": "From",
    "store.priceTo": "To",
    "store.noResults": "No products match your selection.",
    "store.loadError": "The category could not be loaded. Check the store connection.",
    "store.prev": "Previous",
    "store.next": "Next",

    "search.title": "Search results",
    "search.for": "Results for “{q}”",
    "search.hits": "{count} results",
    "search.viewAll": "Show all results for “{q}”",
    "search.minChars": "Type at least 3 characters to search.",
    "search.searching": "Searching…",
    "search.noHits": "No products matched “{q}”.",
    "search.suggestions": "Product suggestions",

    "account.title": "My account",
    "account.signIn": "Sign in",
    "account.signUp": "Create account",
    "account.signOut": "Sign out",
    "account.email": "Email",
    "account.password": "Password",
    "account.confirm": "Confirm password",
    "account.forgot": "Forgot password?",
    "account.forgotSent": "If the email exists, a reset link has been sent.",
    "account.loginIntro": "Sign in to see your orders, addresses and details.",
    "account.registerIntro": "Create an account to check out faster and follow your orders.",
    "account.overview": "Overview",
    "account.orders": "Orders",
    "account.addresses": "Addresses",
    "account.users": "Users",
    "account.profile": "Edit account",
    "account.save": "Save",
    "account.saving": "Saving",
    "account.saved": "Saved",
    "account.greeting": "Hi {name}!",
    "account.overviewBody": "Here you manage your orders, addresses and account details.",
    "account.latestOrder": "Latest order",
    "account.noOrders": "You have no orders yet.",
    "account.order": "Order",
    "account.date": "Date",
    "account.status": "Status",
    "account.total": "Total",
    "account.orderDetails": "Order details",
    "account.quantity": "Qty",
    "account.price": "Price",
    "account.shipping": "Shipping",
    "account.tax": "VAT",
    "account.noUsers": "No additional users are connected to this account.",
    "account.role": "Role",
    "account.name": "Name",
    "account.firstname": "First name",
    "account.lastname": "Last name",
    "account.company": "Company",
    "account.street": "Street address",
    "account.postcode": "Postcode",
    "account.city": "City",
    "account.state": "State/Region",
    "account.country": "Country",
    "account.phone": "Phone",
    "account.mobile": "Mobile",
    "account.type": "Customer type",
    "account.typePrivate": "Private",
    "account.typeCompany": "Company",
    "account.gender": "Gender",
    "account.genderMale": "Male",
    "account.genderFemale": "Female",
    "account.personnummer": "Personal ID number",
    "account.vat": "VAT number",
    "account.newsletter": "Subscribe to the newsletter",
    "account.consent": "I accept the privacy policy",
    "account.required": "This field is required",
    "account.mismatch": "The passwords do not match",
    "account.demoNote": "Demo data is shown until the Vendre account is connected.",
    "account.signedOutBody": "Sign in to see your account.",
    "account.back": "Back",
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
