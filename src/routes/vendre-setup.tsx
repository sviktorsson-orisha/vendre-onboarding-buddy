import { createFileRoute } from "@tanstack/react-router";

import { SetupWizard } from "@/components/vendre/setup-wizard";

export const Route = createFileRoute("/vendre-setup")({
  head: () => ({
    meta: [
      { title: "Vendre-uppstart — koppla din butik" },
      {
        name: "description",
        content:
          "Steg-för-steg-guide som kopplar butiken mot Vendre: OAuth-nycklar, domän, CORS och anslutningstest.",
      },
      { property: "og:title", content: "Vendre-uppstart — koppla din butik" },
      {
        property: "og:description",
        content: "Konfigurera OAuth-nycklar, domän och CORS och verifiera anslutningen mot Vendre.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SetupPage,
});

function SetupPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-6">
      <SetupWizard />
    </div>
  );
}
