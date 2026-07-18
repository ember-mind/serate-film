import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { movies, users, watchlist } from "@/db/schema";
import { removeFromWatchlist } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { Poster } from "@/components/Poster";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  await requireUser();

  const wl = await db.query.watchlist.findMany({
    where: eq(watchlist.status, "active"),
    orderBy: desc(watchlist.addedAt),
  });
  const ids = wl.map((w) => w.movieId);
  const ms = ids.length > 0 ? await db.query.movies.findMany({ where: inArray(movies.id, ids) }) : [];
  const people = await db.query.users.findMany();
  const nameOf = (id: number) => people.find((p) => p.id === id)?.name ?? "?";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="titlecard-sub">Da vedere insieme</p>
          <h1 className="titlecard mt-1 text-2xl text-schermo">In pellicola</h1>
        </div>
        <Link
          href="/serate/nuova"
          className="titlecard rounded-sm bg-proiettore px-4 py-2 text-xs text-notte-fonda transition-colors hover:bg-proiettore-acceso"
        >
          Metti in cartellone
        </Link>
      </div>

      {wl.length === 0 ? (
        <p className="text-sm text-fumo">
          Vuota. <Link href="/film" className="text-proiettore underline">Vai al catalogo</Link> e
          aggiungi i film che volete vedere.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
          {wl.map((w) => {
            const m = ms.find((x) => x.id === w.movieId);
            if (!m) return null;
            return (
              <li key={m.id} className="ticket flex flex-col overflow-hidden">
                <Poster
                  title={m.title}
                  year={m.year}
                  genres={m.genres}
                  posterUrl={m.posterUrl}
                  posterCredit={m.posterCredit}
                  className="aspect-2/3 w-full"
                />
                <div className="flex flex-1 flex-col p-3">
                  <p className="font-display text-sm font-semibold leading-snug">{m.title}</p>
                  <p className="mt-0.5 font-mono text-xs text-fumo">
                    {[m.year, m.runtime ? `${m.runtime}′` : null, m.director]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="mb-2 mt-1 text-xs text-fumo">scelto da {nameOf(w.addedBy)}</p>
                  <form action={removeFromWatchlist.bind(null, m.id)} className="mt-auto">
                    <button className="w-full rounded-md border border-riga py-1.5 text-xs text-fumo transition-colors hover:border-velluto hover:text-velluto">
                      Togli
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
