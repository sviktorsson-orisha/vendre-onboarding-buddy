import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, MapPin, Package, User, UserCog } from "lucide-react";

import { StoreImage } from "@/components/store/store-image";
import { StoreShell } from "@/components/store/store-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  useAccount,
  useAccountMutations,
  useAddresses,
  useAuth,
  useOrder,
  useOrders,
  useSubUsers,
} from "@/lib/vendre/account";
import type { Account, Address } from "@/types/vendre-account";

export type AccountView = "oversikt" | "ordrar" | "adresser" | "anvandare" | "konto";

const NAV: { view: AccountView; label: TranslationKey; icon: typeof User }[] = [
  { view: "oversikt", label: "account.overview", icon: User },
  { view: "ordrar", label: "account.orders", icon: Package },
  { view: "adresser", label: "account.addresses", icon: MapPin },
  { view: "anvandare", label: "account.users", icon: UserCog },
  { view: "konto", label: "account.profile", icon: UserCog },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="brand-heading text-xl text-foreground">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------ overview -- */

function OverviewView() {
  const { t } = useI18n();
  const { name } = useAuth();
  const { data: orders } = useOrders();
  const latest = orders?.[0];

  return (
    <Section title={t("account.greeting", { name: name || "" }).trim()}>
      <p className="text-sm text-muted-foreground">{t("account.overviewBody")}</p>
      <div className="mt-5 rounded-lg border border-border p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("account.latestOrder")}
        </p>
        {latest ? (
          <p className="mt-2 text-sm text-foreground">
            #{latest.order_number} · {latest.date} · {latest.status} · {latest.total}
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">{t("account.noOrders")}</p>
        )}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link to="/mitt-konto/$view" params={{ view: "ordrar" }}>
            {t("account.orders")}
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/mitt-konto/$view" params={{ view: "adresser" }}>
            {t("account.addresses")}
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/mitt-konto/$view" params={{ view: "konto" }}>
            {t("account.profile")}
          </Link>
        </Button>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------- orders -- */

function OrdersView() {
  const { t } = useI18n();
  const { data: orders, isLoading } = useOrders();
  const [selected, setSelected] = useState<string | null>(null);
  const { data: order } = useOrder(selected);

  if (selected && order) {
    return (
      <Section title={`${t("account.orderDetails")} #${order.order_number}`}>
        <button
          type="button"
          className="text-xs text-muted-foreground underline"
          onClick={() => setSelected(null)}
        >
          {t("account.back")}
        </button>
        {order.lines.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">{t("account.noOrderLines")}</p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="py-2">{t("account.name")}</th>
                <th className="py-2">{t("account.quantity")}</th>
                <th className="py-2 text-right">{t("account.price")}</th>
              </tr>
            </thead>
            <tbody>
              {order.lines.map((line) => (
                <tr key={line.id} className="border-b border-border/60">
                  <td className="py-2">
                    <div className="flex items-center gap-3">
                      <StoreImage
                        image={
                          line.image
                            ? {
                                id: null,
                                path: null,
                                image: line.image,
                                alt: line.name,
                                alt_translated: null,
                              }
                            : null
                        }
                        alt={line.name}
                        label={line.name}
                        className="h-12 w-12 shrink-0 rounded-md"
                      />
                      <span className="text-foreground">{line.name}</span>
                    </div>
                  </td>
                  <td className="py-2 text-muted-foreground">{line.quantity}</td>
                  <td className="py-2 text-right text-foreground">{line.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <dl className="mt-4 space-y-1 text-sm">
          {order.totals.length > 0 ? (
            order.totals.map((row, index) => (
              <div
                key={`${row.title}-${index}`}
                className={cn(
                  "flex justify-between",
                  index === order.totals.length - 1 && "font-semibold text-foreground",
                )}
              >
                <dt className="text-muted-foreground">{row.title}</dt>
                <dd>{row.value}</dd>
              </div>
            ))
          ) : (
            <>
              {order.shipping_total && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("account.shipping")}</dt>
                  <dd>{order.shipping_total}</dd>
                </div>
              )}
              {order.tax_total && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("account.tax")}</dt>
                  <dd>{order.tax_total}</dd>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <dt>{t("account.total")}</dt>
                <dd>{order.total}</dd>
              </div>
            </>
          )}
        </dl>
      </Section>
    );
  }

  return (
    <Section title={t("account.orders")}>
      {isLoading && <p className="text-sm text-muted-foreground">…</p>}
      {!isLoading && (orders?.length ?? 0) === 0 && (
        <p className="text-sm text-muted-foreground">{t("account.noOrders")}</p>
      )}
      {(orders?.length ?? 0) > 0 && (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <th className="py-2">{t("account.order")}</th>
              <th className="py-2">{t("account.date")}</th>
              <th className="py-2">{t("account.status")}</th>
              <th className="py-2 text-right">{t("account.total")}</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((row) => (
              <tr
                key={row.id}
                className="cursor-pointer border-b border-border/60 hover:bg-accent"
                onClick={() => setSelected(String(row.id))}
              >
                <td className="py-2 font-medium text-foreground">#{row.order_number}</td>
                <td className="py-2 text-muted-foreground">{row.date}</td>
                <td className="py-2 text-muted-foreground">{row.status}</td>
                <td className="py-2 text-right text-foreground">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Section>
  );
}

/* ----------------------------------------------------------- addresses -- */

function AddressCard({ address }: { address: Address }) {
  const { t } = useI18n();
  const { updateAddress } = useAccountMutations();
  const [form, setForm] = useState(address);
  const [saved, setSaved] = useState(false);

  useEffect(() => setForm(address), [address]);

  const field = (key: keyof Address, label: TranslationKey) => (
    <div className="space-y-1.5">
      <Label htmlFor={`${address.id}-${String(key)}`}>{t(label)}</Label>
      <Input
        id={`${address.id}-${String(key)}`}
        value={String(form[key] ?? "")}
        onChange={(event) => {
          setSaved(false);
          setForm((current) => ({ ...current, [key]: event.target.value }));
        }}
      />
    </div>
  );

  return (
    <form
      className="space-y-4 rounded-lg border border-border p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        await updateAddress.mutateAsync(form);
        setSaved(true);
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {address.label}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {field("firstname", "account.firstname")}
        {field("lastname", "account.lastname")}
        {field("company", "account.company")}
        {field("telephone", "account.phone")}
      </div>
      {field("street_address", "account.street")}
      <div className="grid gap-4 sm:grid-cols-3">
        {field("postcode", "account.postcode")}
        {field("city", "account.city")}
        {field("country", "account.country")}
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={updateAddress.isPending}>
          {updateAddress.isPending ? t("account.saving") : t("account.save")}
        </Button>
        {saved && <span className="text-xs text-muted-foreground">{t("account.saved")}</span>}
      </div>
    </form>
  );
}

function AddressesView() {
  const { t } = useI18n();
  const { data: addresses } = useAddresses();
  return (
    <Section title={t("account.addresses")}>
      <div className="space-y-5">
        {addresses?.map((address) => <AddressCard key={address.id} address={address} />)}
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------- users -- */

function UsersView() {
  const { t } = useI18n();
  const { data: users } = useSubUsers();
  return (
    <Section title={t("account.users")}>
      {(users?.length ?? 0) === 0 ? (
        <p className="text-sm text-muted-foreground">{t("account.noUsers")}</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <th className="py-2">{t("account.name")}</th>
              <th className="py-2">{t("account.email")}</th>
              <th className="py-2">{t("account.role")}</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id} className="border-b border-border/60">
                <td className="py-2 text-foreground">{user.name}</td>
                <td className="py-2 text-muted-foreground">{user.email}</td>
                <td className="py-2 text-muted-foreground">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Section>
  );
}

/* ------------------------------------------------------------- profile -- */

function ProfileView() {
  const { t } = useI18n();
  const { data: account } = useAccount();
  const { updateAccount } = useAccountMutations();
  const [form, setForm] = useState<Account | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (account) setForm(account);
  }, [account]);

  if (!form) return <Section title={t("account.profile")}>…</Section>;

  const field = (key: keyof Account, label: TranslationKey) => (
    <div className="space-y-1.5">
      <Label htmlFor={`profile-${String(key)}`}>{t(label)}</Label>
      <Input
        id={`profile-${String(key)}`}
        value={String(form[key] ?? "")}
        onChange={(event) => {
          setSaved(false);
          setForm((current) => (current ? { ...current, [key]: event.target.value } : current));
        }}
      />
    </div>
  );

  return (
    <Section title={t("account.profile")}>
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          await updateAccount.mutateAsync(form);
          setSaved(true);
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {field("firstname", "account.firstname")}
          {field("lastname", "account.lastname")}
          {field("email", "account.email")}
          {field("telephone", "account.phone")}
          {field("mobile", "account.mobile")}
          {field("company", "account.company")}
          {field("vat_identification_number", "account.vat")}
          {field("personnummer", "account.personnummer")}
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <Checkbox
            checked={form.newsletter}
            onCheckedChange={(value) => {
              setSaved(false);
              setForm((current) => (current ? { ...current, newsletter: value === true } : current));
            }}
          />
          {t("account.newsletter")}
        </label>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={updateAccount.isPending}>
            {updateAccount.isPending ? t("account.saving") : t("account.save")}
          </Button>
          {saved && <span className="text-xs text-muted-foreground">{t("account.saved")}</span>}
        </div>
      </form>
    </Section>
  );
}

/* ---------------------------------------------------------------- page -- */

export default function AccountPage({ view = "oversikt" }: { view?: AccountView }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, name, mode } = useAuth();
  const { logout } = useAccountMutations();

  // In demo mode the account area is browsable with dummy data; live mode requires a session.
  const allowed = isAuthenticated || mode === "demo";

  useEffect(() => {
    if (!isLoading && !allowed) void navigate({ to: "/logga-in", replace: true });
  }, [allowed, isLoading, navigate]);

  if (!allowed) {
    return (
      <StoreShell>
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6">
          <p className="text-sm text-muted-foreground">{t("account.signedOutBody")}</p>
        </div>
      </StoreShell>
    );
  }

  return (
    <StoreShell>
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6">
        <h1 className="brand-heading text-3xl text-foreground">{t("account.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {name}
          {mode === "demo" ? ` · ${t("account.demoNote")}` : ""}
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
          <nav>
            <ul className="space-y-1">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = item.view === view;
                return (
                  <li key={item.view}>
                    {item.view === "oversikt" ? (
                      <Link
                        to="/mitt-konto"
                        className={cn(
                          "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent",
                          active ? "bg-accent font-semibold text-foreground" : "text-muted-foreground",
                        )}
                      >
                        <Icon className="size-4" />
                        {t(item.label)}
                      </Link>
                    ) : (
                      <Link
                        to="/mitt-konto/$view"
                        params={{ view: item.view }}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent",
                          active ? "bg-accent font-semibold text-foreground" : "text-muted-foreground",
                        )}
                      >
                        <Icon className="size-4" />
                        {t(item.label)}
                      </Link>
                    )}
                  </li>
                );
              })}
              <li>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
                  onClick={() => {
                    void logout.mutateAsync().then(() => navigate({ to: "/" }));
                  }}
                >
                  <LogOut className="size-4" />
                  {t("account.signOut")}
                </button>
              </li>
            </ul>
          </nav>

          <div>
            {view === "oversikt" && <OverviewView />}
            {view === "ordrar" && <OrdersView />}
            {view === "adresser" && <AddressesView />}
            {view === "anvandare" && <UsersView />}
            {view === "konto" && <ProfileView />}
          </div>
        </div>
      </div>
    </StoreShell>
  );
}
