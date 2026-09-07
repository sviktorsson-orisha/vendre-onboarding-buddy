import { createFileRoute } from "@tanstack/react-router";

/** Temporary diagnostic: can the published worker resolve the store hostname? */
export const Route = createFileRoute("/api/public/dns-check")({
  server: {
    handlers: {
      GET: async () => {
        const targets = [
          "https://sara_phoenix.testavendre.se/surface/2/",
          "https://sara-phoenix.testavendre.se/surface/2/",
          "https://example.com/",
        ];
        const results = [];
        for (const url of targets) {
          try {
            const res = await fetch(url, { method: "GET" });
            results.push({ url, status: res.status });
          } catch (error) {
            results.push({ url, error: String(error) });
          }
        }
        return Response.json({ results });
      },
    },
  },
});
