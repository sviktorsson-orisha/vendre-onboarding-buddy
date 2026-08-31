import { Link } from "@tanstack/react-router";

import { useI18n } from "@/lib/i18n";
import { useMenuTree } from "@/lib/vendre/api";

export function StoreFooter() {
  const { t } = useI18n();
  const tree = useMenuTree();

  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <span className="brand-wordmark text-xl text-foreground">vendre</span>
          <p className="mt-2 text-sm text-muted-foreground">{t("store.footerNote")}</p>
        </div>
        <div>
          <h2 className="brand-eyebrow text-muted-foreground">{t("store.categories")}</h2>
          <ul className="mt-3 space-y-1.5">
            {tree.slice(0, 5).map((node) => (
              <li key={node.id}>
                <Link
                  to="/kategori/$id"
                  params={{ id: String(node.id) }}
                  className="text-sm text-foreground hover:text-primary"
                >
                  {node.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="brand-eyebrow text-muted-foreground">{t("store.info")}</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <li>{t("store.infoShipping")}</li>
            <li>{t("store.infoReturns")}</li>
            <li>{t("store.infoContact")}</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
