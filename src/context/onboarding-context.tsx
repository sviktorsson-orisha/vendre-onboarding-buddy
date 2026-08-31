/**
 * Onboarding / demo mode state.
 *
 * isConfigured === false  -> the storefront runs on dummy data (Demo Mode).
 * isConfigured === true   -> the storefront calls the connected Vendre store.
 *
 * Implemented as a module store read with useSyncExternalStore so the value is
 * available in every route module, also under route code splitting and SSR.
 */
import { useCallback, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";

const STORAGE_KEY = "vendre.setup-complete";

let configured = false;
let hydrated = false;
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
  if (typeof window !== "undefined") {
    if (next) window.localStorage.setItem(STORAGE_KEY, "1");
    else window.localStorage.removeItem(STORAGE_KEY);
  }
  emit();
}

export function useOnboarding() {
  const isConfigured = useSyncExternalStore(
    subscribe,
    () => configured,
    () => false,
  );

  useEffect(() => {
    if (hydrated) return;
    hydrated = true;
    if (window.localStorage.getItem(STORAGE_KEY) === "1") setConfigured(true);
  }, []);

  const markConfigured = useCallback(() => setConfigured(true), []);
  const reset = useCallback(() => setConfigured(false), []);

  return useMemo(
    () => ({ isConfigured, mode: isConfigured ? ("live" as const) : ("demo" as const), markConfigured, reset }),
    [isConfigured, markConfigured, reset],
  );
}

/** Kept for structural compatibility — state lives in the module store above. */
export function OnboardingProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
