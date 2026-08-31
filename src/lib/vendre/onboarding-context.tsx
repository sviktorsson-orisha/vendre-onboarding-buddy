/**
 * Global onboarding-state.
 *
 * `isConfigured` styr om butiken kör på mockad data (demoläge) eller mot
 * riktiga Surface v2-anrop. Den sätts av /api/vendre/status (secrets finns)
 * och av ett grönt anslutningstest.
 *
 * Implementerat som en modulstore + useSyncExternalStore i stället för React
 * context: rutt-koddelningen i den här appen gör att context-providers annars
 * kan hamna i en annan modulinstans än konsumenterna.
 */

import { useSyncExternalStore, type ReactNode } from "react";

type OnboardingState = {
  isConfigured: boolean;
  checked: boolean;
  wizardOpen: boolean;
};

let state: OnboardingState = { isConfigured: false, checked: false, wizardOpen: false };
const listeners = new Set<() => void>();

function emit(next: Partial<OnboardingState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const serverSnapshot: OnboardingState = { isConfigured: false, checked: false, wizardOpen: false };

export function setConfigured(value: boolean) {
  emit({ isConfigured: value, checked: true });
}

export function openSetupWizard() {
  emit({ wizardOpen: true });
}

export function closeSetupWizard() {
  emit({ wizardOpen: false });
}

let statusInflight: Promise<void> | null = null;

/** Frågar servern om VENDRE-secrets finns. Kör bara en gång per sidladdning. */
export function refreshConfiguredStatus() {
  if (statusInflight) return statusInflight;
  statusInflight = fetch("/api/vendre/status", { headers: { accept: "application/json" } })
    .then((response) => response.json() as Promise<{ ok?: boolean }>)
    .then((data) => emit({ isConfigured: Boolean(data.ok), checked: true }))
    .catch(() => emit({ checked: true }))
    .finally(() => {
      statusInflight = null;
    });
  return statusInflight;
}

export function useOnboarding() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => serverSnapshot,
  );
}

/**
 * Startar statuskontrollen. Ligger som komponent så den kan monteras i
 * __root.tsx utan att blockera renderingen.
 */
export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { checked } = useOnboarding();
  if (typeof window !== "undefined" && !checked) void refreshConfiguredStatus();
  return <>{children}</>;
}
