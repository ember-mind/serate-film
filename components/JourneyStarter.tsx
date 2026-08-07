import Link from "next/link";
import { createJourney } from "@/lib/journey-actions";

type Friend = { id: number; name: string };

export function JourneyStarter({
  subjectType,
  subjectSlug,
  subjectName,
  movieCount,
  friends,
  existingJourneys,
}: {
  subjectType: "director" | "actor";
  subjectSlug: string;
  subjectName: string;
  movieCount: number;
  friends: Friend[];
  existingJourneys: { id: number; mode: "free" | "chronological" }[];
}) {
  const action = createJourney.bind(null, subjectType, subjectSlug);

  if (movieCount < 2) {
    return (
      <section className="ticket mt-8 p-5">
        <p className="eyebrow">Percorso</p>
        <p className="mt-2 text-sm text-fumo">
          Servono almeno due film in cineteca per iniziare questo percorso.
        </p>
      </section>
    );
  }

  return (
    <section className="ticket mt-8 overflow-hidden" aria-labelledby="journey-starter-title">
      <div className="border-b border-riga bg-proiettore/5 p-5 sm:p-6">
        <p className="eyebrow">Nuovo percorso</p>
        <h2 id="journey-starter-title" className="titlecard mt-1 text-xl text-schermo">
          Guarda {subjectName}, film dopo film
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fumo">
          {movieCount} film presenti in cineteca. Affrontalo da solo oppure invita amici:
          ognuno mantiene i propri progressi.
        </p>
        {existingJourneys.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {existingJourneys.map((journey) => (
              <Link
                key={journey.id}
                href={"/percorsi/" + journey.id}
                className="rounded-full border border-proiettore/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-proiettore transition-colors hover:bg-proiettore/10"
              >
                Apri percorso {journey.mode === "chronological" ? "cronologico" : "libero"}
              </Link>
            ))}
          </div>
        )}
      </div>

      <form action={action} className="grid gap-5 p-5 sm:p-6">
        <fieldset>
          <legend className="eyebrow mb-3">Come vuoi affrontarlo?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-riga bg-notte px-4 py-3 has-checked:border-proiettore has-checked:bg-proiettore/5">
              <input
                type="radio"
                name="mode"
                value="chronological"
                defaultChecked
                className="mt-1 accent-[#e8b84b]"
              />
              <span>
                <strong className="block text-sm text-schermo">In ordine cronologico</strong>
                <span className="mt-0.5 block text-xs leading-relaxed text-fumo">
                  Prossimo film suggerito seguendo anno d’uscita. Fuori ordine conta comunque.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-riga bg-notte px-4 py-3 has-checked:border-proiettore has-checked:bg-proiettore/5">
              <input
                type="radio"
                name="mode"
                value="free"
                className="mt-1 accent-[#e8b84b]"
              />
              <span>
                <strong className="block text-sm text-schermo">Ordine libero</strong>
                <span className="mt-0.5 block text-xs leading-relaxed text-fumo">
                  Scegli ogni volta il titolo che ispira di più.
                </span>
              </span>
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend className="eyebrow mb-1">Con chi?</legend>
          <p className="mb-3 text-xs text-fumo">
            Senza selezioni parti da solo. Gli amici potranno accettare o rifiutare.
          </p>
          {friends.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {friends.map((friend) => (
                <label
                  key={friend.id}
                  className="cursor-pointer rounded-full border border-riga bg-notte px-3 py-2 text-xs text-fumo transition-colors has-checked:border-proiettore has-checked:text-proiettore"
                >
                  <input
                    type="checkbox"
                    name="friendIds"
                    value={friend.id}
                    className="mr-2 accent-[#e8b84b]"
                  />
                  {friend.name}
                </label>
              ))}
            </div>
          ) : (
            <p className="text-xs text-fumo">
              Nessun amico salvato.{" "}
              <Link href="/io/amici" className="text-proiettore underline underline-offset-2">
                Gestisci amici
              </Link>
            </p>
          )}
        </fieldset>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-riga pt-4">
          <p className="text-xs text-fumo">
            +50 XP per film unico · +250 XP al completamento
          </p>
          <button className="rounded-lg bg-proiettore px-5 py-2.5 text-sm font-semibold text-notte-fonda transition-colors hover:bg-proiettore-acceso">
            Avvia percorso
          </button>
        </div>
      </form>
    </section>
  );
}
