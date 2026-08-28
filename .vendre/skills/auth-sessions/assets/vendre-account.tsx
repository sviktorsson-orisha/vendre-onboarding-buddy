import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useVendre, VendreUnauthorizedError } from "./vendre-session";
import { CART_QUERY_KEY } from "./vendre-cart";

export type Account = {
  id?: number;
  firstname?: string | null;
  lastname?: string | null;
  email_address?: string | null;
  company?: string | null;
  street_address?: string | null;
  postcode?: string | null;
  city?: string | null;
  state?: string | null;
  gender?: string | null;
  country?: string | number | null;
  telephone?: string | null;
  personnummer?: string | null;
  vat_identification_number?: string | null;
  newsletter?: boolean | number | null;
  logged_in?: boolean;
};

export type AccountAddress = Record<string, unknown>;

export type OrderSummary = {
  id: number | string;
  order_number?: string | null;
  date_purchased?: string | null;
  created_at?: string | null;
  status?: string | null;
  order_status?: string | null;
  total?: string | null;
};

export type OrderDetail = OrderSummary & {
  products?: Array<{
    id?: number;
    name?: string;
    model?: string | null;
    quantity?: number;
    price?: string;
    final_price?: string;
    total_final_price?: string;
  }>;
  totals?: Array<{ title?: string; text?: string; value?: string }>;
  delivery_address?: Record<string, unknown> | null;
  billing_address?: Record<string, unknown> | null;
};

export const ACCOUNT_QUERY_KEY = ["vendre", "account", "me"] as const;
export const ORDERS_QUERY_KEY = ["vendre", "account", "order-history"] as const;

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in (payload as object)) {
    const inner = (payload as { data: unknown }).data;
    if (inner && typeof inner === "object") return inner as T;
  }
  return payload as T;
}

/**
 * Surface v2 returns `first_name` / `email` / `default_address.*`;
 * the UI works with the same snake_case shape used when creating an account.
 */
function normalizeAccount(raw: unknown): Account | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, any>;
  const addr = (r["default_address"] ?? {}) as Record<string, any>;
  const pick = (...vals: unknown[]) =>
    vals.find((v) => v !== undefined && v !== null && v !== "") ?? null;
  return {
    ...r,
    id: r["id"],
    gender: pick(r["gender"], addr["gender"]),
    firstname: pick(r["firstname"], r["first_name"], r["firstName"], addr["firstname"]),
    lastname: pick(r["lastname"], r["last_name"], r["lastName"], addr["lastname"]),
    email_address: pick(r["email_address"], r["email"]),
    company: pick(r["company"], addr["company"]),
    street_address: pick(r["street_address"], addr["street_address"]),
    postcode: pick(r["postcode"], addr["postcode"]),
    city: pick(r["city"], addr["city"]),
    state: pick(r["state"], addr["state"]),
    country: pick(r["country"], addr["country_id"]),
    telephone: pick(r["telephone"], r["mobile"]),
    personnummer: pick(r["personnummer"]),
    vat_identification_number: pick(
      r["vat_identification_number"],
      r["vat_id"],
      addr["vat_identification_number"],
    ),
    newsletter: r["newsletter"] ?? false,
  } as Account;
}

function isLoggedIn(account: Account | null): boolean {
  if (!account) return false;
  if (account.logged_in === false) return false;
  return Boolean(account.email_address || account.id);
}


type AccountContextValue = {
  account: Account | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** True once the session bootstrap and the accounts/me probe have settled. */
  isResolved: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (input: Record<string, unknown>) => Promise<void>;
  updateProfile: (input: Record<string, unknown>) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  isMutating: boolean;
};

const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const { ready, request, refreshSession } = useVendre();
  const queryClient = useQueryClient();
  // Login and registration return the authenticated customer directly. Keep
  // that result because some Vendre stores render legacy HTML from accounts/me.
  const [sessionAccount, setSessionAccount] = useState<Account | null>(null);

  // Account details are never cached — always fetched fresh.
  const accountQuery = useQuery({
    queryKey: ACCOUNT_QUERY_KEY,
    enabled: ready,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    queryFn: async () => {
      // The session itself is the source of truth for "am I signed in?".
      // GET /surface/2/session/context never 401s and reports authenticated
      // plus the customer, so a flaky accounts/me can no longer sign us out.
      let context: Record<string, any> | null = null;
      try {
        context = unwrap<Record<string, any>>(
          await request<unknown>({ path: "/surface/2/session/context" }),
        );
      } catch {
        context = null;
      }

      if (context && context["authenticated"] === false) {
        setSessionAccount(null);
        return null;
      }

      const fromContext = normalizeAccount(context?.["customer"]);

      try {
        const res = await request<unknown>({ path: "/surface/2/accounts/me" });
        const detailed = normalizeAccount(unwrap<unknown>(res));
        if (detailed && (detailed.email_address || detailed.id)) return detailed;
      } catch (err) {
        // Only a session that truly holds no customer clears the account, and
        // only when the session context did not say otherwise.
        if (err instanceof VendreUnauthorizedError && !fromContext) {
          setSessionAccount(null);
          return null;
        }
      }

      return fromContext;
    },
  });


  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEY });
    await queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
  }, [queryClient]);

  const refreshRelated = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
  }, [queryClient]);

  const mutation = useMutation({
    mutationFn: async (input: {
      path: string;
      method: "GET" | "POST" | "PUT" | "DELETE";
      body?: unknown;
    }) => request(input),
  });

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await mutation.mutateAsync({
        path: "/surface/2/login/email",
        method: "POST",
        // Surface v2 login expects `email` (not `email_address`).
        body: { email, password },
      });
      const authenticatedAccount = normalizeAccount(unwrap<unknown>(response));
      if (!authenticatedAccount) {
        throw new Error("The store signed in successfully but returned no customer details.");
      }
      setSessionAccount(authenticatedAccount);
      queryClient.setQueryData(ACCOUNT_QUERY_KEY, authenticatedAccount);
      // Re-read the session so the mutation-protection token and the
      // authenticated flag match the signed-in session.
      await refreshSession();
      await refreshRelated();
    },
    [mutation, queryClient, refreshRelated, refreshSession],
  );

  const logout = useCallback(async () => {
    await mutation.mutateAsync({ path: "/surface/2/logout", method: "POST", body: {} });
    setSessionAccount(null);
    queryClient.setQueryData(ACCOUNT_QUERY_KEY, null);
    await refreshSession();
    await refreshRelated();
  }, [mutation, queryClient, refreshRelated, refreshSession]);

  const register = useCallback(
    async (input: Record<string, unknown>) => {
      const response = await mutation.mutateAsync({
        path: "/surface/2/accounts",
        method: "POST",
        body: input,
      });
      const authenticatedAccount =
        normalizeAccount(unwrap<unknown>(response)) ?? normalizeAccount(input);
      setSessionAccount(authenticatedAccount);
      queryClient.setQueryData(ACCOUNT_QUERY_KEY, authenticatedAccount);
      await refreshSession();
      await refreshRelated();
    },
    [mutation, queryClient, refreshRelated, refreshSession],
  );



  const currentAccount = accountQuery.data ?? sessionAccount;

  const updateProfile = useCallback(
    async (input: Record<string, unknown>) => {
      // Surface requires the full profile shape on PUT.
      const body: Record<string, unknown> = {
        gender: currentAccount?.gender ?? "m",
        state: currentAccount?.state ?? "",
        country: currentAccount?.country ?? 203,
        ...input,
      };
      await mutation.mutateAsync({
        path: "/surface/2/accounts/me",
        method: "PUT",
        body,
      });
      await refresh();
    },
    [currentAccount, mutation, refresh],
  );


  const forgotPassword = useCallback(
    async (email: string) => {
      await mutation.mutateAsync({
        path: `/surface/2/accounts/me/forgot-password?email_address=${encodeURIComponent(email)}`,
        method: "GET",
      });
    },
    [mutation],
  );

  const account = currentAccount;

  const value = useMemo<AccountContextValue>(
    () => ({
      account,
      isAuthenticated: isLoggedIn(account),
      isLoading: !ready || accountQuery.isLoading,
      isResolved: ready && accountQuery.isFetched,
      refresh,
      login,
      logout,
      register,
      updateProfile,
      forgotPassword,
      isMutating: mutation.isPending,
    }),
    [
      account,
      ready,
      accountQuery.isFetched,
      accountQuery.isLoading,
      refresh,
      login,
      logout,
      register,
      updateProfile,
      forgotPassword,
      mutation.isPending,
    ],
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used inside <AccountProvider>");
  return ctx;
}

function pickValue(obj: Record<string, any>, keys: string[]) {
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return null;
}

/** Surface stores vary in key naming across versions — normalize to one shape. */
function normalizeOrder(raw: unknown): OrderSummary & Record<string, any> {
  const r = (raw ?? {}) as Record<string, any>;
  return {
    ...r,
    id: pickValue(r, ["id", "order_id", "orders_id", "number", "order_number"]),
    order_number: pickValue(r, ["order_number", "number", "reference", "id"]),
    date_purchased: pickValue(r, [
      "date_purchased",
      "created_at",
      "date",
      "order_date",
      "purchase_date",
    ]),
    status: pickValue(r, ["status", "order_status", "status_name", "state"]),
    total: pickValue(r, ["total", "total_text", "grand_total", "sum", "total_price"]),
  };
}

function orderList(payload: unknown): Array<OrderSummary & Record<string, any>> {
  const data = unwrap<unknown>(payload);
  const candidates: unknown[] = [data];
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    for (const key of ["orders", "order_history", "items", "list", "results", "data"]) {
      if (Array.isArray(obj[key])) candidates.push(obj[key]);
    }
  }
  const list = candidates.find((c) => Array.isArray(c)) as unknown[] | undefined;
  return (list ?? []).map((entry, index) => {
    const order = normalizeOrder(entry);
    // Never drop a row just because the store names its id differently.
    return order.id === null ? { ...order, id: String(index) } : order;
  });
}

/** Order history — never cached client-side. */
export function useOrderHistory(enabled: boolean) {
  const { request } = useVendre();
  return useQuery({
    queryKey: ORDERS_QUERY_KEY,
    enabled,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnMount: "always",
    queryFn: async () => {
      const res = await request<unknown>({
        path: "/surface/2/accounts/me/order-history",
      });
      return orderList(res);
    },
  });
}

export function useOrderDetail(id: string, enabled: boolean) {
  const { request } = useVendre();
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, id],
    enabled,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnMount: "always",
    queryFn: async () => {
      const res = await request<unknown>({
        path: `/surface/2/accounts/me/order-history/${encodeURIComponent(id)}`,
      });
      const data = unwrap<any>(res);
      const order = normalizeOrder(
        data && typeof data === "object" && data.order ? data.order : data,
      );
      const products =
        order["products"] ?? order["items"] ?? order["order_products"] ?? [];
      return {
        ...order,
        products: Array.isArray(products) ? products : [],
        totals: Array.isArray(order["totals"]) ? order["totals"] : [],
        delivery_address:
          order["delivery_address"] ?? order["shipping_address"] ?? null,
        billing_address: order["billing_address"] ?? order["invoice_address"] ?? null,
      } as OrderDetail;
    },
  });
}


export type AddressEntry = Record<string, unknown> & {
  id?: number | string;
  is_default?: boolean;
  default?: boolean;
  primary?: boolean;
  type?: string;
};

export const ADDRESSES_QUERY_KEY = ["vendre", "account", "addresses"] as const;
export const ACCOUNT_USERS_QUERY_KEY = ["vendre", "account", "users"] as const;

function toList(payload: unknown): Record<string, unknown>[] {
  const data = unwrap<unknown>(payload);
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["addresses", "items", "list", "users", "accounts", "results"]) {
      const value = obj[key];
      if (Array.isArray(value)) return value as Record<string, unknown>[];
    }
    // Object keyed by address type/id → treat values as entries.
    const values = Object.values(obj).filter(
      (v) => v && typeof v === "object" && !Array.isArray(v),
    ) as Record<string, unknown>[];
    if (values.length > 0) return values;
  }
  return [];
}

/** Address book — never cached client-side. */
export function useAddresses(enabled: boolean) {
  const { request } = useVendre();
  return useQuery({
    queryKey: ADDRESSES_QUERY_KEY,
    enabled,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnMount: "always",
    queryFn: async () => {
      const res = await request<unknown>({
        path: "/surface/2/accounts/me/addresses",
      });
      const raw = unwrap<unknown>(res);
      const list = toList(res) as AddressEntry[];
      return { list, raw };
    },
  });
}

/** Users linked to the account — never cached client-side. */
export function useAccountUsers(enabled: boolean) {
  const { request } = useVendre();
  return useQuery({
    queryKey: ACCOUNT_USERS_QUERY_KEY,
    enabled,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    queryFn: async () => {
      try {
        const res = await request<unknown>({ path: "/surface/2/accounts/me/users" });
        return toList(res);
      } catch {
        // Store does not expose linked users.
        return null;
      }
    },
  });
}

