import { createServerFn } from "@tanstack/react-start";

export type StorefrontStatus = {
  ok: boolean;
  secretsOk: boolean;
  tokenOk: boolean;
  missing: string[];
};

/**
 * Server-decided answer to "is the store connected?".
 * Every visitor gets the same answer — the mode is never read from localStorage.
 */
export const getStorefrontStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<StorefrontStatus> => {
    const { getVendreStatus } = await import("./token.server");
    const status = await getVendreStatus();
    return {
      ok: status.ok,
      secretsOk: status.secretsOk,
      tokenOk: status.tokenOk,
      missing: status.missing,
    };
  },
);
