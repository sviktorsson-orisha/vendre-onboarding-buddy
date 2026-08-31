import { createFileRoute } from "@tanstack/react-router";

import AccountPage from "@/pages/AccountPage";

export const Route = createFileRoute("/mitt-konto/")({
  head: () => ({
    meta: [
      { title: "Översikt – Mitt konto | Vendre Storefront" },
      {
        name: "description",
        content: "Översikt över ditt kundkonto: senaste order, adresser och kontouppgifter.",
      },
      { property: "og:title", content: "Översikt – Mitt konto" },
      { property: "og:description", content: "Din kontoöversikt i butiken." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <AccountPage view="oversikt" />,
});
