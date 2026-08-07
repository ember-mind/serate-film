import "server-only";

import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  journeyMembers,
  journeyMovies,
  userFriends,
  users,
} from "@/db/schema";
import { getPersonalMovieStatuses } from "@/lib/personal-movies";

export const JOURNEY_FILM_XP = 50;
export const JOURNEY_COMPLETION_XP = 250;

const LEVELS = [
  { level: 1, name: "Comparsa", threshold: 0 },
  { level: 2, name: "Spettatore", threshold: 250 },
  { level: 3, name: "Cinefilo", threshold: 750 },
  { level: 4, name: "Critico", threshold: 1500 },
  { level: 5, name: "Programmatore", threshold: 2500 },
  { level: 6, name: "Maestro di sala", threshold: 4000 },
] as const;

export function levelForExperience(experience: number) {
  const current = [...LEVELS].reverse().find((level) => experience >= level.threshold)!;
  const next = LEVELS.find((level) => level.threshold > experience) ?? null;
  const progress = next
    ? Math.round(
        ((experience - current.threshold) / (next.threshold - current.threshold)) * 100
      )
    : 100;

  return { ...current, next, progress };
}

export function progressForMovies(movieIds: number[], seenMovieIds: Set<number>) {
  const seen = movieIds.filter((movieId) => seenMovieIds.has(movieId)).length;
  const total = movieIds.length;
  return {
    seen,
    total,
    percentage: total > 0 ? Math.round((seen / total) * 100) : 0,
    complete: total > 0 && seen === total,
  };
}

export async function seenMovieIdsForUser(userId: number) {
  return new Set((await getPersonalMovieStatuses(userId)).keys());
}

export async function getUserJourneyStats(userId: number) {
  const memberships = await db.query.journeyMembers.findMany({
    where: eq(journeyMembers.userId, userId),
  });
  const activeMemberships = memberships.filter((membership) => membership.status === "active");
  const journeyIds = activeMemberships.map((membership) => membership.journeyId);
  const filmRows = journeyIds.length
    ? await db.query.journeyMovies.findMany({
        where: inArray(journeyMovies.journeyId, journeyIds),
      })
    : [];
  const seenMovieIds = await seenMovieIdsForUser(userId);
  const eligibleSeenMovies = new Set(
    filmRows.filter((row) => seenMovieIds.has(row.movieId)).map((row) => row.movieId)
  );
  const completedJourneys = journeyIds.filter((journeyId) => {
    const movieIds = filmRows
      .filter((row) => row.journeyId === journeyId)
      .map((row) => row.movieId);
    return progressForMovies(movieIds, seenMovieIds).complete;
  }).length;
  const experience =
    eligibleSeenMovies.size * JOURNEY_FILM_XP + completedJourneys * JOURNEY_COMPLETION_XP;

  return {
    experience,
    completedJourneys,
    activeJourneys: activeMemberships.length - completedJourneys,
    level: levelForExperience(experience),
  };
}

export async function getJourneyFriends(userId: number) {
  const friendRows = await db.query.userFriends.findMany({
    where: eq(userFriends.userId, userId),
  });
  const friendIds = friendRows.map((friend) => friend.friendUserId);
  if (friendIds.length === 0) return [];
  return db.query.users.findMany({
    where: inArray(users.id, friendIds),
    orderBy: asc(users.name),
  });
}
