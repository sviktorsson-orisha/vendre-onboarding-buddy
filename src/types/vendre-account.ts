/**
 * Customer account types for Vendre Surface v2.
 *
 * GET /surface/2/accounts/me has no single fixed shape: fields can be flat,
 * nested under account/customer/address/data, and use alias keys
 * (email/email_address, phone/telephone/mobile, zip/postcode,
 * street/street_address). Everything is normalised into `Account` below,
 * while `raw` keeps the store's canonical keys for write-back.
 */

export type Account = {
  firstname: string;
  lastname: string;
  email: string;
  telephone: string;
  mobile: string;
  company: string;
  street_address: string;
  postcode: string;
  city: string;
  country: string;
  personnummer: string;
  vat_identification_number: string;
  type: string;
  newsletter: boolean;
  /** The untouched payload from the store, used to write back canonical keys. */
  raw: Record<string, unknown>;
};

export type Address = {
  id: string | number;
  label: string;
  firstname: string;
  lastname: string;
  company: string;
  street_address: string;
  postcode: string;
  city: string;
  country: string;
  telephone: string;
  is_default_shipping?: boolean;
  is_default_billing?: boolean;
  raw?: Record<string, unknown>;
};

export type OrderLine = {
  id: string | number;
  name: string;
  quantity: number;
  price: string;
  /** Raw image path from the store, resolved against the store base URL when rendered. */
  image?: string | null;
};

/** A total row exactly as the store labels it (`{ title, value }`). */
export type OrderTotal = {
  title: string;
  value: string;
};

export type OrderSummary = {
  id: string | number;
  order_number: string;
  date: string;
  status: string;
  total: string;
};

export type OrderDetail = OrderSummary & {
  lines: OrderLine[];
  /** Totals exactly as the store returns them; never computed in the frontend. */
  totals: OrderTotal[];
  shipping_address?: Address | null;
  billing_address?: Address | null;
  shipping_total?: string;
  tax_total?: string;
};

export type SubUser = {
  id: string | number;
  name: string;
  email: string;
  role: string;
};

export type RegisterInput = {
  firstname: string;
  lastname: string;
  email_address: string;
  password: string;
  confirmation: string;
  /** UI-only toggle between private/company — not sent to the store. */
  type: string;
  gender: string;
  company?: string;
  street_address: string;
  postcode: string;
  city: string;
  state: string;
  /** Numeric country id expected by the store (SE = 203). */
  country: number;
  telephone: string;
  mobile?: string;
  personnummer: string;
  vat_identification_number?: string;
  newsletter: boolean;
  consent_personal_data_policy: boolean;
};

/** Field-level validation errors keyed by `source.parameter`. */
export type FieldErrors = Record<string, string>;
