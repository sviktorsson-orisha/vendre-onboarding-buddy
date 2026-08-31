import { createFileRoute } from "@tanstack/react-router";

import CategoryPage, { type CategorySearch } from "@/pages/Category";

export const Route = createFileRoute("/kategori/$slug")({
  validateSearch: (search: Record<string, unknown>): CategorySearch => ({
    sort_by: typeof search["sort_by"] === "string" ? search["sort_by"] : undefined,
    sort_order:
      search["sort_order"] === "asc" || search["sort_order"] === "desc"
        ? search["sort_order"]
        : undefined,
    tags: Array.isArray(search["tags"])
      ? (search["tags"] as unknown[]).map(Number).filter(Number.isFinite)
      : undefined,
    page: Number(search["page"]) > 0 ? Number(search["page"]) : undefined,
  }),
  head: ({ params }) => {
    const title = `${params.slug.replace(/-/g, " ")} – Nordsken`;
    const description = `Handla ${params.slug.replace(/-/g, " ")} hos Nordsken. Skandinavisk design i begränsade serier.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CategoryPage,
});
