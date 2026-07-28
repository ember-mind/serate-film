"use client";

import { useState } from "react";

export function InviteLink({ token, eventTitle }: { token: string; eventTitle: string }) {
  const [message, setMessage] = useState("");
  const path = `/invito/${token}`;

  const copy = async () => {
    const url = new URL(path, window.location.origin).toString();
    await navigator.clipboard.writeText(url);
    setMessage("Link copiato");
    window.setTimeout(() => setMessage(""), 2200);
  };

  const share = async () => {
    const url = new URL(path, window.location.origin).toString();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invito · ${eventTitle}`,
          text: `Ti va una serata film insieme?`,
          url,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await copy();
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={share}
        className="rounded-lg bg-proiettore px-4 py-2.5 text-sm font-semibold text-notte-fonda transition-colors hover:bg-proiettore-acceso"
      >
        Condividi invito
      </button>
      <button
        type="button"
        onClick={copy}
        className="rounded-lg border border-riga px-4 py-2.5 text-sm text-fumo transition-colors hover:border-proiettore hover:text-schermo"
      >
        Copia link
      </button>
      <span className="text-xs text-proiettore" aria-live="polite">
        {message}
      </span>
    </div>
  );
}
