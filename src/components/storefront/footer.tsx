import { Facebook, Instagram, Youtube } from "lucide-react";

import { useNavigation, useSessionContext } from "@/lib/vendre/use-vendre-api";

const payments = ["Visa", "Mastercard", "Klarna", "Swish", "PayPal"];

export function StorefrontFooter() {
  const { data: menus } = useNavigation();
  const { data: session } = useSessionContext();
  const groups = menus?.menus.footer ?? [];

  return (
    <footer className="mt-20 border-t border-border bg-secondary">
      <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <span className="brand-wordmark text-2xl text-foreground">
              {session?.STORE_NAME ?? "Vendre"}
            </span>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Skandinavisk inredning i begränsade serier. Formgivet för att hålla länge.
            </p>
            <div className="mt-4 flex gap-2">
              {[Instagram, Facebook, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  aria-label="Sociala medier"
                  className="rounded-md border border-border bg-card p-2 text-muted-foreground hover:text-foreground"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="brand-eyebrow text-foreground">{group.title}</h2>
              <ul className="mt-3 space-y-2">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <a href={item.url} className="text-sm text-muted-foreground hover:text-foreground">
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {session?.STORE_NAME ?? "Vendre"}. Alla rättigheter förbehållna.
          </p>
          <ul className="ml-auto flex flex-wrap gap-2">
            {payments.map((payment) => (
              <li
                key={payment}
                className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                {payment}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
