import Link from "next/link";
import { eq, desc, asc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { events, movies, users, watchlist } from "@/db/schema";
import { Poster } from "@/components/Poster";
import { Avatar } from "@/components/Avatar";
import { quoteOfTheDay } from "@/lib/quotes";
import { requireUser } from "@/lib/auth";
import { formatDateFull } from "@/lib/dates";

export const dynamic = "force-dynamic";

function giorniAlla(iso: string) {
  const target = new Date(iso + "T20:00:00");
  return Math.max(0, Math.ceil((target.getTime() - Date.now()) / 86_400_000));
}

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
    limit: 10,
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
  const giorni = next?.chosenDate ? giorniAlla(next.chosenDate) : null;

  return (
    <div className="apertura flex flex-col gap-12">
      {/* cartello di apertura */}
      <section className="pt-2 text-center">
        <p className="titlecard-sub">Il cinema club saluta</p>
        <h1 className="titlecard mt-1 text-3xl text-schermo">{firstName}</h1>
        <p className="mt-2 text-sm text-fumo">
          {next
            ? giorni === 0
              ? "È stasera. Spegnete i telefoni."
              : `Mancano ${giorni} ${giorni === 1 ? "giorno" : "giorni"} alla proiezione.`
            : open.length > 0
              ? "Il cartellone è aperto: si vota."
              : "Lo schermo è bianco. Tocca a voi."}
        </p>
      </section>

      {/* lo schermo: prossima proiezione */}
      <section aria-labelledby="prossima" className="-mx-4">
        <p className="eyebrow mb-3 px-4" id="prossima">
          Stasera in sala
        </p>
        {next && nextMovie ? (
          <Link href={`/serate/${next.id}`} className="cinemascope block px-5 py-8 sm:px-10">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 sm:flex-row sm:items-stretch">
              <Poster
                title={nextMovie.title}
                year={nextMovie.year}
                genres={nextMovie.genres}
                posterUrl={nextMovie.posterUrl}
                posterCredit={nextMovie.posterCredit}
                className="h-52 w-36 shrink-0 rounded-sm"
              />
              <div className="flex min-w-0 flex-1 flex-col justify-center text-center sm:text-left">
                <p className="titlecard-sub">{next.title || "Proiezione unica"}</p>
                <h2 className="titlecard mt-2 text-2xl leading-snug text-schermo sm:text-4xl">
                  {nextMovie.title}
                </h2>
                <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-fumo">
                  {[
                    nextMovie.year,
                    nextMovie.runtime ? `${nextMovie.runtime} min` : null,
                    nextMovie.director,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="mt-5 font-mono text-sm capitalize text-proiettore">
                  {formatDateFull(next.chosenDate!)}
                  {next.location ? ` · ${next.location}` : ""}
                </p>
              </div>
            </div>
          </Link>
        ) : (
          <div className="cinemascope px-6 py-12 text-center">
            <p className="titlecard text-2xl text-schermo">Lo schermo è bianco</p>
            <p className="mx-auto mt-3 max-w-md text-sm text-fumo">
              Divano, luci basse, i soliti. Manca solo il film.
            </p>
            <Link
              href="/serate/nuova"
              className="titlecard mt-6 inline-block rounded-sm bg-proiettore px-6 py-2.5 text-sm text-notte-fonda transition-colors hover:bg-proiettore-acceso"
            >
              Metti in cartellone
            </Link>
          </div>
        )}
      </section>

      {/* si vota */}
      {open.length > 0 && (
        <section aria-labelledby="sondaggi">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="eyebrow" id="sondaggi">
              In cartellone · si vota
            </p>
            <Link href="/serate" className="font-mono text-xs uppercase tracking-[0.18em] text-fumo hover:text-schermo">
              Tutte →
            </Link>
          </div>
          <ul className="flex flex-col gap-3">
            {open.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/serate/${e.id}`}
                  className="ticket flex items-center justify-between p-4 transition-colors hover:border-proiettore/60"
                >
                  <span className="titlecard text-base text-schermo">
                    {e.title || "Serata da decidere"}
                  </span>
                  <span className="rounded-sm bg-velluto px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-schermo">
                    Vota ora
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* pellicola: ultime in watchlist */}
      <section aria-labelledby="watchlist-home" className="-mx-4">
        <div className="mb-3 flex items-baseline justify-between px-4">
          <p className="eyebrow" id="watchlist-home">
            In pellicola · da vedere insieme
          </p>
          <Link href="/watchlist" className="font-mono text-xs uppercase tracking-[0.18em] text-fumo hover:text-schermo">
            Tutta →
          </Link>
        </div>
        {wlMovies.length > 0 ? (
          <div className="filmstrip">
            <ul className="filmstrip-scroll">
              {wl.map((w) => {
                const m = wlMovies.find((x) => x.id === w.movieId);
                if (!m) return null;
                return (
                  <li key={m.id} className="w-28 shrink-0">
                    <Poster
                      title={m.title}
                      year={m.year}
                      genres={m.genres}
                      posterUrl={m.posterUrl}
                      posterCredit={m.posterCredit}
                      className="aspect-2/3 w-full rounded-sm"
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p className="px-4 text-sm text-fumo">
            La pellicola è vuota.{" "}
            <Link href="/film" className="text-proiettore underline">
              Passa in cineteca
            </Link>{" "}
            e scegli.
          </p>
        )}
      </section>

      {/* la sala */}
      <section
        aria-labelledby="gruppo"
        className="ticket flex flex-wrap items-center justify-between gap-4 p-5"
      >
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
        <p className="text-right font-mono text-xs uppercase tracking-[0.18em] text-fumo">
          {seen.length === 0
            ? "Prima proiezione in arrivo"
            : `${seen.length} ${seen.length === 1 ? "film visto" : "film visti"} insieme`}
        </p>
      </section>

      {/* citazione del giorno */}
      <section aria-label="Citazione del giorno" className="pb-4 text-center">
        <p className="quote text-xl">“{quote.text}”</p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.24em] text-fumo">
          {quote.film} · {quote.year}
        </p>
      </section>
    </div>
  );
}
