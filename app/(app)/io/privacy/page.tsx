import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { savePrivacyProfile } from "@/lib/social-actions";

export const dynamic = "force-dynamic";

export default async function PrivacyPage({
  searchParams,
}: {
  searchParams: Promise<{ salvato?: string }>;
}) {
  const user = await requireUser();
  const [params, profile] = await Promise.all([
    searchParams,
    db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <header className="apertura mb-8 text-center">
        <p className="titlecard-sub">Chi vede cosa</p>
        <h1 className="titlecard mt-1 text-3xl text-schermo">La tua privacy</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-fumo">
          Profilo, circoli e serate hanno porte separate. Rendere pubblico il
          profilo non apre automaticamente gruppi o serate.
        </p>
      </header>

      {params.salvato === "1" && (
        <p role="status" className="mb-5 text-center text-sm text-proiettore">
          Preferenze salvate.
        </p>
      )}

      <section className="mb-8 grid gap-3 sm:grid-cols-3" aria-label="Livelli di privacy">
        <div className="ticket p-4">
          <p className="font-mono text-xs text-proiettore">01</p>
          <h2 className="mt-2 font-semibold text-schermo">Profilo</h2>
          <p className="mt-2 text-xs leading-5 text-fumo">
            Bio e gusti. Visibili solo al pubblico scelto qui.
          </p>
        </div>
        <div className="ticket p-4">
          <p className="font-mono text-xs text-proiettore">02</p>
          <h2 className="mt-2 font-semibold text-schermo">Circoli</h2>
          <p className="mt-2 text-xs leading-5 text-fumo">
            Ogni circolo decide se è privato, con link o pubblico.
          </p>
        </div>
        <div className="ticket p-4">
          <p className="font-mono text-xs text-proiettore">03</p>
          <h2 className="mt-2 font-semibold text-schermo">Serate</h2>
          <p className="mt-2 text-xs leading-5 text-fumo">
            Invitati e circolo controllano accesso a voti, chat e pagelle.
          </p>
        </div>
      </section>

      <form action={savePrivacyProfile} className="ticket p-5 sm:p-6">
        <div className="grid gap-5">
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-schermo">La tua bio</span>
            <textarea
              name="bio"
              rows={4}
              maxLength={280}
              defaultValue={profile?.bio ?? ""}
              placeholder="Due righe sul tuo rapporto con il cinema…"
              className="resize-y rounded-lg border border-riga bg-notte px-3 py-2.5 text-schermo placeholder:text-fumo/50 focus:border-proiettore focus:outline-none"
            />
            <span className="text-xs text-fumo">Massimo 280 caratteri.</span>
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold text-schermo">Generi preferiti</span>
            <input
              name="favoriteGenres"
              maxLength={120}
              defaultValue={profile?.favoriteGenres ?? ""}
              placeholder="Noir, fantascienza, commedie amare"
              className="rounded-lg border border-riga bg-notte px-3 py-2.5 text-schermo placeholder:text-fumo/50 focus:border-proiettore focus:outline-none"
            />
          </label>

          <fieldset>
            <legend className="text-sm font-semibold text-schermo">
              Chi può vedere il profilo
            </legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {[
                {
                  value: "private",
                  title: "Solo io",
                  copy: "Nessun dato nel Club.",
                },
                {
                  value: "circles",
                  title: "I miei circoli",
                  copy: "Solo membership attive.",
                },
                {
                  value: "public",
                  title: "Pubblico",
                  copy: "Può apparire nel Club.",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className="cursor-pointer rounded-lg border border-riga bg-notte p-3 has-checked:border-proiettore"
                >
                  <span className="flex items-start gap-2">
                    <input
                      type="radio"
                      name="visibility"
                      value={option.value}
                      defaultChecked={
                        (profile?.visibility ?? "private") === option.value
                      }
                      className="mt-0.5 accent-[#d4a24e]"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-schermo">
                        {option.title}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-fumo">
                        {option.copy}
                      </span>
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-riga bg-notte p-3">
              <input
                type="checkbox"
                name="discoverable"
                defaultChecked={profile?.discoverable ?? false}
                className="mt-0.5 accent-[#d4a24e]"
              />
              <span>
                <span className="block text-sm font-semibold text-schermo">
                  Fammi trovare nella pagina Club
                </span>
                <span className="mt-1 block text-xs leading-5 text-fumo">
                  Funziona solo con profilo pubblico. Non mostra username,
                  password, amici o serate private.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-riga bg-notte p-3">
              <input
                type="checkbox"
                name="showStats"
                defaultChecked={profile?.showStats ?? false}
                className="mt-0.5 accent-[#d4a24e]"
              />
              <span>
                <span className="block text-sm font-semibold text-schermo">
                  Condividi statistiche aggregate
                </span>
                <span className="mt-1 block text-xs leading-5 text-fumo">
                  Numeri generali. Nessun dettaglio di serate riservate.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-riga bg-notte p-3">
              <input
                type="checkbox"
                name="allowMentions"
                defaultChecked={profile?.allowMentions ?? true}
                className="mt-0.5 accent-[#d4a24e]"
              />
              <span>
                <span className="block text-sm font-semibold text-schermo">
                  Consenti menzioni
                </span>
                <span className="mt-1 block text-xs leading-5 text-fumo">
                  Solo persone con accesso alla stessa serata o circolo.
                </span>
              </span>
            </label>
          </div>

          <button className="rounded-lg bg-proiettore px-5 py-3 font-semibold text-notte-fonda hover:bg-proiettore-acceso">
            Salva la privacy
          </button>
        </div>
      </form>

      <nav
        aria-label="Altre impostazioni sociali"
        className="mt-6 flex flex-wrap justify-center gap-2"
      >
        <Link
          href="/io/amici"
          className="rounded-full border border-riga px-4 py-2 text-xs text-fumo hover:text-schermo"
        >
          Rubrica amici
        </Link>
        <Link
          href="/circoli"
          className="rounded-full border border-riga px-4 py-2 text-xs text-fumo hover:text-schermo"
        >
          I miei circoli
        </Link>
        <Link
          href="/club"
          className="rounded-full border border-riga px-4 py-2 text-xs text-fumo hover:text-schermo"
        >
          Anteprima Club
        </Link>
      </nav>
    </div>
  );
}
