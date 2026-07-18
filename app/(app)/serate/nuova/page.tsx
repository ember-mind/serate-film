import { asc, desc, eq } from "drizzle-orm";
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
  const wlOrder = new Map(wl.map((w, i) => [w.movieId, i]));
  const all = await db.query.movies.findMany({
    orderBy: [desc(movies.year), asc(movies.title)],
  });
  // watchlist in testa (nell'ordine di aggiunta), poi il resto del catalogo
  const ordered = [
    ...all
      .filter((m) => wlOrder.has(m.id))
      .sort((a, b) => wlOrder.get(a.id)! - wlOrder.get(b.id)!),
    ...all.filter((m) => !wlOrder.has(m.id)),
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <p className="eyebrow">Nuova serata</p>
      <h1 className="mb-6 font-display text-3xl font-bold tracking-tight">
        Metti in programma
      </h1>
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
      />
    </div>
  );
}
