/**
 * Global onboarding state.
 *
 * `isConfigured === false` → the storefront runs on Vendre-shaped dummy data and
 * the demo-mode banner is shown. It flips to `true` when the connection test in
 * `.vendre/skills/setup.md` returns ok, and is remembered in localStorage.
 */
import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "vendre.setup.configured";

let configured = false;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  configured = window.localStorage.getItem(STORAGE_KEY) === "true";
  emit();
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setConfigured(next: boolean) {
  configured = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, String(next));
  }
  emit();
}

export function useOnboarding() {
  const isConfigured = useSyncExternalStore(
    subscribe,
    () => configured,
    () => false,
  );
  const markConfigured = useCallback((value = true) => setConfigured(value), []);
  return { isConfigured, markConfigured };
}
