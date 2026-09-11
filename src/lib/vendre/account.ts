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
  AddressBook,
  FieldErrors,
  OrderDetail,
  OrderSummary,
  RegisterInput,
  SubUser,
} from "@/types/vendre-account";
import type { SessionContext } from "@/types/vendre";

import { guarded, resetSessionGate, useSessionContext } from "./api";
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
  for (const key of ["account", "customer", "address", "data", "attributes", "order"]) {
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
    label: pick(bag, ["label", "name", "type"]),
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

const ADDRESS_LIST_KEYS = [
  "addresses",
  "address_book",
  "addressbook",
  "address_list",
  "items",
  "entries",
  "results",
  "rows",
  "data",
];

function looksLikeAddress(value: unknown): boolean {
  if (!isBag(value)) return false;
  const bag = flatten(value);
  return ["street_address", "street", "postcode", "zip", "city", "address_1"].some(
    (key) => typeof bag[key] === "string" && (bag[key] as string).trim(),
  );
}

/**
 * The address book comes back as an array, as an object wrapping one of many
 * list keys (sometimes one level deeper), or as an object keyed by address id.
 */
function extractAddressList(payload: unknown, depth = 0): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isBag(payload) || depth > 2) return [];

  for (const key of ADDRESS_LIST_KEYS) {
    const value = payload[key];
    if (Array.isArray(value)) return value;
    if (isBag(value)) {
      const nested = extractAddressList(value, depth + 1);
      if (nested.length) return nested;
    }
  }

  // Object keyed by id: { "12": {...}, "13": {...} }
  const values = Object.values(payload);
  if (values.length && values.every(looksLikeAddress)) return values;

  // Single address object returned bare.
  if (looksLikeAddress(payload)) return [payload];

  for (const value of values) {
    if (isBag(value) || Array.isArray(value)) {
      const nested = extractAddressList(value, depth + 1);
      if (nested.length) return nested;
    }
  }

  return [];
}

function dedupeAddresses(list: Address[]): Address[] {
  const seen = new Set<string>();
  return list.filter((address) => {
    const key = [
      address.id,
      address.street_address,
      address.postcode,
      address.city,
    ]
      .join("|")
      .toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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

/** Pulls an image path out of the many shapes a store can use on an order line. */
function pickLineImage(bag: Bag): string | null {
  const direct = pick(bag, ["image", "image_url", "thumbnail", "thumb", "picture", "photo"]);
  if (direct) return direct;
  for (const key of ["image", "images", "media"]) {
    const value = bag[key];
    if (isBag(value)) {
      const nested = pick(value, ["image", "path", "url", "src"]);
      if (nested) return nested;
    }
    if (Array.isArray(value) && value.length > 0) {
      const first = value[0];
      if (typeof first === "string" && first.trim()) return first;
      if (isBag(first)) {
        const nested = pick(first, ["image", "path", "url", "src"]);
        if (nested) return nested;
      }
    }
  }
  return null;
}

/** Total rows come either as a `totals` array or as single fields on the order. */
function normalizeTotals(bag: Bag): { title: string; value: string }[] {
  const raw = asArray(bag["totals"] ?? bag["order_totals"] ?? bag["summary"]);
  return raw
    .map((entry) => {
      const totalBag = flatten(entry);
      return {
        title: pick(totalBag, ["title", "label", "name", "text"]),
        value: pick(totalBag, ["text", "value", "value_formatted", "amount", "total"]),
      };
    })
    .filter((row) => row.title || row.value);
}

/**
 * Order lines only carry raw numbers (`price_each` / `price_total`, excl. VAT)
 * while the totals rows are pre-formatted by the store. Reuse a total row as the
 * formatting sample so line prices look like the rest of the order.
 */
function moneyFormatter(sample: string) {
  const trimmed = (sample ?? "").trim();
  const match = /^([^\d\s-]*)\s*[-\d\s.,\u00a0]+\s*([^\d\s]*)$/.exec(trimmed);
  const prefix = match?.[1] ?? "";
  const suffix = match?.[2] ?? "";
  // Follow the store's own rounding: if the totals are shown without decimals,
  // the line prices must be too, otherwise the rows and the total look
  // inconsistent (e.g. "399,20 kr" rows under a "752 kr" total).
  const decimals = /[.,](\d+)\s*[^\d]*$/.exec(trimmed)?.[1]?.length ?? 0;
  return (value: number) => {
    const number = new Intl.NumberFormat("sv-SE", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
    return [prefix, number, suffix].filter(Boolean).join(prefix && !suffix ? "" : " ").trim();
  };
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/\s|\u00a0/g, "").replace(",", "."));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function normalizeOrderDetail(payload: unknown, id: string): OrderDetail {
  const bag = flatten(payload);
  const summary = normalizeOrder(payload, 0);
  const totals = normalizeTotals(bag);
  const format = moneyFormatter(totals[totals.length - 1]?.value ?? summary.total ?? "");
  const lines = asArray(
    bag["products"] ?? bag["order_products"] ?? bag["lines"] ?? bag["items"] ?? bag["rows"],
  ).map((line, index) => {
    const lineBag = flatten(line);
    const quantity = Number(lineBag["quantity"] ?? lineBag["qty"] ?? 1);
    const formatted = pick(lineBag, [
      "total_final_price",
      "final_price",
      "row_total",
      "total",
      "price",
    ]);
    const each = toNumber(lineBag["price_each"]);
    const rowExcl = toNumber(lineBag["price_total"]) ?? (each != null ? each * quantity : null);
    const tax = toNumber(lineBag["tax"]) ?? 0;
    const rowIncl = rowExcl != null ? rowExcl * (1 + tax / 100) : null;
    return {
      id: (lineBag["id"] as string | number) ?? index,
      product_id: toNumber(lineBag["product_id"]),
      name: pick(lineBag, ["name", "product_name", "title", "model"]),
      quantity,
      price: rowIncl != null ? format(rowIncl) : formatted,
      price_incl: rowIncl != null ? format(rowIncl) : formatted,
      price_excl: rowExcl != null ? format(rowExcl) : "",
      image: pickLineImage(lineBag),
    };
  });
  return {
    ...summary,
    id: summary.id || id,
    order_number: summary.order_number || id,
    lines,
    totals,
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

/**
 * Order lines have no image at all — only `product_id`. Look the images up in a
 * single VQL call. A failure here must never break the order view.
 */
async function withLineImages(lines: OrderDetail["lines"]): Promise<OrderDetail["lines"]> {
  const ids = Array.from(
    new Set(lines.map((line) => line.product_id).filter((id): id is number => !!id)),
  );
  if (ids.length === 0) return lines;
  try {
    const data = await guarded(() =>
      call<{ query?: { products?: { id: number; image?: { href?: string | null } | null }[] } }>(
        "vql",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            query: {
              products: {
                filters: { where: { id: ids } },
                fields: ["id", { image: { fields: ["id", "name", "href"] } }],
              },
            },
          }),
        },
      ),
    );
    const byId = new Map<number, string | null>(
      (data?.query?.products ?? []).map((product) => [product.id, product.image?.href ?? null]),
    );
    return lines.map((line) =>
      line.image || !line.product_id
        ? line
        : { ...line, image: byId.get(line.product_id) ?? null },
    );
  } catch {
    return lines;
  }
}

/* ------------------------------------------------------- register body --- */

/** Numeric country ids used by the store (ISO 3166-1 numeric). */
export const COUNTRY_IDS: Record<string, number> = {
  SE: 203,
  NO: 161,
  DK: 59,
  FI: 73,
  DE: 81,
};

/** Country choices shared by the register and the edit-account forms. */
export const COUNTRY_OPTIONS: { id: number; label: string }[] = [
  { id: 203, label: "Sverige" },
  { id: 161, label: "Norge" },
  { id: 59, label: "Danmark" },
  { id: 73, label: "Finland" },
  { id: 81, label: "Tyskland" },
];

function countryId(value: string | number | null | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const raw = String(value ?? "").trim();
  if (/^\d+$/.test(raw)) return Number(raw);
  return COUNTRY_IDS[raw.toUpperCase()] ?? COUNTRY_IDS["SE"]!;
}

/**
 * Maps the registration form to the exact payload the store accepts: the
 * required field set from the API reference, plus the consent flag.
 */
export function buildRegisterBody(input: RegisterInput): Record<string, unknown> {
  return {
    email_address: input.email_address.trim(),
    password: input.password,
    confirmation: input.confirmation,
    firstname: input.firstname.trim(),
    lastname: input.lastname.trim(),
    street_address: input.street_address.trim(),
    postcode: input.postcode.trim(),
    city: input.city.trim(),
    country: countryId(input.country),
    consent_personal_data_policy: Boolean(input.consent_personal_data_policy),
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
  getAddresses: () => Promise<AddressBook>;
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
    // Only the field set the edit form exposes — the same fields registration
    // requires, minus password/confirmation. Write back with the store's
    // canonical keys when we know them.
    const body: Record<string, unknown> = {};
    const map: [keyof Account, string[]][] = [
      ["firstname", ["firstname", "first_name"]],
      ["lastname", ["lastname", "last_name"]],
      ["email", ["email_address", "email"]],
      ["street_address", ["street_address", "street"]],
      ["postcode", ["postcode", "zip"]],
      ["city", ["city"]],
    ];
    for (const [field, keys] of map) {
      const key = keys.find((candidate) => candidate in account.raw) ?? keys[0]!;
      body[key] = account[field];
    }
    body["country"] = countryId(account.country);
    await guarded(() =>
      call("accounts/me", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
    );
  },
  getAddresses: async () => {
    /** Fetches one candidate endpoint, logging the raw shape in dev. */
    const probe = async (path: string): Promise<Address[]> => {
      try {
        const data = await guarded(() => call<unknown>(path));
        if (import.meta.env.DEV) {
          console.debug(`[vendre] ${path} raw response`, data);
        }
        return dedupeAddresses(extractAddressList(data).map(normalizeAddress));
      } catch (error) {
        if (import.meta.env.DEV) {
          console.debug(`[vendre] ${path} failed`, error);
        }
        return [];
      }
    };

    // `accounts/me/addresses` holds the customer's main address; the address
    // book holds the alternative addresses. Keep them apart.
    const [main, alternatives] = await Promise.all([
      probe("accounts/me/addresses"),
      probe("accounts/me/address-book"),
    ]);
    return { main: main[0] ?? null, alternatives };
  },


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
  getOrder: async (id) => {
    const data = await guarded(() => call<unknown>(`accounts/me/order-history/${id}`));
    const order = normalizeOrderDetail(data, id);
    return { ...order, lines: await withLineImages(order.lines) };
  },
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
      street_address: input.street_address,
      postcode: input.postcode,
      city: input.city,
      country: String(input.country),
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
  getAddresses: async () => ({
    main: demoAddresses[0] ?? null,
    alternatives: demoAddresses.slice(1),
  }),
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

  // Live mode reads the session that the storefront already fetches, so a page
  // load makes one GET session/context call instead of two identical ones.
  const session = useSessionContext();
  const demoQuery = useQuery({
    queryKey: ["vendre", "demo", "auth", demoAuth],
    queryFn: () => demoAccountApi.getSession(),
    enabled: api.mode === "demo",
    ...NO_CACHE,
  });

  if (api.mode === "demo") {
    return {
      mode: api.mode,
      isLoading: demoQuery.isLoading,
      isAuthenticated: demoQuery.data?.authenticated ?? false,
      name: demoQuery.data?.name ?? "",
    };
  }

  const customer = session.data?.customer;
  return {
    mode: api.mode,
    isLoading: session.isLoading,
    isAuthenticated: Boolean(session.data?.authenticated),
    name: [customer?.first_name, customer?.last_name].filter(Boolean).join(" "),
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
