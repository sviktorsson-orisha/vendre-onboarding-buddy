import { createFileRoute } from "@tanstack/react-router";

const REQUIRED = ["VENDRE_BASE_URL", "VENDRE_CLIENT_ID", "VENDRE_CLIENT_SECRET"] as const;

export const Route = createFileRoute("/api/vendre/status")({
  server: {
    handlers: {
      GET: async () => {
        const present: Record<string, boolean> = {};
        for (const name of REQUIRED) present[name] = Boolean(process.env[name]);
        const missing = REQUIRED.filter((name) => !present[name]);

        return Response.json(
          { ok: missing.length === 0, present, missing },
          { headers: { "cache-control": "no-store" } },
        );
      },
    },
  },
});
