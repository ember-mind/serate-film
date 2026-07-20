"use client";

import { useState } from "react";
import Link from "next/link";
import { ActorPortrait } from "@/components/ActorPortrait";

export type ActorCard = {
  name: string;
  slug: string;
  imageUrl: string | null;
  birthDate: string | null;
  filmCount: number;
};

export function ActorsGrid({ actors }: { actors: ActorCard[] }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase("it");
  const visible = normalized
    ? actors.filter((actor) => actor.name.toLocaleLowerCase("it").includes(normalized))
    : actors;

  return (
    <>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Cerca un nome"
        aria-label="Cerca un interprete"
        className="mb-4 w-full rounded-sm border border-riga bg-sipario px-4 py-3 text-schermo placeholder:text-fumo/60"
      />
      <p className="eyebrow mb-6" aria-live="polite">
        {visible.length} {visible.length === 1 ? "interprete" : "interpreti"}
      </p>
      {visible.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((actor) => (
            <li key={actor.name} className="ticket overflow-hidden">
              <Link href={`/attori/${actor.slug}`} className="group block h-full">
                <ActorPortrait
                  name={actor.name}
                  imageUrl={actor.imageUrl}
                  className="aspect-4/5 w-full transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="p-3.5">
                  <h2 className="titlecard text-xs leading-snug text-schermo transition-colors group-hover:text-proiettore">
                    {actor.name}
                  </h2>
                  <p className="mt-1 font-mono text-[10px] text-fumo">
                    {actor.filmCount} film
                    {actor.birthDate ? ` · ${actor.birthDate.split(" ").at(-1)}` : ""}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-fumo">Nessun interprete trovato.</p>
      )}
    </>
  );
}
