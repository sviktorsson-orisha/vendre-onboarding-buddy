import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { StoreShell } from "@/components/store/store-shell";
import { useI18n } from "@/lib/i18n";
import { usePageContent, usePageMenuItem } from "@/lib/vendre/api";
import { prepareCmsHtml } from "@/lib/vendre/html";
import type { ContentBlock } from "@/types/vendre";

/**
 * CMS page (Vendre gallery). Content comes from
 * GET /surface/2/galleries/{id}/content-blocks — never from categories.
 */
function Block({ block }: { block: ContentBlock }) {
  const fields = block.fields ?? {};
  const image = prepareCmsHtml(fields["img"] ?? fields["image"]);
  const text = prepareCmsHtml(fields["text"] ?? fields["body"] ?? fields["html"]);

  // Two-column layouts get an image column; unknown block keys degrade to text.
  if (image && text) {
    return (
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <div className="cms-media [&_img]:w-full [&_img]:rounded-2xl" dangerouslySetInnerHTML={{ __html: image }} />
        <div className="cms-prose" dangerouslySetInnerHTML={{ __html: text }} />
      </div>
    );
  }

  const html = text || image || prepareCmsHtml(Object.values(fields).filter(Boolean).join(""));
  if (!html) return null;
  return <div className="cms-prose" dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function ContentPage({ id }: { id: number }) {
  const { t } = useI18n();
  const { data, isLoading, isError } = usePageContent(id);
  const menuItem = usePageMenuItem(id);

  if (isLoading) {
    return (
      <StoreShell>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> {t("store.loading")}
        </p>
      </StoreShell>
    );
  }

  if (isError || !data) {
    return (
      <StoreShell>
        <p className="text-sm text-muted-foreground">{t("store.pageNotFound")}</p>
        <Link to="/" className="brand-button mt-4">
          {t("store.backToStore")}
        </Link>
      </StoreShell>
    );
  }

  const blocks = [...(data.content_blocks ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );

  return (
    <StoreShell>
      <article className="mx-auto w-full max-w-3xl">
        {menuItem && (
          <h1 className="text-3xl font-extrabold text-foreground">{menuItem.name}</h1>
        )}
        <div className="mt-6 space-y-10 text-sm leading-relaxed text-muted-foreground [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:font-semibold [&_h3]:text-foreground [&_a]:text-primary [&_a]:underline [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
          {blocks.length > 0 ? (
            blocks.map((block) => <Block key={block.id} block={block} />)
          ) : (
            <p>{t("store.pageEmpty")}</p>
          )}
        </div>
      </article>
    </StoreShell>
  );
}
