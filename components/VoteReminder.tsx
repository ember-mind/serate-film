"use client";

import { useState } from "react";

// Solo per chi organizza: quante scelte sono state registrate e chi non ne ha
// ancora registrata una.
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
  copyUrl?: string;
}) {
  void copyUrl;
  const [showAll, setShowAll] = useState(false);

  const visibleNames = showAll ? missingNames : missingNames.slice(0, 4);
  const hiddenCount = missingNames.length - visibleNames.length;

  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-fumo">
          {label} · {votedCount} su {totalCount} hanno registrato una scelta
        </p>
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
