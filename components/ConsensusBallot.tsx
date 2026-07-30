"use client";

import { useActionState, useMemo, useState } from "react";
import { submitConsensusBallot } from "@/lib/event-experience-actions";

type Candidate = {
  id: number;
  title: string;
  year: number | null;
  providers: string[];
  score: number;
  vetoes: number;
};

export function ConsensusBallot({
  eventId,
  candidates,
  initialRanks,
  initialVetoes,
  ballotsCount,
}: {
  eventId: number;
  candidates: Candidate[];
  initialRanks: number[];
  initialVetoes: number[];
  ballotsCount: number;
}) {
  const action = submitConsensusBallot.bind(null, eventId);
  const [state, formAction, pending] = useActionState(action, undefined);
  const [ranks, setRanks] = useState<(number | "")[]>([
    initialRanks[0] ?? "",
    initialRanks[1] ?? "",
    initialRanks[2] ?? "",
  ]);
  const selected = useMemo(() => new Set(ranks.filter(Boolean)), [ranks]);

  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-riga bg-notte/70 p-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="eyebrow">Scelta a consenso</p>
            <h3 className="mt-1 text-lg font-semibold text-schermo">Il tuo podio</h3>
            <p className="mt-1 max-w-xl text-xs text-fumo">
              3 punti alla prima scelta, 2 alla seconda, 1 alla terza. Il veto serve solo
              per un film che davvero non guarderesti.
            </p>
          </div>
          <span className="text-xs text-fumo">{ballotsCount} schede consegnate</span>
        </div>

        <form action={formAction} className="mt-4 grid gap-4">
          <div className="grid gap-2 sm:grid-cols-3">
            {["🥇 Prima scelta", "🥈 Seconda scelta", "🥉 Terza scelta"].map((label, index) => (
              <label key={label} className="text-xs text-fumo">
                {label}
                <select
                  name={`rank${index + 1}`}
                  value={ranks[index]}
                  onChange={(event) => {
                    const value = event.target.value ? Number(event.target.value) : "";
                    setRanks((current) =>
                      current.map((rank, rankIndex) => (rankIndex === index ? value : rank))
                    );
                  }}
                  required={index === 0}
                  className="mt-1 block w-full rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm text-schermo"
                >
                  <option value="">—</option>
                  {candidates.map((candidate) => (
                    <option
                      key={candidate.id}
                      value={candidate.id}
                      disabled={selected.has(candidate.id) && ranks[index] !== candidate.id}
                    >
                      {candidate.title}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <details>
            <summary className="cursor-pointer text-sm text-fumo">Ho un veto</summary>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {candidates.map((candidate) => (
                <label
                  key={candidate.id}
                  className="flex items-center gap-2 rounded-lg border border-riga px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    name="vetoIds"
                    value={candidate.id}
                    defaultChecked={initialVetoes.includes(candidate.id)}
                    disabled={selected.has(candidate.id)}
                    className="accent-[#e8b84b]"
                  />
                  {candidate.title}
                </label>
              ))}
            </div>
          </details>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-fumo">La tua scheda sostituisce quella precedente.</p>
            <button
              disabled={pending}
              className="rounded-lg bg-proiettore px-4 py-2 text-sm font-semibold text-notte-fonda disabled:opacity-50"
            >
              {pending ? "Consegno…" : initialRanks.length ? "Aggiorna podio" : "Consegna podio"}
            </button>
          </div>
          {state?.error && <p className="text-sm text-velluto">{state.error}</p>}
          {state?.ok && <p className="text-sm text-salvia">Podio salvato.</p>}
        </form>
      </div>

      {ballotsCount > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="eyebrow">Consenso provvisorio</p>
            <p className="text-xs text-fumo">I veti restano visibili, mai ignorati.</p>
          </div>
          <ol className="grid gap-2">
            {[...candidates]
              .sort((a, b) => b.score - a.score || a.vetoes - b.vetoes)
              .map((candidate, index) => (
                <li
                  key={candidate.id}
                  className="flex items-center gap-3 rounded-lg border border-riga bg-notte px-3 py-2.5"
                >
                  <span className="w-6 text-center font-mono text-proiettore">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-schermo">
                      {candidate.title}
                      {candidate.year ? ` (${candidate.year})` : ""}
                    </p>
                    {candidate.providers.length > 0 && (
                      <p className="truncate text-xs text-fumo">
                        Si vede su {candidate.providers.join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-proiettore">{candidate.score} pt</p>
                    {candidate.vetoes > 0 && (
                      <p className="text-[11px] text-velluto">{candidate.vetoes} veto</p>
                    )}
                  </div>
                </li>
              ))}
          </ol>
        </div>
      )}
    </section>
  );
}
