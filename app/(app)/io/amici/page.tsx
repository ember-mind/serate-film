import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { users, userFriends } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { saveFriends } from "@/lib/actions";
import { Avatar } from "@/components/Avatar";

export const dynamic = "force-dynamic";

export default async function FriendsPage({
  searchParams,
}: {
  searchParams: Promise<{ salvati?: string }>;
}) {
  const user = await requireUser();
  const [params, people, saved] = await Promise.all([
    searchParams,
    db.query.users.findMany({ orderBy: asc(users.name) }),
    db.query.userFriends.findMany({ where: eq(userFriends.userId, user.id) }),
  ]);
  const savedIds = new Set(saved.map((friend) => friend.friendUserId));
  const candidates = people.filter((person) => person.id !== user.id);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="apertura mb-8 text-center">
        <p className="titlecard-sub">La tua compagnia</p>
        <h1 className="titlecard mt-1 text-3xl text-schermo">I miei amici</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-fumo">
          Salva qui le persone che inviti più spesso. Le nuove serate partiranno da questa lista.
        </p>
      </div>

      {params.salvati === "1" && (
        <p role="status" className="mb-4 text-center text-sm text-proiettore">
          Lista amici aggiornata.
        </p>
      )}

      <form action={saveFriends} className="ticket p-5">
        {candidates.length === 0 ? (
          <p className="text-sm text-fumo">
            Non ci sono ancora altri membri.{" "}
            {user.isAdmin ? (
              <>
                Puoi aggiungerli dalla{" "}
                <Link href="/admin" className="text-proiettore underline">
                  Regia
                </Link>
                .
              </>
            ) : (
              "Chiedi a un amministratore di creare i loro account."
            )}
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {candidates.map((person) => (
              <li key={person.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-riga bg-notte px-3 py-2.5 has-checked:border-proiettore">
                  <input
                    type="checkbox"
                    name="friendIds"
                    value={person.id}
                    defaultChecked={savedIds.has(person.id)}
                    className="accent-[#e8b84b]"
                  />
                  <Avatar id={person.id} name={person.name} />
                  <span className="text-sm text-schermo">{person.name}</span>
                </label>
              </li>
            ))}
          </ul>
        )}

        <button
          type="submit"
          className="mt-5 w-full rounded-lg bg-proiettore py-3 font-semibold text-notte-fonda transition-colors hover:bg-proiettore-acceso"
        >
          Salva la lista
        </button>
      </form>
    </div>
  );
}
