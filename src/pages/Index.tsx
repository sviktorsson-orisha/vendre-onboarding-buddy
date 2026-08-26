import { useEffect, useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Lock, Loader2, TriangleAlert } from "lucide-react";

import { testVendreConnection, type ConnectionResult, type ConnectionStep } from "@/lib/vendre";
import { cn } from "@/lib/utils";

const PROJECT_ID_FALLBACK = "b680686f-4945-4ee5-a18e-4b6fffe4e625";

const CORS_POLICIES = [
  "oauth",
  "bootstrap",
  "session",
  "customer",
  "shopping_cart",
  "checkout",
  "vendre_query_language",
  "default",
];

const SECRET_NAMES = ["VENDRE_BASE_URL", "VENDRE_CLIENT_ID", "VENDRE_CLIENT_SECRET"];

const STEP_TITLES = [
  "Vendre Admin prep (OAuth & CORS)",
  "Ange API-credentials",
  "Testa anslutning & policyer",
  "Klar — nästa steg",
];

function useProjectOrigins() {
  const [projectId, setProjectId] = useState(PROJECT_ID_FALLBACK);

  useEffect(() => {
    const host = window.location.hostname;
    const match =
      host.match(/^id-preview--([0-9a-f-]{36})\./i) ??
      host.match(/^project--([0-9a-f-]{36})(?:-dev)?\./i);
    if (match?.[1]) setProjectId(match[1]);
  }, []);

  return useMemo(
    () => ({
      preview: `https://project--${projectId}-dev.lovable.app`,
      published: `https://project--${projectId}.lovable.app`,
    }),
    [projectId],
  );
}

function CopyBlock({ label, json }: { label: string; json: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-2.5">
        <span className="text-xs font-medium tracking-wide text-foreground">{label}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Copy className="size-3" aria-hidden />
          {copied ? "Kopierat" : "Copy JSON"}
        </button>
      </div>
      <pre className="max-h-72 overflow-auto px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        <code>{json}</code>
      </pre>
    </div>
  );
}

function StatusBadge({ step }: { step: ConnectionStep }) {
  const tone =
    step.status === "ok"
      ? "border-primary/40 bg-primary/10 text-foreground"
      : step.status === "warning"
        ? "border-destructive/40 bg-destructive/10 text-foreground"
        : step.status === "failed"
          ? "border-destructive bg-destructive/15 text-foreground"
          : "border-border bg-muted text-muted-foreground";

  const text =
    step.status === "ok"
      ? "OK"
      : step.status === "warning"
        ? "Varning"
        : step.status === "failed"
          ? "Fel"
          : "Ej kört";

  return (
    <div className={cn("rounded-lg border px-4 py-3", tone)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{step.label}</span>
        <span className="text-xs font-semibold uppercase tracking-wide">{text}</span>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.detail}</p>
    </div>
  );
}

function AdminLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 font-mono text-xs text-foreground underline underline-offset-4 hover:text-muted-foreground"
    >
      {children}
      <ExternalLink className="size-3" aria-hidden />
    </a>
  );
}

export default function Index() {
  const { preview, published } = useProjectOrigins();

  const [current, setCurrent] = useState(0);
  const [adminConfirmed, setAdminConfirmed] = useState(false);

  const [checkingSecrets, setCheckingSecrets] = useState(false);
  const [secretStatus, setSecretStatus] = useState<{ ok: boolean; missing: string[] } | null>(null);

  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<ConnectionResult | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const completed = [adminConfirmed, secretStatus?.ok === true, result?.ok === true, false];
  const maxUnlocked = completed.findIndex((c) => !c);
  const total = STEP_TITLES.length;
  const doneCount = completed.filter(Boolean).length;
  const progress = Math.round((doneCount / total) * 100);

  const originsJson = JSON.stringify(
    { [preview]: CORS_POLICIES, [published]: CORS_POLICIES },
    null,
    2,
  );
  const policiesJson = JSON.stringify(
    Object.fromEntries(CORS_POLICIES.map((p) => [p, [preview, published]])),
    null,
    2,
  );

  const checkSecrets = async () => {
    setCheckingSecrets(true);
    try {
      const res = await fetch("/api/vendre/status", { headers: { accept: "application/json" } });
      const data = (await res.json()) as { ok: boolean; missing: string[] };
      setSecretStatus({ ok: data.ok, missing: data.missing ?? [] });
    } catch {
      setSecretStatus({ ok: false, missing: SECRET_NAMES });
    } finally {
      setCheckingSecrets(false);
    }
  };

  const runTest = async () => {
    setTesting(true);
    setTestError(null);
    try {
      setResult(await testVendreConnection());
    } catch (error) {
      setTestError((error as Error).message);
      setResult(null);
    } finally {
      setTesting(false);
    }
  };

  const canGoNext = current < total - 1 && completed[current] === true;
  const corsWarning = result?.steps.find((s) => s.id === "cors" && s.status === "warning");

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Vendre
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            Vendre Headless Storefront Setup
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Surface API v2 · fyra steg. Inget i butiken byggs innan anslutningen är grön.
          </p>

          <div className="mt-6">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>
                Steg {current + 1} av {total}
              </span>
              <span>{progress}% klart</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground">
            <span className="text-muted-foreground">Aktuellt steg:</span>{" "}
            {current + 1}. {STEP_TITLES[current]}
          </div>

          <ol className="mt-4 grid gap-2 sm:grid-cols-4">
            {STEP_TITLES.map((title, i) => {
              const locked = i > maxUnlocked && maxUnlocked !== -1;
              return (
                <li key={title}>
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => setCurrent(i)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-xs transition-colors",
                      i === current
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:bg-muted",
                      locked && "cursor-not-allowed opacity-50 hover:bg-transparent",
                    )}
                  >
                    {completed[i] ? (
                      <Check className="size-3.5 shrink-0" aria-hidden />
                    ) : locked ? (
                      <Lock className="size-3.5 shrink-0" aria-hidden />
                    ) : (
                      <span className="size-3.5 shrink-0 rounded-full border border-current" />
                    )}
                    <span className="truncate">
                      {i + 1}. {title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </header>

        <section className="mt-8 rounded-xl border border-border bg-card p-6">
          {current === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-medium text-foreground">
                  Steg 1 — Vendre Admin prep (OAuth & CORS)
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Admin först: skapa OAuth-klienten och allowlista storefrontens origins. Först
                  därefter samlas nycklarna in och testet körs.
                </p>
              </div>

              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  Meny → Appar & Integrationer → Headless → OAuth:{" "}
                  <AdminLink href="/Admin/headless/auth/oauth-clients">
                    /Admin/headless/auth/oauth-clients
                  </AdminLink>{" "}
                  — <code className="font-mono text-xs">client_secret</code> visas bara en gång.
                </li>
                <li>
                  Meny → Appar & Integrationer → Headless → CORS:{" "}
                  <AdminLink href="/Admin/configuration?gID=232">
                    /Admin/configuration?gID=232
                  </AdminLink>{" "}
                  — klistra in JSON:en nedan.
                </li>
              </ul>

              <div className="space-y-2">
                {[
                  ["Preview", preview],
                  ["Published", published],
                ].map(([label, origin]) => (
                  <div
                    key={label}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border px-4 py-3"
                  >
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {label}
                    </span>
                    <span className="break-all font-mono text-xs text-foreground">{origin}</span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Använd de stabila adresserna — aldrig den tillfälliga{" "}
                  <code className="font-mono">id-preview--</code>-adressen.
                </p>
              </div>

              <div className="space-y-4">
                <CopyBlock label="Surface CORS Origins JSON" json={originsJson} />
                <CopyBlock
                  label="Surface CORS Policies JSON (vinner vid konflikt)"
                  json={policiesJson}
                />
                <p className="text-xs text-muted-foreground">
                  <code className="font-mono">default</code> är policyn där alla{" "}
                  <code className="font-mono">accounts*</code>-anrop och Twig-rendering hamnar — den
                  glöms oftast bort.
                </p>
              </div>

              <label className="flex items-start gap-3 rounded-lg border border-border px-4 py-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={adminConfirmed}
                  onChange={(e) => setAdminConfirmed(e.target.checked)}
                  className="mt-0.5 size-4 accent-[hsl(var(--primary))]"
                />
                Jag har konfigurerat CORS och skapat OAuth-nycklar i Vendre Admin.
              </label>
            </div>
          )}

          {current === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-medium text-foreground">
                  Steg 2 — Ange API-credentials
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  De tre värdena sparas som Lovable Secrets och används enbart server-side.
                  Skriv dem aldrig i kod, i repots <code className="font-mono">.env</code> eller i
                  chatten.
                </p>
              </div>

              <ul className="space-y-2">
                {SECRET_NAMES.map((name) => {
                  const state = secretStatus
                    ? secretStatus.missing.includes(name)
                      ? "missing"
                      : "set"
                    : "unknown";
                  return (
                    <li
                      key={name}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
                    >
                      <code className="font-mono text-xs text-foreground">{name}</code>
                      <span
                        className={cn(
                          "text-xs font-semibold uppercase tracking-wide",
                          state === "set"
                            ? "text-foreground"
                            : state === "missing"
                              ? "text-destructive"
                              : "text-muted-foreground",
                        )}
                      >
                        {state === "set" ? "Satt" : state === "missing" ? "Saknas" : "Okänd"}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <button
                type="button"
                onClick={checkSecrets}
                disabled={checkingSecrets}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {checkingSecrets && <Loader2 className="size-4 animate-spin" aria-hidden />}
                Kontrollera credentials
              </button>

              {secretStatus && !secretStatus.ok && (
                <p className="text-sm text-destructive">
                  Saknas: {secretStatus.missing.join(", ")}. Lägg in dem under Secrets och kör
                  kontrollen igen.
                </p>
              )}
              {secretStatus?.ok && (
                <p className="text-sm text-foreground">Alla tre credentials är satta.</p>
              )}
            </div>
          )}

          {current === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-medium text-foreground">
                  Steg 3 — Testa anslutning & policyer
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Kör <code className="font-mono text-xs">testVendreConnection()</code>: token →
                  CORS → session/bootstrap → läsning av navigation/menus.
                </p>
              </div>

              <button
                type="button"
                onClick={runTest}
                disabled={testing}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {testing && <Loader2 className="size-4 animate-spin" aria-hidden />}
                Kör Vendre-anslutningstest
              </button>

              {testError && <p className="text-sm text-destructive">{testError}</p>}

              {result && (
                <div className="space-y-3">
                  {result.steps.map((s) => (
                    <StatusBadge key={s.id} step={s} />
                  ))}

                  {corsWarning && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <TriangleAlert className="size-4" aria-hidden />
                        Degraderat proxy-läge
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        Origin <code className="font-mono">{result.origin}</code> är inte
                        allowlistad. Appen kan fungera, men checkout startar en tom session. Lägg
                        till origin under Meny → Appar & Integrationer → Headless → CORS
                        (/Admin/configuration?gID=232) med JSON:en från steg 1 och kör testet igen.
                      </p>
                    </div>
                  )}

                  {result.ok && (
                    <p className="text-sm text-foreground">
                      Anslutningen är grön — steg 4 är upplåst.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {current === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Check className="size-5 text-foreground" aria-hidden />
                <h2 className="text-base font-medium text-foreground">
                  Butiksanslutningen är verifierad!
                </h2>
              </div>

              <dl className="space-y-2">
                <div className="flex flex-wrap items-center gap-x-3 rounded-lg border border-border px-4 py-3">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Base URL
                  </dt>
                  <dd className="break-all font-mono text-xs text-foreground">
                    {result?.baseUrl ?? "—"}
                  </dd>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 rounded-lg border border-border px-4 py-3">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Allowlistad origin
                  </dt>
                  <dd className="break-all font-mono text-xs text-foreground">
                    {result?.origin ?? "—"}
                  </dd>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 rounded-lg border border-border px-4 py-3">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Session
                  </dt>
                  <dd className="text-xs text-foreground">
                    Bootstrap OK · mutation protection token aktiv
                  </dd>
                </div>
              </dl>

              <p className="text-sm text-muted-foreground">
                Gå tillbaka till chatten och säg vad du vill bygga först: Home, PLP, PDP eller Cart.
              </p>
            </div>
          )}
        </section>

        <nav className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
          >
            Föregående
          </button>
          <button
            type="button"
            onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
            disabled={!canGoNext}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
          >
            {!canGoNext && current < total - 1 && <Lock className="size-3.5" aria-hidden />}
            Nästa
          </button>
        </nav>
      </div>
    </main>
  );
}
