import { useMemo, useState, type ReactNode } from "react";
import { Check, ChevronDown, Copy, ExternalLink, Loader2, Lock } from "lucide-react";

import { BrandHero, BrandShell } from "@/components/vendre/brand-shell";
import { testVendreConnection, type ConnectionResult, type ConnectionStep } from "@/lib/vendre";
import { cn } from "@/lib/utils";

const PROJECT_ID = "b680686f-4945-4ee5-a18e-4b6fffe4e625";
const SECRET_NAMES = ["VENDRE_BASE_URL", "VENDRE_CLIENT_ID", "VENDRE_CLIENT_SECRET"];
const POLICIES = ["oauth", "bootstrap", "session", "customer", "shopping_cart", "checkout", "vendre_query_language", "default"];
const TITLES = ["Skapa OAuth-nycklar", "Lägg in credentials", "Konfigurera CORS", "Verifiera anslutningen", "Redo att börja bygga"];

type GuideState = "done" | "current" | "pending";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" className="brand-button-ghost" onClick={() => void navigator.clipboard.writeText(value).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1500); })}>
      <Copy className="size-3.5" aria-hidden /> {copied ? "Kopierat" : "Kopiera"}
    </button>
  );
}

function StepResult({ step }: { step: ConnectionStep }) {
  const color = step.status === "ok" ? "bg-emerald-500" : step.status === "warning" ? "bg-amber-500" : step.status === "failed" ? "bg-destructive" : "bg-muted-foreground/40";
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-sm">
      <div className="flex items-center gap-2"><span className={cn("size-2 shrink-0 rounded-full", color)} /><span className="font-medium text-foreground">{step.label}</span></div>
      <p className="mt-1 text-muted-foreground">{step.detail}</p>
    </div>
  );
}

function GuideStep({ index, title, state, open, onToggle, verdict, children }: { index: number; title: string; state: GuideState; open: boolean; onToggle: () => void; verdict: string; children: ReactNode }) {
  const done = state === "done";
  const current = state === "current";
  return (
    <li className={cn("brand-card relative p-5 pl-16 transition-all", current && "border-primary/60 ring-2 ring-primary/20", state === "pending" && !open && "opacity-70")}>
      {index > 1 && <span className="pointer-events-none absolute -top-4 left-[2.3rem] h-4 w-px bg-border" aria-hidden />}
      <span className={cn("absolute left-5 top-5 flex size-9 items-center justify-center rounded-lg border font-display text-sm font-bold", done ? "border-emerald-500 bg-emerald-500 text-primary-foreground" : current ? "border-transparent bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "border-border bg-card text-muted-foreground")}>
        {done ? <Check className="size-4" /> : state === "pending" ? <Lock className="size-3.5" /> : index}
      </span>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-2 text-left">
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        <span className={cn("brand-eyebrow rounded-md px-2 py-0.5", done ? "bg-emerald-500/10 text-emerald-700" : current ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>{done ? "Klar" : current ? "Aktuell" : "Väntar"}</span>
        <ChevronDown className={cn("ml-auto size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      <p className={cn("mt-1 flex items-center gap-2 text-sm font-medium", done ? "text-emerald-700" : current ? "text-primary" : "text-muted-foreground")}><span className={cn("size-2 rounded-full", done ? "bg-emerald-500" : current ? "bg-primary" : "bg-muted-foreground/40")} />{verdict}</p>
      {open && <div className="mt-4 space-y-4 text-sm text-muted-foreground">{children}</div>}
    </li>
  );
}

function AdminLink({ path, children }: { path: string; children: ReactNode }) {
  return <a href={path} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-xs text-primary underline underline-offset-4">{children}<ExternalLink className="size-3" /></a>;
}

export default function Index() {
  const preview = `https://project--${PROJECT_ID}-dev.lovable.app`;
  const published = `https://project--${PROJECT_ID}.lovable.app`;
  const [open, setOpen] = useState(0);
  const [adminDone, setAdminDone] = useState(false);
  const [corsDone, setCorsDone] = useState(false);
  const [checking, setChecking] = useState(false);
  const [secretStatus, setSecretStatus] = useState<{ ok: boolean; missing: string[] } | null>(null);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<ConnectionResult | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const originsJson = useMemo(() => JSON.stringify({ [preview]: POLICIES, [published]: POLICIES }, null, 2), [preview, published]);
  const policiesJson = useMemo(() => JSON.stringify(Object.fromEntries(POLICIES.map((policy) => [policy, [preview, published]])), null, 2), [preview, published]);
  const done = [adminDone, secretStatus?.ok === true, corsDone, result?.ok === true, result?.ok === true];
  const active = Math.max(done.findIndex((value) => !value), 0);
  const completedCount = done.filter(Boolean).length;
  const states = done.map((value, index): GuideState => value ? "done" : index === active ? "current" : "pending");

  const checkSecrets = async () => {
    setChecking(true);
    try {
      const response = await fetch("/api/vendre/status", { headers: { accept: "application/json" } });
      const data = (await response.json()) as { ok: boolean; missing?: string[] };
      setSecretStatus({ ok: data.ok, missing: data.missing ?? [] });
      if (data.ok) setOpen(2);
    } catch { setSecretStatus({ ok: false, missing: SECRET_NAMES }); }
    finally { setChecking(false); }
  };

  const runTest = async () => {
    setTesting(true); setTestError(null);
    try {
      const next = await testVendreConnection();
      setResult(next);
      if (next.ok) setOpen(4);
    } catch (error) { setTestError((error as Error).message); }
    finally { setTesting(false); }
  };

  return (
    <BrandShell>
      <BrandHero />

      <section className="brand-card sticky top-20 z-20 mt-10 overflow-hidden bg-card/95 p-5 backdrop-blur sm:p-6">
        <div className="brand-canvas pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">Setup-guide</h2>
              <span className="brand-eyebrow rounded-md bg-primary/10 px-2.5 py-1 text-primary">Steg {Math.min(active + 1, 5)} av 5</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{result?.ok ? "Anslutningen är verifierad och klar." : `${completedCount} av 5 steg klara.`}</p>
            {!result?.ok && <p className="mt-3 inline-flex rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground">Nästa: {active + 1}. {TITLES[active]}</p>}
          </div>
          <button type="button" onClick={runTest} disabled={testing || !secretStatus?.ok} className="brand-button">{testing && <Loader2 className="size-4 animate-spin" />}{testing ? "Testar" : "Testa igen"}</button>
        </div>
        <div className="relative mt-5 flex gap-1.5">{states.map((state, index) => <span key={TITLES[index]} className={cn("h-1.5 flex-1 rounded-full transition-colors", state === "done" ? "bg-emerald-500" : state === "current" ? "bg-linear-to-r from-primary via-brand-pink to-brand-blue" : "bg-muted")} />)}</div>
      </section>

      <ol className="mt-6 space-y-4">
        <GuideStep index={1} title={TITLES[0]} state={states[0]} open={open === 0} onToggle={() => setOpen(open === 0 ? -1 : 0)} verdict={adminDone ? "OAuth-förberedelser bekräftade" : "Skapa en OAuth-klient i Vendre Admin"}>
          <p>Skapa klienten innan credentials läggs in. Din <code className="font-mono text-xs text-foreground">client_secret</code> visas bara en gång.</p>
          <div className="rounded-lg border border-border bg-muted/40 p-4"><p className="font-medium text-foreground">Appar & Integrationer → Headless → OAuth</p><AdminLink path="/Admin/headless/auth/oauth-clients">/Admin/headless/auth/oauth-clients</AdminLink></div>
          <label className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-foreground"><input type="checkbox" checked={adminDone} onChange={(event) => { setAdminDone(event.target.checked); if (event.target.checked) setOpen(1); }} className="mt-0.5 size-4 accent-primary" />Jag har skapat OAuth-klienten och sparat nycklarna.</label>
        </GuideStep>

        <GuideStep index={2} title={TITLES[1]} state={states[1]} open={open === 1} onToggle={() => setOpen(open === 1 ? -1 : 1)} verdict={secretStatus?.ok ? "Alla credentials är tillgängliga" : "Lägg in tre värden under Secrets"}>
          <p>Credentials används endast på serversidan och ska aldrig skrivas i kod eller chatten.</p>
          <ul className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">{SECRET_NAMES.map((name) => { const missing = secretStatus?.missing.includes(name); return <li key={name} className="flex items-center gap-2"><span className={cn("size-2 rounded-full", !secretStatus ? "bg-muted-foreground/40" : missing ? "bg-destructive" : "bg-emerald-500")} /><code className="font-mono text-xs text-foreground">{name}</code></li>; })}</ul>
          <button type="button" className="brand-button" disabled={checking || !adminDone} onClick={checkSecrets}>{checking && <Loader2 className="size-4 animate-spin" />}{checking ? "Kontrollerar" : "Kontrollera credentials"}</button>
          {secretStatus && !secretStatus.ok && <p className="rounded-md bg-destructive/10 p-3 text-destructive">Saknas: {secretStatus.missing.join(", ")}</p>}
        </GuideStep>

        <GuideStep index={3} title={TITLES[2]} state={states[2]} open={open === 2} onToggle={() => setOpen(open === 2 ? -1 : 2)} verdict={corsDone ? "Origins och policyer bekräftade" : "Allowlista storefrontens stabila adresser"}>
          <p>Klistra in adresserna under Appar & Integrationer → Headless → CORS. Använd inte den tillfälliga <code className="font-mono text-xs">id-preview--</code>-adressen.</p>
          <div className="rounded-lg border border-border bg-muted/40 p-4"><p className="font-medium text-foreground">CORS-inställningar</p><AdminLink path="/Admin/configuration?gID=232">/Admin/configuration?gID=232</AdminLink></div>
          {[preview, published].map((origin) => <code key={origin} className="block break-all rounded-md border border-border bg-card p-3 text-xs text-foreground">{origin}</code>)}
          {[["Surface CORS Origins JSON", originsJson], ["Surface CORS Policies JSON", policiesJson]].map(([label, json]) => <div key={label}><div className="flex items-center justify-between gap-3"><span className="brand-eyebrow text-muted-foreground">{label}</span><CopyButton value={json} /></div><pre className="mt-2 max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs text-foreground">{json}</pre></div>)}
          <label className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-foreground"><input type="checkbox" checked={corsDone} onChange={(event) => { setCorsDone(event.target.checked); if (event.target.checked) setOpen(3); }} disabled={!secretStatus?.ok} className="mt-0.5 size-4 accent-primary" />Jag har lagt in origins och policyer i Vendre Admin.</label>
        </GuideStep>

        <GuideStep index={4} title={TITLES[3]} state={states[3]} open={open === 3} onToggle={() => setOpen(open === 3 ? -1 : 3)} verdict={result?.ok ? "Token, CORS, session och läsrättigheter fungerar" : "Kör det tekniska anslutningstestet"}>
          <p>Testet verifierar OAuth-token, CORS, session/bootstrap och läsning av navigation/menus.</p>
          <button type="button" className="brand-button" disabled={testing || !corsDone} onClick={runTest}>{testing && <Loader2 className="size-4 animate-spin" />}{testing ? "Testar anslutningen" : "Kör anslutningstest"}</button>
          {testError && <p className="rounded-md bg-destructive/10 p-3 text-destructive">{testError}</p>}
          {result && <div className="space-y-2">{result.steps.map((step) => <StepResult key={step.id} step={step} />)}</div>}
        </GuideStep>

        <GuideStep index={5} title={TITLES[4]} state={states[4]} open={open === 4} onToggle={() => setOpen(open === 4 ? -1 : 4)} verdict={result?.ok ? "Butiksanslutningen är verifierad" : "Låst tills anslutningen är grön"}>
          {result?.ok ? <><p className="rounded-md bg-emerald-500/10 p-3 font-medium text-emerald-700">Setupen är klar. Projektet är redo för storefront-arbete.</p><dl className="space-y-2"><div className="rounded-lg border border-border bg-card p-3"><dt className="brand-eyebrow">Base URL</dt><dd className="mt-1 break-all font-mono text-xs text-foreground">{result.baseUrl}</dd></div><div className="rounded-lg border border-border bg-card p-3"><dt className="brand-eyebrow">Allowlistad origin</dt><dd className="mt-1 break-all font-mono text-xs text-foreground">{result.origin}</dd></div></dl></> : <p>Slutför föregående steg och kör anslutningstestet.</p>}
        </GuideStep>
      </ol>
    </BrandShell>
  );
}
