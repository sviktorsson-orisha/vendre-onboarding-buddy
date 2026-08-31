import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vendre Storefront – handla online" },
      {
        name: "description",
        content:
          "Butik byggd på Vendre Surface API v2: kategorier, produkter och kundvagn. Demodata visas tills butikskopplingen är verifierad.",
      },
      { property: "og:title", content: "Vendre Storefront – handla online" },
      {
        property: "og:description",
        content:
          "Kategorier, produkter och kundvagn i en färdig headless-butik byggd på Vendre Surface API v2.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },

    ],
  }),
  component: Index,
});
