import { createFileRoute } from "@tanstack/react-router";
import Home from "@/pages/Home";

const description =
  "Skandinavisk inredning i begränsade serier – möbler, belysning och textil. Butiksmall byggd på Vendre Surface API v2.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nordsken – inredning som håller i decennier" },
      { name: "description", content: description },
      { property: "og:title", content: "Nordsken – inredning som håller i decennier" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});
