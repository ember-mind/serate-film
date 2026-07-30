"use client";

import { useEffect, useMemo, useState } from "react";
import {
  categories,
  competitors,
  features,
  revenuePaths,
  sources,
  type CategoryId,
  type Feature,
} from "./roadmap-data";

type Variant = "A" | "B" | "C";

const recommendationStyle = {
  Costruire: "border-[#d4a24e]/45 bg-[#d4a24e]/10 text-[#e9bc6a]",
  Testare: "border-[#86b6b2]/45 bg-[#86b6b2]/10 text-[#a8d5d1]",
  "Più avanti": "border-riga bg-notte/60 text-fumo",
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Impact({ value }: { value: Feature["impact"] }) {
  return (
    <span className="flex items-center gap-1" aria-label={`Impatto ${value} su 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={cx(
            "h-1.5 w-3 rounded-full",
            index < value ? "bg-proiettore" : "bg-riga",
          )}
        />
      ))}
    </span>
  );
}

function MockFrame({
  label,
  children,
  tint = "gold",
}: {
  label: string;
  children: React.ReactNode;
  tint?: "gold" | "teal" | "rose" | "violet" | "green";
}) {
  const border = {
    gold: "border-[#d4a24e]/30",
    teal: "border-[#86b6b2]/35",
    rose: "border-[#ce7f8c]/35",
    violet: "border-[#a9a0d8]/35",
    green: "border-[#98b982]/35",
  }[tint];

  return (
    <div
      className={cx(
        "relative min-h-52 overflow-hidden rounded-[18px] border bg-[#0d0c0a] p-3 shadow-2xl shadow-black/30",
        border,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-fumo">{label}</span>
        <span className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-velluto" />
          <span className="h-1.5 w-1.5 rounded-full bg-proiettore" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#86b6b2]" />
        </span>
      </div>
      {children}
    </div>
  );
}

function AvatarStack({ names }: { names: string[] }) {
  return (
    <div className="flex -space-x-2">
      {names.map((name, index) => (
        <span
          key={name}
          className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#0d0c0a] bg-sipario-chiaro font-mono text-[9px] text-schermo"
          style={{ transform: `rotate(${index % 2 ? 3 : -2}deg)` }}
        >
          {name.slice(0, 2)}
        </span>
      ))}
    </div>
  );
}

function MiniMockup({ feature }: { feature: Feature }) {
  const commonLabel = feature.title;

  if (feature.id === "smart-rsvp") {
    return (
      <MockFrame label={commonLabel}>
        <p className="font-display text-sm text-schermo">Venerdì · Dune: Parte Due</p>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-sipario p-3">
          <AvatarStack names={["EM", "LU", "SA", "GI"]} />
          <span className="font-mono text-[9px] text-[#86b6b2]">4 confermati</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center font-mono text-[9px]">
          <span className="rounded-lg bg-[#98b982]/15 px-1 py-2 text-[#b7d5a4]">Ci sono</span>
          <span className="rounded-lg bg-proiettore/10 px-1 py-2 text-proiettore">Forse</span>
          <span className="rounded-lg bg-velluto/15 px-1 py-2 text-[#dc9aa4]">Non posso</span>
        </div>
        <p className="mt-3 text-[9px] text-fumo">Rispondi entro giovedì · 20:00</p>
      </MockFrame>
    );
  }

  if (feature.id === "ranked-choice") {
    return (
      <MockFrame label={commonLabel}>
        {[
          ["01", "Perfect Days", "18 pt"],
          ["02", "Anatomia di una caduta", "15 pt"],
          ["03", "The Holdovers", "12 pt"],
        ].map(([position, title, points], index) => (
          <div
            key={title}
            className={cx(
              "mb-2 grid grid-cols-[28px_1fr_auto] items-center gap-2 rounded-xl border p-2",
              index === 0 ? "border-proiettore/35 bg-proiettore/8" : "border-riga bg-sipario/60",
            )}
          >
            <span className="font-display text-xs text-proiettore">{position}</span>
            <span className="truncate text-[10px] text-schermo">{title}</span>
            <span className="font-mono text-[8px] text-fumo">{points}</span>
          </div>
        ))}
        <p className="mt-3 text-[9px] leading-4 text-fumo">
          Miglior compromesso: piace a 5 su 6, nessun veto.
        </p>
      </MockFrame>
    );
  }

  if (feature.id === "group-filters") {
    return (
      <MockFrame label={commonLabel}>
        <div className="flex flex-wrap gap-1.5 font-mono text-[8px]">
          {["Leggero ✓", "≤ 120 min", "Netflix", "Nessun horror"].map((item) => (
            <span key={item} className="rounded-full border border-proiettore/30 px-2 py-1 text-proiettore">
              {item}
            </span>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-gradient-to-br from-[#56422d] to-[#201914] p-3">
          <span className="font-mono text-[8px] text-proiettore">94% MATCH</span>
          <p className="mt-1 font-display text-base">The Grand Budapest Hotel</p>
          <p className="mt-2 text-[9px] text-[#d8d3c8]/70">1h 39m · disponibile per tutti · mai visto in 5</p>
        </div>
        <button className="mt-3 w-full rounded-lg bg-proiettore py-2 font-mono text-[8px] uppercase text-notte">
          Proponi al gruppo
        </button>
      </MockFrame>
    );
  }

  if (feature.id === "where-to-watch") {
    return (
      <MockFrame label={commonLabel}>
        <div className="rounded-xl bg-sipario p-3">
          <p className="font-display text-sm">Past Lives</p>
          <p className="mt-1 text-[9px] text-fumo">Disponibile in Italia</p>
        </div>
        <div className="mt-3 space-y-2">
          {[
            ["N", "Netflix", "Incluso", true],
            ["A", "Apple TV", "3,99 €", false],
            ["C", "Cinema Moderno", "21:15", false],
          ].map(([mark, name, price, owned]) => (
            <div key={String(name)} className="flex items-center gap-2 rounded-lg border border-riga p-2">
              <span className="grid h-6 w-6 place-items-center rounded bg-sipario-chiaro text-[9px]">
                {mark}
              </span>
              <span className="flex-1 text-[10px]">{name}</span>
              <span className={cx("font-mono text-[8px]", owned ? "text-[#98b982]" : "text-fumo")}>
                {price}
              </span>
            </div>
          ))}
        </div>
      </MockFrame>
    );
  }

  if (feature.id === "recurring-clubs") {
    return (
      <MockFrame label={commonLabel}>
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-sm">Giovedì Giallo</p>
            <p className="mt-1 text-[9px] text-fumo">Ogni 2 settimane · 8 membri</p>
          </div>
          <span className="rounded-full bg-[#98b982]/15 px-2 py-1 font-mono text-[8px] text-[#b7d5a4]">
            ATTIVO
          </span>
        </div>
        <div className="mt-5 flex items-center justify-between">
          {["Sara", "Leo", "Ema", "Marta"].map((name, index) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <span
                className={cx(
                  "grid h-8 w-8 place-items-center rounded-full border text-[9px]",
                  index === 1
                    ? "border-proiettore bg-proiettore text-notte"
                    : "border-riga bg-sipario text-fumo",
                )}
              >
                {index + 1}
              </span>
              <span className="text-[8px] text-fumo">{name}</span>
            </div>
          ))}
        </div>
        <p className="mt-5 rounded-lg border border-dashed border-riga p-2 text-center text-[9px] text-fumo">
          Prossimo host: Leo · 14 novembre
        </p>
      </MockFrame>
    );
  }

  if (feature.id === "calendar-reminders") {
    return (
      <MockFrame label={commonLabel}>
        <div className="grid grid-cols-[54px_1fr] overflow-hidden rounded-xl border border-riga">
          <div className="grid place-items-center bg-velluto px-2 py-3">
            <span className="font-mono text-[8px]">NOV</span>
            <strong className="font-display text-2xl">14</strong>
          </div>
          <div className="p-3">
            <p className="font-display text-xs">Serata Kubrick</p>
            <p className="mt-1 text-[9px] text-fumo">20:45 · da Marta</p>
          </div>
        </div>
        <div className="mt-4 space-y-2 text-[9px]">
          <p className="rounded-lg bg-sipario p-2">✓ Aggiunta al calendario</p>
          <p className="rounded-lg bg-proiettore/10 p-2 text-proiettore">
            Domani · ricorda a Leo le birre
          </p>
          <p className="rounded-lg bg-sipario p-2 text-fumo">2 ore prima · indicazioni stradali</p>
        </div>
      </MockFrame>
    );
  }

  if (feature.id === "sync-lobby") {
    return (
      <MockFrame label={commonLabel} tint="teal">
        <div className="rounded-xl bg-[#12201f] p-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[8px] text-[#a8d5d1]">6 IN SALA · 6 SYNC</span>
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#86b6b2]" />
          </div>
          <p className="mt-3 font-display text-sm">La cosa</p>
          <p className="mt-1 font-mono text-xl text-schermo">01:14:23</p>
        </div>
        <div className="mt-3 flex items-center justify-center gap-3">
          <button className="grid h-8 w-8 place-items-center rounded-full border border-[#86b6b2]/40 text-xs">
            −10
          </button>
          <button className="grid h-11 w-11 place-items-center rounded-full bg-[#86b6b2] text-notte">
            ▶
          </button>
          <button className="grid h-8 w-8 place-items-center rounded-full border border-[#86b6b2]/40 text-xs">
            +10
          </button>
        </div>
        <p className="mt-3 text-center text-[8px] text-fumo">Il film resta sul servizio di ogni spettatore</p>
      </MockFrame>
    );
  }

  if (feature.id === "youtube-room") {
    return (
      <MockFrame label={commonLabel} tint="teal">
        <div className="relative grid aspect-video place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-[#273c3a] to-black">
          <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 font-mono text-[7px] text-white">
            YOUTUBE · EMBED UFFICIALE
          </span>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white/90 pl-0.5 text-notte">▶</span>
          <div className="absolute inset-x-3 bottom-2 h-1 rounded-full bg-white/20">
            <span className="block h-1 w-2/3 rounded-full bg-[#86b6b2]" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[9px]">
          <span>Nosferatu · 1922</span>
          <span className="text-[#a8d5d1]">Public domain verificato</span>
        </div>
      </MockFrame>
    );
  }

  if (feature.id === "streamer-watchalong") {
    return (
      <MockFrame label={commonLabel} tint="teal">
        <div className="grid grid-cols-[1.2fr_.8fr] gap-2">
          <div className="relative grid min-h-28 place-items-center rounded-xl bg-gradient-to-br from-[#334c49] to-[#111a19]">
            <span className="text-2xl">🎙️</span>
            <span className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-[8px]">
              Marta · LIVE
            </span>
          </div>
          <div className="rounded-xl border border-dashed border-[#86b6b2]/30 p-2 text-center">
            <p className="font-mono text-[8px] text-[#a8d5d1]">TUO PLAYER</p>
            <p className="mt-5 text-[9px] text-fumo">Il film non viene ritrasmesso</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg bg-sipario px-3 py-2">
          <span className="font-mono text-sm">00:42:17</span>
          <span className="text-[8px] text-[#98b982]">● 184 sincronizzati</span>
        </div>
      </MockFrame>
    );
  }

  if (feature.id === "live-room") {
    return (
      <MockFrame label={commonLabel} tint="teal">
        <div className="flex h-24 items-center justify-center gap-4 rounded-xl bg-[#12201f] text-2xl">
          <span className="-rotate-6">😱</span>
          <span className="translate-y-4">🍿</span>
          <span className="rotate-6">👏</span>
          <span className="-translate-y-3">🫣</span>
        </div>
        <div className="mt-3 rounded-xl border border-[#86b6b2]/25 p-3">
          <p className="text-[9px] text-schermo">Il sospetto è chiuso nella stanza?</p>
          <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-[8px]">
            <span className="rounded bg-[#86b6b2] p-2 text-center text-notte">SÌ · 68%</span>
            <span className="rounded bg-sipario p-2 text-center text-fumo">NO · 32%</span>
          </div>
        </div>
      </MockFrame>
    );
  }

  if (feature.id === "licensed-events") {
    return (
      <MockFrame label={commonLabel} tint="teal">
        <div className="rounded-xl border border-[#86b6b2]/25 bg-[#12201f] p-3">
          <p className="font-display text-sm">Rassegna Sci-Fi Europea</p>
          <p className="mt-1 text-[9px] text-fumo">Italia · 300 posti online · €8</p>
        </div>
        <div className="mt-3 space-y-2 font-mono text-[8px]">
          {[
            ["Diritti film e territorio", "Da verificare"],
            ["Licenza online SIAE", "Richiesta"],
            ["Biglietteria e accessi", "Pronta"],
          ].map(([label, status], index) => (
            <div key={label} className="flex items-center justify-between rounded-lg bg-sipario p-2">
              <span>{label}</span>
              <span className={index === 2 ? "text-[#98b982]" : "text-proiettore"}>{status}</span>
            </div>
          ))}
        </div>
      </MockFrame>
    );
  }

  if (feature.id === "private-feed") {
    return (
      <MockFrame label={commonLabel} tint="rose">
        <div className="space-y-2">
          {[
            ["LU", "Luca ha recensito", "Perfect Days · 4½"],
            ["SA", "Sara ha creato", "Horror di mezzanotte"],
            ["EM", "Ema ha aggiunto", "3 film alla watchlist"],
          ].map(([avatar, action, detail]) => (
            <div key={detail} className="flex gap-2 rounded-xl border border-riga bg-sipario/70 p-2.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#ce7f8c]/15 text-[8px] text-[#e1aab3]">
                {avatar}
              </span>
              <div>
                <p className="text-[9px] text-schermo">{action}</p>
                <p className="mt-0.5 text-[8px] text-fumo">{detail}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 font-mono text-[8px] text-[#e1aab3]">Solo dal circolo “I soliti sei”</p>
      </MockFrame>
    );
  }

  if (feature.id === "review-threads") {
    return (
      <MockFrame label={commonLabel} tint="rose">
        <div className="rounded-xl bg-sipario p-3">
          <div className="flex items-center justify-between">
            <strong className="text-[10px]">Marta</strong>
            <span className="text-[10px] text-proiettore">★★★★½</span>
          </div>
          <p className="mt-2 text-[9px] leading-4 text-schermo/80">
            “Un film che sembra piccolo finché non ti accorgi che parla di tutto.”
          </p>
          <p className="mt-2 text-[8px] text-[#e1aab3]">♥ 4 · Rispondi</p>
        </div>
        <div className="ml-5 mt-2 rounded-xl border-l-2 border-[#ce7f8c]/40 bg-notte p-2">
          <p className="text-[8px]"><strong>Leo</strong> · proprio quella scena finale.</p>
          <button className="mt-2 rounded bg-velluto/20 px-2 py-1 text-[7px] text-[#e1aab3]">
            Mostra spoiler
          </button>
        </div>
      </MockFrame>
    );
  }

  if (feature.id === "circles") {
    return (
      <MockFrame label={commonLabel} tint="rose">
        {[
          ["👻", "Horror crew", "6 amici", true],
          ["🍝", "Cinema in famiglia", "9 amici", false],
          ["🎞️", "Classici restaurati", "4 amici", true],
        ].map(([emoji, name, count, selected]) => (
          <div
            key={String(name)}
            className={cx(
              "mb-2 flex items-center gap-3 rounded-xl border p-2",
              selected ? "border-[#ce7f8c]/40 bg-[#ce7f8c]/8" : "border-riga bg-sipario/60",
            )}
          >
            <span className="text-lg">{emoji}</span>
            <span className="flex-1 text-[10px]">{name}</span>
            <span className="text-[8px] text-fumo">{count}</span>
            <span className="text-[#e1aab3]">{selected ? "✓" : "+"}</span>
          </div>
        ))}
        <p className="mt-3 text-center font-mono text-[8px] text-fumo">Invita i 10 amici selezionati</p>
      </MockFrame>
    );
  }

  if (feature.id === "taste-match") {
    return (
      <MockFrame label={commonLabel} tint="rose">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-sipario text-sm">EM</span>
            <p className="mt-2 text-[9px]">Tu</p>
          </div>
          <div className="text-center">
            <strong className="font-display text-xl text-[#e1aab3]">82%</strong>
            <p className="font-mono text-[7px] text-fumo">AFFINITÀ</p>
          </div>
          <div className="text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-sipario text-sm">SA</span>
            <p className="mt-2 text-[9px]">Sara</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-1.5 text-[8px]">
          <span className="rounded-full bg-[#98b982]/15 px-2 py-1 text-[#b7d5a4]">+ Sci-fi</span>
          <span className="rounded-full bg-[#98b982]/15 px-2 py-1 text-[#b7d5a4]">+ Corea</span>
          <span className="rounded-full bg-velluto/15 px-2 py-1 text-[#dc9aa4]">− Western</span>
        </div>
        <p className="mt-4 text-center text-[9px] text-fumo">Film ponte: Arrival · 91% match</p>
      </MockFrame>
    );
  }

  if (feature.id === "public-clubs") {
    return (
      <MockFrame label={commonLabel} tint="rose">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-velluto to-[#3b1319] text-xl">
            🎬
          </span>
          <div className="flex-1">
            <p className="font-display text-sm">Notturno VHS</p>
            <p className="mt-1 text-[8px] text-fumo">@marta · 1.248 follower</p>
          </div>
          <span className="rounded-full bg-[#ce7f8c] px-3 py-1 text-[8px] text-notte">Segui</span>
        </div>
        <div className="mt-4 rounded-xl border border-riga p-3">
          <span className="font-mono text-[8px] text-[#e1aab3]">PROSSIMA SERATA</span>
          <p className="mt-2 text-[10px]">Videodrome · watch-along</p>
          <p className="mt-1 text-[8px] text-fumo">Sabato 23:30 · 214 interessati</p>
        </div>
        <p className="mt-3 text-[8px] text-fumo">Il tuo profilo personale resta privato.</p>
      </MockFrame>
    );
  }

  if (feature.id === "year-in-film") {
    return (
      <MockFrame label={commonLabel} tint="violet">
        <div className="rounded-xl bg-gradient-to-br from-[#403b63] to-[#171526] p-4 text-center">
          <p className="font-mono text-[8px] tracking-[0.2em] text-[#cbc5ef]">IL VOSTRO 2026</p>
          <strong className="mt-2 block font-display text-3xl">42</strong>
          <span className="text-[9px] text-fumo">film visti insieme</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            ["Horror", "genere"],
            ["4,1", "voto medio"],
            ["Sara", "scoperta"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-lg bg-sipario p-2">
              <strong className="block text-[10px] text-[#cbc5ef]">{value}</strong>
              <span className="text-[7px] text-fumo">{label}</span>
            </div>
          ))}
        </div>
      </MockFrame>
    );
  }

  if (feature.id === "recap-cards") {
    return (
      <MockFrame label={commonLabel} tint="violet">
        <div className="mx-auto w-[82%] -rotate-2 rounded-sm border border-[#d8d3c8]/20 bg-[#d8d3c8] p-3 text-notte shadow-xl">
          <p className="font-mono text-[7px] uppercase tracking-[0.2em]">Serate Film · 14 nov</p>
          <div className="my-3 h-20 bg-gradient-to-br from-[#1d3044] to-[#7e2634]" />
          <p className="font-display text-base">Perfect Days</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[8px]">6 presenti · 4,6 ★</span>
            <span className="text-sm">🍿🍺</span>
          </div>
          <p className="mt-3 border-t border-black/20 pt-2 text-[8px] italic">
            “La miglior scelta di Leo finora.”
          </p>
        </div>
      </MockFrame>
    );
  }

  if (feature.id === "memory-roll") {
    return (
      <MockFrame label={commonLabel} tint="violet">
        <div className="grid grid-cols-3 gap-2">
          {["🍿", "📸", "🎟️", "🍕", "😂", "🎬"].map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="grid aspect-square place-items-center rounded-sm bg-gradient-to-br from-sipario-chiaro to-notte text-xl shadow-lg"
              style={{ transform: `rotate(${(index % 3) - 1}deg)` }}
            >
              {item}
            </div>
          ))}
        </div>
        <p className="mt-4 border-l-2 border-[#a9a0d8]/50 pl-3 font-display text-[10px] italic text-[#cbc5ef]">
          “La carbonara durante i titoli non si ripete.”
        </p>
      </MockFrame>
    );
  }

  return (
    <MockFrame label={commonLabel} tint="green">
      <div className="rounded-xl border border-[#98b982]/30 bg-[#172016] p-3">
        <p className="font-display text-sm">Chi può vedere questa serata?</p>
        <div className="mt-3 grid grid-cols-3 gap-1 text-center font-mono text-[8px]">
          <span className="rounded bg-[#98b982] px-1 py-2 text-notte">Solo invitati</span>
          <span className="rounded bg-sipario px-1 py-2 text-fumo">Amici</span>
          <span className="rounded bg-sipario px-1 py-2 text-fumo">Pubblica</span>
        </div>
      </div>
      <div className="mt-3 space-y-2 text-[9px]">
        <p className="flex justify-between rounded-lg bg-sipario p-2">
          <span>Consenso foto</span><span className="text-[#b7d5a4]">Richiedi ✓</span>
        </p>
        <p className="flex justify-between rounded-lg bg-sipario p-2">
          <span>Esporta i miei dati</span><span className="text-fumo">→</span>
        </p>
        <p className="flex justify-between rounded-lg bg-sipario p-2">
          <span>Blocca e segnala</span><span className="text-fumo">→</span>
        </p>
      </div>
    </MockFrame>
  );
}

function SelectButton({
  feature,
  selected,
  onToggle,
  compact = false,
}: {
  feature: Feature;
  selected: boolean;
  onToggle: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onToggle(feature.id)}
      className={cx(
        "rounded-full border font-mono uppercase tracking-[0.12em] transition",
        compact ? "px-2.5 py-1.5 text-[7px]" : "px-4 py-2 text-[9px]",
        selected
          ? "border-proiettore bg-proiettore text-notte"
          : "border-riga text-fumo hover:border-proiettore/50 hover:text-schermo",
      )}
    >
      {selected ? "Scelta ✓" : "La voglio"}
    </button>
  );
}

function FeatureCard({
  feature,
  selected,
  onToggle,
}: {
  feature: Feature;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <article
      className={cx(
        "group grid gap-5 rounded-[24px] border bg-sipario/70 p-4 transition sm:p-5",
        selected
          ? "border-proiettore/60 shadow-[0_0_35px_rgba(212,162,78,0.08)]"
          : "border-riga hover:border-[#4b453a]",
      )}
    >
      <MiniMockup feature={feature} />
      <div className="flex min-h-64 flex-col">
        <div className="flex items-center justify-between gap-3">
          <span
            className={cx(
              "rounded-full border px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.14em]",
              recommendationStyle[feature.recommendation],
            )}
          >
            {feature.recommendation}
          </span>
          <span className="font-mono text-[8px] text-fumo">Sforzo {feature.effort}</span>
        </div>
        <h3 className="mt-5 font-display text-xl text-schermo">{feature.title}</h3>
        <p className="mt-1 text-sm text-proiettore">{feature.tagline}</p>
        <p className="mt-4 text-sm leading-6 text-fumo">{feature.description}</p>
        <p className="mt-4 border-l border-proiettore/30 pl-3 text-xs leading-5 text-schermo/75">
          {feature.outcome}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-6">
          <div>
            <span className="mb-1.5 block font-mono text-[7px] uppercase tracking-[0.18em] text-fumo">
              Impatto
            </span>
            <Impact value={feature.impact} />
          </div>
          <SelectButton feature={feature} selected={selected} onToggle={onToggle} />
        </div>
      </div>
    </article>
  );
}

function CompetitorSection({ compact = false }: { compact?: boolean }) {
  return (
    <section id="competitor" className={cx("scroll-mt-24", compact ? "mt-12" : "mt-28")}>
      <div className="mb-7 max-w-3xl">
        <p className="eyebrow">Scenario competitivo</p>
        <h2 className="mt-3 font-display text-3xl text-schermo sm:text-4xl">Il vuoto non è “un altro Letterboxd”</h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-fumo">
          Gli altri prodotti coprono catalogo, voto o sincronizzazione. Lo spazio più difendibile è unire
          coordinazione reale, cerchia privata, memoria del gruppo e watch-along.
        </p>
      </div>
      <div className="overflow-hidden rounded-[24px] border border-riga bg-sipario/60">
        <div className="hidden grid-cols-[150px_1fr_1fr_1fr] border-b border-riga bg-notte/50 px-5 py-3 font-mono text-[8px] uppercase tracking-[0.18em] text-fumo md:grid">
          <span>Prodotto</span>
          <span>Punto forte</span>
          <span>Spazio lasciato</span>
          <span>Lezione</span>
        </div>
        {competitors.map((competitor) => (
          <div
            key={competitor.name}
            className="grid gap-3 border-b border-riga px-5 py-5 last:border-b-0 md:grid-cols-[150px_1fr_1fr_1fr]"
          >
            <a
              href={competitor.url}
              target="_blank"
              rel="noreferrer"
              className="font-display text-sm text-proiettore underline decoration-proiettore/25 underline-offset-4"
            >
              {competitor.name} ↗
            </a>
            <p className="text-xs leading-5 text-schermo/75">{competitor.strength}</p>
            <p className="text-xs leading-5 text-fumo">{competitor.gap}</p>
            <p className="text-xs leading-5 text-[#b7d5a4]">{competitor.lesson}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-proiettore/30 bg-proiettore/7 p-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-proiettore">Posizionamento suggerito</p>
        <p className="mt-3 font-display text-xl leading-8 text-schermo">
          “Il cinema club privato che porta gli amici dalla scelta del film al ricordo della serata — sul divano
          o a distanza.”
        </p>
      </div>
    </section>
  );
}

function WatchPartyAnalysis({ compact = false }: { compact?: boolean }) {
  const steps = [
    {
      level: "01 · Subito",
      title: "Stanza companion",
      copy: "Lobby, countdown, chat e timecode. Ogni persona guarda dal proprio servizio.",
      status: "Fattibile",
      color: "text-[#b7d5a4]",
    },
    {
      level: "02 · Poi",
      title: "Controllo sincronizzato",
      copy: "Play/pausa condivisi dove l’integrazione tecnica e i termini del provider lo consentono.",
      status: "Da integrare",
      color: "text-[#a8d5d1]",
    },
    {
      level: "03 · Creator",
      title: "Watch-along pubblico",
      copy: "Video e commento dell’host, film riprodotto localmente dagli spettatori.",
      status: "Da validare",
      color: "text-proiettore",
    },
    {
      level: "04 · Licensed",
      title: "Film dentro la sala",
      copy: "Solo dopo accordi con titolari dei diritti, licenze, territori e rendicontazione.",
      status: "Business separato",
      color: "text-[#dc9aa4]",
    },
  ];

  return (
    <section id="watch-party" className={cx("scroll-mt-24", compact ? "mt-12" : "mt-28")}>
      <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="eyebrow">Watch party · fattibilità</p>
          <h2 className="mt-3 font-display text-3xl text-schermo sm:text-4xl">Costruire la sala, non piratare il film</h2>
          <p className="mt-4 text-sm leading-6 text-fumo">
            Il percorso più solido sincronizza le persone e lascia il contenuto sul servizio legittimo di ciascuno.
            Teleparty usa già questo modello. Apple offre API per esperienze coordinate. Twitch vieta film senza
            diritti; in Italia una proiezione pubblica o uno streaming richiedono autorizzazioni specifiche.
          </p>
          <div className="mt-6 rounded-2xl border border-velluto/40 bg-velluto/10 p-4 text-xs leading-5 text-[#dc9aa4]">
            Non è consulenza legale. Prima di eventi pubblici o a pagamento: verifica titolo, territorio, licenza
            cinematografica e compensi SIAE con professionisti e titolari dei diritti.
          </div>
        </div>
        <div className="relative space-y-3 before:absolute before:bottom-6 before:left-[19px] before:top-6 before:w-px before:bg-riga">
          {steps.map((step, index) => (
            <div key={step.title} className="relative grid grid-cols-[40px_1fr] gap-3">
              <span className="z-10 grid h-10 w-10 place-items-center rounded-full border border-riga bg-notte font-display text-xs text-proiettore">
                {index + 1}
              </span>
              <div className="rounded-2xl border border-riga bg-sipario/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-fumo">{step.level}</span>
                  <span className={cx("font-mono text-[8px] uppercase tracking-[0.12em]", step.color)}>
                    {step.status}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-lg">{step.title}</h3>
                <p className="mt-2 text-xs leading-5 text-fumo">{step.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RevenueSection({ compact = false }: { compact?: boolean }) {
  return (
    <section id="monetizzazione" className={cx("scroll-mt-24", compact ? "mt-12" : "mt-28")}>
      <div className="mb-7 grid gap-6 lg:grid-cols-[1fr_.7fr]">
        <div>
          <p className="eyebrow">Monetizzazione</p>
          <h2 className="mt-3 font-display text-3xl text-schermo sm:text-4xl">Far pagare il valore, non l’amicizia</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-fumo">
            Core gratuito per invitare, votare e registrare la serata. Pagano soprattutto gli host frequenti e le
            organizzazioni; niente pubblicità invasiva nelle stanze private.
          </p>
        </div>
        <div className="rounded-2xl border border-[#98b982]/30 bg-[#98b982]/8 p-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#b7d5a4]">Segnale di mercato</p>
          <p className="mt-3 text-xs leading-5 text-schermo/80">
            Friday Movie Club vende piani per host. Letterboxd monetizza statistiche, filtri streaming e
            personalizzazione. Entrambi lasciano gratuito il comportamento di base.
          </p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {revenuePaths.map((path, index) => (
          <article
            key={path.id}
            className={cx(
              "flex min-h-64 flex-col rounded-[22px] border p-4",
              index === 0
                ? "border-proiettore/50 bg-proiettore/8"
                : "border-riga bg-sipario/65",
            )}
          >
            <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-fumo">{path.target}</span>
            <h3 className="mt-4 font-display text-lg text-schermo">{path.title}</h3>
            <p className="mt-2 text-xs text-proiettore">{path.price}</p>
            <p className="mt-4 text-xs leading-5 text-fumo">{path.includes}</p>
            <span className="mt-auto border-t border-riga pt-4 font-mono text-[8px] uppercase tracking-[0.14em] text-[#b7d5a4]">
              {path.verdict}
            </span>
          </article>
        ))}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ["1", "Host Plus", "Test prezzo con chi ha già creato ≥3 serate."],
          ["2", "Supporter", "Vendere memoria, statistiche e identità; non funzioni sociali essenziali."],
          ["3", "Cineclub Pro", "Interviste prima del codice: associazioni, scuole, locali, creator."],
        ].map(([number, title, copy]) => (
          <div key={number} className="rounded-2xl border border-riga bg-notte/50 p-4">
            <span className="font-display text-xl text-proiettore">{number}</span>
            <strong className="ml-3 text-sm text-schermo">{title}</strong>
            <p className="mt-3 text-xs leading-5 text-fumo">{copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SocialLadder({ compact = false }: { compact?: boolean }) {
  const stages = [
    ["Privato", "Amici, circoli, RSVP, recensioni e notifiche.", "Ora"],
    ["Relazionale", "Feed privato, thread, affinità e recap condivisibili.", "Prossimo"],
    ["Scopribile", "Club pubblici opt-in e follow degli organizzatori.", "Dopo"],
    ["Aperto", "DM, ricerca persone e community pubbliche.", "Solo con moderazione"],
  ];
  return (
    <section className={cx(compact ? "mt-12" : "mt-28")}>
      <div className="mb-7 max-w-3xl">
        <p className="eyebrow">Strategia social</p>
        <h2 className="mt-3 font-display text-3xl text-schermo sm:text-4xl">Crescere a cerchi, non a piazza aperta</h2>
        <p className="mt-4 text-sm leading-6 text-fumo">
          La parte sociale più forte nasce dalla serata. Prima approfondire le relazioni esistenti; solo dopo
          introdurre scoperta pubblica e strumenti che richiedono moderazione continua.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map(([title, copy, timing], index) => (
          <article
            key={title}
            className={cx(
              "relative overflow-hidden rounded-[22px] border p-5",
              index === 0 ? "border-[#ce7f8c]/45 bg-[#ce7f8c]/8" : "border-riga bg-sipario/60",
            )}
          >
            <span className="font-display text-4xl text-riga">0{index + 1}</span>
            <h3 className="mt-5 font-display text-xl">{title}</h3>
            <p className="mt-3 min-h-16 text-xs leading-5 text-fumo">{copy}</p>
            <span className="mt-5 inline-block rounded-full border border-riga px-2.5 py-1 font-mono text-[8px] uppercase text-[#e1aab3]">
              {timing}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

function RecommendedRoadmap({ compact = false }: { compact?: boolean }) {
  const phases = [
    {
      timing: "0–6 settimane",
      title: "Rendere irresistibile il club privato",
      items: ["RSVP intelligente", "Circoli di amici", "Calendario e promemoria", "Cartoline dalla serata"],
    },
    {
      timing: "6–12 settimane",
      title: "Scelta e ritorno",
      items: ["Voto a consenso", "Dove si vede", "Feed privato", "Thread sulle recensioni"],
    },
    {
      timing: "3–6 mesi",
      title: "Sala online e valore premium",
      items: ["Lobby sincronizzata", "YouTube room", "Club ricorrenti", "Host Plus"],
    },
    {
      timing: "Dopo validazione",
      title: "Creator e scala",
      items: ["Watch-along streamer", "Club pubblici", "Cineclub Pro", "Eventi licensed"],
    },
  ];
  return (
    <section id="roadmap" className={cx("scroll-mt-24", compact ? "mt-12" : "mt-28")}>
      <p className="eyebrow">Sequenza consigliata</p>
      <h2 className="mt-3 font-display text-3xl text-schermo sm:text-4xl">Una roadmap che conserva il focus</h2>
      <div className="mt-7 grid gap-3 lg:grid-cols-4">
        {phases.map((phase, index) => (
          <article key={phase.timing} className="rounded-[22px] border border-riga bg-sipario/65 p-5">
            <div className="flex items-center justify-between">
              <span className="font-display text-2xl text-proiettore">0{index + 1}</span>
              <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-fumo">{phase.timing}</span>
            </div>
            <h3 className="mt-6 min-h-12 font-display text-lg">{phase.title}</h3>
            <ul className="mt-5 space-y-2">
              {phase.items.map((item) => (
                <li key={item} className="flex gap-2 text-xs text-fumo">
                  <span className="text-proiettore">·</span> {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function SourcesSection() {
  return (
    <section className="mt-20 border-t border-riga pt-8">
      <p className="eyebrow">Fonti primarie consultate · luglio 2026</p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        {sources.map((source) => (
          <a
            key={source.url}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[9px] text-fumo underline decoration-riga underline-offset-4 hover:text-proiettore"
          >
            {source.label} ↗
          </a>
        ))}
      </div>
      <p className="mt-5 max-w-3xl text-[10px] leading-5 text-fumo">
        Prezzi, disponibilità e condizioni possono cambiare. Le ipotesi economiche qui sopra sono proposte da
        validare, non previsioni di ricavo.
      </p>
    </section>
  );
}

function DecisionSummary({
  selectedIds,
  onRemove,
  large = false,
}: {
  selectedIds: string[];
  onRemove: (id: string) => void;
  large?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const selectedFeatures = features.filter((feature) => selectedIds.includes(feature.id));
  const message =
    selectedFeatures.length > 0
      ? `Vorrei applicare queste migliorie a Serate Film:\n${selectedFeatures
          .map((feature) => `- ${feature.title}`)
          .join("\n")}`
      : "";

  async function copyDecision() {
    if (!message) return;
    await navigator.clipboard.writeText(message);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section
      id="decisione"
      className={cx(
        "rounded-[28px] border p-5 sm:p-7",
        large ? "mt-28 border-proiettore/45 bg-proiettore/8" : "border-riga bg-notte/80",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">La tua selezione</p>
          <h2 className={cx("mt-2 font-display text-schermo", large ? "text-3xl" : "text-xl")}>
            {selectedFeatures.length
              ? `${selectedFeatures.length} ${selectedFeatures.length === 1 ? "idea scelta" : "idee scelte"}`
              : "Scegli le idee che vuoi applicare"}
          </h2>
        </div>
        <button
          type="button"
          onClick={copyDecision}
          disabled={!message}
          className="rounded-full bg-proiettore px-4 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-notte disabled:cursor-not-allowed disabled:opacity-35"
        >
          {copied ? "Copiato ✓" : "Copia la richiesta"}
        </button>
      </div>
      {selectedFeatures.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {selectedFeatures.map((feature) => (
            <button
              type="button"
              key={feature.id}
              onClick={() => onRemove(feature.id)}
              className="rounded-full border border-proiettore/30 bg-notte/50 px-3 py-2 text-[10px] text-schermo hover:border-velluto/60"
              title="Rimuovi"
            >
              {feature.title} <span className="ml-1 text-fumo">×</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-xs leading-5 text-fumo">
          Premi “La voglio” sui mockup. Alla fine copia una richiesta già pronta da incollare in chat.
        </p>
      )}
    </section>
  );
}

function Hero({ label }: { label: string }) {
  return (
    <header className="relative overflow-hidden rounded-[30px] border border-riga bg-[#0a0908] px-5 py-14 sm:px-10 sm:py-20">
      <div
        className="absolute inset-0 opacity-65"
        style={{
          background:
            "radial-gradient(circle at 78% 22%, rgba(212,162,78,.18), transparent 25%), radial-gradient(circle at 14% 82%, rgba(134,182,178,.11), transparent 28%)",
        }}
      />
      <div className="relative max-w-4xl">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-velluto/40 bg-velluto/10 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-[#dc9aa4]">
            Prototipo · non in produzione
          </span>
          <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-fumo">{label}</span>
        </div>
        <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.32em] text-proiettore">
          Serate Film · Cabina futuro
        </p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.12] text-schermo sm:text-6xl">
          Venti modi per far diventare una serata <span className="text-proiettore">un rito.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-fumo sm:text-base">
          Mockup, concorrenti, watch party, social e ricavi. Seleziona quello che vuoi costruire: alla fine avrai
          una richiesta pronta da affidarmi.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a
            href="#opportunita"
            className="rounded-full bg-proiettore px-5 py-3 font-mono text-[9px] uppercase tracking-[0.14em] text-notte"
          >
            Esplora i mockup
          </a>
          <a
            href="#decisione"
            className="rounded-full border border-riga px-5 py-3 font-mono text-[9px] uppercase tracking-[0.14em] text-fumo"
          >
            Vai alla selezione
          </a>
        </div>
      </div>
    </header>
  );
}

function VariantA({
  selectedIds,
  onToggle,
}: {
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <Hero label="Variante A · Dossier editoriale" />
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          ["La tesi", "Non competere sul catalogo: possedere il momento collettivo."],
          ["Il motore", "Amici → scelta → serata → memoria → prossima serata."],
          ["La regola", "Privato di default. Pubblico solo per host e creator che lo scelgono."],
        ].map(([title, copy]) => (
          <div key={title} className="rounded-2xl border border-riga bg-sipario/55 p-5">
            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-proiettore">{title}</span>
            <p className="mt-3 text-xs leading-5 text-schermo/75">{copy}</p>
          </div>
        ))}
      </div>

      <section id="opportunita" className="mt-28 scroll-mt-24">
        {categories.map((category) => {
          const categoryFeatures = features.filter((feature) => feature.category === category.id);
          return (
            <div key={category.id} className="mb-28 last:mb-0">
              <div className="mb-8 grid items-end gap-4 border-b border-riga pb-6 sm:grid-cols-[100px_1fr]">
                <span className="font-display text-5xl text-riga">{category.number}</span>
                <div>
                  <h2 className="font-display text-3xl text-schermo sm:text-4xl">{category.title}</h2>
                  <p className="mt-2 text-sm text-fumo">{category.subtitle}</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {categoryFeatures.map((feature) => (
                  <FeatureCard
                    key={feature.id}
                    feature={feature}
                    selected={selectedIds.includes(feature.id)}
                    onToggle={onToggle}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </section>
      <WatchPartyAnalysis />
      <SocialLadder />
      <CompetitorSection />
      <RevenueSection />
      <RecommendedRoadmap />
      <DecisionSummary selectedIds={selectedIds} onRemove={onToggle} large />
      <SourcesSection />
    </div>
  );
}

function VariantB({
  selectedIds,
  onToggle,
}: {
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [activeId, setActiveId] = useState(features[0].id);
  const visibleFeatures = category === "all" ? features : features.filter((feature) => feature.category === category);
  const activeFeature = features.find((feature) => feature.id === activeId) ?? visibleFeatures[0] ?? features[0];

  useEffect(() => {
    if (!visibleFeatures.some((feature) => feature.id === activeId)) {
      setActiveId(visibleFeatures[0].id);
    }
  }, [activeId, visibleFeatures]);

  return (
    <div>
      <header className="rounded-[28px] border border-[#86b6b2]/25 bg-[#0a0f0e] p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="rounded-full border border-velluto/40 bg-velluto/10 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-[#dc9aa4]">
              Prototipo · non in produzione
            </span>
            <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.24em] text-[#a8d5d1]">
              Variante B · Opportunity cockpit
            </p>
            <h1 className="mt-3 font-display text-3xl text-schermo sm:text-5xl">Cabina di decisione</h1>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              [String(features.length), "idee"],
              [String(features.filter((feature) => feature.recommendation === "Costruire").length), "pronte"],
              [String(selectedIds.length), "scelte"],
            ].map(([value, label]) => (
              <div key={label} className="min-w-16 rounded-xl border border-[#86b6b2]/20 bg-[#12201f] p-3">
                <strong className="block font-display text-xl text-[#a8d5d1]">{value}</strong>
                <span className="font-mono text-[7px] uppercase text-fumo">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div id="opportunita" className="mt-6 scroll-mt-24">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={cx(
              "shrink-0 rounded-full border px-3 py-2 font-mono text-[8px] uppercase",
              category === "all" ? "border-[#86b6b2] bg-[#86b6b2] text-notte" : "border-riga text-fumo",
            )}
          >
            Tutte · {features.length}
          </button>
          {categories.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setCategory(item.id)}
              className={cx(
                "shrink-0 rounded-full border px-3 py-2 font-mono text-[8px] uppercase",
                category === item.id
                  ? "border-[#86b6b2] bg-[#86b6b2] text-notte"
                  : "border-riga text-fumo",
              )}
            >
              {item.title} · {features.filter((feature) => feature.category === item.id).length}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[.75fr_1.25fr]">
          <div className="max-h-[720px] space-y-2 overflow-y-auto rounded-[24px] border border-riga bg-sipario/45 p-3">
            {visibleFeatures.map((feature) => (
              <button
                type="button"
                key={feature.id}
                onClick={() => setActiveId(feature.id)}
                className={cx(
                  "grid w-full grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border p-3 text-left transition",
                  activeFeature.id === feature.id
                    ? "border-[#86b6b2]/50 bg-[#86b6b2]/8"
                    : "border-transparent bg-notte/45 hover:border-riga",
                )}
              >
                <span>
                  <strong className="block text-xs text-schermo">{feature.title}</strong>
                  <span className="mt-1 block font-mono text-[7px] uppercase text-fumo">
                    {feature.recommendation} · {feature.effort}
                  </span>
                </span>
                <span className={selectedIds.includes(feature.id) ? "text-proiettore" : "text-riga"}>
                  {selectedIds.includes(feature.id) ? "●" : "○"}
                </span>
              </button>
            ))}
          </div>

          <article className="sticky top-24 self-start rounded-[24px] border border-[#86b6b2]/25 bg-[#101714] p-4 sm:p-6">
            <MiniMockup feature={activeFeature} />
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <span className={cx("rounded-full border px-3 py-1 font-mono text-[8px]", recommendationStyle[activeFeature.recommendation])}>
                {activeFeature.recommendation}
              </span>
              <span className="font-mono text-[8px] text-fumo">
                Sforzo {activeFeature.effort} · Impatto {activeFeature.impact}/5
              </span>
            </div>
            <h2 className="mt-5 font-display text-3xl">{activeFeature.title}</h2>
            <p className="mt-2 text-sm text-[#a8d5d1]">{activeFeature.tagline}</p>
            <p className="mt-5 text-sm leading-6 text-fumo">{activeFeature.description}</p>
            <p className="mt-4 rounded-xl border border-[#86b6b2]/20 bg-[#86b6b2]/5 p-3 text-xs leading-5 text-schermo/80">
              Risultato: {activeFeature.outcome}
            </p>
            <div className="mt-5 flex items-center justify-between">
              <Impact value={activeFeature.impact} />
              <SelectButton
                feature={activeFeature}
                selected={selectedIds.includes(activeFeature.id)}
                onToggle={onToggle}
              />
            </div>
          </article>
        </div>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[.7fr_1.3fr]">
        <DecisionSummary selectedIds={selectedIds} onRemove={onToggle} />
        <div className="rounded-[28px] border border-riga bg-sipario/55 p-6">
          <p className="eyebrow">Tesi di prodotto</p>
          <p className="mt-4 font-display text-2xl leading-9">
            Serate Film non deve vincere sul catalogo. Deve vincere sul <span className="text-proiettore">momento condiviso</span>.
          </p>
        </div>
      </div>
      <WatchPartyAnalysis compact />
      <SocialLadder compact />
      <CompetitorSection compact />
      <RevenueSection compact />
      <RecommendedRoadmap compact />
      <SourcesSection />
    </div>
  );
}

function VariantC({
  selectedIds,
  onToggle,
}: {
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const current = features[index];
  const category = categories.find((item) => item.id === current.category) ?? categories[0];
  const progress = Math.round(((index + 1) / features.length) * 100);

  function move(direction: -1 | 1) {
    setIndex((value) => Math.min(features.length - 1, Math.max(0, value + direction)));
  }

  return (
    <div>
      <header className="rounded-[28px] border border-[#a9a0d8]/25 bg-[#0f0e16] p-5 sm:p-8">
        <span className="rounded-full border border-velluto/40 bg-velluto/10 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-[#dc9aa4]">
          Prototipo · non in produzione
        </span>
        <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.24em] text-[#cbc5ef]">
          Variante C · Giuria guidata
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-3xl leading-tight text-schermo sm:text-5xl">
          Vedi un’idea alla volta. Tieni soltanto quelle che meritano il film.
        </h1>
        <div className="mt-8 h-1 overflow-hidden rounded-full bg-riga">
          <span className="block h-full rounded-full bg-[#a9a0d8] transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-right font-mono text-[8px] text-fumo">
          {index + 1} / {features.length} · {progress}%
        </p>
      </header>

      <section id="opportunita" className="mt-6 scroll-mt-24">
        <div className="grid overflow-hidden rounded-[30px] border border-[#a9a0d8]/25 bg-[#11101a] lg:grid-cols-[1.05fr_.95fr]">
          <div className="border-b border-riga p-5 sm:p-8 lg:border-b-0 lg:border-r">
            <div className="mx-auto max-w-md">
              <MiniMockup feature={current} />
            </div>
          </div>
          <div className="flex min-h-[520px] flex-col p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-[8px] uppercase tracking-[0.16em]" style={{ color: category.accent }}>
                Atto {category.number} · {category.title}
              </span>
              <span className={cx("rounded-full border px-3 py-1 font-mono text-[8px]", recommendationStyle[current.recommendation])}>
                {current.recommendation}
              </span>
            </div>
            <h2 className="mt-8 font-display text-3xl text-schermo sm:text-4xl">{current.title}</h2>
            <p className="mt-3 text-base text-[#cbc5ef]">{current.tagline}</p>
            <p className="mt-7 text-sm leading-7 text-fumo">{current.description}</p>
            <blockquote className="mt-5 border-l-2 border-[#a9a0d8]/45 pl-4 text-sm leading-6 text-schermo/80">
              {current.outcome}
            </blockquote>
            <div className="mt-6 flex items-center gap-6">
              <div>
                <span className="mb-2 block font-mono text-[7px] uppercase text-fumo">Impatto</span>
                <Impact value={current.impact} />
              </div>
              <span className="font-mono text-[8px] text-fumo">Sforzo {current.effort}</span>
              {current.monetizable && (
                <span className="font-mono text-[8px] text-[#b7d5a4]">Potenziale premium</span>
              )}
            </div>
            <div className="mt-auto grid grid-cols-[auto_1fr_auto] items-center gap-3 pt-8">
              <button
                type="button"
                onClick={() => move(-1)}
                disabled={index === 0}
                className="rounded-full border border-riga px-4 py-3 font-mono text-[9px] text-fumo disabled:opacity-25"
              >
                ←
              </button>
              <SelectButton
                feature={current}
                selected={selectedIds.includes(current.id)}
                onToggle={onToggle}
              />
              <button
                type="button"
                onClick={() => move(1)}
                disabled={index === features.length - 1}
                className="rounded-full border border-riga px-4 py-3 font-mono text-[9px] text-fumo disabled:opacity-25"
              >
                →
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-1 overflow-x-auto pb-2">
          {features.map((feature, featureIndex) => (
            <button
              type="button"
              key={feature.id}
              onClick={() => setIndex(featureIndex)}
              aria-label={`Apri ${feature.title}`}
              title={feature.title}
              className={cx(
                "h-2.5 min-w-6 flex-1 rounded-full transition",
                featureIndex === index
                  ? "bg-[#a9a0d8]"
                  : selectedIds.includes(feature.id)
                    ? "bg-proiettore"
                    : "bg-riga hover:bg-fumo",
              )}
            />
          ))}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-5">
          {categories.map((item) => {
            const firstIndex = features.findIndex((feature) => feature.category === item.id);
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setIndex(firstIndex)}
                className={cx(
                  "rounded-xl border p-3 text-left",
                  item.id === current.category ? "border-[#a9a0d8]/50 bg-[#a9a0d8]/8" : "border-riga bg-sipario/50",
                )}
              >
                <span className="font-display text-lg" style={{ color: item.accent }}>{item.number}</span>
                <span className="mt-1 block text-[9px] text-fumo">{item.title}</span>
              </button>
            );
          })}
        </div>
      </section>

      <DecisionSummary selectedIds={selectedIds} onRemove={onToggle} large />

      <section className="mt-28 rounded-[30px] border border-[#a9a0d8]/25 bg-[#11101a] p-5 sm:p-8">
        <p className="eyebrow">Verdetto prima della produzione</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {[
            ["Differenziante", "Coordina l’esperienza completa: prima, durante e dopo la visione."],
            ["Difendibile", "Il grafo privato degli amici e la memoria condivisa migliorano nel tempo."],
            ["Monetizzabile", "L’host e il cineclub pagano per continuità, controllo e strumenti; gli amici entrano gratis."],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-2xl border border-riga bg-notte/55 p-5">
              <h3 className="font-display text-xl text-[#cbc5ef]">{title}</h3>
              <p className="mt-3 text-xs leading-5 text-fumo">{copy}</p>
            </div>
          ))}
        </div>
      </section>
      <WatchPartyAnalysis />
      <SocialLadder />
      <CompetitorSection />
      <RevenueSection />
      <RecommendedRoadmap />
      <SourcesSection />
    </div>
  );
}

function VariantSwitcher({
  variant,
  setVariant,
}: {
  variant: Variant;
  setVariant: (variant: Variant) => void;
}) {
  const variants: Array<[Variant, string]> = [
    ["A", "Dossier"],
    ["B", "Cockpit"],
    ["C", "Giuria"],
  ];
  return (
    <div className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 sm:bottom-5">
      <div className="flex items-center gap-1 rounded-full border border-[#4b453a] bg-notte-fonda/95 p-1.5 shadow-2xl shadow-black backdrop-blur">
        <span className="hidden pl-2 pr-1 font-mono text-[7px] uppercase tracking-[0.15em] text-fumo sm:block">
          Prototipo
        </span>
        {variants.map(([id, label]) => (
          <button
            type="button"
            key={id}
            onClick={() => setVariant(id)}
            className={cx(
              "rounded-full px-3 py-2 font-mono text-[8px] uppercase tracking-[0.12em] transition",
              variant === id ? "bg-schermo text-notte" : "text-fumo hover:text-schermo",
            )}
          >
            {id} · {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function RoadmapPrototype({ initialVariant }: { initialVariant: Variant }) {
  const [variant, setVariantState] = useState<Variant>(initialVariant);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const variantOrder = useMemo<Variant[]>(() => ["A", "B", "C"], []);

  function setVariant(next: Variant) {
    setVariantState(next);
    const url = new URL(window.location.href);
    url.searchParams.set("variant", next);
    window.history.replaceState({}, "", url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleFeature(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const currentIndex = variantOrder.indexOf(variant);
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (currentIndex + delta + variantOrder.length) % variantOrder.length;
      setVariant(variantOrder[nextIndex]);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [variant, variantOrder]);

  return (
    <div className="apertura pb-16">
      {variant === "A" && <VariantA selectedIds={selectedIds} onToggle={toggleFeature} />}
      {variant === "B" && <VariantB selectedIds={selectedIds} onToggle={toggleFeature} />}
      {variant === "C" && <VariantC selectedIds={selectedIds} onToggle={toggleFeature} />}
      <VariantSwitcher variant={variant} setVariant={setVariant} />
    </div>
  );
}
