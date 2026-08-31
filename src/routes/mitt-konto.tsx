import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mitt-konto")({
  head: () => ({
    meta: [
      { title: "Mitt konto – Vendre Storefront" },
      {
        name: "description",
        content:
          "Hantera dina ordrar, adresser, användare och kontouppgifter i din Vendre-butik.",
      },
      { property: "og:title", content: "Mitt konto – Vendre Storefront" },
      { property: "og:description", content: "Ordrar, adresser och kontouppgifter." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <Outlet />,
});
