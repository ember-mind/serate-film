import { genreSlug } from "@/lib/genreArt";
import { generatedPosterFor } from "@/lib/generatedPosters";

// Locandina: poster reale da Wikimedia Commons quando c'è (posterUrl, solo materiale
// libero — fetch-commons-posters.mjs), altrimenti artwork di genere (arte nostra) + titolo.
export function Poster({
  title,
  year,
  genres,
  posterUrl,
  posterCredit,
  showTitle = true,
  className = "",
}: {
  title: string;
  year?: number | null;
  genres?: string | null;
  posterUrl?: string | null;
  posterCredit?: string | null;
  showTitle?: boolean;
  className?: string;
}) {
  const slug = genreSlug(genres);
  const generatedPoster = generatedPosterFor(title, year);
  const artworkUrl = generatedPoster ?? posterUrl;
  if (artworkUrl) {
    return (
      <div
        className={`relative flex flex-col items-end justify-end overflow-hidden bg-sipario-chiaro ${className}`}
        title={generatedPoster ? undefined : (posterCredit ?? undefined)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={artworkUrl}
          alt={`Immagine di ${title}`}
          className="nitrato absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }
  return (
    <div
      aria-hidden
      className={`relative flex flex-col items-center justify-end overflow-hidden bg-sipario-chiaro ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/generi/${slug}.svg`}
        alt=""
        className="nitrato absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(6,5,5,0.92) 0%, rgba(6,5,5,0.35) 45%, rgba(6,5,5,0.12) 100%)",
        }}
      />
      {showTitle && (
        <>
          <span className="titlecard relative px-2 pb-1 text-center text-[11px] leading-tight text-schermo drop-shadow">
            {title}
          </span>
          {year ? (
            <span className="relative mb-2 font-mono text-[10px] text-schermo/80">{year}</span>
          ) : (
            <span className="relative mb-2" />
          )}
        </>
      )}
    </div>
  );
}
