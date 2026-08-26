const steps = [
  {
    state: "done" as const,
    title: "API-nycklar tillagda",
    description: "VENDRE_API_KEY och VENDRE_STORE_URL är inlagda under Secrets.",
  },
  {
    state: "todo" as const,
    title: "Validera anslutning mot Vendre",
    description: "Kontrollera att butiken svarar med dina nycklar.",
  },
  {
    state: "todo" as const,
    title: "Klar att börja bygga!",
    description: "Din butiksfront är redo att växa.",
  },
];

export default function Index() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Vendre
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
          Kom igång
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tre steg till din Vendre-anslutna butik.
        </p>

        <ol className="mt-10 space-y-1">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-xl border border-transparent px-4 py-5 transition-colors hover:border-border hover:bg-card"
            >
              <span
                className={
                  "mt-1 size-3 shrink-0 rounded-full " +
                  (step.state === "done"
                    ? "bg-destructive"
                    : "border border-border bg-muted")
                }
                aria-hidden
              />
              <div>
                <h2 className="text-sm font-medium text-foreground">
                  {i + 1}. {step.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
