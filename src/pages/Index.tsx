import { useEffect, useMemo, useState } from "react";

type StepState = "done" | "todo" | "blocked";

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

function useProjectOrigins() {
  const [projectId, setProjectId] = useState(PROJECT_ID_FALLBACK);

  useEffect(() => {
    const host = window.location.hostname;
    const match =
      host.match(/^id-preview--([0-9a-f-]{36})\./i) ??
      host.match(/^project--([0-9a-f-]{36})(?:-dev)?\./i);
    if (match) setProjectId(match[1]);
  }, []);

  return useMemo(
    () => ({
      projectId,
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
          className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {copied ? "Kopierat" : "Copy JSON"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        <code>{json}</code>
      </pre>
    </div>
  );
}

function StatusDot({ state }: { state: StepState }) {
  const cls =
    state === "done"
      ? "bg-destructive"
      : state === "blocked"
        ? "border border-destructive/60 bg-destructive/20"
        : "border border-border bg-muted";
  return <span className={`mt-1.5 size-3 shrink-0 rounded-full ${cls}`} aria-hidden />;
}

export default function Index() {
  const { preview, published } = useProjectOrigins();

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

  const steps: {
    state: StepState;
    title: string;
    description: string;
    details?: string[];
  }[] = [
    {
      state: "todo",
      title: "Steg 0 — Vendre Admin prep (OAuth & CORS)",
      description:
        "Skapa OAuth-klienten och allowlista origins i Vendre Admin innan något annat görs.",
      details: [
        "Meny → Appar & Integrationer → Headless → OAuth (/Admin/headless/auth/oauth-clients) — client_secret visas bara en gång.",
        "Meny → Appar & Integrationer → Headless → CORS (/Admin/configuration?gID=232) — klistra in JSON:en nedan.",
      ],
    },
    {
      state: "todo",
      title: "Steg 1 — Credentials i Lovable Secrets",
      description: "Tre värden krävs, de sparas som secrets och används endast server-side.",
      details: ["VENDRE_BASE_URL", "VENDRE_CLIENT_ID", "VENDRE_CLIENT_SECRET"],
    },
    {
      state: "todo",
      title: "Steg 2 & 3 — Validera anslutning",
      description:
        "Kör testVendreConnection() (eller öppna /vendre-setup) och läs statusen för varje delsteg.",
      details: [
        "token — OAuth client credentials accepteras",
        "cors — origin allowlistad (annars degraderat proxy-läge)",
        "session — session/bootstrap + mutation protection token",
        "read — läsrättighet, t.ex. navigation/menus",
      ],
    },
    {
      state: "blocked",
      title: "Steg 4 — Readiness gate",
      description:
        "Inga storefront-sidor, komponenter eller produkt-/varukorgsflöden byggs förrän testet returnerar ok: true.",
      details: [
        "CORS-varning = degraderat proxy-läge: appen fungerar, men checkout startar en tom session.",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto w-full max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Vendre
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
          Vendre Headless Storefront Setup
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Surface API v2 · följ stegen i ordning. Inget byggs innan anslutningen är grön.
        </p>

        <ol className="mt-10 space-y-1">
          {steps.map((step) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-xl border border-transparent px-4 py-5 transition-colors hover:border-border hover:bg-card"
            >
              <StatusDot state={step.state} />
              <div className="min-w-0">
                <h2 className="text-sm font-medium text-foreground">{step.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                {step.details && (
                  <ul className="mt-2 space-y-1">
                    {step.details.map((d) => (
                      <li
                        key={d}
                        className="font-mono text-xs leading-relaxed text-muted-foreground/80"
                      >
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>

        <section className="mt-14">
          <h2 className="text-sm font-semibold text-foreground">Origins & CORS-hjälp</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Använd de stabila Lovable-adresserna — aldrig den tillfälliga{" "}
            <code className="font-mono text-xs">id-preview--</code>-adressen.
          </p>

          <dl className="mt-4 space-y-2">
            {[
              ["Preview", preview],
              ["Published", published],
            ].map(([label, origin]) => (
              <div
                key={label}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border bg-card px-4 py-3"
              >
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {label}
                </dt>
                <dd className="break-all font-mono text-xs text-foreground">{origin}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 space-y-4">
            <CopyBlock label="Surface CORS Origins JSON" json={originsJson} />
            <CopyBlock label="Surface CORS Policies JSON (vinner vid konflikt)" json={policiesJson} />
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Klistras in under Meny → Appar & Integrationer → Headless → CORS
            (/Admin/configuration?gID=232). <code className="font-mono">default</code> är policyn
            som alla <code className="font-mono">accounts*</code>-anrop och Twig-rendering hamnar
            på — den glöms oftast bort.
          </p>
        </section>
      </div>
    </main>
  );
}
