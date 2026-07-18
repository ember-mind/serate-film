import { posterUrl } from "@/lib/tmdb";

export function Poster({
  path,
  title,
  className = "",
}: {
  path: string | null | undefined;
  title: string;
  className?: string;
}) {
  const url = posterUrl(path);
  if (!url) {
    return (
      <div
        className={`flex items-center justify-center bg-sipario-chiaro text-center text-xs text-fumo ${className}`}
        aria-hidden
      >
        <span className="px-2 font-display font-semibold">{title}</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={`Locandina di ${title}`} className={`object-cover ${className}`} />;
}
