"use client";

import { useState } from "react";
import Link from "next/link";
import { ActorPortrait } from "@/components/ActorPortrait";

export type DirectorCard = {
  name: string;
  slug: string;
  imageUrl: string | null;
  birthDate: string | null;
  filmCount: number;
};

export function DirectorsGrid({ directors }: { directors: DirectorCard[] }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase("it");
  const visible = normalized
    ? directors.filter((director) => director.name.toLocaleLowerCase("it").includes(normalized))
    : directors;

  return (
    <>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Cerca un nome"
        aria-label="Cerca un regista"
        className="mb-4 w-full rounded-sm border border-riga bg-sipario px-4 py-3 text-schermo placeholder:text-fumo/60"
      />
      <p className="eyebrow mb-6" aria-live="polite">
        {visible.length} {visible.length === 1 ? "regista" : "registi"}
      </p>
      {visible.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((director) => (
            <li key={director.name} className="ticket overflow-hidden">
              <Link href={`/registi/${director.slug}`} className="group block h-full">
                <ActorPortrait
                  name={director.name}
                  imageUrl={director.imageUrl}
                  className="aspect-4/5 w-full transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="p-3.5">
                  <h2 className="titlecard text-xs leading-snug text-schermo transition-colors group-hover:text-proiettore">
                    {director.name}
                  </h2>
                  <p className="mt-1 font-mono text-[10px] text-fumo">
                    {director.filmCount} film
                    {director.birthDate ? ` · ${director.birthDate.split(" ").at(-1)}` : ""}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-fumo">Nessun regista trovato.</p>
      )}
    </>
  );
}
