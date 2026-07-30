import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { circleMembers, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getCircleAccessBySlug } from "@/lib/access";
import {
  acceptCircleInvite,
  approveCircleRequest,
  declineCircleInvite,
  inviteCircleMember,
  removeCircleMember,
  setCircleMemberRole,
  updateCircle,
} from "@/lib/social-actions";
import { Avatar } from "@/components/Avatar";

export const dynamic = "force-dynamic";

const statusLabel = {
  active: "Nel circolo",
  invited: "Invitato",
  requested: "Ha chiesto di entrare",
} as const;

export default async function CirclePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ creato?: string; unito?: string }>;
}) {
  const user = await requireUser();
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const access = await getCircleAccessBySlug(slug, user);
  if (!access || !access.canView) notFound();

  const { circle, membership, canManage } = access;
  const [memberRows, people] = await Promise.all([
    db.query.circleMembers.findMany({
      where: eq(circleMembers.circleId, circle.id),
    }),
    db.query.users.findMany({ orderBy: asc(users.name) }),
  ]);
  const nameOf = (userId: number) =>
    people.find((person) => person.id === userId)?.name ?? "Membro";
  const memberIds = new Set(memberRows.map((member) => member.userId));
  const candidates = people.filter(
    (person) => person.id !== user.id && !memberIds.has(person.id)
  );
  const activeMembers = memberRows.filter((member) => member.status === "active");
  const pending = memberRows.filter((member) => member.status !== "active");
  const isOwner = user.isAdmin || circle.ownerId === user.id;

  if (membership?.status === "invited" && !user.isAdmin) {
    return (
      <div className="mx-auto max-w-xl pt-8 text-center">
        <p className="titlecard-sub">Posto riservato</p>
        <h1 className="titlecard mt-2 text-3xl text-schermo">{circle.name}</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-fumo">
          {circle.description || "Sei stato invitato in questo circolo."}
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <form action={acceptCircleInvite.bind(null, circle.id)}>
            <button className="rounded-lg bg-proiettore px-5 py-3 font-semibold text-notte-fonda">
              Entra nel circolo
            </button>
          </form>
          <form action={declineCircleInvite.bind(null, circle.id)}>
            <button className="rounded-lg border border-riga px-5 py-3 text-fumo hover:text-schermo">
              Declina
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="apertura mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="titlecard-sub">
              {circle.visibility === "public"
                ? "Circolo pubblico"
                : circle.visibility === "unlisted"
                  ? "Circolo con link"
                  : "Circolo privato"}
            </p>
            <h1 className="titlecard mt-2 text-3xl text-schermo">{circle.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-fumo">
              {circle.description || "Descrizione ancora da scrivere."}
            </p>
          </div>
          <Link
            href="/circoli"
            className="rounded-full border border-riga px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-fumo hover:text-schermo"
          >
            Tutti i circoli
          </Link>
        </div>
        {(query.creato === "1" || query.unito === "1") && (
          <p role="status" className="mt-4 text-sm text-proiettore">
            {query.creato === "1"
              ? "Circolo creato. Ora invita la compagnia."
              : "Sei entrato nel circolo."}
          </p>
        )}
      </header>

      <section className="ticket mb-8 p-5" aria-labelledby="compagnia">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">La compagnia</p>
            <h2 id="compagnia" className="mt-1 font-display text-2xl font-semibold">
              {activeMembers.length}{" "}
              {activeMembers.length === 1 ? "persona" : "persone"}
            </h2>
          </div>
          <Link
            href={`/io/anno/${new Date().getFullYear()}`}
            className="text-xs text-proiettore underline"
          >
            L&apos;anno del gruppo
          </Link>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {activeMembers.map((member) => {
            const memberName = nameOf(member.userId);
            return (
              <li
                key={member.userId}
                className="flex items-center gap-3 rounded-lg border border-riga bg-notte p-3"
              >
                <Avatar id={member.userId} name={memberName} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-schermo">
                    {memberName}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-fumo">
                    {member.role === "owner"
                      ? "Fondatore"
                      : member.role === "moderator"
                        ? "Regia"
                        : "Membro"}
                  </p>
                </div>
                {canManage && member.userId !== circle.ownerId && (
                  <div className="flex items-center gap-1.5">
                    {isOwner && (
                      <form
                        action={setCircleMemberRole.bind(
                          null,
                          circle.id,
                          member.userId
                        )}
                        className="flex items-center gap-1"
                      >
                        <select
                          name="role"
                          defaultValue={member.role}
                          aria-label={`Ruolo di ${memberName}`}
                          className="rounded-md border border-riga bg-sipario px-2 py-1 text-xs text-fumo"
                        >
                          <option value="member">Membro</option>
                          <option value="moderator">Regia</option>
                        </select>
                        <button
                          title={`Salva ruolo di ${memberName}`}
                          className="rounded-md border border-riga px-2 py-1 text-xs text-fumo hover:border-proiettore hover:text-schermo"
                        >
                          Salva
                        </button>
                      </form>
                    )}
                    <form
                      action={removeCircleMember.bind(
                        null,
                        circle.id,
                        member.userId
                      )}
                    >
                      <button
                        aria-label={`Rimuovi ${memberName}`}
                        title={`Rimuovi ${memberName}`}
                        className="rounded-md border border-riga px-2 py-1 text-xs text-fumo hover:border-velluto hover:text-velluto-acceso"
                      >
                        ×
                      </button>
                    </form>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {canManage && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="ticket p-5" aria-labelledby="invita-membro">
            <p className="eyebrow">Allarga la fila</p>
            <h2 id="invita-membro" className="mt-1 font-display text-xl font-semibold">
              Invita una persona
            </h2>
            {candidates.length > 0 ? (
              <form
                action={inviteCircleMember.bind(null, circle.id)}
                className="mt-4 flex gap-2"
              >
                <select
                  name="userId"
                  required
                  className="min-w-0 flex-1 rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm"
                >
                  <option value="">Scegli dalla compagnia…</option>
                  {candidates.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
                <button className="rounded-lg bg-proiettore px-4 py-2.5 text-sm font-semibold text-notte-fonda">
                  Invita
                </button>
              </form>
            ) : (
              <p className="mt-3 text-sm text-fumo">
                Tutte le persone disponibili sono già qui o hanno un invito.
              </p>
            )}

            {pending.length > 0 && (
              <ul className="mt-5 grid gap-2">
                {pending.map((member) => {
                  const memberName = nameOf(member.userId);
                  return (
                    <li
                      key={member.userId}
                      className="flex items-center justify-between gap-3 rounded-lg border border-riga bg-notte px-3 py-2.5"
                    >
                      <span>
                        <span className="block text-sm text-schermo">
                          {memberName}
                        </span>
                        <span className="block text-xs text-fumo">
                          {statusLabel[member.status]}
                        </span>
                      </span>
                      <span className="flex gap-1.5">
                        {member.status === "requested" && (
                          <form
                            action={approveCircleRequest.bind(
                              null,
                              circle.id,
                              member.userId
                            )}
                          >
                            <button className="rounded-md bg-proiettore px-3 py-1.5 text-xs font-semibold text-notte-fonda">
                              Accetta
                            </button>
                          </form>
                        )}
                        <form
                          action={removeCircleMember.bind(
                            null,
                            circle.id,
                            member.userId
                          )}
                        >
                          <button className="rounded-md border border-riga px-3 py-1.5 text-xs text-fumo">
                            Rimuovi
                          </button>
                        </form>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="ticket p-5" aria-labelledby="regole-circolo">
            <p className="eyebrow">Regole d&apos;ingresso</p>
            <h2 id="regole-circolo" className="mt-1 font-display text-xl font-semibold">
              Impostazioni
            </h2>
            <form
              action={updateCircle.bind(null, circle.id)}
              className="mt-4 grid gap-3"
            >
              <label className="grid gap-1 text-xs text-fumo">
                Nome
                <input
                  name="name"
                  required
                  minLength={2}
                  maxLength={60}
                  defaultValue={circle.name}
                  className="rounded-lg border border-riga bg-notte px-3 py-2 text-sm text-schermo"
                />
              </label>
              <label className="grid gap-1 text-xs text-fumo">
                Descrizione
                <textarea
                  name="description"
                  rows={3}
                  maxLength={500}
                  defaultValue={circle.description ?? ""}
                  className="rounded-lg border border-riga bg-notte px-3 py-2 text-sm text-schermo"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-1 text-xs text-fumo">
                  Visibilità
                  <select
                    name="visibility"
                    defaultValue={circle.visibility}
                    className="rounded-lg border border-riga bg-notte px-2 py-2 text-sm text-schermo"
                  >
                    <option value="private">Privato</option>
                    <option value="unlisted">Con link</option>
                    <option value="public">Pubblico</option>
                  </select>
                </label>
                <label className="grid gap-1 text-xs text-fumo">
                  Ingressi
                  <select
                    name="joinPolicy"
                    defaultValue={circle.joinPolicy}
                    className="rounded-lg border border-riga bg-notte px-2 py-2 text-sm text-schermo"
                  >
                    <option value="invite">Invito</option>
                    <option value="request">Richiesta</option>
                    <option value="open">Liberi</option>
                  </select>
                </label>
              </div>
              <button className="mt-1 rounded-lg border border-proiettore px-4 py-2.5 text-sm font-semibold text-proiettore hover:bg-proiettore hover:text-notte-fonda">
                Salva impostazioni
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
