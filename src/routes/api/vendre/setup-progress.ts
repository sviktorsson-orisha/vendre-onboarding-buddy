import { createFileRoute } from "@tanstack/react-router";

/**
 * Shared setup-guide progress. GET returns the server-resolved progress,
 * POST stores the steps the user just completed. Domain independent, so the
 * guide looks identical in preview, on the published site and for any visitor.
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
        const requestOrigin = new URL(request.url).origin;
        const callerOrigin = request.headers.get("origin");
        if (callerOrigin !== requestOrigin) {
          return Response.json({ error: "Invalid origin" }, { status: 403 });
        }
        const { writeSetupProgress, resolveSetupProgress } = await import(
          "@/lib/vendre/setup-progress.server"
        );
        let patch: Record<string, unknown> = {};
        try {
          patch = (await request.json()) as Record<string, unknown>;
        } catch {
          patch = {};
        }
        await writeSetupProgress(patch);
        const progress = await resolveSetupProgress();
        return Response.json(progress, { headers: { "cache-control": "no-store" } });
      },
    },
  },
});
