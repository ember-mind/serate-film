"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { postEventDiscussionMessage } from "@/lib/event-discussion-actions";

type Message = {
  id: number;
  userId: number;
  userName: string;
  body: string;
  createdAt: string;
};

function messageTime(value: string) {
  const normalized = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  return new Intl.DateTimeFormat("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(normalized));
}

export function EventDiscussion({
  eventId,
  currentUserId,
  messages,
}: {
  eventId: number;
  currentUserId: number;
  messages: Message[];
}) {
  const router = useRouter();
  const action = postEventDiscussionMessage.bind(null, eventId);
  const [state, formAction, pending] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const interval = window.setInterval(() => router.refresh(), 10_000);
    return () => window.clearInterval(interval);
  }, [router]);

  useEffect(() => {
    if (!state?.ok) return;
    formRef.current?.reset();
    router.refresh();
  }, [router, state?.ok]);

  const panel = (mobile = false) => (
    <div className={mobile ? "w-[min(22rem,calc(100vw-2rem))] p-4" : "p-4"}>
      <div className="mb-3">
        <p className="eyebrow">Commenti</p>
        <h2 className="mt-1 font-semibold text-schermo">Parliamone qui</h2>
        <p className="mt-1 text-xs leading-5 text-fumo">
          Dubbi, proposte e compromessi mentre scegliete.
        </p>
      </div>

      <div
        className="max-h-80 space-y-2 overflow-y-auto pr-1"
        aria-live="polite"
        aria-label="Messaggi della serata"
      >
        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-lg px-3 py-2 text-sm ${
                message.userId === currentUserId
                  ? "ml-5 bg-proiettore/10"
                  : "mr-5 bg-notte-fonda/70"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <strong className="truncate text-xs text-schermo">{message.userName}</strong>
                <span className="font-mono text-[9px] text-fumo">
                  {messageTime(message.createdAt)}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-wrap break-words leading-5 text-schermo/85">
                {message.body}
              </p>
            </div>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-riga p-3 text-xs text-fumo">
            Nessun commento. Rompi il ghiaccio.
          </p>
        )}
      </div>

      <form ref={formRef} action={formAction} className="mt-3 grid gap-2">
        <textarea
          name="body"
          rows={2}
          required
          maxLength={500}
          placeholder="Scrivi al gruppo…"
          aria-label="Nuovo commento"
          className="resize-none rounded-lg border border-riga bg-notte px-3 py-2 text-sm placeholder:text-fumo/50"
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-fumo">Aggiornamento automatico</span>
          <button
            disabled={pending}
            className="rounded-lg bg-proiettore px-3 py-2 text-xs font-semibold text-notte-fonda disabled:opacity-50"
          >
            {pending ? "Invio…" : "Invia"}
          </button>
        </div>
        {state?.error && <p className="text-xs text-velluto">{state.error}</p>}
      </form>
    </div>
  );

  return (
    <>
      <aside className="ticket sticky top-24 hidden lg:block">{panel()}</aside>
      <details className="fixed bottom-16 right-3 z-30 overflow-hidden rounded-xl border border-proiettore/60 bg-sipario shadow-2xl lg:hidden">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-proiettore">
          💬 Commenti{messages.length > 0 ? ` · ${messages.length}` : ""}
        </summary>
        <div className="border-t border-riga">{panel(true)}</div>
      </details>
    </>
  );
}
