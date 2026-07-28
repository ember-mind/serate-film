"use client";

import { useState } from "react";

type Props = {
  videoId: string;
  title: string | null;
  channel: string | null;
};

export function TrailerPlayer({ videoId, title, channel }: Props) {
  const [playing, setPlaying] = useState(false);
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) return null;

  return (
    <section aria-labelledby="trailer-title" className="mt-6 border-t border-riga pt-5">
      <p className="eyebrow mb-3" id="trailer-title">
        Trailer
      </p>
      {playing ? (
        <div className="overflow-hidden rounded-sm border border-riga bg-black">
          <div className="aspect-video">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&hl=it`}
              title={title || "Trailer del film"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group flex aspect-video w-full max-w-2xl items-center justify-center rounded-sm border border-riga bg-sipario-chiaro/50 transition-colors hover:border-proiettore/70 hover:bg-sipario-chiaro"
          aria-label={`Riproduci ${title || "trailer"}`}
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-proiettore/60 bg-notte/80 transition-transform group-hover:scale-105">
            <span
              aria-hidden="true"
              className="ml-1 block h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-proiettore"
            />
          </span>
        </button>
      )}
      {(title || channel) && (
        <p className="mt-2 font-mono text-[10px] leading-relaxed text-fumo/70">
          {[title, channel].filter(Boolean).join(" · ")}
        </p>
      )}
    </section>
  );
}
