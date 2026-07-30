"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  closeRoomPoll,
  controlRoom,
  createRoomPoll,
  heartbeatRoom,
  joinRoom,
  postRoomMessage,
  postRoomReaction,
  setRoomReady,
  voteRoomPoll,
} from "@/lib/room-actions";

type Room = {
  mode: "youtube" | "watch_along" | "licensed_public";
  youtubeVideoId: string | null;
  externalPlaybackUrl: string | null;
  streamerUrl: string | null;
  rightsBasis: "public_domain" | "creator_owned" | "licensed" | "consumer_account";
  rightsSourceUrl: string | null;
  playbackStatus: "waiting" | "playing" | "paused" | "ended";
  positionSeconds: number;
  revision: number;
  updatedAt: string;
};

type Participant = {
  userId: number;
  name: string;
  ready: boolean;
  online: boolean;
};

type Message = {
  id: number;
  userId: number;
  userName: string;
  kind: "chat" | "reaction" | "system";
  body: string;
  timecodeSeconds: number | null;
  createdAt: string;
};

type Poll = {
  id: number;
  question: string;
  status: "open" | "closed";
  options: { id: number; label: string; votes: number }[];
  myOptionId: number | null;
};

function timestamp(value: string) {
  const normalized = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  const parsed = new Date(normalized).getTime();
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function timecode(seconds: number) {
  const safe = Math.max(0, Math.round(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${minutes}:${String(secs).padStart(2, "0")}`;
}

function youtubeCommand(
  iframe: HTMLIFrameElement | null,
  func: "playVideo" | "pauseVideo" | "seekTo",
  args: unknown[] = []
) {
  iframe?.contentWindow?.postMessage(
    JSON.stringify({ event: "command", func, args }),
    "https://www.youtube.com"
  );
}

export function RoomLiveClient({
  eventId,
  currentUserId,
  canManage,
  room,
  participants,
  messages,
  polls,
}: {
  eventId: number;
  currentUserId: number;
  canManage: boolean;
  room: Room;
  participants: Participant[];
  messages: Message[];
  polls: Poll[];
}) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [now, setNow] = useState(Date.now());
  const [ready, setReady] = useState(
    participants.find((participant) => participant.userId === currentUserId)?.ready ?? false
  );
  const [chat, setChat] = useState("");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState("");
  const [feedback, setFeedback] = useState("");
  const [pending, startTransition] = useTransition();

  const position = useMemo(() => {
    if (room.playbackStatus !== "playing") return room.positionSeconds;
    return Math.min(
      86_400,
      room.positionSeconds + Math.max(0, (now - timestamp(room.updatedAt)) / 1000)
    );
  }, [now, room.playbackStatus, room.positionSeconds, room.updatedAt]);

  useEffect(() => {
    startTransition(() => {
      void joinRoom(eventId);
    });
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    const refresh = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 3500);
    const heartbeat = window.setInterval(() => {
      startTransition(() => {
        void heartbeatRoom(eventId);
      });
    }, 20_000);
    return () => {
      window.clearInterval(clock);
      window.clearInterval(refresh);
      window.clearInterval(heartbeat);
    };
  }, [eventId, router]);

  useEffect(() => {
    if (room.mode !== "youtube" || !iframeRef.current) return;
    youtubeCommand(iframeRef.current, "seekTo", [Math.round(position), true]);
    if (room.playbackStatus === "playing") {
      youtubeCommand(iframeRef.current, "playVideo");
    } else {
      youtubeCommand(iframeRef.current, "pauseVideo");
    }
    // Revision is authoritative sync boundary. Position intentionally sampled once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.revision, room.mode, room.playbackStatus]);

  const run = (task: () => Promise<{ ok?: boolean; error?: string } | void>, success = "") => {
    setFeedback("");
    startTransition(async () => {
      try {
        const result = await task();
        if (result && "error" in result && result.error) setFeedback(result.error);
        else if (success) setFeedback(success);
        router.refresh();
      } catch {
        setFeedback("Connessione persa. Riprova.");
      }
    });
  };

  const control = (command: "play" | "pause" | "seek" | "end", nextPosition = position) =>
    run(
      () =>
        controlRoom(eventId, {
          command,
          positionSeconds: Math.round(nextPosition),
          revision: room.revision,
        }),
      "Timecode condiviso aggiornato."
    );

  const activeParticipants = participants.filter((participant) => participant.online);
  const readyCount = activeParticipants.filter((participant) => participant.ready).length;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-5">
        <section className="cinemascope overflow-hidden rounded-lg" aria-label="Schermo condiviso">
          {room.mode === "youtube" && room.youtubeVideoId ? (
            <div className="aspect-video bg-black">
              <iframe
                ref={iframeRef}
                title="Video YouTube della sala"
                src={`https://www.youtube.com/embed/${room.youtubeVideoId}?enablejsapi=1&playsinline=1&rel=0`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : room.mode === "watch_along" ? (
            <div className="flex aspect-video flex-col items-center justify-center gap-4 bg-notte-fonda p-6 text-center">
              <div className="text-5xl" aria-hidden="true">
                🎧
              </div>
              <div>
                <h2 className="titlecard text-xl">Watch-along</h2>
                <p className="mt-2 max-w-lg text-sm text-fumo">
                  Film non trasmesso da Serate Film. Apri tua copia legale, poi
                  segui timecode comune.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {room.externalPlaybackUrl && (
                  <a
                    href={room.externalPlaybackUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-proiettore px-4 py-2.5 text-sm font-semibold text-notte-fonda"
                  >
                    Apri film legalmente ↗
                  </a>
                )}
                {room.streamerUrl && (
                  <a
                    href={room.streamerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-riga px-4 py-2.5 text-sm text-schermo"
                  >
                    Apri live creator ↗
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-notte-fonda p-6 text-center">
              <div className="text-5xl" aria-hidden="true">
                🎟️
              </div>
              <h2 className="titlecard text-xl">Proiezione autorizzata</h2>
              <p className="max-w-lg text-sm text-fumo">
                Serate Film coordina partecipanti e conversazione. Contenuto resta
                su infrastruttura titolare dei diritti.
              </p>
            </div>
          )}
        </section>

        <section className="ticket p-4 sm:p-5" aria-labelledby="sync-title">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow" id="sync-title">
                Timecode condiviso
              </p>
              <p className="mt-1 font-mono text-3xl text-schermo" aria-live="polite">
                {timecode(position)}
              </p>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-xs ${
                room.playbackStatus === "playing"
                  ? "border-proiettore text-proiettore"
                  : "border-riga text-fumo"
              }`}
            >
              {room.playbackStatus === "playing" && "▶ In riproduzione"}
              {room.playbackStatus === "paused" && "Ⅱ In pausa"}
              {room.playbackStatus === "waiting" && "In attesa"}
              {room.playbackStatus === "ended" && "Titoli di coda"}
            </span>
          </div>

          {canManage ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  control(room.playbackStatus === "playing" ? "pause" : "play")
                }
                className="rounded-lg bg-proiettore px-4 py-2 text-sm font-semibold text-notte-fonda disabled:opacity-50"
              >
                {room.playbackStatus === "playing" ? "Pausa per tutti" : "Avvia per tutti"}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => control("seek", Math.max(0, position - 10))}
                className="rounded-lg border border-riga px-3 py-2 text-sm text-fumo"
              >
                −10 s
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => control("seek", position + 30)}
                className="rounded-lg border border-riga px-3 py-2 text-sm text-fumo"
              >
                +30 s
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => control("end")}
                className="rounded-lg border border-riga px-3 py-2 text-sm text-fumo"
              >
                Fine
              </button>
            </div>
          ) : (
            <p className="mt-3 text-xs text-fumo">
              Organizzatore controlla timecode. Player prova riallineamento a ogni
              comando.
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-riga pt-4">
            <p className="text-sm text-fumo">
              {readyCount}/{Math.max(activeParticipants.length, 1)} pronti
            </p>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                const next = !ready;
                setReady(next);
                run(() => setRoomReady(eventId, next));
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                ready
                  ? "border border-proiettore bg-proiettore/10 text-proiettore"
                  : "bg-proiettore text-notte-fonda"
              }`}
            >
              {ready ? "✓ Pronto" : "Sono pronto"}
            </button>
          </div>
          {feedback && (
            <p className="mt-3 text-xs text-proiettore" aria-live="polite">
              {feedback}
            </p>
          )}
        </section>

        <section className="ticket p-4 sm:p-5" aria-labelledby="people-title">
          <p className="step-title" id="people-title">
            In sala
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {participants.map((participant) => (
              <li
                key={participant.userId}
                className="flex items-center justify-between rounded-lg border border-riga bg-notte px-3 py-2"
              >
                <span className="flex items-center gap-2 text-sm">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      participant.online ? "bg-proiettore" : "bg-riga"
                    }`}
                    aria-hidden="true"
                  />
                  {participant.name}
                </span>
                <span className="text-xs text-fumo">
                  {participant.ready ? "pronto" : participant.online ? "si prepara" : "fuori sala"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {room.rightsSourceUrl && (
          <aside className="rounded-lg border border-riga px-4 py-3 text-xs text-fumo">
            Diritti dichiarati da organizzatore:{" "}
            <a
              href={room.rightsSourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-proiettore underline"
            >
              consulta fonte ↗
            </a>
            . Presenza su YouTube non prova pubblico dominio.
          </aside>
        )}
      </div>

      <aside className="space-y-5 lg:sticky lg:top-5 lg:self-start">
        <section className="ticket overflow-hidden" aria-labelledby="live-title">
          <div className="border-b border-riga px-4 py-3">
            <p className="step-title" id="live-title">
              Reazioni dal vivo
            </p>
            <div className="mt-3 flex gap-1.5">
              {["❤️", "😂", "😮", "👏", "🍿"].map((reaction) => (
                <button
                  key={reaction}
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    run(() => postRoomReaction(eventId, reaction, position))
                  }
                  aria-label={`Reagisci ${reaction}`}
                  className="rounded-lg border border-riga bg-notte px-2.5 py-2 text-lg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {reaction}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto px-4 py-3">
            {messages.length === 0 ? (
              <p className="py-8 text-center text-sm text-fumo">
                Silenzio in sala. Rompilo senza spoiler.
              </p>
            ) : (
              <ol className="space-y-3">
                {messages.map((message) => (
                  <li key={message.id} className="text-sm">
                    {message.kind === "reaction" ? (
                      <p className="text-fumo">
                        <span className="text-lg">{message.body}</span>{" "}
                        {message.userName} ·{" "}
                        <span className="font-mono text-xs">
                          {timecode(message.timecodeSeconds ?? 0)}
                        </span>
                      </p>
                    ) : (
                      <>
                        <p className="text-xs text-fumo">
                          {message.userName} ·{" "}
                          {timecode(message.timecodeSeconds ?? 0)}
                        </p>
                        <p className="mt-0.5 break-words text-schermo">{message.body}</p>
                      </>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>

          <form
            className="border-t border-riga p-3"
            onSubmit={(event) => {
              event.preventDefault();
              const body = chat.trim();
              if (!body) return;
              run(async () => {
                const result = await postRoomMessage(eventId, body, position);
                if (!result.error) setChat("");
                return result;
              });
            }}
          >
            <label className="sr-only" htmlFor="room-message">
              Messaggio
            </label>
            <div className="flex gap-2">
              <input
                id="room-message"
                value={chat}
                onChange={(event) => setChat(event.target.value)}
                maxLength={500}
                placeholder="Commenta senza spoiler…"
                className="min-w-0 flex-1 rounded-lg border border-riga bg-notte px-3 py-2 text-sm"
              />
              <button
                disabled={pending || !chat.trim()}
                className="rounded-lg bg-proiettore px-3 py-2 text-sm font-semibold text-notte-fonda disabled:opacity-40"
              >
                Invia
              </button>
            </div>
          </form>
        </section>

        <section className="ticket p-4" aria-labelledby="polls-title">
          <p className="step-title" id="polls-title">
            Sondaggi
          </p>
          <div className="mt-4 space-y-5">
            {polls.length === 0 && (
              <p className="text-sm text-fumo">Nessun sondaggio aperto.</p>
            )}
            {polls.map((poll) => {
              const total = poll.options.reduce((sum, option) => sum + option.votes, 0);
              return (
                <article key={poll.id}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold">{poll.question}</h3>
                    {poll.status === "closed" && (
                      <span className="text-xs text-fumo">chiuso</span>
                    )}
                  </div>
                  <div className="mt-2 space-y-2">
                    {poll.options.map((option) => {
                      const percent = total ? Math.round((option.votes / total) * 100) : 0;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          disabled={pending || poll.status === "closed"}
                          onClick={() =>
                            run(() => voteRoomPoll(eventId, poll.id, option.id))
                          }
                          className={`relative block w-full overflow-hidden rounded-lg border px-3 py-2 text-left text-xs disabled:cursor-default ${
                            poll.myOptionId === option.id
                              ? "border-proiettore"
                              : "border-riga"
                          }`}
                        >
                          <span
                            className="absolute inset-y-0 left-0 bg-proiettore/10"
                            style={{ width: `${percent}%` }}
                          />
                          <span className="relative flex justify-between gap-2">
                            <span>{option.label}</span>
                            <span className="text-fumo">
                              {option.votes} · {percent}%
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {canManage && poll.status === "open" && (
                    <button
                      type="button"
                      onClick={() => run(() => closeRoomPoll(eventId, poll.id))}
                      className="mt-2 text-xs text-fumo underline"
                    >
                      Chiudi sondaggio
                    </button>
                  )}
                </article>
              );
            })}
          </div>

          {canManage && (
            <form
              className="mt-5 space-y-2 border-t border-riga pt-4"
              onSubmit={(event) => {
                event.preventDefault();
                run(async () => {
                  const result = await createRoomPoll(
                    eventId,
                    pollQuestion,
                    pollOptions
                  );
                  if (!result.error) {
                    setPollQuestion("");
                    setPollOptions("");
                  }
                  return result;
                });
              }}
            >
              <p className="eyebrow">Nuovo sondaggio</p>
              <input
                value={pollQuestion}
                onChange={(event) => setPollQuestion(event.target.value)}
                maxLength={160}
                placeholder="Facciamo una pausa?"
                className="w-full rounded-lg border border-riga bg-notte px-3 py-2 text-sm"
              />
              <textarea
                value={pollOptions}
                onChange={(event) => setPollOptions(event.target.value)}
                placeholder={"Sì\nNo\nTra 10 minuti"}
                rows={3}
                className="w-full resize-none rounded-lg border border-riga bg-notte px-3 py-2 text-sm"
              />
              <button
                disabled={pending || !pollQuestion.trim() || !pollOptions.trim()}
                className="rounded-lg border border-proiettore px-3 py-2 text-xs text-proiettore disabled:opacity-40"
              >
                Apri sondaggio
              </button>
            </form>
          )}
        </section>
      </aside>
    </div>
  );
}
