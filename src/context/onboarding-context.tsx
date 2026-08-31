/**
 * Demo Mode flag.
 *
 * isConfigured === false  → the storefront renders mock data and the setup
 * notice bar is visible. It flips to true when the connection test is green,
 * and is persisted in localStorage so the choice survives reloads.
 *
 * Implemented as a module store (useSyncExternalStore) rather than React
 * context so it is safe with route-level code splitting and SSR.
 */
import { useCallback, useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "vendre.setup-complete";

let configured = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setConfigured(next: boolean) {
  configured = next;
  try {
    if (next) window.localStorage.setItem(STORAGE_KEY, "1");
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable — the flag simply lives for this session */
  }
  emit();
}

/** True once the Vendre connection test has passed. Always false on the server. */
export function isStoreConfigured() {
  return configured;
}

export function useOnboarding() {
  const isConfigured = useSyncExternalStore(
    subscribe,
    () => configured,
    () => false,
  );

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) === "1";
      if (stored !== configured) setConfigured(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const markConfigured = useCallback(() => setConfigured(true), []);
  const reset = useCallback(() => setConfigured(false), []);

  return { isConfigured, markConfigured, reset };
}
