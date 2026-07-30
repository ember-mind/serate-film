import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  circleMembers,
  circles,
  movies,
  users,
  userFriends,
  watchlist,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { NewEventForm } from "./NewEventForm";

export const dynamic = "force-dynamic";

export default async function NuovaSerataPage({
  searchParams,
}: {
  searchParams: Promise<{ movieId?: string }>;
}) {
  const user = await requireUser();
  const { movieId: movieIdParam } = await searchParams;
  const initialMovieId = Number(movieIdParam);
  const people = await db.query.users.findMany({ orderBy: asc(users.name) });
  const friends = await db.query.userFriends.findMany({
    where: eq(userFriends.userId, user.id),
  });
  const friendIds = friends.map((friend) => friend.friendUserId);
  const wl = await db.query.watchlist.findMany({
    where: eq(watchlist.status, "active"),
    orderBy: desc(watchlist.addedAt),
  });
  const wlOrder = new Map(wl.map((w, i) => [w.movieId, i]));
  const all = await db.query.movies.findMany({
    orderBy: [desc(movies.year), asc(movies.title)],
  });
  const memberships = await db.query.circleMembers.findMany({
    where: and(
      eq(circleMembers.userId, user.id),
      eq(circleMembers.status, "active")
    ),
  });
  const memberCircles =
    memberships.length > 0
      ? await db.query.circles.findMany({
          where: inArray(
            circles.id,
            memberships.map((membership) => membership.circleId)
          ),
          orderBy: asc(circles.name),
        })
      : [];
  const allCircleMembers =
    memberCircles.length > 0
      ? await db.query.circleMembers.findMany({
          where: and(
            inArray(
              circleMembers.circleId,
              memberCircles.map((circle) => circle.id)
            ),
            eq(circleMembers.status, "active")
          ),
        })
      : [];
  // watchlist in testa (nell'ordine di aggiunta), poi il resto del catalogo
  const ordered = [
    ...all
      .filter((m) => wlOrder.has(m.id))
      .sort((a, b) => wlOrder.get(a.id)! - wlOrder.get(b.id)!),
    ...all.filter((m) => !wlOrder.has(m.id)),
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="apertura mb-8 text-center">
        <p className="titlecard-sub">Nuova proiezione</p>
        <h1 className="titlecard mt-1 text-3xl text-schermo">In cartellone</h1>
      </div>
      <NewEventForm
        movies={ordered.map((m) => ({
          id: m.id,
          title: m.title,
          year: m.year,
          director: m.director,
          genres: m.genres,
          posterUrl: m.posterUrl,
          posterCredit: m.posterCredit,
          inWatchlist: wlOrder.has(m.id),
        }))}
        people={people
          .filter((person) => person.id !== user.id)
          .map((person) => ({ id: person.id, name: person.name }))}
        friendIds={friendIds}
        circles={memberCircles.map((circle) => ({
          id: circle.id,
          name: circle.name,
          members: allCircleMembers.filter((member) => member.circleId === circle.id).length,
        }))}
        initialMovieId={Number.isInteger(initialMovieId) ? initialMovieId : undefined}
      />
    </div>
  );
}
