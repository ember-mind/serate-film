import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { events, movies } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { filterVisible } from "@/lib/invites";
import { formatDateShort } from "@/lib/dates";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, { label: string; cls: string }> = {
  open: { label: "Si vota", cls: "bg-velluto text-schermo" },
  scheduled: { label: "In programma", cls: "bg-proiettore text-notte-fonda" },
  done: { label: "Vista", cls: "bg-sipario-chiaro text-fumo" },
  cancelled: { label: "Annullata", cls: "bg-sipario-chiaro text-fumo line-through" },
};

export default async function SeratePage() {
  const me = await requireUser();

  const all = await filterVisible(
    await db.query.events.findMany({ orderBy: desc(events.createdAt) }),
    me
  );
  const movieIds = all.map((e) => e.chosenMovieId).filter((x): x is number => Boolean(x));
  const ms = movieIds.length > 0 ? await db.query.movies.findMany({ where: inArray(movies.id, movieIds) }) : [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="titlecard-sub">Il cartellone</p>
          <h1 className="titlecard mt-1 text-2xl text-schermo">Proiezioni</h1>
        </div>
        <Link
          href="/serate/nuova"
          className="titlecard rounded-sm bg-proiettore px-4 py-2 text-xs text-notte-fonda transition-colors hover:bg-proiettore-acceso"
        >
          Nuova serata
        </Link>
      </div>

      {all.length === 0 ? (
        <p className="text-sm text-fumo">Ancora nessuna serata. Crea la prima.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {all.map((e) => {
            const m = e.chosenMovieId ? ms.find((x) => x.id === e.chosenMovieId) : null;
            const s = statusLabel[e.status];
            return (
              <li key={e.id}>
                <Link
                  href={`/serate/${e.id}`}
                  className="ticket flex items-center justify-between gap-3 p-4 transition-colors hover:border-proiettore/50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg font-semibold">
                      {m ? m.title : e.title || "Serata da decidere"}
                    </p>
                    <p className="mt-0.5 font-mono text-xs capitalize text-fumo">
                      {e.chosenDate ? formatDateShort(e.chosenDate) : "data da votare"}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${s.cls}`}>
                    {s.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
