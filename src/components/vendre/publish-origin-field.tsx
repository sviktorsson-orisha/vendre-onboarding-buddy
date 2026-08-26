/** Lets the user store the friendly domain chosen in Lovable's Publish dialog. */
import { useEffect, useState } from "react";

import { toPublishedOrigin } from "@/lib/vendre/published-origin";

export function PublishOriginField({
  origin,
  onSave,
}: {
  origin: string;
  onSave: (value: string) => void;
}) {
  const [draft, setDraft] = useState(origin);
  const [error, setError] = useState(false);

  useEffect(() => {
    setDraft(origin);
  }, [origin]);

  function save() {
    const parsed = toPublishedOrigin(draft);
    if (!parsed) {
      setError(true);
      return;
    }
    setError(false);
    onSave(parsed);
  }

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <label htmlFor="published-origin" className="brand-eyebrow text-muted-foreground">
        Publicerad Lovable-adress
      </label>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          id="published-origin"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              save();
            }
          }}
          placeholder="spring-board eller https://spring-board.lovable.app"
          className="min-w-[14rem] flex-1 rounded-lg border border-border bg-card px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-primary"
        />
        <button type="button" onClick={save} className="brand-button">
          Använd adressen
        </button>
        {origin ? (
          <button
            type="button"
            className="brand-button-ghost"
            onClick={() => {
              onSave("");
              setDraft("");
            }}
          >
            Rensa
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="mt-2 text-xs text-destructive">
          Kunde inte tolka adressen — ange ett namn eller en https-adress.
        </p>
      ) : origin ? (
        <p className="mt-2 break-all text-xs text-muted-foreground">Sparad adress: {origin}</p>
      ) : null}
    </div>
  );
}
