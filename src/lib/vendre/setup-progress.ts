/**
 * Remembers the developer's progress through the setup guide so a page refresh
 * does not reset the checklist. This is UI state only — whether the storefront
 * runs on live data is decided by the server (see status.functions.ts).
 */
import { useCallback, useEffect, useState } from "react";

const KEY = "vendre.setup-progress";

export type SetupProgress = {
  adminDone: boolean;
  corsDone: boolean;
  secretsOk: boolean;
  connectionOk: boolean;
};

const EMPTY: SetupProgress = { adminDone: false, corsDone: false, secretsOk: false, connectionOk: false };

function read(): SetupProgress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<SetupProgress>;
    return {
      adminDone: Boolean(parsed.adminDone),
      corsDone: Boolean(parsed.corsDone),
      secretsOk: Boolean(parsed.secretsOk),
      connectionOk: Boolean(parsed.connectionOk),
    };
  } catch {
    return EMPTY;
  }
}

export function useSetupProgress() {
  const [progress, setProgress] = useState<SetupProgress>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProgress(read());
    setLoaded(true);
  }, []);

  const update = useCallback((patch: Partial<SetupProgress>) => {
    setProgress((current) => {
      const next = { ...current, ...patch };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setProgress(EMPTY);
  }, []);

  return { progress, loaded, update, clear };
}
