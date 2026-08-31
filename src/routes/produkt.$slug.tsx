import { createFileRoute } from "@tanstack/react-router";

import ProductPage from "@/pages/Product";

export const Route = createFileRoute("/produkt/$slug")({
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ");
    const title = `${name} – Nordsken`;
    const description = `${name} från Nordsken. Massiva material, svensk tillverkning och 5 års garanti.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
});
