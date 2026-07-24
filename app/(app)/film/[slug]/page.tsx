import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { movies, watchlist } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { addToWatchlist, removeFromWatchlist } from "@/lib/actions";
import { Poster } from "@/components/Poster";
import { actorSlug, parseActors } from "@/lib/actors";
import { getBeforeWatchingNotes } from "@/lib/before-watching";
import { directorSlug, parseDirectors } from "@/lib/directors";
import { filmSlug } from "@/lib/films";

export const dynamic = "force-dynamic";

export default async function FilmPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireUser();
  const { slug } = await params;

  const movie = /^\d+$/.test(slug)
    ? await db.query.movies.findFirst({ where: eq(movies.id, Number(slug)) })
    : (await db.query.movies.findMany()).find((m) => filmSlug(m) === slug);
  if (!movie) notFound();

  const wl = await db.query.watchlist.findFirst({ where: eq(watchlist.movieId, movie.id) });
  const state = !wl || wl.status === "removed" ? "none" : wl.status;
  const beforeWatchingNotes = getBeforeWatchingNotes(movie);

  return (
    <div>
      <Link
        href="/film"
        className="font-mono text-xs uppercase tracking-[0.18em] text-fumo transition-colors hover:text-proiettore"
      >
        ← Cineteca
      </Link>

      <div className="mt-6 grid gap-8 sm:grid-cols-[240px_1fr]">
        <div>
          <Poster
            title={movie.title}
            year={movie.year}
            genres={movie.genres}
            posterUrl={movie.posterUrl}
            posterCredit={movie.posterCredit}
            showTitle={false}
            className="ticket aspect-2/3 w-full"
          />
          {movie.posterCredit && (
            <p className="mt-2 font-mono text-[10px] leading-relaxed text-fumo/70">
              {movie.posterCredit}
            </p>
          )}
        </div>

        <div className="min-w-0">
          <p className="titlecard-sub">Dalla cineteca</p>
          <h1 className="titlecard mt-1 text-3xl text-schermo">{movie.title}</h1>
          <p className="mt-2 font-mono text-sm text-proiettore">
            {[movie.year, movie.runtime ? `${movie.runtime}′` : null].filter(Boolean).join(" · ")}
          </p>

          <dl className="mt-5 flex flex-col gap-1.5 text-sm">
            {movie.director && (
              <div>
                <span className="text-fumo">regia di </span>
                {parseDirectors(movie.director).map((name, index, names) => (
                  <span key={name}>
                    <Link
                      href={`/registi/${directorSlug(name)}`}
                      className="underline decoration-riga underline-offset-4 transition-colors hover:text-proiettore hover:decoration-proiettore"
                    >
                      {name}
                    </Link>
                    {index < names.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            )}
            {movie.actors && (
              <div>
                <span className="text-fumo">con </span>
                {parseActors(movie.actors).map((actor, index, credits) => (
                  <span key={actor.name}>
                    <Link
                      href={`/attori/${actorSlug(actor.name)}`}
                      className="underline decoration-riga underline-offset-4 transition-colors hover:text-proiettore hover:decoration-proiettore"
                    >
                      {actor.name}
                    </Link>
                    {actor.note ? ` (${actor.note})` : ""}
                    {index < credits.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            )}
            {movie.genres && (
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fumo/70">
                {movie.genres}
              </p>
            )}
          </dl>

          {movie.synopsis && (
            <div className="mt-6 border-t border-riga pt-5">
              <p className="eyebrow mb-2">La trama</p>
              <p className="text-sm leading-relaxed text-schermo/90">{movie.synopsis}</p>
              {movie.synopsisSource && (
                <a
                  href={movie.synopsisSource}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block font-mono text-[10px] uppercase tracking-[0.18em] text-fumo/70 transition-colors hover:text-proiettore"
                >
                  Fonte: Wikipedia ↗
                </a>
              )}
            </div>
          )}

          {beforeWatchingNotes.length > 0 && (
            <section
              aria-labelledby="before-watching-title"
              className="mt-6 rounded-sm border border-riga bg-sipario-chiaro/30 p-4 sm:p-5"
            >
              <h2 id="before-watching-title" className="eyebrow mb-4">
                Cosa sapere prima di vederlo
              </h2>
              <dl className="space-y-3">
                {beforeWatchingNotes.map((note) => (
                  <div key={note.label} className="grid gap-1 sm:grid-cols-[88px_1fr] sm:gap-3">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-proiettore">
                      {note.label}
                    </dt>
                    <dd className="text-sm leading-relaxed text-schermo/85">{note.text}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 border-t border-riga/70 pt-3 font-mono text-[9px] uppercase tracking-[0.13em] text-fumo/60">
                Indicazioni orientative e senza spoiler
              </p>
            </section>
          )}

          <div className="mt-7 max-w-xs">
            {state === "watched" ? (
              <span className="block rounded-sm border border-riga py-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-fumo">
                Già vista
              </span>
            ) : state === "active" ? (
              <form action={removeFromWatchlist.bind(null, movie.id)}>
                <button className="w-full rounded-sm border border-proiettore/40 py-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-proiettore transition-colors hover:border-velluto-acceso hover:text-velluto-acceso">
                  In pellicola ✓
                </button>
              </form>
            ) : (
              <form action={addToWatchlist.bind(null, movie.id)}>
                <button className="w-full rounded-sm bg-sipario-chiaro py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-schermo transition-colors hover:bg-proiettore hover:text-notte-fonda">
                  + In pellicola
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
