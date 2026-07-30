import Link from "next/link";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
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
  users,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { canAccessEvent } from "@/lib/access";
import { LicenseWorkflow } from "./LicenseWorkflow";
import { RoomLiveClient } from "./RoomLiveClient";
import { RoomSetupForm } from "./RoomSetupForm";

export const dynamic = "force-dynamic";

function dateMillis(value: string) {
  const normalized = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  const parsed = new Date(normalized).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

export default async function SalaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isInteger(eventId) || eventId < 1) notFound();

  const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
  if (!event) notFound();

  const canManage = user.isAdmin || event.createdBy === user.id;
  const allowed = await canAccessEvent(event, user);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-md pt-12 text-center">
        <p className="eyebrow">Ingresso riservato</p>
        <h1 className="titlecard mt-2 text-2xl">Sala non accessibile</h1>
        <p className="mt-3 text-sm text-fumo">
          Serve invito o appartenenza al circolo organizzatore.
        </p>
        <Link href="/serate" className="mt-6 inline-block text-sm text-proiettore underline">
          Torna alle serate
        </Link>
      </div>
    );
  }

  const room = await db.query.eventRooms.findFirst({
    where: eq(eventRooms.eventId, eventId),
  });
  const license =
    room?.mode === "licensed_public"
      ? await db.query.screeningLicenses.findFirst({
          where: eq(screeningLicenses.eventId, eventId),
        })
      : null;

  const eventTitle = event.title || `Serata #${event.id}`;

  if (!room) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link href={`/serate/${eventId}`} className="text-sm text-fumo hover:text-schermo">
          ← {eventTitle}
        </Link>
        <header className="mt-7">
          <p className="eyebrow">Sala online</p>
          <h1 className="titlecard mt-2 text-2xl sm:text-3xl">{eventTitle}</h1>
        </header>
        <section className="ticket mt-7 p-5 sm:p-7">
          {canManage ? (
            <RoomSetupForm eventId={eventId} />
          ) : (
            <div className="py-8 text-center">
              <p className="text-lg font-semibold">Sala non ancora preparata</p>
              <p className="mt-2 text-sm text-fumo">
                Organizzatore deve scegliere formato e contenuto.
              </p>
            </div>
          )}
        </section>
      </div>
    );
  }

  const licenseExpired =
    license?.expiresAt && license.expiresAt < new Date().toISOString().slice(0, 10);
  const licensedAllowed =
    room.mode !== "licensed_public" ||
    (license?.status === "verified" && !licenseExpired);

  if (!licensedAllowed) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link href={`/serate/${eventId}`} className="text-sm text-fumo hover:text-schermo">
          ← {eventTitle}
        </Link>
        <header className="my-7">
          <p className="eyebrow">Proiezione pubblica</p>
          <h1 className="titlecard mt-2 text-2xl sm:text-3xl">{eventTitle}</h1>
        </header>
        <LicenseWorkflow
          eventId={eventId}
          license={
            license
              ? {
                  ...license,
                  status: licenseExpired ? "expired" : license.status,
                }
              : null
          }
          canManage={canManage}
          isAdmin={user.isAdmin}
        />
        {canManage && (
          <details className="ticket mt-5 p-4">
            <summary className="cursor-pointer text-sm text-fumo">
              Cambia tipo di sala
            </summary>
            <div className="mt-5">
              <RoomSetupForm eventId={eventId} compact />
            </div>
          </details>
        )}
      </div>
    );
  }

  const [participantRows, messageRows, pollRows, people] = await Promise.all([
    db.query.roomParticipants.findMany({
      where: eq(roomParticipants.eventId, eventId),
      orderBy: asc(roomParticipants.joinedAt),
    }),
    db.query.roomMessages.findMany({
      where: eq(roomMessages.eventId, eventId),
      orderBy: desc(roomMessages.id),
      limit: 80,
    }),
    db.query.roomPolls.findMany({
      where: eq(roomPolls.eventId, eventId),
      orderBy: desc(roomPolls.id),
      limit: 8,
    }),
    db.query.users.findMany({ orderBy: asc(users.name) }),
  ]);

  const personName = new Map(people.map((person) => [person.id, person.name]));
  const pollIds = pollRows.map((poll) => poll.id);
  const [optionRows, voteRows] =
    pollIds.length > 0
      ? await Promise.all([
          db.query.roomPollOptions.findMany({
            where: inArray(roomPollOptions.pollId, pollIds),
            orderBy: asc(roomPollOptions.id),
          }),
          db.query.roomPollVotes.findMany({
            where: inArray(roomPollVotes.pollId, pollIds),
          }),
        ])
      : [[], []];

  const onlineCutoff = Date.now() - 45_000;
  const participantIds = new Set(participantRows.map((participant) => participant.userId));
  const visibleParticipantRows = participantRows.length
    ? participantRows
    : [
        {
          eventId,
          userId: user.id,
          ready: false,
          joinedAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
        },
      ];
  if (!participantIds.has(user.id) && participantRows.length > 0) {
    visibleParticipantRows.push({
      eventId,
      userId: user.id,
      ready: false,
      joinedAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    });
  }

  return (
    <div>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href={`/serate/${eventId}`} className="text-sm text-fumo hover:text-schermo">
            ← Torna alla serata
          </Link>
          <p className="eyebrow mt-5">
            {room.mode === "youtube" && "Sala YouTube"}
            {room.mode === "watch_along" && "Watch-along"}
            {room.mode === "licensed_public" && "Proiezione autorizzata"}
          </p>
          <h1 className="titlecard mt-1 text-2xl sm:text-3xl">{eventTitle}</h1>
        </div>
        <span className="self-start rounded-full border border-riga px-3 py-1.5 text-xs text-fumo sm:self-auto">
          Aggiornamento automatico · 3,5 s
        </span>
      </header>

      <RoomLiveClient
        eventId={eventId}
        currentUserId={user.id}
        canManage={canManage}
        room={{
          mode: room.mode,
          youtubeVideoId: room.youtubeVideoId,
          externalPlaybackUrl: room.externalPlaybackUrl,
          streamerUrl: room.streamerUrl,
          rightsBasis: room.rightsBasis,
          rightsSourceUrl: room.rightsSourceUrl,
          playbackStatus: room.playbackStatus,
          positionSeconds: room.positionSeconds,
          revision: room.revision,
          updatedAt: room.updatedAt,
        }}
        participants={visibleParticipantRows.map((participant) => ({
          userId: participant.userId,
          name: personName.get(participant.userId) ?? "Ospite",
          ready: participant.ready,
          online:
            participant.userId === user.id ||
            dateMillis(participant.lastSeenAt) >= onlineCutoff,
        }))}
        messages={[...messageRows].reverse().map((message) => ({
          id: message.id,
          userId: message.userId,
          userName: personName.get(message.userId) ?? "Ospite",
          kind: message.kind,
          body: message.body,
          timecodeSeconds: message.timecodeSeconds,
          createdAt: message.createdAt,
        }))}
        polls={pollRows.map((poll) => ({
          id: poll.id,
          question: poll.question,
          status: poll.status,
          options: optionRows
            .filter((option) => option.pollId === poll.id)
            .map((option) => ({
              id: option.id,
              label: option.label,
              votes: voteRows.filter((vote) => vote.optionId === option.id).length,
            })),
          myOptionId:
            voteRows.find(
              (vote) => vote.pollId === poll.id && vote.userId === user.id
            )?.optionId ?? null,
        }))}
      />

      {canManage && (
        <details className="ticket mt-6 p-4">
          <summary className="cursor-pointer text-sm text-fumo">
            Impostazioni sala
          </summary>
          <div className="mt-5 max-w-2xl">
            <RoomSetupForm eventId={eventId} compact />
          </div>
        </details>
      )}
    </div>
  );
}
