import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { eventInviteLinks, events, movies, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { acceptEventInvite } from "@/lib/actions";
import { canAccessEvent, isEventActionStateAllowed } from "@/lib/access";

export const dynamic = "force-dynamic";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await db.query.eventInviteLinks.findFirst({
    where: eq(eventInviteLinks.token, token),
  });
  const event = invite
    ? await db.query.events.findFirst({ where: eq(events.id, invite.eventId) })
    : null;

  if (!invite || !event || !isEventActionStateAllowed("acceptEventInvite", event.status)) {
    return (
      <main className="curtain flex min-h-dvh items-center justify-center px-4 py-10">
        <div className="cinemascope w-full max-w-md px-6 py-10 text-center">
          <p className="eyebrow">Biglietto non valido</p>
          <h1 className="titlecard mt-3 text-2xl text-schermo">Invito scaduto</h1>
          <p className="mt-3 text-sm text-fumo">
            Chiedi un nuovo link a chi organizza la serata.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm text-proiettore underline">
            Vai all&apos;accesso
          </Link>
        </div>
      </main>
    );
  }

  const [organizer, movie, currentUser] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, event.createdBy) }),
    event.chosenMovieId
      ? db.query.movies.findFirst({ where: eq(movies.id, event.chosenMovieId) })
      : null,
    getCurrentUser(),
  ]);
  const alreadyInside = currentUser ? await canAccessEvent(event, currentUser) : false;
  const eventTitle = movie?.title ?? event.title ?? "Serata da decidere";

  return (
    <main className="curtain relative flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="curtain-edge pointer-events-none absolute inset-0" aria-hidden />
      <div className="apertura relative w-full max-w-md">
        <div className="cinemascope px-6 py-10 text-center sm:px-10">
          <p className="titlecard-sub">Biglietto per una serata</p>
          <h1 className="titlecard mt-3 text-3xl text-schermo">{eventTitle}</h1>
          <p className="mt-3 text-sm text-fumo">
            {organizer?.name ?? "Un amico"} ti invita a scegliere e guardare un film insieme.
          </p>

          {currentUser ? (
            alreadyInside ? (
              <Link
                href={`/serate/${event.id}`}
                className="titlecard mt-8 block rounded-sm bg-proiettore py-3 text-sm text-notte-fonda"
              >
                Apri la serata
              </Link>
            ) : (
              <form action={acceptEventInvite.bind(null, token)} className="mt-8">
                <button className="titlecard w-full rounded-sm bg-proiettore py-3 text-sm text-notte-fonda transition-colors hover:bg-proiettore-acceso">
                  Accetta ed entra
                </button>
              </form>
            )
          ) : (
            <div className="mt-8 flex flex-col gap-3">
              <Link
                href={`/signup?invito=${encodeURIComponent(token)}`}
                className="titlecard rounded-sm bg-proiettore py-3 text-sm text-notte-fonda"
              >
                Crea account ed entra
              </Link>
              <Link
                href={`/login?next=${encodeURIComponent(`/invito/${token}`)}`}
                className="rounded-sm border border-riga py-2.5 text-sm text-fumo transition-colors hover:border-proiettore hover:text-schermo"
              >
                Ho già un account
              </Link>
            </div>
          )}

          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-fumo">
            Invito personale · non inoltrarlo fuori dal gruppo
          </p>
        </div>
      </div>
    </main>
  );
}
