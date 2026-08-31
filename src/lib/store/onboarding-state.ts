/**
 * Demo Mode / Live Mode state.
 *
 * isConfigured === false  -> the storefront runs on local dummy data.
 * isConfigured === true   -> the Vendre connection has been verified.
 *
 * Uses a module-level store with useSyncExternalStore (same pattern as
 * src/lib/i18n.tsx) so it survives route code-splitting without context.
 */
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "vendre.setup-complete";

let configured = false;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  configured = window.localStorage.getItem(STORAGE_KEY) === "true";
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  hydrate();
  return () => listeners.delete(listener);
}

export function setConfigured(value: boolean) {
  if (configured === value) return;
  configured = value;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, value ? "true" : "false");
  }
  emit();
}

export function useIsConfigured() {
  return useSyncExternalStore(
    subscribe,
    () => configured,
    () => false,
  );
}
