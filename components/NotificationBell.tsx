"use client";

import { useEffect, useState } from "react";
import { openNotifications } from "@/lib/actions";

export function NotificationBell({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    const refresh = async () => {
      try {
        const response = await fetch("/api/notifications/unread", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { count?: number };
        if (typeof data.count === "number") setCount(data.count);
      } catch {
        // La campana riprova al prossimo intervallo o quando la finestra torna attiva.
      }
    };

    const interval = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const active = count > 0;

  return (
    <form action={openNotifications}>
      <button
        aria-label={active ? `${count} ${count === 1 ? "notifica in sospeso" : "notifiche in sospeso"}` : "Notifiche"}
        className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
          active
            ? "border-proiettore/70 bg-proiettore/10 text-proiettore shadow-[0_0_16px_rgba(232,184,75,0.35)]"
            : "border-riga text-fumo hover:border-proiettore/50 hover:text-schermo"
        }`}
      >
        <span aria-hidden className="relative block h-5 w-5">
          <span className="absolute left-1/2 top-0.5 h-3.5 w-3 -translate-x-1/2 rounded-t-full rounded-b-md border-2 border-current" />
          <span className="absolute bottom-0 left-1/2 h-1 w-1.5 -translate-x-1/2 rounded-full bg-current" />
        </span>
        {active && (
          <span className="absolute -right-1.5 -top-1.5 min-w-4 rounded-full bg-velluto px-1 py-0.5 text-center font-mono text-[9px] leading-none text-schermo">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>
    </form>
  );
}
