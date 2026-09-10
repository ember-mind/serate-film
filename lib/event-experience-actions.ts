"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  attendance,
  dateVotes,
  eventContributions,
  eventDates,
  eventNeeds,
  eventRsvps,
  events,
  eventMovies,
  movieBallotItems,
  movieBallots,
  movieVotes,
  notifications,
  ratingComments,
  ratings,
  runoffVotes,
} from "@/db/schema";
import { authorizeEventAction, isEventActionStateAllowed } from "@/lib/access";
import { requireUser } from "@/lib/auth";

type ActionState = { error?: string; ok?: boolean };

function parseCandidateId(value: FormDataEntryValue) {
  const raw = String(value);
  if (!/^[1-9]\d*$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) ? id : null;
}

export async function setEventParticipation(
  eventId: number,
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const context = await authorizeEventAction("setEventParticipation", eventId);

  const participating = formData.get("participating") === "yes";
  if (participating) {
    await db
      .delete(eventRsvps)
      .where(
        and(
          eq(eventRsvps.eventId, eventId),
          eq(eventRsvps.userId, context.user.id),
          eq(eventRsvps.status, "no")
        )
      );
  } else {
    const [dates, candidates, ballots] = await Promise.all([
      db.query.eventDates.findMany({
        where: eq(eventDates.eventId, eventId),
        columns: { id: true },
      }),
      db.query.eventMovies.findMany({
        where: eq(eventMovies.eventId, eventId),
        columns: { id: true },
      }),
      db.query.movieBallots.findMany({
        where: and(
          eq(movieBallots.eventId, eventId),
          eq(movieBallots.userId, context.user.id)
        ),
        columns: { id: true },
      }),
    ]);

    if (dates.length > 0) {
      await db.delete(dateVotes).where(
        and(
          inArray(
            dateVotes.eventDateId,
            dates.map((date) => date.id)
          ),
          eq(dateVotes.userId, context.user.id)
        )
      );
    }
    if (candidates.length > 0) {
      const candidateIds = candidates.map((candidate) => candidate.id);
      await db.delete(movieVotes).where(
        and(
          inArray(movieVotes.eventMovieId, candidateIds),
          eq(movieVotes.userId, context.user.id)
        )
      );
      await db.delete(runoffVotes).where(
        and(
          inArray(runoffVotes.eventMovieId, candidateIds),
          eq(runoffVotes.userId, context.user.id)
        )
      );
    }
    if (ballots.length > 0) {
      const ballotIds = ballots.map((ballot) => ballot.id);
      await db.delete(movieBallotItems).where(inArray(movieBallotItems.ballotId, ballotIds));
      await db.delete(movieBallots).where(inArray(movieBallots.id, ballotIds));
    }
    await db
      .update(eventNeeds)
      .set({ claimedBy: null })
      .where(
        and(
          eq(eventNeeds.eventId, eventId),
          eq(eventNeeds.claimedBy, context.user.id)
        )
      );
    await db
      .delete(eventContributions)
      .where(
        and(
          eq(eventContributions.eventId, eventId),
          eq(eventContributions.userId, context.user.id)
        )
      );
    await db
      .insert(eventRsvps)
      .values({
        eventId,
        userId: context.user.id,
        status: "no",
        guestCount: 0,
        note: null,
        respondedAt: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: [eventRsvps.eventId, eventRsvps.userId],
        set: {
          status: "no",
          guestCount: 0,
          note: null,
          respondedAt: new Date().toISOString(),
        },
      });
  }

  revalidatePath(`/serate/${eventId}`);
  revalidatePath("/");
  return { ok: true };
}

export async function submitConsensusBallot(
  eventId: number,
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const context = await authorizeEventAction("submitConsensusBallot", eventId);

  const result = db.transaction((tx): ActionState => {
    const currentEvent = tx
      .select({ status: events.status })
      .from(events)
      .where(eq(events.id, eventId))
      .get();
    if (
      !currentEvent ||
      !isEventActionStateAllowed("submitConsensusBallot", currentEvent.status)
    ) {
      return { error: "La scelta del film è chiusa." };
    }
    const optedOut = tx
      .select({ eventId: eventRsvps.eventId })
      .from(eventRsvps)
      .where(
        and(
          eq(eventRsvps.eventId, eventId),
          eq(eventRsvps.userId, context.user.id),
          eq(eventRsvps.status, "no")
        )
      )
      .get();
    if (optedOut) return { error: "Hai indicato che non parteciperai." };

    const candidates = tx
      .select()
      .from(eventMovies)
      .where(eq(eventMovies.eventId, eventId))
      .all();
    const validIds = new Set(candidates.map((candidate) => candidate.id));
    const rankEntries = ["rank1", "rank2", "rank3"].map((name) =>
      formData.getAll(name)
    );
    if (rankEntries.some((entries) => entries.length > 1)) {
      return { error: "Scheda non valida." };
    }
    const rankedSlots: Array<number | null> = [];
    for (const entries of rankEntries) {
      if (entries.length === 0 || String(entries[0]).trim() === "") {
        rankedSlots.push(null);
        continue;
      }
      const id = parseCandidateId(entries[0]);
      if (id === null || !validIds.has(id)) {
        return { error: "Scheda non valida." };
      }
      rankedSlots.push(id);
    }
    if (rankedSlots[0] === null) {
      return { error: "Indica almeno la tua prima scelta." };
    }
    const firstGap = rankedSlots.indexOf(null);
    if (firstGap !== -1 && rankedSlots.slice(firstGap + 1).some((id) => id !== null)) {
      return { error: "Le posizioni devono essere consecutive." };
    }
    const rankedIds = rankedSlots.filter((id): id is number => id !== null);
    if (new Set(rankedIds).size !== rankedIds.length) {
      return { error: "Ogni posizione del podio deve avere un film diverso." };
    }

    const vetoIds: number[] = [];
    for (const entry of formData.getAll("vetoIds")) {
      const id = parseCandidateId(entry);
      if (id === null || !validIds.has(id)) {
        return { error: "Scheda non valida." };
      }
      vetoIds.push(id);
    }
    if (new Set(vetoIds).size !== vetoIds.length) {
      return { error: "Ogni esclusione deve indicare un film diverso." };
    }
    if (vetoIds.some((id) => rankedIds.includes(id))) {
      return { error: "Un film sul podio non può essere anche escluso." };
    }

    const previous = tx
      .select()
      .from(movieBallots)
      .where(
        and(
          eq(movieBallots.eventId, eventId),
          eq(movieBallots.userId, context.user.id)
        )
      )
      .get();
    if (previous) {
      tx.delete(movieBallotItems)
        .where(eq(movieBallotItems.ballotId, previous.id))
        .run();
      tx.delete(movieBallots).where(eq(movieBallots.id, previous.id)).run();
    }

    const ballot = tx
      .insert(movieBallots)
      .values({ eventId, userId: context.user.id, submittedAt: new Date().toISOString() })
      .returning()
      .get();
    tx.insert(movieBallotItems)
      .values([
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
      ])
      .run();
    return { ok: true };
  });

  if (result.ok) revalidatePath(`/serate/${eventId}`);
  return result;
}

export async function addRatingComment(
  eventId: number,
  ratingUserId: number,
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const context = await authorizeEventAction("addRatingComment", eventId);

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
  await requireUser();
  const comment = await db.query.ratingComments.findFirst({
    where: eq(ratingComments.id, commentId),
  });
  if (!comment) return;
  await authorizeEventAction("deleteRatingComment", comment.eventId, {
    resourceOwnerId: comment.authorUserId,
  });
  await db.delete(ratingComments).where(eq(ratingComments.id, commentId));
  revalidatePath(`/serate/${comment.eventId}`);
}
