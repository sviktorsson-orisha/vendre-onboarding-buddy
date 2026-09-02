/**
 * Server-side store for the setup guide progress.
 *
 * The guide used to keep its checkmarks in localStorage, which meant the
 * progress vanished as soon as the site was opened from another domain
 * (preview vs published vs custom domain) or by another visitor. The progress
 * now lives on the server so every visitor, on every domain, sees the same
 * state after a reload.
 *
 * Persistence is best-effort: an in-memory cache plus a JSON file when the
 * runtime offers a writable filesystem. Verified facts (secrets present,
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

const FILE = "/tmp/vendre-setup-progress.json";

let cache: StoredSetupProgress | null = null;

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

async function readFile(): Promise<StoredSetupProgress | null> {
  try {
    const { readFile: read } = await import("node:fs/promises");
    return coerce(JSON.parse(await read(FILE, "utf8")));
  } catch {
    return null;
  }
}

async function writeFile(value: StoredSetupProgress): Promise<void> {
  try {
    const { writeFile: write } = await import("node:fs/promises");
    await write(FILE, JSON.stringify(value), "utf8");
  } catch {
    /* read-only runtime — the in-memory cache still serves this instance */
  }
}

export async function readSetupProgress(): Promise<StoredSetupProgress> {
  if (!cache) cache = (await readFile()) ?? { ...EMPTY };
  return { ...cache };
}

export async function writeSetupProgress(
  patch: Partial<StoredSetupProgress>,
): Promise<StoredSetupProgress> {
  const current = await readSetupProgress();
  const next = coerce({ ...current, ...patch });
  cache = next;
  await writeFile(next);
  return { ...next };
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
