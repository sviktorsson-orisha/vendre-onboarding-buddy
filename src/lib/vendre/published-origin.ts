/**
 * The friendly Lovable domain the customer picks in the Publish dialog.
 *
 * The stable project addresses (project--<uuid>.lovable.app) always work, but
 * they are hard to read and hard to type into Vendre Admin. Publishing lets the
 * user choose a slug such as https://spring-board.lovable.app — we store that
 * choice locally so every CORS snippet in the guide includes it.
 *
 * Presentation-level only: nothing here talks to Vendre.
 */
import { useCallback, useEffect, useState } from "react";

export const PUBLISHED_ORIGIN_STORAGE_KEY = "vendre.published-origin";

export function normaliseOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, "");
}

/** Accepts "spring-board", "spring-board.lovable.app" or a full https URL. */
export function toPublishedOrigin(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const candidate = /^[a-z0-9][a-z0-9-]*$/i.test(raw)
    ? `https://${raw.toLowerCase()}.lovable.app`
    : withScheme;

  try {
    const url = new URL(candidate);
    if (!url.hostname.includes(".")) return null;
    return normaliseOrigin(`${url.protocol}//${url.host}`);
  } catch {
    return null;
  }
}

export function getStoredPublishedOrigin(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(PUBLISHED_ORIGIN_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function usePublishedOrigin() {
  const [origin, setOriginState] = useState<string>("");

  useEffect(() => {
    setOriginState(getStoredPublishedOrigin());
  }, []);

  const setOrigin = useCallback((value: string) => {
    setOriginState(value);
    try {
      if (value) window.localStorage.setItem(PUBLISHED_ORIGIN_STORAGE_KEY, value);
      else window.localStorage.removeItem(PUBLISHED_ORIGIN_STORAGE_KEY);
    } catch {
      /* storage unavailable — the choice is simply not persisted */
    }
  }, []);

  return { origin, setOrigin };
}
