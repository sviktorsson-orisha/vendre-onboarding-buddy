import { createFileRoute } from "@tanstack/react-router";

import ProductPage from "@/pages/ProductPage";

export const Route = createFileRoute("/produkt/$id")({
  head: () => ({
    meta: [
      { title: "Produkt – Vendre Storefront" },
      {
        name: "description",
        content:
          "Produktsida med pris, lagerstatus, varianter och köpknapp – kopplad till din Vendre-butik.",
      },
      { property: "og:title", content: "Produkt – Vendre Storefront" },
      {
        property: "og:description",
        content: "Pris, lagerstatus och varianter från din Vendre-butik.",
      },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  const { id } = Route.useParams();
  return <ProductPage id={id} />;
}
