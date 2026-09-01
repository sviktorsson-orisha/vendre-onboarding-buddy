import { createFileRoute } from "@tanstack/react-router";

import CategoryPage from "@/pages/CategoryPage";

export type CategorySearch = {
  page?: number | undefined;
  limit?: number | undefined;
  sort_by?: string | undefined;
  sort_order?: string | undefined;
  /** Comma-separated tag ids, e.g. "m,xl". */
  tags?: string | undefined;
  pfrom?: number | undefined;
  pto?: number | undefined;
};

function num(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export const Route = createFileRoute("/kategori/$id")({
  validateSearch: (search: Record<string, unknown>): CategorySearch => {
    const rawTags = search["tags"];
    const tags = Array.isArray(rawTags)
      ? rawTags.map(String).join(",")
      : typeof rawTags === "string" && rawTags
        ? rawTags
        : undefined;
    const sortOrder = String(search["sort_order"] ?? "").toUpperCase();
    return {
      ...(num(search["page"]) ? { page: num(search["page"]) } : {}),
      ...(num(search["limit"]) ? { limit: num(search["limit"]) } : {}),
      ...(typeof search["sort_by"] === "string" && search["sort_by"]
        ? { sort_by: search["sort_by"] }
        : {}),
      ...(sortOrder === "ASC" || sortOrder === "DESC" ? { sort_order: sortOrder } : {}),
      ...(tags ? { tags } : {}),
      ...(num(search["pfrom"]) ? { pfrom: num(search["pfrom"]) } : {}),
      ...(num(search["pto"]) ? { pto: num(search["pto"]) } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Kategori – Vendre Storefront" },
      {
        name: "description",
        content:
          "Bläddra i kategorin: filtrera, sortera och paginera produkter från din Vendre-butik via Surface API v2.",
      },
      { property: "og:title", content: "Kategori – Vendre Storefront" },
      {
        property: "og:description",
        content: "Produkter, filter och underkategorier från din Vendre-butik.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoryRoute,
});

function CategoryRoute() {
  const { id } = Route.useParams();
  return <CategoryPage id={Number(id)} />;
}
