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

let autoDetect: Promise<void> | null = null;

/**
 * Live mode should not depend on someone having clicked through the wizard in
 * this exact browser: if the store answers, we run live. The probe runs once
 * per page load and only when the flag is not already set.
 */
function detectLiveStore() {
  autoDetect ??= (async () => {
    try {
      const { testVendreConnection } = await import("@/lib/vendre/test-connection");
      const result = await testVendreConnection();
      if (result.ok) setConfigured(true);
    } catch {
      /* stay in demo mode */
    }
  })();
  return autoDetect;
}

export function useOnboarding() {
  const isConfigured = useSyncExternalStore(
    subscribe,
    () => configured,
    () => false,
  );

  useEffect(() => {
    let stored = false;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      /* ignore */
    }
    if (stored) {
      if (!configured) setConfigured(true);
      return;
    }
    void detectLiveStore();
  }, []);


  const markConfigured = useCallback(() => setConfigured(true), []);
  const reset = useCallback(() => setConfigured(false), []);

  return { isConfigured, markConfigured, reset };
}
