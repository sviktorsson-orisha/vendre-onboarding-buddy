import { createFileRoute } from "@tanstack/react-router";

/**
 * Shared setup-guide progress. GET returns the server-resolved progress,
 * POST stores the steps the user just completed. Domain independent, so the
 * guide looks identical in preview, on the published site and for any visitor.
 *
 * Writes are only accepted from our own pages, throttled, and refused once the
 * guide is fully completed so nobody can rewrite a finished setup.
 */
export const Route = createFileRoute("/api/vendre/setup-progress")({
  server: {
    handlers: {
      GET: async () => {
        const { resolveSetupProgress } = await import("@/lib/vendre/setup-progress.server");
        const progress = await resolveSetupProgress();
        return Response.json(progress, { headers: { "cache-control": "no-store" } });
      },
      POST: async ({ request }) => {
        const { isBrowserSameOrigin, rateLimit, tooManyRequests, forbidden } = await import(
          "@/lib/vendre/request-guard.server"
        );
        if (!isBrowserSameOrigin(request)) return forbidden();
        if (!rateLimit(request, "setup-progress", 30, 60_000)) return tooManyRequests();

        const { writeSetupProgress, resolveSetupProgress } = await import(
          "@/lib/vendre/setup-progress.server"
        );

        let patch: Record<string, unknown> = {};
        try {
          patch = (await request.json()) as Record<string, unknown>;
        } catch {
          patch = {};
        }

        // Once the guide is finished, the only thing still editable is the
        // published domain. Completed steps can no longer be rewritten.
        const current = await resolveSetupProgress();
        const completed =
          current.adminDone && current.corsDone && current.secretsOk && current.connectionOk;
        if (completed) {
          patch = "publishedOrigin" in patch ? { publishedOrigin: patch["publishedOrigin"] } : {};
        }

        await writeSetupProgress(patch);
        const progress = await resolveSetupProgress();
        return Response.json(progress, { headers: { "cache-control": "no-store" } });
      },
    },
  },
});
