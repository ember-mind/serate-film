import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { watchlist } from "@/db/schema";
import { searchMovies, popularMovies, topRatedMovies, yearOf, hasApiKey, type TmdbMovie } from "@/lib/tmdb";
import { addToWatchlist } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { Poster } from "@/components/Poster";

export const dynamic = "force-dynamic";

export default async function FilmPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; vista?: string }>;
}) {
  await requireUser();
  const { q, vista } = await searchParams;

  if (!hasApiKey()) {
    return (
      <div className="ticket mx-auto max-w-lg p-6 text-center">
        <h1 className="font-display text-2xl font-bold">Catalogo spento</h1>
        <p className="mt-2 text-sm text-fumo">
          Manca la chiave TMDb. Aggiungi <code className="font-mono text-schermo">TMDB_API_KEY</code>{" "}
          al file <code className="font-mono text-schermo">.env.local</code> e riavvia.
        </p>
      </div>
    );
  }

  let results: TmdbMovie[] = [];
  let heading: string;
  const view = vista === "migliori" ? "migliori" : "popolari";
  if (q) {
    results = await searchMovies(q);
    heading = `Risultati per “${q}”`;
  } else if (view === "migliori") {
    results = await topRatedMovies();
    heading = "I più votati di sempre";
  } else {
    results = await popularMovies();
    heading = "Popolari adesso";
  }

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
      <h1 className="sr-only">Catalogo film</h1>
      <form className="mb-4 flex gap-2" action="/film" method="GET">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Cerca un film…"
          aria-label="Cerca un film"
          className="w-full rounded-lg border border-riga bg-sipario px-4 py-2.5 text-schermo placeholder:text-fumo/60"
        />
        <button className="rounded-lg bg-proiettore px-5 font-semibold text-notte-fonda transition-colors hover:bg-proiettore-acceso">
          Cerca
        </button>
      </form>

      {!q && (
        <nav className="mb-4 flex gap-2" aria-label="Filtri catalogo">
          <a
            href="/film"
            aria-current={view === "popolari" ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 text-sm ${view === "popolari" ? "bg-sipario-chiaro font-semibold" : "text-fumo hover:text-schermo"}`}
          >
            Popolari
          </a>
          <a
            href="/film?vista=migliori"
            aria-current={view === "migliori" ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 text-sm ${view === "migliori" ? "bg-sipario-chiaro font-semibold" : "text-fumo hover:text-schermo"}`}
          >
            I più votati
          </a>
        </nav>
      )}

      <p className="eyebrow mb-4">{heading}</p>

      {results.length === 0 ? (
        <p className="text-sm text-fumo">Niente. Prova con un altro titolo.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
          {results.map((m) => {
            const added = activeIds.has(m.id);
            const watched = watchedIds.has(m.id);
            return (
              <li key={m.id} className="ticket flex flex-col overflow-hidden">
                <Poster path={m.poster_path} title={m.title} className="aspect-2/3 w-full" />
                <div className="flex flex-1 flex-col p-3">
                  <p className="font-display text-sm font-semibold leading-snug">{m.title}</p>
                  <p className="mb-2 mt-0.5 font-mono text-xs text-fumo">
                    {[yearOf(m), m.vote_average ? `★ ${m.vote_average.toFixed(1)}` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <div className="mt-auto">
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
