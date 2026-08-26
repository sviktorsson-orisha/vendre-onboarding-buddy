import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vendre onboarding – kom igång i tre steg" },
      {
        name: "description",
        content:
          "Onboarding-guide för din Vendre-butik: lägg in API-nycklar, validera anslutningen och börja bygga.",
      },
      { property: "og:title", content: "Vendre onboarding – kom igång i tre steg" },
      {
        property: "og:description",
        content:
          "Onboarding-guide för din Vendre-butik: lägg in API-nycklar, validera anslutningen och börja bygga.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});
