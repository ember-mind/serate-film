import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { movies, watchlist } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { NewEventForm } from "./NewEventForm";

export const dynamic = "force-dynamic";

export default async function NuovaSerataPage() {
  await requireUser();
  const wl = await db.query.watchlist.findMany({
    where: eq(watchlist.status, "active"),
    orderBy: desc(watchlist.addedAt),
  });
  const ms =
    wl.length > 0
      ? await db.query.movies.findMany({
          where: inArray(
            movies.id,
            wl.map((w) => w.movieId)
          ),
        })
      : [];
  const ordered = wl
    .map((w) => ms.find((m) => m.id === w.movieId))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  return (
    <div className="mx-auto max-w-2xl">
      <p className="eyebrow">Nuova serata</p>
      <h1 className="mb-6 font-display text-3xl font-bold tracking-tight">
        Metti in programma
      </h1>
      <NewEventForm
        watchlistMovies={ordered.map((m) => ({
          id: m.id,
          title: m.title,
          year: m.year,
          posterPath: m.posterPath,
        }))}
      />
    </div>
  );
}
