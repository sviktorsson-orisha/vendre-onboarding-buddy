/**
 * Customer auth + account adapter (Surface v2).
 *
 * Same demo/live split as src/lib/vendre/api.ts:
 *   demo -> src/mock/vendreAccount.ts
 *   live -> /surface/2/accounts*, login/email, logout
 *
 * Rules from .vendre/knowledge/api-reference.md and .vendre/skills/account-auth.md:
 * - Auth state comes from GET session/context, never from the login response alone.
 * - The mutation token is replaced after login/logout and customer queries invalidated.
 * - Surface-Mutation-Protection-Token on every mutation, including GET forgot-password.
 * - Account data and order history are never cached (staleTime: 0, gcTime: 0).
 * - accounts/me is normalised from flat / nested / alias shapes before use.
 */
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useOnboarding } from "@/context/onboarding-context";
import {
  mockAccount,
  mockAddresses,
  mockOrderDetails,
  mockOrders,
  mockSubUsers,
} from "@/mock/vendreAccount";
import type {
  Account,
  Address,
  FieldErrors,
  OrderDetail,
  OrderSummary,
  RegisterInput,
  SubUser,
} from "@/types/vendre-account";
import type { SessionContext } from "@/types/vendre";

import { guarded, resetSessionGate } from "./api";
import { setMutationProtectionToken, surfaceFetch } from "./client";

/* ------------------------------------------------------------- errors ---- */

export class VendreAccountError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields: FieldErrors = {},
  ) {
    super(message);
    this.name = "VendreAccountError";
  }
}

type SurfaceErrors = {
  errors?: { code?: string; title?: string; status?: string; source?: { parameter?: string } }[];
};

async function call<T>(path: string, init: RequestInit & { method?: string } = {}): Promise<T> {
  const res = await surfaceFetch(path, init);
  const body = (await res.json().catch(() => null)) as (T & SurfaceErrors) | null;

  if (!res.ok) {
    const fields: FieldErrors = {};
    for (const error of body?.errors ?? []) {
      const parameter = error.source?.parameter;
      if (parameter && error.title) fields[parameter] = error.title;
    }
    const first = body?.errors?.[0];
    throw new VendreAccountError(
      first?.title ?? `Surface-anrop misslyckades (${res.status})`,
      res.status,
      fields,
    );
  }

  return body as T;
}

/* -------------------------------------------------------- normalising ---- */

type Bag = Record<string, unknown>;

function isBag(value: unknown): value is Bag {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Flattens the account payload across the flat / nested response shapes. */
function flatten(payload: unknown): Bag {
  if (!isBag(payload)) return {};
  const out: Bag = { ...payload };
  for (const key of ["account", "customer", "address", "data", "attributes"]) {
    const nested = payload[key];
    if (isBag(nested)) Object.assign(out, flatten(nested));
  }
  return out;
}

function pick(bag: Bag, keys: string[]): string {
  for (const key of keys) {
    const value = bag[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  return "";
}

export function normalizeAccount(payload: unknown): Account {
  const bag = flatten(payload);
  return {
    firstname: pick(bag, ["firstname", "first_name", "given_name"]),
    lastname: pick(bag, ["lastname", "last_name", "family_name"]),
    email: pick(bag, ["email", "email_address"]),
    telephone: pick(bag, ["telephone", "phone"]),
    mobile: pick(bag, ["mobile", "cellphone", "phone_mobile"]),
    company: pick(bag, ["company", "company_name"]),
    street_address: pick(bag, ["street_address", "street", "address", "address_1"]),
    postcode: pick(bag, ["postcode", "zip", "postal_code", "zipcode"]),
    city: pick(bag, ["city", "town"]),
    country: pick(bag, ["country", "country_code"]),
    personnummer: pick(bag, ["personnummer", "social_security_number"]),
    vat_identification_number: pick(bag, ["vat_identification_number", "vat_number", "vat"]),
    type: pick(bag, ["type", "customer_type"]) || "private",
    newsletter: Boolean(bag["newsletter"]),
    raw: bag,
  };
}

function normalizeAddress(payload: unknown, index: number): Address {
  const bag = flatten(payload);
  const account = normalizeAccount(payload);
  return {
    id: (bag["id"] as string | number) ?? index,
    label: pick(bag, ["label", "name", "type"]) || `Adress ${index + 1}`,
    firstname: account.firstname,
    lastname: account.lastname,
    company: account.company,
    street_address: account.street_address,
    postcode: account.postcode,
    city: account.city,
    country: account.country,
    telephone: account.telephone || account.mobile,
    is_default_shipping: Boolean(bag["is_default_shipping"] ?? bag["default_shipping"]),
    is_default_billing: Boolean(bag["is_default_billing"] ?? bag["default_billing"]),
    raw: bag,
  };
}

function asArray(payload: unknown, ...keys: string[]): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (isBag(payload)) {
    for (const key of keys) {
      const value = payload[key];
      if (Array.isArray(value)) return value;
    }
  }
  return [];
}

function normalizeOrder(payload: unknown, index: number): OrderSummary {
  const bag = flatten(payload);
  return {
    id: (bag["id"] as string | number) ?? index,
    order_number: pick(bag, ["order_number", "orders_id", "number", "id"]),
    date: pick(bag, ["date", "date_purchased", "created_at", "order_date"]),
    status: pick(bag, ["status", "order_status", "state"]),
    total: pick(bag, ["total", "order_total", "grand_total", "sum"]),
  };
}

function normalizeOrderDetail(payload: unknown, id: string): OrderDetail {
  const bag = flatten(payload);
  const summary = normalizeOrder(payload, 0);
  const lines = asArray(bag["products"] ?? bag["lines"] ?? bag["items"]).map((line, index) => {
    const lineBag = flatten(line);
    return {
      id: (lineBag["id"] as string | number) ?? index,
      name: pick(lineBag, ["name", "title", "product_name"]),
      quantity: Number(lineBag["quantity"] ?? lineBag["qty"] ?? 1),
      price: pick(lineBag, ["price", "total", "row_total", "final_price"]),
    };
  });
  return {
    ...summary,
    id: summary.id || id,
    order_number: summary.order_number || id,
    lines,
    shipping_total: pick(bag, ["shipping_total", "shipping"]),
    tax_total: pick(bag, ["tax_total", "tax"]),
    shipping_address: bag["shipping_address"]
      ? normalizeAddress(bag["shipping_address"], 0)
      : null,
    billing_address: bag["billing_address"] ? normalizeAddress(bag["billing_address"], 1) : null,
  };
}

function normalizeSubUser(payload: unknown, index: number): SubUser {
  const bag = flatten(payload);
  const account = normalizeAccount(payload);
  return {
    id: (bag["id"] as string | number) ?? index,
    name: [account.firstname, account.lastname].filter(Boolean).join(" ") || pick(bag, ["name"]),
    email: account.email,
    role: pick(bag, ["role", "type", "permission"]),
  };
}

/* ------------------------------------------------------------- adapter --- */

export type AccountApi = {
  mode: "demo" | "live";
  getSession: () => Promise<{ authenticated: boolean; name: string }>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  getAccount: () => Promise<Account>;
  updateAccount: (account: Account) => Promise<void>;
  getAddresses: () => Promise<Address[]>;
  updateAddress: (address: Address) => Promise<void>;
  getOrders: () => Promise<OrderSummary[]>;
  getOrder: (id: string) => Promise<OrderDetail | null>;
  getSubUsers: () => Promise<SubUser[]>;
};

const liveAccountApi: AccountApi = {
  mode: "live",
  getSession: async () => {
    const context = await guarded(() => call<SessionContext>("session/context"));
    const name = [context.customer?.first_name, context.customer?.last_name]
      .filter(Boolean)
      .join(" ");
    return { authenticated: Boolean(context.authenticated), name };
  },
  login: async (email, password) => {
    const data = await guarded(() =>
      call<{ mutationProtectionToken?: string }>("login/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      }),
    );
    if (data?.mutationProtectionToken) setMutationProtectionToken(data.mutationProtectionToken);
  },
  logout: async () => {
    const data = await guarded(() =>
      call<{ mutationProtectionToken?: string }>("logout", { method: "POST" }),
    );
    if (data?.mutationProtectionToken) setMutationProtectionToken(data.mutationProtectionToken);
    else resetSessionGate();
  },
  register: async (input) => {
    await guarded(() =>
      call("accounts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(buildRegisterBody(input)),
      }),
    );
  },
  forgotPassword: async (email) => {
    await guarded(() =>
      call(`accounts/me/forgot-password?email=${encodeURIComponent(email)}`),
    );
  },
  getAccount: () => guarded(() => call<unknown>("accounts/me")).then(normalizeAccount),
  updateAccount: async (account) => {
    // Write back with the store's canonical keys when we know them.
    const body: Record<string, unknown> = {};
    const map: [keyof Account, string[]][] = [
      ["firstname", ["firstname", "first_name"]],
      ["lastname", ["lastname", "last_name"]],
      ["email", ["email", "email_address"]],
      ["telephone", ["telephone", "phone"]],
      ["mobile", ["mobile"]],
      ["company", ["company"]],
      ["street_address", ["street_address", "street"]],
      ["postcode", ["postcode", "zip"]],
      ["city", ["city"]],
      ["country", ["country"]],
      ["personnummer", ["personnummer"]],
      ["vat_identification_number", ["vat_identification_number"]],
      ["newsletter", ["newsletter"]],
    ];
    for (const [field, keys] of map) {
      const key = keys.find((candidate) => candidate in account.raw) ?? keys[0]!;
      body[key] = account[field];
    }
    await guarded(() =>
      call("accounts/me", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
    );
  },
  getAddresses: () =>
    guarded(() => call<unknown>("accounts/me/addresses")).then((data) =>
      asArray(data, "addresses", "address_list", "data").map(normalizeAddress),
    ),
  updateAddress: async (address) => {
    await guarded(() =>
      call("accounts/me/addresses", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: address.id,
          firstname: address.firstname,
          lastname: address.lastname,
          company: address.company,
          street_address: address.street_address,
          postcode: address.postcode,
          city: address.city,
          country: address.country,
          telephone: address.telephone,
        }),
      }),
    );
  },
  getOrders: () =>
    guarded(() => call<unknown>("accounts/me/order-history")).then((data) =>
      asArray(data, "orders", "order_history", "data").map(normalizeOrder),
    ),
  getOrder: (id) =>
    guarded(() => call<unknown>(`accounts/me/order-history/${id}`)).then((data) =>
      normalizeOrderDetail(data, id),
    ),
  getSubUsers: () =>
    guarded(() => call<unknown>("accounts/me/users"))
      .then((data) => asArray(data, "users", "data").map(normalizeSubUser))
      .catch(() => []),
};

/* ---------------------------------------------------------------- demo --- */

let demoAuthenticated = false;
let demoAccount: Account = { ...mockAccount };
let demoAddresses: Address[] = mockAddresses.map((address) => ({ ...address }));
const demoListeners = new Set<() => void>();

function emitDemo() {
  for (const listener of demoListeners) listener();
}

export function useDemoAuthenticated() {
  return useSyncExternalStore(
    (listener) => {
      demoListeners.add(listener);
      return () => demoListeners.delete(listener);
    },
    () => demoAuthenticated,
    () => false,
  );
}

const demoAccountApi: AccountApi = {
  mode: "demo",
  getSession: async () => ({
    authenticated: demoAuthenticated,
    name: `${demoAccount.firstname} ${demoAccount.lastname}`.trim(),
  }),
  login: async () => {
    demoAuthenticated = true;
    emitDemo();
  },
  logout: async () => {
    demoAuthenticated = false;
    emitDemo();
  },
  register: async (input) => {
    demoAccount = {
      ...demoAccount,
      firstname: input.firstname,
      lastname: input.lastname,
      email: input.email_address,
      company: input.company,
      street_address: input.street_address,
      postcode: input.postcode,
      city: input.city,
      country: input.country,
      telephone: input.telephone,
      mobile: input.mobile,
      newsletter: input.newsletter,
      type: input.type,
    };
    demoAuthenticated = true;
    emitDemo();
  },
  forgotPassword: async () => {},
  getAccount: async () => demoAccount,
  updateAccount: async (account) => {
    demoAccount = { ...account };
    emitDemo();
  },
  getAddresses: async () => demoAddresses,
  updateAddress: async (address) => {
    demoAddresses = demoAddresses.map((item) => (item.id === address.id ? address : item));
    emitDemo();
  },
  getOrders: async () => mockOrders,
  getOrder: async (id) => mockOrderDetails[id] ?? null,
  getSubUsers: async () => mockSubUsers,
};

/* --------------------------------------------------------------- hooks --- */

export function useAccountApi(): AccountApi {
  const { isConfigured } = useOnboarding();
  return useMemo(() => (isConfigured ? liveAccountApi : demoAccountApi), [isConfigured]);
}

const NO_CACHE = { staleTime: 0, gcTime: 0 } as const;

export function useAuth() {
  const api = useAccountApi();
  const demoAuth = useDemoAuthenticated();
  const query = useQuery({
    queryKey: ["vendre", api.mode, "auth", api.mode === "demo" ? demoAuth : null],
    queryFn: () => api.getSession(),
    ...NO_CACHE,
  });

  return {
    mode: api.mode,
    isLoading: query.isLoading,
    isAuthenticated: query.data?.authenticated ?? false,
    name: query.data?.name ?? "",
  };
}

export function useAccountMutations() {
  const api = useAccountApi();
  const queryClient = useQueryClient();

  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["vendre", api.mode] });
  }, [api.mode, queryClient]);

  const login = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.login(email, password),
    onSuccess: invalidate,
  });

  const logout = useMutation({
    mutationFn: () => api.logout(),
    onSuccess: invalidate,
  });

  const register = useMutation({
    mutationFn: (input: RegisterInput) => api.register(input),
    onSuccess: invalidate,
  });

  const forgotPassword = useMutation({
    mutationFn: (email: string) => api.forgotPassword(email),
  });

  const updateAccount = useMutation({
    mutationFn: (account: Account) => api.updateAccount(account),
    onSuccess: invalidate,
  });

  const updateAddress = useMutation({
    mutationFn: (address: Address) => api.updateAddress(address),
    onSuccess: invalidate,
  });

  return { login, logout, register, forgotPassword, updateAccount, updateAddress };
}

export function useAccount(enabled = true) {
  const api = useAccountApi();
  return useQuery({
    queryKey: ["vendre", api.mode, "account"],
    queryFn: () => api.getAccount(),
    enabled,
    ...NO_CACHE,
  });
}

export function useAddresses(enabled = true) {
  const api = useAccountApi();
  return useQuery({
    queryKey: ["vendre", api.mode, "addresses"],
    queryFn: () => api.getAddresses(),
    enabled,
    ...NO_CACHE,
  });
}

export function useOrders(enabled = true) {
  const api = useAccountApi();
  return useQuery({
    queryKey: ["vendre", api.mode, "orders"],
    queryFn: () => api.getOrders(),
    enabled,
    ...NO_CACHE,
  });
}

export function useOrder(id: string | null) {
  const api = useAccountApi();
  return useQuery({
    queryKey: ["vendre", api.mode, "order", id],
    queryFn: () => (id ? api.getOrder(id) : Promise.resolve(null)),
    enabled: Boolean(id),
    ...NO_CACHE,
  });
}

export function useSubUsers(enabled = true) {
  const api = useAccountApi();
  return useQuery({
    queryKey: ["vendre", api.mode, "sub-users"],
    queryFn: () => api.getSubUsers(),
    enabled,
    ...NO_CACHE,
  });
}
