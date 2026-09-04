/** Demo-mode account data, shaped like real Surface v2 responses. */
import type { Account, Address, OrderDetail, OrderSummary, SubUser } from "@/types/vendre-account";

export const mockAccount: Account = {
  firstname: "Anna",
  lastname: "Andersson",
  email: "anna.andersson@example.com",
  telephone: "08-123 45 67",
  mobile: "070-123 45 67",
  company: "Andersson Design AB",
  street_address: "Storgatan 12",
  postcode: "114 51",
  city: "Stockholm",
  country: "SE",
  personnummer: "",
  vat_identification_number: "SE556677889901",
  type: "company",
  newsletter: true,
  raw: {},
};

export const mockAddresses: Address[] = [
  {
    id: 1,
    label: "Leveransadress",
    firstname: "Anna",
    lastname: "Andersson",
    company: "Andersson Design AB",
    street_address: "Storgatan 12",
    postcode: "114 51",
    city: "Stockholm",
    country: "SE",
    telephone: "070-123 45 67",
    is_default_shipping: true,
  },
  {
    id: 2,
    label: "Fakturaadress",
    firstname: "Anna",
    lastname: "Andersson",
    company: "Andersson Design AB",
    street_address: "Box 4711",
    postcode: "114 52",
    city: "Stockholm",
    country: "SE",
    telephone: "08-123 45 67",
    is_default_billing: true,
  },
];

export const mockOrders: OrderSummary[] = [
  {
    id: 10241,
    order_number: "10241",
    date: "2026-08-12",
    status: "Levererad",
    total: "1 498 kr",
  },
  {
    id: 10198,
    order_number: "10198",
    date: "2026-06-03",
    status: "Behandlas",
    total: "749 kr",
  },
];

export const mockOrderDetails: Record<string, OrderDetail> = {
  "10241": {
    ...mockOrders[0]!,
    lines: [
      { id: 1, name: "Klassisk T-shirt", quantity: 2, price: "598 kr", image: null },
      { id: 2, name: "Canvasväska", quantity: 1, price: "900 kr", image: null },
    ],
    totals: [
      { title: "Delsumma", value: "1 498 kr" },
      { title: "Frakt", value: "0 kr" },
      { title: "Varav moms", value: "299 kr" },
      { title: "Summa", value: "1 498 kr" },
    ],
    shipping_total: "0 kr",
    tax_total: "299 kr",
    shipping_address: mockAddresses[0]!,
    billing_address: mockAddresses[1]!,
  },
  "10198": {
    ...mockOrders[1]!,
    lines: [{ id: 1, name: "Stickad tröja", quantity: 1, price: "749 kr", image: null }],
    totals: [
      { title: "Delsumma", value: "700 kr" },
      { title: "Frakt", value: "49 kr" },
      { title: "Varav moms", value: "150 kr" },
      { title: "Summa", value: "749 kr" },
    ],
    shipping_total: "49 kr",
    tax_total: "150 kr",
    shipping_address: mockAddresses[0]!,
    billing_address: mockAddresses[1]!,
  },
};

export const mockSubUsers: SubUser[] = [
  { id: 1, name: "Erik Eriksson", email: "erik@example.com", role: "Inköpare" },
];
