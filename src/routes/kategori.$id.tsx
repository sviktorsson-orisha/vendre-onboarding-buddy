import { createFileRoute } from "@tanstack/react-router";

import CategoryPage from "@/pages/CategoryPage";

export const Route = createFileRoute("/kategori/$id")({
  head: () => ({
    meta: [
      { title: "Kategori – Vendre Storefront" },
      {
        name: "description",
        content:
          "Bläddra i kategorin: produkter, underkategorier och priser från din Vendre-butik via Surface API v2.",
      },
      { property: "og:title", content: "Kategori – Vendre Storefront" },
      {
        property: "og:description",
        content: "Produkter och underkategorier från din Vendre-butik.",
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
