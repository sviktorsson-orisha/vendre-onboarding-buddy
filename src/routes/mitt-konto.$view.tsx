import { createFileRoute } from "@tanstack/react-router";

import AccountPage, { type AccountView } from "@/pages/AccountPage";

const VIEWS: AccountView[] = ["oversikt", "ordrar", "adresser", "konto"];

export const Route = createFileRoute("/mitt-konto/$view")({
  head: () => ({
    meta: [
      { title: "Mitt konto – Vendre Storefront" },
      {
        name: "description",
        content: "Ordrar, adresser, användare och kontouppgifter för ditt kundkonto.",
      },
      { property: "og:title", content: "Mitt konto – Vendre Storefront" },
      { property: "og:description", content: "Hantera ditt kundkonto i butiken." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountViewRoute,
});

function AccountViewRoute() {
  const { view } = Route.useParams();
  const safe = (VIEWS as string[]).includes(view) ? (view as AccountView) : "oversikt";
  return <AccountPage view={safe} />;
}
