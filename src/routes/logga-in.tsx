import { createFileRoute } from "@tanstack/react-router";

import LoginPage from "@/pages/LoginPage";

export const Route = createFileRoute("/logga-in")({
  head: () => ({
    meta: [
      { title: "Logga in eller skapa konto – Vendre Storefront" },
      {
        name: "description",
        content:
          "Logga in på ditt kundkonto eller skapa ett nytt för att följa ordrar, spara adresser och handla snabbare.",
      },
      { property: "og:title", content: "Logga in eller skapa konto – Vendre Storefront" },
      {
        property: "og:description",
        content: "Logga in eller registrera ett kundkonto i butiken.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});
