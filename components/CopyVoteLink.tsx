"use client";

import { useState } from "react";

// Solo per chi organizza: copia il link diretto alla scheda voto film di questa serata.
export function CopyVoteLink({ eventId }: { eventId: number }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/serate/${eventId}?focus=film`;
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

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-lg border border-riga px-4 py-1.5 text-sm text-fumo transition-colors hover:border-proiettore hover:text-schermo"
    >
      {copied ? "Copiato ✓" : "Copia link voto film"}
    </button>
  );
}
