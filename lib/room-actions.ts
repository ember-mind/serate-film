"use server";

import { and, eq, gt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  eventRooms,
  events,
  roomMessages,
  roomParticipants,
  roomPollOptions,
  roomPollVotes,
  roomPolls,
  screeningLicenses,
} from "@/db/schema";
import { authorizeEventAction } from "@/lib/access";

export type RoomActionResult = { ok?: boolean; error?: string };

const REACTIONS = new Set(["❤️", "😂", "😮", "👏", "🍿"]);
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

function clean(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

function httpsUrl(value: unknown, required = false) {
  const raw = clean(value, 500);
  if (!raw) return required ? null : "";
  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function youtubeId(value: unknown) {
  const raw = clean(value, 300);
  if (YOUTUBE_ID.test(raw)) return raw;
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");
    let id = "";
    if (host === "youtu.be") id = url.pathname.split("/").filter(Boolean)[0] ?? "";
    if (host === "youtube.com" || host === "m.youtube.com") {
      id =
        url.searchParams.get("v") ??
        url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] ??
        "";
    }
    return YOUTUBE_ID.test(id) ? id : null;
  } catch {
    return null;
  }
}

export async function configureRoom(
  eventId: number,
  _previous: RoomActionResult | undefined,
  formData: FormData
): Promise<RoomActionResult> {
  const { user } = await authorizeEventAction("configureRoom", eventId);

  const mode = clean(formData.get("mode"), 30);
  if (!["youtube", "watch_along", "licensed_public"].includes(mode)) {
    return { error: "Scegli tipo di sala." };
  }

  let mediaProvider: "youtube" | "external" | "licensed";
  let rightsBasis: "public_domain" | "creator_owned" | "licensed" | "consumer_account";
  let videoId: string | null = null;
  let externalPlaybackUrl: string | null = null;
  let streamerUrl: string | null = null;
  let rightsSourceUrl: string | null = null;

  if (mode === "youtube") {
    mediaProvider = "youtube";
    videoId = youtubeId(formData.get("youtubeUrl"));
    rightsBasis = clean(formData.get("rightsBasis"), 30) as typeof rightsBasis;
    rightsSourceUrl = httpsUrl(formData.get("rightsSourceUrl"), true);
    if (!videoId) return { error: "Link o ID YouTube non valido." };
    if (!["public_domain", "creator_owned", "licensed"].includes(rightsBasis)) {
      return { error: "Indica base dei diritti." };
    }
    if (!rightsSourceUrl) return { error: "Aggiungi fonte che documenta diritti." };
  } else if (mode === "watch_along") {
    mediaProvider = "external";
    rightsBasis = "consumer_account";
    externalPlaybackUrl = httpsUrl(formData.get("externalPlaybackUrl"), true);
    streamerUrl = httpsUrl(formData.get("streamerUrl")) || null;
    if (!externalPlaybackUrl) return { error: "Aggiungi link legale dove aprire film." };
  } else {
    mediaProvider = "licensed";
    rightsBasis = "licensed";
  }

  await db
    .insert(eventRooms)
    .values({
      eventId,
      mode: mode as "youtube" | "watch_along" | "licensed_public",
      mediaProvider,
      youtubeVideoId: videoId,
      externalPlaybackUrl,
      streamerUrl,
      rightsBasis,
      rightsSourceUrl,
      playbackStatus: "waiting",
      positionSeconds: 0,
      revision: 0,
      updatedBy: user.id,
      updatedAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: eventRooms.eventId,
      set: {
        mode: mode as "youtube" | "watch_along" | "licensed_public",
        mediaProvider,
        youtubeVideoId: videoId,
        externalPlaybackUrl,
        streamerUrl,
        rightsBasis,
        rightsSourceUrl,
        playbackStatus: "waiting",
        positionSeconds: 0,
        revision: sql`${eventRooms.revision} + 1`,
        updatedBy: user.id,
        updatedAt: new Date().toISOString(),
      },
    });

  await db
    .update(events)
    .set({ viewingMode: mode as "youtube" | "watch_along" | "licensed_public" })
    .where(eq(events.id, eventId));

  if (mode === "licensed_public") {
    await db
      .insert(screeningLicenses)
      .values({ eventId })
      .onConflictDoNothing();
  }

  revalidatePath(`/serate/${eventId}`);
  revalidatePath(`/serate/${eventId}/sala`);
  return { ok: true };
}

export async function joinRoom(eventId: number): Promise<RoomActionResult> {
  const { user } = await authorizeEventAction("joinRoom", eventId);
  const now = new Date().toISOString();
  await db
    .insert(roomParticipants)
    .values({ eventId, userId: user.id, ready: false, lastSeenAt: now })
    .onConflictDoUpdate({
      target: [roomParticipants.eventId, roomParticipants.userId],
      // Ogni nuovo ingresso richiede conferma esplicita: un "pronto" della
      // sessione precedente non deve avviare il film per errore.
      set: { ready: false, lastSeenAt: now },
    });
  revalidatePath(`/serate/${eventId}/sala`);
  return { ok: true };
}

export async function heartbeatRoom(eventId: number): Promise<void> {
  const { user } = await authorizeEventAction("heartbeatRoom", eventId);
  await db
    .update(roomParticipants)
    .set({ lastSeenAt: new Date().toISOString() })
    .where(
      and(
        eq(roomParticipants.eventId, eventId),
        eq(roomParticipants.userId, user.id)
      )
    );
}

export async function setRoomReady(
  eventId: number,
  ready: boolean
): Promise<RoomActionResult> {
  const { user } = await authorizeEventAction("setRoomReady", eventId);
  const now = new Date().toISOString();
  await db
    .insert(roomParticipants)
    .values({ eventId, userId: user.id, ready: Boolean(ready), lastSeenAt: now })
    .onConflictDoUpdate({
      target: [roomParticipants.eventId, roomParticipants.userId],
      set: { ready: Boolean(ready), lastSeenAt: now },
    });
  revalidatePath(`/serate/${eventId}/sala`);
  return { ok: true };
}

export async function controlRoom(
  eventId: number,
  input: {
    command: "play" | "pause" | "seek" | "end";
    positionSeconds: number;
    revision: number;
  }
): Promise<RoomActionResult> {
  const { user } = await authorizeEventAction("controlRoom", eventId);
  const room = await db.query.eventRooms.findFirst({
    where: eq(eventRooms.eventId, eventId),
  });
  if (!room) return { error: "Sala non configurata." };

  const command = input?.command;
  const position = Math.round(Number(input?.positionSeconds));
  const revision = Math.round(Number(input?.revision));
  if (!["play", "pause", "seek", "end"].includes(command)) {
    return { error: "Comando non valido." };
  }
  if (!Number.isFinite(position) || position < 0 || position > 86_400) {
    return { error: "Timecode non valido." };
  }
  if (!Number.isInteger(revision) || revision !== room.revision) {
    return { error: "Sala aggiornata altrove. Riprova." };
  }

  const playbackStatus =
    command === "play"
      ? "playing"
      : command === "end"
        ? "ended"
        : "paused";
  const updated = await db
    .update(eventRooms)
    .set({
      playbackStatus,
      positionSeconds: position,
      revision: room.revision + 1,
      updatedBy: user.id,
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(
        eq(eventRooms.eventId, eventId),
        eq(eventRooms.revision, room.revision)
      )
    )
    .returning({ eventId: eventRooms.eventId });

  if (updated.length === 0) return { error: "Comando superato da altro aggiornamento." };
  revalidatePath(`/serate/${eventId}/sala`);
  return { ok: true };
}

export async function postRoomMessage(
  eventId: number,
  bodyInput: string,
  timecodeSeconds: number
): Promise<RoomActionResult> {
  const { user } = await authorizeEventAction("postRoomMessage", eventId);
  const body = clean(bodyInput, 500);
  const timecode = Math.max(0, Math.min(86_400, Math.round(Number(timecodeSeconds) || 0)));
  if (!body) return { error: "Scrivi messaggio." };

  const recent = await db.query.roomMessages.findMany({
    where: and(
      eq(roomMessages.eventId, eventId),
      eq(roomMessages.userId, user.id),
      gt(roomMessages.createdAt, sql`datetime('now', '-10 seconds')`)
    ),
  });
  if (recent.length >= 5) return { error: "Troppi messaggi: attendi qualche secondo." };

  await db.insert(roomMessages).values({
    eventId,
    userId: user.id,
    kind: "chat",
    body,
    timecodeSeconds: timecode,
  });
  revalidatePath(`/serate/${eventId}/sala`);
  return { ok: true };
}

export async function postRoomReaction(
  eventId: number,
  reaction: string,
  timecodeSeconds: number
): Promise<RoomActionResult> {
  const { user } = await authorizeEventAction("postRoomReaction", eventId);
  if (!REACTIONS.has(reaction)) return { error: "Reazione non valida." };
  const timecode = Math.max(0, Math.min(86_400, Math.round(Number(timecodeSeconds) || 0)));

  const recent = await db.query.roomMessages.findMany({
    where: and(
      eq(roomMessages.eventId, eventId),
      eq(roomMessages.userId, user.id),
      eq(roomMessages.kind, "reaction"),
      gt(roomMessages.createdAt, sql`datetime('now', '-10 seconds')`)
    ),
  });
  if (recent.length >= 5) return { error: "Reazioni in pausa per qualche secondo." };

  await db.insert(roomMessages).values({
    eventId,
    userId: user.id,
    kind: "reaction",
    body: reaction,
    timecodeSeconds: timecode,
  });
  revalidatePath(`/serate/${eventId}/sala`);
  return { ok: true };
}

export async function createRoomPoll(
  eventId: number,
  questionInput: string,
  optionsInput: string
): Promise<RoomActionResult> {
  const { user } = await authorizeEventAction("createRoomPoll", eventId);
  const question = clean(questionInput, 160);
  const options = [
    ...new Set(
      String(optionsInput ?? "")
        .split(/\r?\n|,/)
        .map((option) => clean(option, 80))
        .filter(Boolean)
    ),
  ].slice(0, 6);

  if (!question) return { error: "Scrivi domanda." };
  if (options.length < 2) return { error: "Servono almeno due opzioni." };

  const [poll] = await db
    .insert(roomPolls)
    .values({ eventId, question, createdBy: user.id })
    .returning();
  await db
    .insert(roomPollOptions)
    .values(options.map((label) => ({ pollId: poll.id, label })));

  revalidatePath(`/serate/${eventId}/sala`);
  return { ok: true };
}

export async function voteRoomPoll(
  eventId: number,
  pollId: number,
  optionId: number
): Promise<RoomActionResult> {
  const { user } = await authorizeEventAction("voteRoomPoll", eventId);
  const [poll, option] = await Promise.all([
    db.query.roomPolls.findFirst({
      where: and(eq(roomPolls.id, pollId), eq(roomPolls.eventId, eventId)),
    }),
    db.query.roomPollOptions.findFirst({
      where: and(eq(roomPollOptions.id, optionId), eq(roomPollOptions.pollId, pollId)),
    }),
  ]);
  if (!poll || poll.status !== "open" || !option) return { error: "Sondaggio chiuso." };

  await db
    .insert(roomPollVotes)
    .values({ pollId, userId: user.id, optionId })
    .onConflictDoUpdate({
      target: [roomPollVotes.pollId, roomPollVotes.userId],
      set: { optionId },
    });
  revalidatePath(`/serate/${eventId}/sala`);
  return { ok: true };
}

export async function closeRoomPoll(
  eventId: number,
  pollId: number
): Promise<RoomActionResult> {
  await authorizeEventAction("closeRoomPoll", eventId);
  await db
    .update(roomPolls)
    .set({ status: "closed" })
    .where(and(eq(roomPolls.id, pollId), eq(roomPolls.eventId, eventId)));
  revalidatePath(`/serate/${eventId}/sala`);
  return { ok: true };
}

export async function submitScreeningLicense(
  eventId: number,
  _previous: RoomActionResult | undefined,
  formData: FormData
): Promise<RoomActionResult> {
  await authorizeEventAction("submitScreeningLicense", eventId);
  const territory = clean(formData.get("territory"), 2).toUpperCase();
  const capacity = Number(formData.get("capacity"));
  const reference = clean(formData.get("reference"), 120);
  const evidenceUrl = httpsUrl(formData.get("evidenceUrl"), true);
  const expiresAt = clean(formData.get("expiresAt"), 10);

  if (!/^[A-Z]{2}$/.test(territory)) return { error: "Territorio non valido." };
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100_000) {
    return { error: "Capienza non valida." };
  }
  if (!reference) return { error: "Inserisci riferimento licenza." };
  if (!evidenceUrl) return { error: "Inserisci link HTTPS alla prova licenza." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expiresAt) || expiresAt < new Date().toISOString().slice(0, 10)) {
    return { error: "Scadenza non valida o già trascorsa." };
  }

  await db
    .insert(screeningLicenses)
    .values({
      eventId,
      status: "submitted",
      territory,
      capacity,
      reference,
      evidenceUrl,
      expiresAt,
      reviewedBy: null,
      reviewedAt: null,
      updatedAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: screeningLicenses.eventId,
      set: {
        status: "submitted",
        territory,
        capacity,
        reference,
        evidenceUrl,
        expiresAt,
        reviewedBy: null,
        reviewedAt: null,
        updatedAt: new Date().toISOString(),
      },
    });
  revalidatePath(`/serate/${eventId}/sala`);
  return { ok: true };
}

export async function reviewScreeningLicense(
  eventId: number,
  decision: "verified" | "rejected"
): Promise<RoomActionResult> {
  const { user: admin } = await authorizeEventAction("reviewScreeningLicense", eventId);
  const license = await db.query.screeningLicenses.findFirst({
    where: eq(screeningLicenses.eventId, eventId),
  });
  if (!license || license.status !== "submitted") {
    return { error: "Richiesta non pronta per verifica." };
  }
  if (decision === "verified" && (!license.expiresAt || license.expiresAt < new Date().toISOString().slice(0, 10))) {
    return { error: "Licenza scaduta." };
  }

  await db
    .update(screeningLicenses)
    .set({
      status: decision,
      reviewedBy: admin.id,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(screeningLicenses.eventId, eventId));
  revalidatePath(`/serate/${eventId}/sala`);
  return { ok: true };
}
