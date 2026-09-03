import { createFileRoute } from "@tanstack/react-router";

import SearchPage from "@/pages/SearchPage";

export type StoreSearch = {
  q?: string | undefined;
  page?: number | undefined;
};

export const Route = createFileRoute("/sok")({
  validateSearch: (search: Record<string, unknown>): StoreSearch => {
    const q = typeof search["q"] === "string" ? search["q"] : "";
    const page = Number(search["page"]);
    return {
      ...(q ? { q } : {}),
      ...(Number.isFinite(page) && page > 1 ? { page } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Sök produkter – Vendre Storefront" },
      {
        name: "description",
        content:
          "Sök i hela sortimentet: skriv tre tecken för direkta produktförslag och se alla träffar på sökresultatsidan.",
      },
      { property: "og:title", content: "Sök produkter – Vendre Storefront" },
      {
        property: "og:description",
        content: "Hitta produkter direkt i din Vendre-butik med autocomplete och full sökresultatsida.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
});
