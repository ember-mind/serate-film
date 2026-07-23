"use client";

import { useState } from "react";

// Solo per chi organizza: quante scelte sono state registrate e chi non ne ha
// ancora registrata una, con link diretto alla sezione di voto.
export function VoteReminder({
  label,
  votedCount,
  totalCount,
  missingNames,
  copyUrl,
}: {
  label: string;
  votedCount: number;
  totalCount: number;
  missingNames: string[];
  copyUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const [showAll, setShowAll] = useState(false);

  async function copy() {
    const url = `${window.location.origin}${copyUrl}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const visibleNames = showAll ? missingNames : missingNames.slice(0, 4);
  const hiddenCount = missingNames.length - visibleNames.length;

  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-fumo">
          {label} · {votedCount} su {totalCount} hanno registrato una scelta
        </p>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-lg border border-riga px-4 py-1.5 text-sm text-fumo transition-colors hover:border-proiettore hover:text-schermo"
        >
          {copied ? "Copiato ✓" : `Copia link voto ${label.toLowerCase()}`}
        </button>
      </div>
      {missingNames.length === 0 ? (
        <p className="text-xs text-fumo">Tutti hanno registrato una scelta.</p>
      ) : (
        <p className="text-xs text-fumo">
          Nessuna scelta registrata da: {visibleNames.join(", ")}
          {hiddenCount > 0 && !showAll && ` e altre ${hiddenCount} persone`}
          {missingNames.length > 4 && (
            <>
              {" · "}
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="underline hover:text-schermo"
              >
                {showAll ? "Mostra meno" : "Mostra tutti"}
              </button>
            </>
          )}
        </p>
      )}
    </div>
  );
}
