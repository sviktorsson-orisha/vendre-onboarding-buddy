import { createFileRoute } from "@tanstack/react-router";

import ContentPage from "@/pages/ContentPage";

export const Route = createFileRoute("/sida/$id")({
  head: () => ({
    meta: [
      { title: "Information – Vendre Storefront" },
      {
        name: "description",
        content:
          "Innehållssida från butikens CMS i Vendre – frakt, villkor, kundservice och annan information.",
      },
      { property: "og:title", content: "Information – Vendre Storefront" },
      {
        property: "og:description",
        content: "Innehållssida hämtad från Vendre Surface API v2.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContentRoute,
});

function ContentRoute() {
  const { id } = Route.useParams();
  return <ContentPage id={Number(id)} />;
}
