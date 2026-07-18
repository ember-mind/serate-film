import { asc } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { deleteUser, resetPassword } from "@/lib/actions";
import { NewUserForm } from "./NewUserForm";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin();
  const people = await db.query.users.findMany({ orderBy: asc(users.name) });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="apertura mb-8 text-center">
        <p className="titlecard-sub">Cabina di regia</p>
        <h1 className="titlecard mt-1 text-3xl text-schermo">La compagnia</h1>
      </div>

      <ul className="mb-8 flex flex-col gap-2">
        {people.map((p) => (
          <li key={p.id} className="ticket flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">
                {p.name}{" "}
                {p.isAdmin && (
                  <span className="ml-1 rounded-full bg-sipario-chiaro px-2 py-0.5 text-xs text-fumo">
                    regia
                  </span>
                )}
              </p>
              <p className="font-mono text-xs text-fumo">@{p.username}</p>
            </div>
            <div className="flex items-center gap-2">
              <form action={resetPassword.bind(null, p.id)} className="flex gap-2">
                <input
                  name="password"
                  type="password"
                  placeholder="nuova password"
                  minLength={6}
                  required
                  className="w-36 rounded-lg border border-riga bg-notte px-2 py-1.5 text-xs placeholder:text-fumo/50"
                />
                <button className="rounded-lg border border-riga px-3 py-1.5 text-xs text-fumo hover:border-proiettore hover:text-schermo">
                  Reset
                </button>
              </form>
              {p.id !== admin.id && (
                <form action={deleteUser.bind(null, p.id)}>
                  <button className="rounded-lg border border-riga px-3 py-1.5 text-xs text-fumo hover:border-velluto hover:text-velluto">
                    Elimina
                  </button>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>

      <NewUserForm />

      <p className="mt-6 text-xs text-fumo">
        Chi ha già votato o partecipato a serate non si può eliminare: lo storico resta intatto.
      </p>
    </div>
  );
}
