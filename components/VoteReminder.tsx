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
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [showAll, setShowAll] = useState(false);

  function buildReminderText() {
    const names = new Intl.ListFormat("it", {
      style: "long",
      type: "conjunction",
    }).format(missingNames);
    const absoluteUrl = `${window.location.origin}${copyUrl}`;
    if (label.toLowerCase() === "date") {
      return `🎬 ${names}: per la prossima serata non risulta ancora nessuna scelta sulle date.\n\nSegnate qui quando ci siete:\n${absoluteUrl}`;
    }
    return `🎬 ${names}: per la prossima serata non risulta ancora nessuna preferenza sui film.\n\nVotate qui:\n${absoluteUrl}`;
  }

  async function copy() {
    const text = buildReminderText();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch {
        setStatus("error");
        return;
      }
    }
    setStatus("success");
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
        {missingNames.length > 0 && (
          <button
            type="button"
            onClick={copy}
            className="shrink-0 rounded-lg border border-riga px-4 py-1.5 text-sm text-fumo transition-colors hover:border-proiettore hover:text-schermo"
          >
            {copied ? "Copiato ✓" : `Copia promemoria ${label.toLowerCase()}`}
          </button>
        )}
      </div>
      <p aria-live="polite" className="sr-only">
        {status === "success" && "Promemoria copiato negli appunti"}
        {status === "error" && "Non siamo riusciti a copiare il promemoria"}
      </p>
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
