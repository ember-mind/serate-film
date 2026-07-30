import Link from "next/link";
import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { circleMembers, circles } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import {
  acceptCircleInvite,
  createCircle,
  declineCircleInvite,
} from "@/lib/social-actions";

export const dynamic = "force-dynamic";

export default async function CirclesPage({
  searchParams,
}: {
  searchParams: Promise<{ errore?: string }>;
}) {
  const user = await requireUser();
  const [params, memberships] = await Promise.all([
    searchParams,
    db.query.circleMembers.findMany({
      where: eq(circleMembers.userId, user.id),
    }),
  ]);
  const circleIds = memberships.map((membership) => membership.circleId);
  const circleRows = circleIds.length
    ? await db.query.circles.findMany({
        where: inArray(circles.id, circleIds),
        orderBy: asc(circles.name),
      })
    : [];
  const active = memberships.filter((membership) => membership.status === "active");
  const invitations = memberships.filter(
    (membership) => membership.status === "invited"
  );
  const requests = memberships.filter(
    (membership) => membership.status === "requested"
  );

  return (
    <div className="mx-auto max-w-4xl">
      <header className="apertura mb-8 text-center">
        <p className="titlecard-sub">Compagnie che ritornano</p>
        <h1 className="titlecard mt-1 text-3xl text-schermo">I tuoi circoli</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-fumo">
          Gruppi stabili per organizzare serate, ritrovare persone e costruire
          una storia comune.
        </p>
        <Link
          href="/club"
          className="mt-4 inline-flex rounded-full border border-riga px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-proiettore hover:border-proiettore"
        >
          Scopri circoli pubblici
        </Link>
      </header>

      {invitations.length > 0 && (
        <section className="mb-8" aria-labelledby="inviti-circoli">
          <h2 id="inviti-circoli" className="step-title mb-3">
            Inviti ricevuti
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {invitations.map((membership) => {
              const circle = circleRows.find(
                (item) => item.id === membership.circleId
              );
              if (!circle) return null;
              return (
                <li key={circle.id} className="ticket ticket-glow p-5">
                  <p className="eyebrow">Posto riservato</p>
                  <h3 className="mt-2 font-display text-xl font-semibold text-schermo">
                    {circle.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-fumo">
                    {circle.description || "Un nuovo gruppo di visione."}
                  </p>
                  <div className="mt-5 flex gap-2">
                    <form action={acceptCircleInvite.bind(null, circle.id)}>
                      <button className="rounded-lg bg-proiettore px-4 py-2 text-sm font-semibold text-notte-fonda hover:bg-proiettore-acceso">
                        Entra
                      </button>
                    </form>
                    <form action={declineCircleInvite.bind(null, circle.id)}>
                      <button className="rounded-lg border border-riga px-4 py-2 text-sm text-fumo hover:text-schermo">
                        Declina
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="mb-10" aria-labelledby="circoli-attivi">
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 id="circoli-attivi" className="step-title flex-1">
            In sala con te
          </h2>
          <span className="font-mono text-xs text-fumo">{active.length}</span>
        </div>
        {active.length === 0 ? (
          <div className="ticket p-6 text-center text-sm text-fumo">
            Nessun circolo attivo. Creane uno per il tuo gruppo abituale.
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {active.map((membership) => {
              const circle = circleRows.find(
                (item) => item.id === membership.circleId
              );
              if (!circle) return null;
              return (
                <li key={circle.id}>
                  <Link
                    href={`/circoli/${circle.slug}`}
                    className="ticket group block h-full p-5 transition-colors hover:border-proiettore/60"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="eyebrow">
                          {membership.role === "owner"
                            ? "Organizzi tu"
                            : membership.role === "moderator"
                              ? "In regia"
                              : "Membro"}
                        </p>
                        <h3 className="mt-2 font-display text-xl font-semibold text-schermo group-hover:text-proiettore">
                          {circle.name}
                        </h3>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${
                          circle.visibility === "public"
                            ? "bg-proiettore/10 text-proiettore"
                            : "bg-sipario-chiaro text-fumo"
                        }`}
                      >
                        {circle.visibility === "public"
                          ? "Pubblico"
                          : circle.visibility === "unlisted"
                            ? "Con link"
                            : "Privato"}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-fumo">
                      {circle.description || "Nessuna descrizione ancora."}
                    </p>
                    <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.15em] text-proiettore">
                      Apri il circolo →
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        {requests.length > 0 && (
          <p className="mt-3 text-xs text-fumo">
            {requests.length === 1
              ? "Una richiesta di ingresso attende risposta."
              : `${requests.length} richieste di ingresso attendono risposta.`}
          </p>
        )}
      </section>

      <section className="ticket p-5 sm:p-6" aria-labelledby="nuovo-circolo">
        <p className="eyebrow">Una nuova compagnia</p>
        <h2 id="nuovo-circolo" className="mt-2 font-display text-2xl font-semibold">
          Crea un circolo
        </h2>
        <p className="mt-2 text-sm leading-6 text-fumo">
          Parti privato. Potrai renderlo pubblico quando descrizione e regole
          saranno pronte.
        </p>
        {params.errore === "nome" && (
          <p role="alert" className="mt-3 text-sm text-velluto-acceso">
            Nome troppo corto.
          </p>
        )}
        <form action={createCircle} className="mt-5 grid gap-4">
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-schermo">Nome</span>
            <input
              name="name"
              required
              minLength={2}
              maxLength={60}
              placeholder="Cinema del martedì"
              className="rounded-lg border border-riga bg-notte px-3 py-2.5 placeholder:text-fumo/50 focus:border-proiettore focus:outline-none"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-schermo">Descrizione</span>
            <textarea
              name="description"
              maxLength={500}
              rows={3}
              placeholder="Che film guardate e che atmosfera cercate?"
              className="resize-y rounded-lg border border-riga bg-notte px-3 py-2.5 placeholder:text-fumo/50 focus:border-proiettore focus:outline-none"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold text-schermo">Visibilità</span>
              <select
                name="visibility"
                defaultValue="private"
                className="rounded-lg border border-riga bg-notte px-3 py-2.5"
              >
                <option value="private">Privato</option>
                <option value="unlisted">Solo con link</option>
                <option value="public">Pubblico e scopribile</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold text-schermo">Ingressi</span>
              <select
                name="joinPolicy"
                defaultValue="invite"
                className="rounded-lg border border-riga bg-notte px-3 py-2.5"
              >
                <option value="invite">Solo su invito</option>
                <option value="request">Su richiesta</option>
                <option value="open">Ingresso libero</option>
              </select>
            </label>
          </div>
          <button className="mt-1 rounded-lg bg-proiettore px-5 py-3 font-semibold text-notte-fonda hover:bg-proiettore-acceso">
            Crea il circolo
          </button>
        </form>
      </section>
    </div>
  );
}
