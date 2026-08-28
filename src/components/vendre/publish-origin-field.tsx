/** Lets the user store the friendly domain chosen in Lovable's Publish dialog. */
import { useEffect, useState } from "react";

import { useI18n } from "@/lib/i18n";
import { toPublishedOrigin } from "@/lib/vendre/published-origin";

export function PublishOriginField({
  origin,
  onSave,
}: {
  origin: string;
  onSave: (value: string) => void;
}) {
  const { t } = useI18n();
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
        {t("step3.fieldLabel")}
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
          {t("step3.use")}
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
            {t("step3.clear")}
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="mt-2 text-xs text-destructive">{t("step3.parseError")}</p>
      ) : origin ? (
        <p className="mt-2 break-all text-xs text-muted-foreground">
          {t("step3.saved")} {origin}
        </p>
      ) : null}
    </div>
  );
}
