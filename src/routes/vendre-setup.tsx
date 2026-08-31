import { createFileRoute } from "@tanstack/react-router";

import { BrandHero, BrandShell } from "@/components/vendre/brand-shell";
import { SetupWizard } from "@/components/vendre/setup-wizard";
import { setConfigured } from "@/lib/vendre/onboarding-context";

const description =
  "Setup-guide för Vendre Surface API v2: OAuth i Admin, CORS-allowlist, credentials och anslutningstest innan butiken går live.";

export const Route = createFileRoute("/vendre-setup")({
  head: () => ({
    meta: [
      { title: "Uppstartsguide – koppla butiken till Vendre" },
      { name: "description", content: description },
      { property: "og:title", content: "Uppstartsguide – koppla butiken till Vendre" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SetupPage,
});

function SetupPage() {
  return (
    <BrandShell>
      <BrandHero />
      <div className="mt-10">
        <SetupWizard onVerified={() => setConfigured(true)} />
      </div>
    </BrandShell>
  );
}
