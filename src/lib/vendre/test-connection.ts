import {
  VendreError,
  getVendreToken,
  setMutationProtectionToken,
  surfaceFetch,
} from "./client";

export type StepId = "token" | "cors" | "session" | "read";
export type StepStatus = "ok" | "warning" | "failed" | "skipped";

export type ConnectionStep = {
  id: StepId;
  label: string;
  status: StepStatus;
  detail: string;
};

export type ConnectionResult = {
  ok: boolean;
  steps: ConnectionStep[];
  missing: string[];
  origin: string;
  baseUrl: string | null;
};

const LABELS: Record<StepId, string> = {
  token: "Token",
  cors: "CORS",
  session: "Session",
  read: "Läsrättigheter",
};

function step(id: StepId, status: StepStatus, detail: string): ConnectionStep {
  return { id, label: LABELS[id], status, detail };
}

/**
 * Runs the setup verification chain: token → cors → session → read.
 * Implements .vendre/skills/setup.md step 2/3.
 */
export async function testVendreConnection(): Promise<ConnectionResult> {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const steps: ConnectionStep[] = [];
  let missing: string[] = [];
  let baseUrl: string | null = null;

  // 1. Token (server-side minted, client_secret never leaves the server).
  try {
    const token = await getVendreToken(true);
    baseUrl = token.baseUrl;
    steps.push(step("token", "ok", `OAuth-token hämtad från ${token.baseUrl}`));
  } catch (error) {
    const err = error as VendreError;
    missing = err.missing ?? [];
    const detail = missing.length
      ? `Saknade secrets: ${missing.join(", ")}`
      : err.status === 429
        ? "Butiken rate-limitar (429). Vänta en minut och försök igen."
        : err.status === 401 || err.status === 400
          ? "Client id/secret avvisades — verifiera dem i Vendre Admin."
          : err.message;
    steps.push(step("token", "failed", detail));
    steps.push(step("cors", "skipped", "Kördes inte — token saknas."));
    steps.push(step("session", "skipped", "Kördes inte — token saknas."));
    steps.push(step("read", "skipped", "Kördes inte — token saknas."));
    return { ok: false, steps, missing, origin, baseUrl };
  }

  // 2 + 3. Session bootstrap — a network-level failure here means the origin is not allowlisted.
  let corsOk = true;
  try {
    const res = await surfaceFetch("session/bootstrap", { method: "POST" });
    const body = (await res.json().catch(() => null)) as
      | {
          surface_mutation_protection_token?: string;
          mutationProtectionToken?: string;
          errors?: { title?: string }[];
        }
      | null;

    if (!res.ok) {
      steps.push(step("cors", "ok", `Origin ${origin} kan nå butiken direkt.`));
      steps.push(
        step(
          "session",
          "failed",
          body?.errors?.[0]?.title ??
            `session/bootstrap svarade ${res.status}. Kontrollera policyerna bootstrap och session.`,
        ),
      );
      steps.push(step("read", "skipped", "Kördes inte — sessionen saknas."));
      return { ok: false, steps, missing, origin, baseUrl };
    }

    const token = body?.surface_mutation_protection_token ?? body?.mutationProtectionToken ?? null;
    setMutationProtectionToken(token);
    steps.push(step("cors", "ok", `Origin ${origin} är allowlistad.`));
    steps.push(
      step(
        "session",
        token ? "ok" : "warning",
        token
          ? "Session startad och mutation protection token mottagen."
          : "Session startad men ingen mutation protection token returnerades.",
      ),
    );
  } catch {
    corsOk = false;
    steps.push(
      step(
        "cors",
        "warning",
        `Direktanropet blockerades — ${origin} är inte allowlistad under Surface CORS. Appen kan köras i degraderat proxy-läge, men checkout startar en tom session.`,
      ),
    );
    steps.push(step("session", "failed", "session/bootstrap kunde inte nås från webbläsaren."));
    steps.push(step("read", "skipped", "Kördes inte — sessionen saknas."));
    return { ok: false, steps, missing, origin, baseUrl };
  }

  // 4. Read permission.
  try {
    const res = await surfaceFetch("navigation/menus");
    if (!res.ok) {
      steps.push(
        step(
          "read",
          "failed",
          `navigation/menus svarade ${res.status}. Kontrollera policyn navigation_menus och att en meny är publicerad.`,
        ),
      );
      return { ok: false, steps, missing, origin, baseUrl };
    }
    steps.push(step("read", "ok", "Läsning av navigation/menus fungerar."));
  } catch {
    steps.push(step("read", "failed", "navigation/menus kunde inte nås — kontrollera policyn navigation_menus."));
    return { ok: false, steps, missing, origin, baseUrl };
  }

  const ok = corsOk && steps.every((s) => s.status === "ok" || s.status === "warning");
  return { ok, steps, missing, origin, baseUrl };
}
