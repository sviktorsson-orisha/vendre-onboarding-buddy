import { Link } from "@tanstack/react-router";

import { useI18n } from "@/lib/i18n";
import { usePageMenu } from "@/lib/vendre/api";
import type { MenuNode } from "@/types/vendre";

/** CMS pages (information_page) route to /sida/$id — never to a category. */
function PageLink({ node, muted }: { node: MenuNode; muted?: boolean }) {
  return (
    <Link
      to="/sida/$id"
      params={{ id: String(node.entity_id) }}
      className={
        muted
          ? "text-sm text-muted-foreground hover:text-primary"
          : "text-sm text-foreground hover:text-primary"
      }
    >
      {node.name}
    </Link>
  );
}

export function StoreFooter() {
  const { t } = useI18n();
  const pages = usePageMenu();

  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <span className="brand-wordmark text-xl text-foreground">vendre</span>
          <p className="mt-2 text-sm text-muted-foreground">{t("store.footerNote")}</p>
        </div>

        {pages.map((group) => (
          <div key={`${group.source}-${group.id}`}>
            <h2 className="brand-eyebrow text-muted-foreground">
              {group.children.length > 0 ? group.name : t("store.pages")}
            </h2>
            <ul className="mt-3 space-y-1.5">
              {group.children.length > 0 ? (
                group.children.map((child) => (
                  <li key={`${child.source}-${child.id}`}>
                    <PageLink node={child} muted />
                  </li>
                ))
              ) : (
                <li>
                  <PageLink node={group} muted />
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
