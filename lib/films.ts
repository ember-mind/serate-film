export function filmSlug(movie: { title: string; year: number | null }): string {
  const base = movie.title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return movie.year ? `${base}-${movie.year}` : base;
}
