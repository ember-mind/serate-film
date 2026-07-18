import Link from "next/link";
import { eq, desc, asc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { events, movies, users, watchlist } from "@/db/schema";
import { Poster } from "@/components/Poster";
import { Avatar } from "@/components/Avatar";
import { quoteOfTheDay } from "@/lib/quotes";
import { requireUser } from "@/lib/auth";
import { formatDateFull, formatDateShort } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const me = await requireUser();
  const scheduled = await db.query.events.findMany({
    where: eq(events.status, "scheduled"),
    orderBy: asc(events.chosenDate),
  });
  const next = scheduled[0] ?? null;
  const nextMovie = next?.chosenMovieId
    ? await db.query.movies.findFirst({ where: eq(movies.id, next.chosenMovieId) })
    : null;

  const open = await db.query.events.findMany({
    where: eq(events.status, "open"),
    orderBy: desc(events.createdAt),
  });

  const wl = await db.query.watchlist.findMany({
    where: eq(watchlist.status, "active"),
    orderBy: desc(watchlist.addedAt),
    limit: 6,
  });
  const wlMovies =
    wl.length > 0
      ? await db.query.movies.findMany({
          where: inArray(
            movies.id,
            wl.map((w) => w.movieId)
          ),
        })
      : [];

  const people = await db.query.users.findMany({ orderBy: asc(users.name) });
  const seen = await db.query.events.findMany({ where: eq(events.status, "done") });
  const quote = quoteOfTheDay();
  const firstName = me.name.split(" ")[0];

  return (
    <div className="flex flex-col gap-10">
      {/* saluto */}
      <section>
        <h1 className="font-display text-3xl font-bold tracking-tight">Ciao {firstName} 👋</h1>
        <p className="mt-1 text-sm text-fumo">
          {next
            ? "C'è una serata in programma: si prepara la sala."
            : open.length > 0
              ? "Si vota la prossima serata — di' la tua."
              : "La sala aspetta solo voi."}
        </p>
      </section>

      {/* prossima proiezione: il biglietto */}
      <section aria-labelledby="prossima">
        <p className="eyebrow mb-3" id="prossima">
          Prossima proiezione
        </p>
        {next && nextMovie ? (
          <Link
            href={`/serate/${next.id}`}
            className="ticket ticket-glow flex flex-col overflow-hidden sm:flex-row"
          >
            <div className="flex flex-1 gap-4 p-5">
              <Poster
                title={nextMovie.title}
                year={nextMovie.year}
                className="h-36 w-24 shrink-0 rounded-md"
              />
              <div className="min-w-0">
                <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                  {nextMovie.title}
                </h1>
                <p className="mt-1 text-sm text-fumo">
                  {[
                    nextMovie.year,
                    nextMovie.director ? `regia di ${nextMovie.director}` : null,
                    nextMovie.genres,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {next.location && <p className="mt-3 text-sm">📍 {next.location}</p>}
              </div>
            </div>
            <div className="ticket-tear flex items-center justify-between gap-1 px-5 py-4 sm:w-40 sm:flex-col sm:justify-center sm:text-center">
              <span className="eyebrow">Ammissione uno</span>
              <span className="font-mono text-lg font-semibold capitalize text-proiettore">
                {formatDateFull(next.chosenDate!)}
              </span>
            </div>
          </Link>
        ) : (
          <div className="ticket flex flex-col items-center gap-4 p-8 text-center">
            <p className="font-display text-2xl font-semibold">Il proiettore è spento</p>
            <p className="text-sm text-fumo">
              Divano, luci basse, i soliti. Manca solo il film: accendilo tu.
            </p>
            <Link
              href="/serate/nuova"
              className="rounded-lg bg-proiettore px-5 py-2.5 font-semibold text-notte-fonda transition-colors hover:bg-proiettore-acceso"
            >
              Organizza una serata
            </Link>
          </div>
        )}
      </section>

      {/* sondaggi aperti */}
      {open.length > 0 && (
        <section aria-labelledby="sondaggi">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="eyebrow" id="sondaggi">
              Si vota
            </p>
            <Link href="/serate" className="text-sm text-fumo hover:text-schermo">
              Tutte le serate →
            </Link>
          </div>
          <ul className="flex flex-col gap-3">
            {open.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/serate/${e.id}`}
                  className="ticket flex items-center justify-between p-4 transition-colors hover:border-proiettore/50"
                >
                  <span className="font-display text-lg font-semibold">
                    {e.title || "Serata da decidere"}
                  </span>
                  <span className="rounded-full bg-velluto px-3 py-1 text-xs font-semibold text-schermo">
                    Vota ora
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ultime aggiunte in watchlist */}
      <section aria-labelledby="watchlist-home">
        <div className="mb-3 flex items-baseline justify-between">
          <p className="eyebrow" id="watchlist-home">
            Ultime in watchlist
          </p>
          <Link href="/watchlist" className="text-sm text-fumo hover:text-schermo">
            Tutta la watchlist →
          </Link>
        </div>
        {wlMovies.length > 0 ? (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {wl.map((w) => {
              const m = wlMovies.find((x) => x.id === w.movieId);
              if (!m) return null;
              return (
                <li key={m.id}>
                  <Poster title={m.title} year={m.year} className="aspect-2/3 w-full rounded-md" />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-fumo">
            Vuota. <Link href="/film" className="text-proiettore underline">Cerca un film</Link> e
            mettilo in lista.
          </p>
        )}
      </section>

      {/* il gruppo */}
      <section aria-labelledby="gruppo" className="ticket flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="eyebrow mb-2" id="gruppo">
            La sala
          </p>
          <div className="flex -space-x-1.5">
            {people.map((p) => (
              <Avatar key={p.id} name={p.name} id={p.id} />
            ))}
          </div>
        </div>
        <p className="text-right font-mono text-sm text-fumo">
          {seen.length === 0
            ? "prima proiezione in arrivo"
            : `${seen.length} ${seen.length === 1 ? "film visto" : "film visti"} insieme`}
        </p>
      </section>

      {/* citazione del giorno */}
      <section aria-label="Citazione del giorno" className="pb-2 text-center">
        <p className="quote text-lg">“{quote.text}”</p>
        <p className="mt-1 font-mono text-xs text-fumo">
          {quote.film} · {quote.year}
        </p>
      </section>
    </div>
  );
}
