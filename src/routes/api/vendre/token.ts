import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/vendre/token")({
  server: {
    handlers: {
      GET: async () => {
        const { readVendreEnv, getVendreServerToken, TokenError } = await import("@/lib/vendre/token.server");
        const { missing, baseUrl } = readVendreEnv();
        if (missing.length) {
          return Response.json(
            { error: "missing_credentials", missing },
            { status: 400, headers: { "cache-control": "no-store" } },
          );
        }

        try {
          const state = await getVendreServerToken();
          return Response.json(
            { access_token: state.accessToken, base_url: baseUrl, expires_at: state.expiresAt },
            { headers: { "cache-control": "no-store" } },
          );
        } catch (error) {
          const status = error instanceof TokenError ? error.status : 502;
          const headers: Record<string, string> = { "cache-control": "no-store" };
          if (error instanceof TokenError && error.retryAfter) headers["retry-after"] = error.retryAfter;
          return Response.json(
            { error: "token_failed", status, message: (error as Error).message },
            { status, headers },
          );
        }
      },
    },
  },
});
