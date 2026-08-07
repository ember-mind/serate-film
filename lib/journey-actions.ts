"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  journeyMembers,
  journeyMovies,
  journeys,
  movies,
  userFriends,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { actorSlug, parseActors } from "@/lib/actors";
import { directorSlug, parseDirectors } from "@/lib/directors";

type SubjectType = "director" | "actor";

async function resolveSubject(subjectType: SubjectType, subjectSlug: string) {
  const catalog = await db.query.movies.findMany({
    orderBy: [asc(movies.year), asc(movies.title)],
  });
  const names =
    subjectType === "director"
      ? [...new Set(catalog.flatMap((movie) => parseDirectors(movie.director)))]
      : [
          ...new Set(
            catalog.flatMap((movie) => parseActors(movie.actors).map((actor) => actor.name))
          ),
        ];
  const name = names.find((candidate) =>
    subjectType === "director"
      ? directorSlug(candidate) === subjectSlug
      : actorSlug(candidate) === subjectSlug
  );
  if (!name) return null;

  const filmography = catalog.filter((movie) =>
    subjectType === "director"
      ? parseDirectors(movie.director).includes(name)
      : parseActors(movie.actors).some((actor) => actor.name === name)
  );
  return { name, filmography };
}

function journeyTitle(subjectType: SubjectType, name: string, chronological: boolean) {
  if (subjectType === "director") {
    return chronological ? `Il cinema di ${name}, in ordine` : `Tutto il cinema di ${name}`;
  }
  return chronological ? `${name}, film dopo film` : `Tutti i film con ${name}`;
}

async function validInvitedFriendIds(userId: number, formData: FormData) {
  const selectedIds = [...new Set(formData.getAll("friendIds").map(Number).filter(Boolean))];
  if (selectedIds.length === 0) return [];
  const friendships = await db.query.userFriends.findMany({
    where: and(
      eq(userFriends.userId, userId),
      inArray(userFriends.friendUserId, selectedIds)
    ),
  });
  return friendships.map((friendship) => friendship.friendUserId);
}

async function addInvitations(journeyId: number, invitedBy: number, friendIds: number[]) {
  if (friendIds.length === 0) return;
  await db
    .insert(journeyMembers)
    .values(
      friendIds.map((userId) => ({
        journeyId,
        userId,
        role: "member" as const,
        status: "invited" as const,
        invitedBy,
      }))
    )
    .onConflictDoNothing();
}

export async function createJourney(
  subjectType: SubjectType,
  subjectSlug: string,
  formData: FormData
) {
  const user = await requireUser();
  if (subjectType !== "director" && subjectType !== "actor") return;
  const subject = await resolveSubject(subjectType, subjectSlug);
  if (!subject || subject.filmography.length < 2) return;

  const mode = formData.get("mode") === "free" ? "free" : "chronological";
  const friendIds = await validInvitedFriendIds(user.id, formData);
  const existing = await db.query.journeys.findFirst({
    where: and(
      eq(journeys.createdBy, user.id),
      eq(journeys.subjectType, subjectType),
      eq(journeys.subjectSlug, subjectSlug),
      eq(journeys.mode, mode)
    ),
  });

  if (existing) {
    await addInvitations(existing.id, user.id, friendIds);
    revalidatePath("/percorsi");
    revalidatePath(`/percorsi/${existing.id}`);
    redirect(`/percorsi/${existing.id}`);
  }

  const now = new Date().toISOString();
  const journey = db.transaction((tx) => {
    const created = tx
      .insert(journeys)
      .values({
        title: journeyTitle(subjectType, subject.name, mode === "chronological"),
        subjectType,
        subjectName: subject.name,
        subjectSlug,
        mode,
        createdBy: user.id,
      })
      .returning()
      .get();

    tx.insert(journeyMovies)
      .values(
        subject.filmography.map((movie, index) => ({
          journeyId: created.id,
          movieId: movie.id,
          position: index + 1,
        }))
      )
      .run();
    tx.insert(journeyMembers)
      .values({
        journeyId: created.id,
        userId: user.id,
        role: "owner",
        status: "active",
        invitedBy: user.id,
        acceptedAt: now,
      })
      .run();
    return created;
  });

  await addInvitations(journey.id, user.id, friendIds);
  revalidatePath("/percorsi");
  revalidatePath("/io");
  redirect(`/percorsi/${journey.id}`);
}

export async function acceptJourney(journeyId: number) {
  const user = await requireUser();
  if (!Number.isInteger(journeyId)) return;
  const membership = await db.query.journeyMembers.findFirst({
    where: and(
      eq(journeyMembers.journeyId, journeyId),
      eq(journeyMembers.userId, user.id),
      eq(journeyMembers.status, "invited")
    ),
  });
  if (!membership) return;

  await db
    .update(journeyMembers)
    .set({ status: "active", acceptedAt: new Date().toISOString() })
    .where(
      and(
        eq(journeyMembers.journeyId, journeyId),
        eq(journeyMembers.userId, user.id)
      )
    );
  revalidatePath("/percorsi");
  revalidatePath(`/percorsi/${journeyId}`);
  revalidatePath("/io");
  redirect(`/percorsi/${journeyId}`);
}

export async function declineJourney(journeyId: number) {
  const user = await requireUser();
  if (!Number.isInteger(journeyId)) return;
  await db
    .delete(journeyMembers)
    .where(
      and(
        eq(journeyMembers.journeyId, journeyId),
        eq(journeyMembers.userId, user.id),
        eq(journeyMembers.status, "invited")
      )
    );
  revalidatePath("/percorsi");
  redirect("/percorsi");
}

export async function inviteJourneyFriends(journeyId: number, formData: FormData) {
  const user = await requireUser();
  if (!Number.isInteger(journeyId)) return;
  const journey = await db.query.journeys.findFirst({ where: eq(journeys.id, journeyId) });
  if (!journey || (journey.createdBy !== user.id && !user.isAdmin)) return;
  const friendIds = await validInvitedFriendIds(user.id, formData);
  await addInvitations(journeyId, user.id, friendIds);
  revalidatePath("/percorsi");
  revalidatePath(`/percorsi/${journeyId}`);
}
