// Cerchietto con iniziale, tinta calda deterministica per persona.
const HUES = ["#e8b84b", "#c9704a", "#c2506a", "#d89b3d", "#a85751", "#b8843f"];

export function Avatar({ name, id, small = false }: { name: string; id: number; small?: boolean }) {
  return (
    <span
      title={name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold text-notte-fonda ${
        small ? "h-6 w-6 text-xs" : "h-9 w-9 text-base"
      }`}
      style={{ backgroundColor: HUES[id % HUES.length] }}
      aria-hidden
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}
