import { getFooterColumns, getStore } from "@/lib/storefront/data";

export function StoreFooter() {
  const store = getStore();
  const columns = getFooterColumns();

  return (
    <footer className="mt-16 border-t border-border bg-secondary">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <p className="brand-wordmark text-lg text-foreground">{store.name}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Inredning i naturmaterial, formgiven i Norden.
            </p>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-bold text-foreground">{column.title}</h2>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <span className="cursor-default text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {store.name}. Alla priser inkluderar moms.
        </p>
      </div>
    </footer>
  );
}
