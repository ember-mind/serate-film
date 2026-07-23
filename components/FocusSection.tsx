"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const SECTION_IDS: Record<string, string> = {
  date: "vota-date",
  film: "vota-film",
};

// Se il deep-link porta ?focus=date|film, scrolla alla sezione giusta e
// sposta il focus sul titolo (accessibilità), senza mai selezionare un voto.
export function FocusSection() {
  const searchParams = useSearchParams();
  const focus = searchParams.get("focus");

  useEffect(() => {
    const id = focus ? SECTION_IDS[focus] : undefined;
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    if (el.tabIndex < 0) el.tabIndex = -1;
    el.focus({ preventScroll: true });
  }, [focus]);

  return null;
}
