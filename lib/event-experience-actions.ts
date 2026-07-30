"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  attendance,
  eventRsvps,
  events,
  eventMovies,
  movieBallotItems,
  movieBallots,
  notifications,
  ratingComments,
  ratings,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { canAccessEvent } from "@/lib/access";

type ActionState = { error?: string; ok?: boolean };

async function eventForMember(eventId: number) {
  const user = await requireUser();
  const event = await db.query.events.findFirst({ where: eq(events.id, eventId) });
  if (!event) return null;

  return (await canAccessEvent(event, user)) ? { user, event } : null;
}

export async function saveEventRsvp(
  eventId: number,
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const context = await eventForMember(eventId);
  if (!context) return { error: "Questa serata è riservata." };
  if (context.event.status === "done" || context.event.status === "cancelled") {
    return { error: "Le conferme sono chiuse." };
  }

  const rawStatus = String(formData.get("status") ?? "");
  if (rawStatus !== "yes" && rawStatus !== "maybe" && rawStatus !== "no") {
    return { error: "Scegli se ci sarai." };
  }
  const guestCount = Math.min(6, Math.max(0, Number(formData.get("guestCount")) || 0));
  const note = String(formData.get("note") ?? "").trim().slice(0, 160) || null;

  await db
    .insert(eventRsvps)
    .values({
      eventId,
      userId: context.user.id,
      status: rawStatus,
      guestCount,
      note,
      respondedAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: [eventRsvps.eventId, eventRsvps.userId],
      set: {
        status: rawStatus,
        guestCount,
        note,
        respondedAt: new Date().toISOString(),
      },
    });

  revalidatePath(`/serate/${eventId}`);
  revalidatePath("/");
  return { ok: true };
}

export async function submitConsensusBallot(
  eventId: number,
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const context = await eventForMember(eventId);
  if (!context) return { error: "Questa serata è riservata." };
  if (context.event.status !== "open") return { error: "La scelta del film è chiusa." };

  const candidates = await db.query.eventMovies.findMany({
    where: eq(eventMovies.eventId, eventId),
  });
  const validIds = new Set(candidates.map((candidate) => candidate.id));
  const rankedIds = ["rank1", "rank2", "rank3"]
    .map((name) => Number(formData.get(name)))
    .filter((id) => Number.isInteger(id) && validIds.has(id));
  if (rankedIds.length === 0) return { error: "Indica almeno la tua prima scelta." };
  if (new Set(rankedIds).size !== rankedIds.length) {
    return { error: "Ogni posizione del podio deve avere un film diverso." };
  }

  const vetoIds = [
    ...new Set(
      formData
        .getAll("vetoIds")
        .map(Number)
        .filter((id) => Number.isInteger(id) && validIds.has(id))
    ),
  ];
  if (vetoIds.some((id) => rankedIds.includes(id))) {
    return { error: "Un film sul podio non può essere anche escluso." };
  }

  const previous = await db.query.movieBallots.findFirst({
    where: and(
      eq(movieBallots.eventId, eventId),
      eq(movieBallots.userId, context.user.id)
    ),
  });
  if (previous) {
    await db.delete(movieBallotItems).where(eq(movieBallotItems.ballotId, previous.id));
    await db.delete(movieBallots).where(eq(movieBallots.id, previous.id));
  }

  const [ballot] = await db
    .insert(movieBallots)
    .values({ eventId, userId: context.user.id, submittedAt: new Date().toISOString() })
    .returning();
  await db.insert(movieBallotItems).values([
    ...rankedIds.map((eventMovieId, index) => ({
      ballotId: ballot.id,
      eventMovieId,
      rank: index + 1,
      veto: false,
    })),
    ...vetoIds.map((eventMovieId) => ({
      ballotId: ballot.id,
      eventMovieId,
      rank: null,
      veto: true,
    })),
  ]);

  revalidatePath(`/serate/${eventId}`);
  return { ok: true };
}

export async function addRatingComment(
  eventId: number,
  ratingUserId: number,
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const context = await eventForMember(eventId);
  if (!context || context.event.status !== "done") {
    return { error: "Conversazione non disponibile." };
  }
  const attended = await db.query.attendance.findFirst({
    where: and(
      eq(attendance.eventId, eventId),
      eq(attendance.userId, context.user.id)
    ),
  });
  if (!attended) return { error: "Può commentare chi ha partecipato alla serata." };

  const review = await db.query.ratings.findFirst({
    where: and(eq(ratings.eventId, eventId), eq(ratings.userId, ratingUserId)),
  });
  if (!review?.comment) return { error: "Pagella non trovata." };

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Scrivi una risposta." };
  if (body.length > 400) return { error: "Massimo 400 caratteri." };
  const spoiler = formData.get("spoiler") === "on";

  await db.insert(ratingComments).values({
    eventId,
    ratingUserId,
    authorUserId: context.user.id,
    body,
    spoiler,
  });
  if (ratingUserId !== context.user.id) {
    await db
      .insert(notifications)
      .values({
        userId: ratingUserId,
        actorUserId: context.user.id,
        type: "review_reply",
        eventId,
      })
      .onConflictDoUpdate({
        target: [
          notifications.userId,
          notifications.actorUserId,
          notifications.type,
          notifications.eventId,
        ],
        set: {
          readAt: null,
          createdAt: new Date().toISOString(),
        },
      });
  }

  revalidatePath(`/serate/${eventId}`);
  revalidatePath("/notifiche");
  return { ok: true };
}

export async function deleteRatingComment(commentId: number) {
  const user = await requireUser();
  const comment = await db.query.ratingComments.findFirst({
    where: eq(ratingComments.id, commentId),
  });
  if (!comment || (comment.authorUserId !== user.id && !user.isAdmin)) return;
  await db.delete(ratingComments).where(eq(ratingComments.id, commentId));
  revalidatePath(`/serate/${comment.eventId}`);
}
