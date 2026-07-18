import { asc, desc, inArray, like, or } from "drizzle-orm";
import { db } from "@/db";
import { movies, watchlist } from "@/db/schema";
import { addToWatchlist } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { Poster } from "@/components/Poster";
import { AddMovieForm } from "./AddMovieForm";

export const dynamic = "force-dynamic";

export default async function FilmPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireUser();
  const { q } = await searchParams;

  const results = q
    ? await db.query.movies.findMany({
        where: or(
          like(movies.title, `%${q}%`),
          like(movies.director, `%${q}%`),
          like(movies.actors, `%${q}%`)
        ),
        orderBy: [desc(movies.year), asc(movies.title)],
      })
    : await db.query.movies.findMany({ orderBy: [desc(movies.year), asc(movies.title)] });

  const inList =
    results.length > 0
      ? await db.query.watchlist.findMany({
          where: inArray(
            watchlist.movieId,
            results.map((r) => r.id)
          ),
        })
      : [];
  const activeIds = new Set(inList.filter((w) => w.status === "active").map((w) => w.movieId));
  const watchedIds = new Set(inList.filter((w) => w.status === "watched").map((w) => w.movieId));

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <p className="eyebrow">Il catalogo</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">Film</h1>
        </div>
        <p className="font-mono text-sm text-fumo">{results.length} titoli</p>
      </div>

      <form className="mb-4 flex gap-2" action="/film" method="GET">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Cerca per titolo, regista o attore…"
          aria-label="Cerca nel catalogo"
          className="w-full rounded-lg border border-riga bg-sipario px-4 py-2.5 text-schermo placeholder:text-fumo/60"
        />
        <button className="rounded-lg bg-proiettore px-5 font-semibold text-notte-fonda transition-colors hover:bg-proiettore-acceso">
          Cerca
        </button>
      </form>

      <AddMovieForm />

      {results.length === 0 ? (
        <p className="mt-6 text-sm text-fumo">
          Niente in catalogo per questa ricerca. Aggiungilo tu qui sopra.
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((m) => {
            const added = activeIds.has(m.id);
            const watched = watchedIds.has(m.id);
            return (
              <li key={m.id} className="ticket flex flex-col overflow-hidden">
                <div className="flex flex-1 flex-col p-3">
                  <p className="font-display text-base font-bold leading-snug">{m.title}</p>
                  <p className="mt-0.5 font-mono text-xs text-proiettore">{m.year}</p>
                  {m.director && <p className="mt-1.5 text-xs text-fumo">regia di {m.director}</p>}
                  {m.actors && <p className="mt-0.5 line-clamp-2 text-xs text-fumo">con {m.actors}</p>}
                  {m.genres && (
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-fumo/70">
                      {m.genres}
                    </p>
                  )}
                  <div className="mt-3">
                    {watched ? (
                      <span className="block rounded-md border border-riga py-1.5 text-center text-xs text-fumo">
                        Già vista
                      </span>
                    ) : added ? (
                      <span className="block rounded-md border border-proiettore/40 py-1.5 text-center text-xs text-proiettore">
                        In watchlist ✓
                      </span>
                    ) : (
                      <form action={addToWatchlist.bind(null, m.id)}>
                        <button className="w-full rounded-md bg-sipario-chiaro py-1.5 text-xs font-semibold transition-colors hover:bg-proiettore hover:text-notte-fonda">
                          + Watchlist
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
