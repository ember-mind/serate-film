"use client";

import { useActionState, useMemo, useState } from "react";
import { submitConsensusBallot } from "@/lib/event-experience-actions";
import { Poster } from "@/components/Poster";

type Candidate = {
  id: number;
  title: string;
  year: number | null;
  genres: string | null;
  posterUrl: string | null;
  posterCredit: string | null;
  providers: string[];
  score: number;
  vetoes: number;
  firstChoices: number;
  secondChoices: number;
  thirdChoices: number;
};

type BallotDetail = {
  userId: number;
  userName: string;
  choices: { rank: number; title: string }[];
  vetoes: string[];
};

function choiceBreakdown(candidate: Candidate) {
  return (
    [
      candidate.firstChoices > 0
        ? `${candidate.firstChoices} ${
            candidate.firstChoices === 1 ? "prima scelta" : "prime scelte"
          } × 3`
        : null,
      candidate.secondChoices > 0
        ? `${candidate.secondChoices} ${
            candidate.secondChoices === 1 ? "seconda scelta" : "seconde scelte"
          } × 2`
        : null,
      candidate.thirdChoices > 0
        ? `${candidate.thirdChoices} ${
            candidate.thirdChoices === 1 ? "terza scelta" : "terze scelte"
          } × 1`
        : null,
    ]
      .filter(Boolean)
      .join(" · ") || "Nessuna preferenza"
  );
}

export function ConsensusBallot({
  eventId,
  candidates,
  initialRanks,
  initialVetoes,
  ballotsCount,
  ballotDetails,
  disabled = false,
}: {
  eventId: number;
  candidates: Candidate[];
  initialRanks: number[];
  initialVetoes: number[];
  ballotsCount: number;
  ballotDetails: BallotDetail[];
  disabled?: boolean;
}) {
  const action = submitConsensusBallot.bind(null, eventId);
  const [state, formAction, pending] = useActionState(action, undefined);
  const [ranks, setRanks] = useState<(number | "")[]>([
    initialRanks[0] ?? "",
    initialRanks[1] ?? "",
    initialRanks[2] ?? "",
  ]);
  const selected = useMemo(() => new Set(ranks.filter(Boolean)), [ranks]);
  const ranking = useMemo(
    () => [...candidates].sort((a, b) => b.score - a.score || a.vetoes - b.vetoes),
    [candidates]
  );
  const podium = ranking.slice(0, 2);
  const otherCandidates = ranking.slice(2);

  return (
    <section className="grid min-w-0 w-full grid-cols-[minmax(0,1fr)] gap-5">
      <div className="min-w-0 max-w-full overflow-hidden rounded-lg border border-riga bg-notte/70 p-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="eyebrow">Scelta a consenso</p>
            <h3 className="mt-1 text-lg font-semibold text-schermo">Il tuo podio</h3>
            <p className="mt-1 max-w-xl text-xs text-fumo">
              3 punti alla prima scelta, 2 alla seconda, 1 alla terza. Il veto serve solo
              per un film che davvero non guarderesti.
            </p>
          </div>
          <span className="text-xs text-fumo">{ballotsCount} schede consegnate</span>
        </div>

        <form
          action={formAction}
          className="mt-4 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4"
        >
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-3">
            {["🥇 Prima scelta", "🥈 Seconda scelta", "🥉 Terza scelta"].map((label, index) => (
              <label key={label} className="min-w-0 text-xs text-fumo">
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
                  disabled={disabled}
                  className="mt-1 block w-full min-w-0 max-w-full rounded-lg border border-riga bg-notte px-3 py-2.5 text-sm text-schermo"
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
                    disabled={disabled || selected.has(candidate.id)}
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
              disabled={pending || disabled}
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
        <div className="grid min-w-0 w-full grid-cols-[minmax(0,1fr)] gap-7">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-1">
              <p className="eyebrow">Consenso provvisorio</p>
              <p className="text-xs text-fumo">
                Prima scelta 3 punti · seconda 2 · terza 1.
              </p>
            </div>

            <ol className="grid min-w-0 w-full grid-cols-2 items-end gap-3">
              {[...podium].reverse().map((candidate) => {
                const position = ranking.findIndex((item) => item.id === candidate.id) + 1;
                return (
                  <li
                    key={candidate.id}
                    className={`min-w-0 ${position === 1 ? "order-2" : "order-1"}`}
                  >
                    <div
                      className={`mx-auto w-full min-w-0 ${
                        position === 1 ? "max-w-52" : "max-w-44"
                      }`}
                    >
                      <div className="overflow-hidden rounded-t-lg border border-riga bg-notte">
                        <Poster
                          title={candidate.title}
                          year={candidate.year}
                          genres={candidate.genres}
                          posterUrl={candidate.posterUrl}
                          posterCredit={candidate.posterCredit}
                          showTitle={false}
                          className="aspect-2/3 w-full"
                        />
                        <div className="p-3 text-center">
                          <p className="line-clamp-2 text-sm font-semibold text-schermo">
                            {candidate.title}
                          </p>
                          <p className="mt-1 font-mono text-sm text-proiettore">
                            {candidate.score} {candidate.score === 1 ? "punto" : "punti"}
                          </p>
                          <p className="mt-1 text-[11px] leading-relaxed text-fumo">
                            {choiceBreakdown(candidate)}
                          </p>
                          {candidate.vetoes > 0 && (
                            <p className="mt-2 inline-block rounded-full bg-velluto/15 px-2 py-0.5 text-[11px] text-velluto">
                              ⛔ {candidate.vetoes} veto
                            </p>
                          )}
                        </div>
                      </div>
                      <div
                        className={`flex items-center justify-center border-x border-b border-proiettore/40 bg-proiettore/10 ${
                          position === 1 ? "h-20" : "h-14"
                        }`}
                      >
                        <span className="titlecard text-3xl text-proiettore">
                          {position}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {otherCandidates.length > 0 && (
            <div className="min-w-0">
              <p className="eyebrow mb-2">Altri film in corsa</p>
              <ol className="grid min-w-0 gap-2">
                {otherCandidates.map((candidate, index) => (
                  <li
                    key={candidate.id}
                    className="flex min-w-0 items-center gap-3 rounded-lg border border-riga bg-notte p-3"
                  >
                    <span className="w-6 text-center font-mono text-fumo">{index + 3}</span>
                    <Poster
                      title={candidate.title}
                      year={candidate.year}
                      genres={candidate.genres}
                      posterUrl={candidate.posterUrl}
                      posterCredit={candidate.posterCredit}
                      showTitle={false}
                      className="h-16 w-11 shrink-0 rounded-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-schermo">{candidate.title}</p>
                      <p className="mt-1 truncate text-xs text-fumo">
                        {choiceBreakdown(candidate)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-sm text-proiettore">
                        {candidate.score} {candidate.score === 1 ? "punto" : "punti"}
                      </p>
                      {candidate.vetoes > 0 && (
                        <p className="text-[11px] text-velluto">⛔ {candidate.vetoes} veto</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="min-w-0">
            <p className="eyebrow mb-2">Chi ha votato cosa</p>
            <ul className="grid min-w-0 gap-2">
              {ballotDetails.map((ballot) => (
                <li
                  key={ballot.userId}
                  className="flex min-w-0 items-start gap-3 rounded-lg border border-riga bg-notte p-3"
                >
                  <span
                    aria-hidden
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-proiettore/10 font-semibold text-proiettore"
                  >
                    {ballot.userName.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-schermo">{ballot.userName}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-fumo">
                      {ballot.choices.map((choice) => (
                        <span
                          key={`${ballot.userId}-${choice.rank}`}
                          className="rounded-full border border-riga px-2 py-1"
                        >
                          {choice.rank === 1 ? "🥇" : choice.rank === 2 ? "🥈" : "🥉"}{" "}
                          {choice.title}
                        </span>
                      ))}
                      {ballot.vetoes.map((title) => (
                        <span
                          key={`${ballot.userId}-veto-${title}`}
                          className="rounded-full bg-velluto/15 px-2 py-1 text-velluto"
                        >
                          ⛔ {title}
                        </span>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
