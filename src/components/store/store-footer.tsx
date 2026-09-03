import { Link } from "@tanstack/react-router";

import { useI18n } from "@/lib/i18n";
import { usePageMenu } from "@/lib/vendre/api";
import type { MenuNode } from "@/types/vendre";

/** CMS pages (information_page) route to /sida/$id — never to a category. */
function PageLink({ node }: { node: MenuNode }) {
  return (
    <Link
      to="/sida/$id"
      params={{ id: String(node.entity_id) }}
      className="text-sm text-muted-foreground hover:text-primary"
    >
      {node.name}
    </Link>
  );
}

function PageColumn({ title, items }: { title: string; items: MenuNode[] }) {
  return (
    <div>
      <h2 className="brand-eyebrow text-muted-foreground">{title}</h2>
      <ul className="mt-3 space-y-1.5">
        {items.map((item) => (
          <li key={`${item.source}-${item.id}`}>
            <PageLink node={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StoreFooter() {
  const { t } = useI18n();
  const pages = usePageMenu();

  // Top-level pages with children become columns; loose pages share one column.
  const groups = pages.filter((node) => node.children.length > 0);
  const loose = pages.filter((node) => node.children.length === 0);

  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <span className="brand-wordmark text-xl text-foreground">vendre</span>
          <p className="mt-2 text-sm text-muted-foreground">{t("store.footerNote")}</p>
        </div>

        {groups.map((group) => (
          <PageColumn
            key={`${group.source}-${group.id}`}
            title={group.name}
            items={[group, ...group.children]}
          />
        ))}

        {loose.length > 0 && <PageColumn title={t("store.pages")} items={loose} />}
      </div>
    </footer>
  );
}
