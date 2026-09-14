import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { useOnboarding } from "@/context/onboarding-context";
import { getPriceLogPrices, type PriceLogPrice } from "@/lib/vendre";

/**
 * Collects the product ids that actually need a logged price (discounted rows
 * only) and fetches them in ONE Surface v1 call per page instead of one per
 * price row. Live mode only — demo data has no logged prices.
 */
type PriceLogContextValue = {
  register: (id: string | number) => void;
  get: (id: string | number) => PriceLogPrice | null;
};

const PriceLogContext = createContext<PriceLogContextValue | null>(null);

export function PriceLogProvider({ children }: { children: ReactNode }) {
  const { mode } = useOnboarding();
  const live = mode === "live";

  const pending = useRef(new Set<string>());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ids, setIds] = useState<string[]>([]);

  const flush = useCallback(() => {
    setIds((current) => {
      const next = new Set(current);
      let changed = false;
      for (const id of pending.current) {
        if (!next.has(id)) {
          next.add(id);
          changed = true;
        }
      }
      pending.current.clear();
      return changed ? Array.from(next).sort() : current;
    });
  }, []);

  const register = useCallback(
    (id: string | number) => {
      const key = String(id);
      if (!key || key === "null" || key === "undefined") return;
      pending.current.add(key);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, 50);
    },
    [flush],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const { data } = useQuery({
    queryKey: ["vendre", "price-log", ids],
    queryFn: () => getPriceLogPrices(ids),
    enabled: live && ids.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const value = useMemo<PriceLogContextValue>(
    () => ({
      register: live ? register : () => {},
      get: (id) => (live ? (data?.[String(id)] ?? null) : null),
    }),
    [live, register, data],
  );

  return <PriceLogContext.Provider value={value}>{children}</PriceLogContext.Provider>;
}

/** Returns the logged price for a product, registering it for the batched call. */
export function usePriceLogEntry(id: string | number | null | undefined, enabled: boolean) {
  const ctx = useContext(PriceLogContext);

  useEffect(() => {
    if (ctx && enabled && id != null) ctx.register(id);
  }, [ctx, enabled, id]);

  if (!ctx || !enabled || id == null) return null;
  return ctx.get(id);
}
