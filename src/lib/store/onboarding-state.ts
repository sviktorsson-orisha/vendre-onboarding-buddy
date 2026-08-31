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

/** Non-reactive read for modules outside React (cart sync, data layer). */
export function isConfigured() {
  hydrate();
  return configured;
}

export function setConfigured(value: boolean) {
  if (configured === value) return;
  configured = value;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, value ? "true" : "false");
  }
  emit();

  // Switching modes must not serve stale catalog/session data.
  if (typeof window !== "undefined") {
    void import("@/lib/vendre/catalog").then((m) => m.clearCatalogCache()).catch(() => undefined);
    void import("@/lib/vendre/session").then((m) => m.resetSession()).catch(() => undefined);
  }
}

export function useIsConfigured() {
  return useSyncExternalStore(
    subscribe,
    () => configured,
    () => false,
  );
}

/** Lets any part of the storefront (e.g. a live-data error card) open the wizard. */
let wizardOpen = false;
const wizardListeners = new Set<() => void>();

function emitWizard() {
  for (const listener of wizardListeners) listener();
}

export function openSetupWizard() {
  wizardOpen = true;
  emitWizard();
}

export function setSetupWizardOpen(value: boolean) {
  if (wizardOpen === value) return;
  wizardOpen = value;
  emitWizard();
}

export function useSetupWizardOpen() {
  return useSyncExternalStore(
    (listener) => {
      wizardListeners.add(listener);
      return () => wizardListeners.delete(listener);
    },
    () => wizardOpen,
    () => false,
  );
}
