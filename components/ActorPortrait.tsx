export function ActorPortrait({
  name,
  imageUrl,
  className = "",
  eager = false,
}: {
  name: string;
  imageUrl?: string | null;
  className?: string;
  eager?: boolean;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={`Ritratto di ${name}`}
        loading={eager ? "eager" : "lazy"}
        className={`nitrato bg-sipario-chiaro object-cover object-top ${className}`}
      />
    );
  }

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (
    <div
      role="img"
      aria-label={`Ritratto non disponibile per ${name}`}
      className={`flex items-center justify-center bg-[radial-gradient(circle_at_50%_30%,#3a3226,#171512_68%)] ${className}`}
    >
      <span className="titlecard text-3xl text-proiettore/65">{initials}</span>
    </div>
  );
}
