import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/vendre/status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { getVendreStatus, readVendreEnv } = await import("@/lib/vendre/token.server");
        const force = new URL(request.url).searchParams.get("force") === "1";
        const status = await getVendreStatus(force);
        const { baseUrl, clientId, clientSecret } = readVendreEnv();

        return Response.json(
          {
            ok: status.ok,
            secretsOk: status.secretsOk,
            tokenOk: status.tokenOk,
            missing: status.missing,
            baseUrl: baseUrl ?? null,
            present: {
              VENDRE_BASE_URL: Boolean(baseUrl),
              VENDRE_CLIENT_ID: Boolean(clientId),
              VENDRE_CLIENT_SECRET: Boolean(clientSecret),
            },
            message: status.message,
          },
          { headers: { "cache-control": "no-store" } },
        );
      },
    },
  },
});
