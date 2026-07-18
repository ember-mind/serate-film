// Locandina tipografica: niente immagini esterne, solo titolo e anno.
export function Poster({
  title,
  year,
  className = "",
}: {
  title: string;
  year?: number | null;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`relative flex flex-col items-center justify-center overflow-hidden bg-sipario-chiaro ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(232,184,75,0.10), transparent 65%)",
        }}
      />
      <span className="relative px-2 text-center font-display text-sm font-bold leading-tight">
        {title}
      </span>
      {year && <span className="relative mt-1.5 font-mono text-[10px] text-fumo">{year}</span>}
      <span className="absolute inset-x-3 bottom-2 border-t border-riga" />
      <span className="absolute inset-x-3 top-2 border-t border-riga" />
    </div>
  );
}
