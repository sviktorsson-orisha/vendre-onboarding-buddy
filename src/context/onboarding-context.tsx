/**
 * Storefront mode.
 *
 * isConfigured === false  -> the storefront runs on dummy data (Demo Mode).
 * isConfigured === true   -> the storefront calls the connected Vendre store.
 *
 * IMPORTANT: the mode is decided by the SERVER (credentials present + the store
 * accepting them), never by localStorage. Every visitor sees live data as soon
 * as the store is connected. localStorage is only used to remember that the
 * person configuring the store dismissed the guide banner.
 */
import { useCallback, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";

const DISMISS_KEY = "vendre.guide-dismissed";

let configured = false;
let guideVerified = false;
let dismissed = false;
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

/** Called with the server-resolved status during SSR and hydration. */
export function setServerConfigured(next: boolean) {
  if (configured === next) return;
  configured = next;
  emit();
}

/** The whole setup guide is done (credentials + CORS + green connection test). */
export function setServerVerified(next: boolean) {
  if (guideVerified === next) return;
  guideVerified = next;
  emit();
}

export function setGuideDismissed(next: boolean) {
  dismissed = next;
  if (typeof window !== "undefined") {
    try {
      if (next) window.localStorage.setItem(DISMISS_KEY, "1");
      else window.localStorage.removeItem(DISMISS_KEY);
    } catch {
      /* storage unavailable — the choice is simply not remembered */
    }
  }
  emit();
}

function snapshot() {
  return (configured ? 2 : 0) + (dismissed ? 1 : 0) + (guideVerified ? 4 : 0);
}

export function useOnboarding() {
  const state = useSyncExternalStore(subscribe, snapshot, () => (configured ? 2 : 0));
  const isConfigured = (state & 2) !== 0;
  const guideDismissed = (state & 1) !== 0;
  const verified = (state & 4) !== 0;

  useEffect(() => {
    if (hydrated) return;
    hydrated = true;
    try {
      if (window.localStorage.getItem(DISMISS_KEY) === "1") setGuideDismissed(true);
    } catch {
      /* ignore */
    }
  }, []);

  const markConfigured = useCallback(() => setGuideDismissed(true), []);
  const reset = useCallback(() => setGuideDismissed(false), []);

  return useMemo(
    () => ({
      isConfigured,
      verified,
      guideDismissed,
      mode: isConfigured ? ("live" as const) : ("demo" as const),
      markConfigured,
      reset,
    }),
    [isConfigured, verified, guideDismissed, markConfigured, reset],
  );
}

/** Kept for structural compatibility — state lives in the module store above. */
export function OnboardingProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
