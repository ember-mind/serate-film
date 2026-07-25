import "server-only";

import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { attendance, events, userSeenMovies } from "@/db/schema";

export type PersonalMovieStatus = {
  manual: boolean;
  together: boolean;
  watchedAt: string | null;
};

function latestDate(current: string | null, candidate: string | null) {
  if (!candidate) return current;
  if (!current || candidate > current) return candidate;
  return current;
}

export async function getPersonalMovieStatuses(userId: number) {
  const [manualRows, clubRows] = await Promise.all([
    db.query.userSeenMovies.findMany({
      where: eq(userSeenMovies.userId, userId),
    }),
    db
      .select({
        movieId: events.chosenMovieId,
        watchedAt: events.chosenDate,
      })
      .from(attendance)
      .innerJoin(events, eq(attendance.eventId, events.id))
      .where(
        and(
          eq(attendance.userId, userId),
          eq(events.status, "done"),
          isNotNull(events.chosenMovieId)
        )
      ),
  ]);

  const statuses = new Map<number, PersonalMovieStatus>();

  for (const row of manualRows) {
    statuses.set(row.movieId, {
      manual: true,
      together: false,
      watchedAt: row.watchedAt,
    });
  }

  for (const row of clubRows) {
    if (row.movieId === null) continue;
    const current = statuses.get(row.movieId);
    statuses.set(row.movieId, {
      manual: current?.manual ?? false,
      together: true,
      watchedAt: latestDate(current?.watchedAt ?? null, row.watchedAt),
    });
  }

  return statuses;
}
