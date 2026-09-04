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
    const { readSetupProgress } = await import("./setup-progress.server");
    const status = await getVendreStatus();
    let corsDone = false;
    let connectionOk = false;
    try {
      const progress = await readSetupProgress();
      corsDone = progress.corsDone;
      connectionOk = progress.connectionOk;
    } catch {
      /* progress store unavailable — stay in demo mode */
    }
    return {
      ok: status.ok,
      secretsOk: status.secretsOk,
      tokenOk: status.tokenOk,
      missing: status.missing,
      corsDone,
      connectionOk,
      verified: status.ok && corsDone && connectionOk,
    };
  },
);
