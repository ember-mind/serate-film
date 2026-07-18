import { genreSlug } from "@/lib/genreArt";

// Locandina: artwork di genere (arte nostra, niente poster ufficiali) + titolo.
export function Poster({
  title,
  year,
  genres,
  showTitle = true,
  className = "",
}: {
  title: string;
  year?: number | null;
  genres?: string | null;
  showTitle?: boolean;
  className?: string;
}) {
  const slug = genreSlug(genres);
  return (
    <div
      aria-hidden
      className={`relative flex flex-col items-center justify-end overflow-hidden bg-sipario-chiaro ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/generi/${slug}.svg`}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(13,15,30,0.92) 0%, rgba(13,15,30,0.35) 45%, rgba(13,15,30,0.15) 100%)",
        }}
      />
      {showTitle && (
        <>
          <span className="relative px-2 pb-1 text-center font-display text-sm font-bold leading-tight drop-shadow">
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
