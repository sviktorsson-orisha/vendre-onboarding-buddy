import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vendre Headless Storefront Setup" },
      {
        name: "description",
        content:
          "Setup-guide för Vendre Surface API v2: OAuth i Admin, CORS-allowlist, credentials och anslutningstest innan storefronten byggs.",
      },
      { property: "og:title", content: "Vendre Headless Storefront Setup" },
      {
        property: "og:description",
        content:
          "Setup-guide för Vendre Surface API v2: OAuth i Admin, CORS-allowlist, credentials och anslutningstest innan storefronten byggs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});
