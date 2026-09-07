/**
 * Server-side store for the setup guide progress.
 *
 * The guide used to keep its checkmarks in localStorage, which meant the
 * progress vanished as soon as the site was opened from another domain
 * (preview vs published vs custom domain) or by another visitor. The progress
 * now lives on the server so every visitor, on every domain, sees the same
 * state after a reload.
 *
 * Persistence lives in Lovable Cloud. Verified facts (secrets present,
 * connection working) are always re-derived from the live status so the guide
 * can never show a green step that is no longer true.
 */
export type StoredSetupProgress = {
  adminDone: boolean;
  corsDone: boolean;
  secretsOk: boolean;
  connectionOk: boolean;
  publishedOrigin: string;
  /** false when the Cloud table is missing/unreachable and we fall back to memory. */
  storageOk: boolean;
};

const EMPTY: StoredSetupProgress = {
  adminDone: false,
  corsDone: false,
  secretsOk: false,
  connectionOk: false,
  publishedOrigin: "",
  storageOk: true,
};

function coerce(value: unknown): StoredSetupProgress {
  const raw = (value ?? {}) as Partial<StoredSetupProgress>;
  return {
    adminDone: Boolean(raw.adminDone),
    corsDone: Boolean(raw.corsDone),
    secretsOk: Boolean(raw.secretsOk),
    connectionOk: Boolean(raw.connectionOk),
    publishedOrigin: typeof raw.publishedOrigin === "string" ? raw.publishedOrigin : "",
    storageOk: raw.storageOk !== false,
  };
}

/**
 * Fallback store used when the Cloud table does not exist yet (a freshly
 * imported copy of this template). Without it the guide could never reach
 * "done" and the storefront stayed on demo data for good.
 */
type MemoryStore = { value: StoredSetupProgress | null };
const mg = globalThis as typeof globalThis & { __vendreSetupProgress?: MemoryStore };
const memory = (mg.__vendreSetupProgress ??= { value: null });

export async function readSetupProgress(): Promise<StoredSetupProgress> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("vendre_setup_progress")
      .select("admin_done,cors_done,secrets_ok,connection_ok,published_origin")
      .eq("id", 1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return { ...EMPTY, ...(memory.value ?? {}), storageOk: true };
    return {
      adminDone: data.admin_done,
      corsDone: data.cors_done,
      secretsOk: data.secrets_ok,
      connectionOk: data.connection_ok,
      publishedOrigin: data.published_origin,
      storageOk: true,
    };
  } catch {
    return { ...EMPTY, ...(memory.value ?? {}), storageOk: false };
  }
}

export async function writeSetupProgress(
  patch: Partial<StoredSetupProgress>,
): Promise<StoredSetupProgress> {
  const current = await readSetupProgress();
  const next = coerce({ ...current, ...patch, storageOk: true });

  // Always keep the in-memory copy so progress survives even when the
  // database write below fails.
  memory.value = next;

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("vendre_setup_progress").upsert({
      id: 1,
      admin_done: next.adminDone,
      cors_done: next.corsDone,
      secrets_ok: next.secretsOk,
      connection_ok: next.connectionOk,
      published_origin: next.publishedOrigin,
    });
    if (error) throw new Error(error.message);
    return next;
  } catch {
    return { ...next, storageOk: false };
  }
}

/**
 * Merges the stored progress with what the server can verify right now.
 * A step is green when it was completed AND still holds true.
 */
export async function resolveSetupProgress(force = false): Promise<StoredSetupProgress> {
  const stored = await readSetupProgress();
  try {
    const { getVendreStatus } = await import("./token.server");
    const status = await getVendreStatus(force);
    const secretsOk = status.secretsOk;
    // A valid OAuth token is only the credentials check. It must never stand
    // in for the browser connection test, which also verifies CORS, session
    // bootstrap and a live Surface read. Only that test writes connectionOk.
    const connectionOk = status.ok && stored.connectionOk;
    return {
      ...stored,
      // Credentials in place implies the admin OAuth client exists.
      adminDone: stored.adminDone || secretsOk,
      secretsOk,
      connectionOk,
    };
  } catch {
    return stored;
  }
}

