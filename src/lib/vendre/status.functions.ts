import { createServerFn } from "@tanstack/react-start";

export type StorefrontStatus = {
  ok: boolean;
  secretsOk: boolean;
  tokenOk: boolean;
  missing: string[];
  /** CORS confirmed in the setup guide. */
  corsDone: boolean;
  /** Connection test returned ok in the setup guide. */
  connectionOk: boolean;
  /** Demo data is replaced only when the guide is fully verified. */
  verified: boolean;
};

/**
 * Server-decided answer to "is the store connected?".
 * Every visitor gets the same answer — the mode is never read from localStorage.
 */
export const getStorefrontStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<StorefrontStatus> => {
    const { getVendreStatus } = await import("./token.server");
    const { resolveSetupProgress } = await import("./setup-progress.server");
    // Use the same resolved status source as the setup guide. Force the live
    // credential check so a just-completed setup cannot be held back by the
    // 60-second status cache.
    const [status, progress] = await Promise.all([
      getVendreStatus(true),
      resolveSetupProgress(true),
    ]);
    const corsDone = progress.corsDone;
    const connectionOk = progress.connectionOk;
    return {
      ok: status.ok,
      secretsOk: status.secretsOk,
      tokenOk: status.tokenOk,
      missing: status.missing,
      corsDone,
      connectionOk,
      verified: progress.secretsOk && corsDone && connectionOk,
    };
  },
);
