import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/vendre/status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { isBrowserSameOrigin, rateLimit, tooManyRequests } = await import(
          "@/lib/vendre/request-guard.server"
        );
        if (!rateLimit(request, "status", 60, 60_000)) return tooManyRequests();

        // Store URL and which secrets exist are only revealed to our own pages
        // (the setup guide); anonymous callers get booleans only.
        const trusted = isBrowserSameOrigin(request);

        const { getVendreStatus, readVendreEnv } = await import("@/lib/vendre/token.server");
        const force = trusted && new URL(request.url).searchParams.get("force") === "1";
        const status = await getVendreStatus(force);
        const { baseUrl, clientId, clientSecret } = readVendreEnv();

        if (!trusted) {
          return Response.json(
            { ok: status.ok, secretsOk: status.secretsOk, tokenOk: status.tokenOk },
            { headers: { "cache-control": "no-store" } },
          );
        }

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
