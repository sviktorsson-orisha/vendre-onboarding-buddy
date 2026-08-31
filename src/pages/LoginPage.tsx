import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";

import { StoreShell } from "@/components/store/store-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n";
import { useAccountMutations, useAuth, VendreAccountError } from "@/lib/vendre/account";
import type { FieldErrors, RegisterInput } from "@/types/vendre-account";

function errorsOf(error: unknown): { message: string; fields: FieldErrors } {
  if (error instanceof VendreAccountError) return { message: error.message, fields: error.fields };
  if (error instanceof Error) return { message: error.message, fields: {} };
  return { message: "", fields: {} };
}

function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export default function LoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const { login, register, forgotPassword } = useAccountMutations();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const [form, setForm] = useState<RegisterInput>({
    firstname: "",
    lastname: "",
    email_address: "",
    password: "",
    confirmation: "",
    type: "private",
    gender: "",
    company: "",
    street_address: "",
    postcode: "",
    city: "",
    country: "SE",
    telephone: "",
    mobile: "",
    personnummer: "",
    vat_identification_number: "",
    newsletter: false,
    consent_personal_data_policy: false,
  });
  const [registerError, setRegisterError] = useState("");
  const [registerFields, setRegisterFields] = useState<FieldErrors>({});

  useEffect(() => {
    if (!isLoading && isAuthenticated) void navigate({ to: "/mitt-konto", replace: true });
  }, [isAuthenticated, isLoading, navigate]);

  const set = <K extends keyof RegisterInput>(key: K, value: RegisterInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setLoginError("");
    try {
      await login.mutateAsync({ email, password });
      await navigate({ to: "/mitt-konto" });
    } catch (error) {
      setLoginError(errorsOf(error).message);
    }
  }

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    setRegisterError("");
    setRegisterFields({});
    if (form.password !== form.confirmation) {
      setRegisterFields({ confirmation: t("account.mismatch") });
      return;
    }
    try {
      await register.mutateAsync(form);
      await navigate({ to: "/mitt-konto" });
    } catch (error) {
      const { message, fields } = errorsOf(error);
      setRegisterError(message);
      setRegisterFields(fields);
    }
  }

  return (
    <StoreShell>
      <div className="mx-auto w-full max-w-xl px-5 py-10 sm:px-6">
        <h1 className="brand-heading text-3xl text-foreground">{t("account.title")}</h1>

        <Tabs defaultValue="login" className="mt-6">
          <TabsList className="w-full">
            <TabsTrigger value="login" className="flex-1">
              {t("account.signIn")}
            </TabsTrigger>
            <TabsTrigger value="register" className="flex-1">
              {t("account.signUp")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form
              onSubmit={handleLogin}
              className="space-y-4 rounded-xl border border-border bg-card p-6"
            >
              <p className="text-sm text-muted-foreground">{t("account.loginIntro")}</p>
              <div className="space-y-1.5">
                <Label htmlFor="login-email">{t("account.email")}</Label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="login-password">{t("account.password")}</Label>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <FieldError message={loginError} />
              <Button type="submit" className="w-full" disabled={login.isPending}>
                {t("account.signIn")}
              </Button>
              <button
                type="button"
                className="text-xs text-muted-foreground underline"
                onClick={() => {
                  setResetSent(true);
                  void forgotPassword.mutateAsync(email).catch(() => undefined);
                }}
              >
                {t("account.forgot")}
              </button>
              {resetSent && (
                <p className="text-xs text-muted-foreground">{t("account.forgotSent")}</p>
              )}
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form
              onSubmit={handleRegister}
              className="space-y-4 rounded-xl border border-border bg-card p-6"
            >
              <p className="text-sm text-muted-foreground">{t("account.registerIntro")}</p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="firstname">{t("account.firstname")}</Label>
                  <Input
                    id="firstname"
                    required
                    value={form.firstname}
                    onChange={(event) => set("firstname", event.target.value)}
                  />
                  <FieldError message={registerFields["firstname"]} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastname">{t("account.lastname")}</Label>
                  <Input
                    id="lastname"
                    required
                    value={form.lastname}
                    onChange={(event) => set("lastname", event.target.value)}
                  />
                  <FieldError message={registerFields["lastname"]} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="register-email">{t("account.email")}</Label>
                <Input
                  id="register-email"
                  type="email"
                  required
                  value={form.email_address}
                  onChange={(event) => set("email_address", event.target.value)}
                />
                <FieldError message={registerFields["email_address"]} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="register-password">{t("account.password")}</Label>
                  <Input
                    id="register-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={form.password}
                    onChange={(event) => set("password", event.target.value)}
                  />
                  <FieldError message={registerFields["password"]} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmation">{t("account.confirm")}</Label>
                  <Input
                    id="confirmation"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={form.confirmation}
                    onChange={(event) => set("confirmation", event.target.value)}
                  />
                  <FieldError message={registerFields["confirmation"]} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="type">{t("account.type")}</Label>
                <select
                  id="type"
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                  value={form.type}
                  onChange={(event) => set("type", event.target.value)}
                >
                  <option value="private">{t("account.typePrivate")}</option>
                  <option value="company">{t("account.typeCompany")}</option>
                </select>
              </div>

              {form.type === "company" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="company">{t("account.company")}</Label>
                    <Input
                      id="company"
                      value={form.company}
                      onChange={(event) => set("company", event.target.value)}
                    />
                    <FieldError message={registerFields["company"]} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="vat">{t("account.vat")}</Label>
                    <Input
                      id="vat"
                      value={form.vat_identification_number}
                      onChange={(event) => set("vat_identification_number", event.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="street">{t("account.street")}</Label>
                <Input
                  id="street"
                  value={form.street_address}
                  onChange={(event) => set("street_address", event.target.value)}
                />
                <FieldError message={registerFields["street_address"]} />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="postcode">{t("account.postcode")}</Label>
                  <Input
                    id="postcode"
                    value={form.postcode}
                    onChange={(event) => set("postcode", event.target.value)}
                  />
                  <FieldError message={registerFields["postcode"]} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">{t("account.city")}</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(event) => set("city", event.target.value)}
                  />
                  <FieldError message={registerFields["city"]} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="country">{t("account.country")}</Label>
                  <Input
                    id="country"
                    value={form.country}
                    onChange={(event) => set("country", event.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="telephone">{t("account.phone")}</Label>
                  <Input
                    id="telephone"
                    value={form.telephone}
                    onChange={(event) => set("telephone", event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mobile">{t("account.mobile")}</Label>
                  <Input
                    id="mobile"
                    value={form.mobile}
                    onChange={(event) => set("mobile", event.target.value)}
                  />
                </div>
              </div>

              {form.type !== "company" && (
                <div className="space-y-1.5">
                  <Label htmlFor="personnummer">{t("account.personnummer")}</Label>
                  <Input
                    id="personnummer"
                    value={form.personnummer}
                    onChange={(event) => set("personnummer", event.target.value)}
                  />
                  <FieldError message={registerFields["personnummer"]} />
                </div>
              )}

              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={form.newsletter}
                  onCheckedChange={(value) => set("newsletter", value === true)}
                />
                {t("account.newsletter")}
              </label>

              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={form.consent_personal_data_policy}
                  onCheckedChange={(value) => set("consent_personal_data_policy", value === true)}
                />
                {t("account.consent")}
              </label>
              <FieldError message={registerFields["consent_personal_data_policy"]} />

              <FieldError message={registerError} />
              <Button
                type="submit"
                className="w-full"
                disabled={register.isPending || !form.consent_personal_data_policy}
              >
                {t("account.signUp")}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </StoreShell>
  );
}
