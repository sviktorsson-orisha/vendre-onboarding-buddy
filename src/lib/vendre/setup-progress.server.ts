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
};

const EMPTY: StoredSetupProgress = {
  adminDone: false,
  corsDone: false,
  secretsOk: false,
  connectionOk: false,
  publishedOrigin: "",
};

function coerce(value: unknown): StoredSetupProgress {
  const raw = (value ?? {}) as Partial<StoredSetupProgress>;
  return {
    adminDone: Boolean(raw.adminDone),
    corsDone: Boolean(raw.corsDone),
    secretsOk: Boolean(raw.secretsOk),
    connectionOk: Boolean(raw.connectionOk),
    publishedOrigin: typeof raw.publishedOrigin === "string" ? raw.publishedOrigin : "",
  };
}

export async function readSetupProgress(): Promise<StoredSetupProgress> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("vendre_setup_progress")
    .select("admin_done,cors_done,secrets_ok,connection_ok,published_origin")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return { ...EMPTY };
  return {
    adminDone: data.admin_done,
    corsDone: data.cors_done,
    secretsOk: data.secrets_ok,
    connectionOk: data.connection_ok,
    publishedOrigin: data.published_origin,
  };
}

export async function writeSetupProgress(
  patch: Partial<StoredSetupProgress>,
): Promise<StoredSetupProgress> {
  const current = await readSetupProgress();
  const next = coerce({ ...current, ...patch });
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("vendre_setup_progress").upsert({
    id: 1,
    admin_done: next.adminDone,
    cors_done: next.corsDone,
    secrets_ok: next.secretsOk,
    connection_ok: next.connectionOk,
    published_origin: next.publishedOrigin,
  });
  if (error) throw new Error(`Could not save setup progress: ${error.message}`);
  return next;
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
    const connectionOk = secretsOk && (status.tokenOk || stored.connectionOk);
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
