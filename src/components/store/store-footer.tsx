import { Facebook, Instagram, Youtube } from "lucide-react";

const COLUMNS = [
  {
    title: "Kundservice",
    links: ["Kontakta oss", "Leverans", "Retur och byte", "Frågor och svar", "Storleksguide"],
  },
  {
    title: "Information",
    links: ["Om oss", "Hållbarhet", "Butiker", "Jobba hos oss", "Presskontakt"],
  },
  {
    title: "Villkor",
    links: ["Köpvillkor", "Integritetspolicy", "Cookies", "Reklamation"],
  },
];

export function StoreFooter({ storeName }: { storeName: string }) {
  return (
    <footer className="mt-16 border-t border-border bg-secondary">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <span className="brand-wordmark text-xl text-foreground">{storeName}</span>
          <p className="mt-3 text-sm text-muted-foreground">
            Headless storefront byggd på Vendre Surface API v2.
          </p>
          <div className="mt-4 flex gap-3 text-muted-foreground">
            <Instagram className="size-5" aria-label="Instagram" />
            <Facebook className="size-5" aria-label="Facebook" />
            <Youtube className="size-5" aria-label="Youtube" />
          </div>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="text-sm font-bold text-foreground">{column.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {column.links.map((link) => (
                <li key={link}>
                  <span className="transition-colors hover:text-foreground">{link}</span>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 py-5 text-xs text-muted-foreground sm:px-6">
          <span>© {new Date().getFullYear()} {storeName}</span>
          <div className="ml-auto flex flex-wrap gap-2">
            {["Visa", "Mastercard", "Klarna", "Swish", "PayPal"].map((method) => (
              <span key={method} className="rounded-md border border-border bg-card px-2.5 py-1 font-medium text-foreground">
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
