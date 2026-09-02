/**
 * Remembers the developer's progress through the setup guide.
 *
 * The progress is stored on the SERVER (see setup-progress.server.ts), so the
 * green checkmarks survive a reload and look the same on every domain —
 * preview, published, custom domain — and for every visitor. localStorage is
 * only a fallback mirror for when the server route cannot be reached.
 */
import { useCallback, useEffect, useRef, useState } from "react";

const KEY = "vendre.setup-progress";
const ENDPOINT = "/api/vendre/setup-progress";

export type SetupProgress = {
  adminDone: boolean;
  corsDone: boolean;
  secretsOk: boolean;
  connectionOk: boolean;
  publishedOrigin: string;
};

const EMPTY: SetupProgress = {
  adminDone: false,
  corsDone: false,
  secretsOk: false,
  connectionOk: false,
  publishedOrigin: "",
};

function coerce(value: Partial<SetupProgress> | null | undefined): SetupProgress {
  return {
    adminDone: Boolean(value?.adminDone),
    corsDone: Boolean(value?.corsDone),
    secretsOk: Boolean(value?.secretsOk),
    connectionOk: Boolean(value?.connectionOk),
    publishedOrigin: typeof value?.publishedOrigin === "string" ? value.publishedOrigin : "",
  };
}

function readLocal(): SetupProgress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? coerce(JSON.parse(raw) as Partial<SetupProgress>) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function writeLocal(value: SetupProgress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export function useSetupProgress() {
  const [progress, setProgress] = useState<SetupProgress>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const latest = useRef<SetupProgress>(EMPTY);

  const apply = useCallback((next: SetupProgress) => {
    latest.current = next;
    setProgress(next);
    writeLocal(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const local = readLocal();
    apply(local);
    fetch(ENDPOINT, { headers: { accept: "application/json" } })
      .then((response) => response.json() as Promise<Partial<SetupProgress>>)
      .then(async (data) => {
        const remote = coerce(data);
        // One-time migration from the previous localStorage implementation.
        // This preserves an already entered Step 3 domain when Cloud storage
        // is first enabled, then makes it available to all domains/visitors.
        if (!remote.publishedOrigin && local.publishedOrigin) {
          const response = await fetch(ENDPOINT, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(local),
          });
          const migrated = coerce((await response.json()) as Partial<SetupProgress>);
          if (!cancelled) apply(migrated);
          return;
        }
        if (!cancelled) apply(remote);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [apply]);

  const update = useCallback(
    (patch: Partial<SetupProgress>) => {
      const next = coerce({ ...latest.current, ...patch });
      apply(next);
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      })
        .then((response) => response.json() as Promise<Partial<SetupProgress>>)
        .then((data) => apply(coerce(data)))
        .catch(() => undefined);
    },
    [apply],
  );

  const clear = useCallback(() => {
    update({ adminDone: false, corsDone: false, secretsOk: false, connectionOk: false, publishedOrigin: "" });
  }, [update]);

  return { progress, loaded, update, clear };
}
