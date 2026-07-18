export function Stars({ value, small = false }: { value: number; small?: boolean }) {
  const full = Math.round(value);
  return (
    <span
      className={`font-mono ${small ? "text-xs" : "text-sm"} text-proiettore`}
      aria-label={`${value.toFixed(1)} stelle su 5`}
    >
      {"★".repeat(full)}
      <span className="text-riga">{"★".repeat(5 - full)}</span>
    </span>
  );
}
