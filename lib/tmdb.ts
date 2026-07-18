// Client minimale TMDb v3, lingua italiana.
// Richiede TMDB_API_KEY (v3 api key) in env.

const BASE = "https://api.themoviedb.org/3";

export type TmdbMovie = {
  id: number;
  title: string;
  original_title: string;
  release_date: string | null;
  poster_path: string | null;
  overview: string;
  vote_average: number;
  genre_ids?: number[];
};

export type TmdbMovieDetails = TmdbMovie & {
  runtime: number | null;
  genres: { id: number; name: string }[];
};

export function posterUrl(path: string | null | undefined, size = "w342") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

export function hasApiKey() {
  return Boolean(process.env.TMDB_API_KEY);
}

async function tmdb<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY mancante");
  const url = new URL(BASE + endpoint);
  url.searchParams.set("api_key", key);
  url.searchParams.set("language", "it-IT");
  url.searchParams.set("include_adult", "false");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDb ${res.status} su ${endpoint}`);
  return res.json();
}

export async function searchMovies(query: string): Promise<TmdbMovie[]> {
  const data = await tmdb<{ results: TmdbMovie[] }>("/search/movie", { query });
  return data.results;
}

export async function popularMovies(page = 1): Promise<TmdbMovie[]> {
  const data = await tmdb<{ results: TmdbMovie[] }>("/movie/popular", { page: String(page) });
  return data.results;
}

export async function topRatedMovies(page = 1): Promise<TmdbMovie[]> {
  const data = await tmdb<{ results: TmdbMovie[] }>("/movie/top_rated", { page: String(page) });
  return data.results;
}

export async function movieDetails(id: number): Promise<TmdbMovieDetails> {
  return tmdb<TmdbMovieDetails>(`/movie/${id}`);
}

export function yearOf(m: { release_date: string | null }) {
  return m.release_date ? m.release_date.slice(0, 4) : null;
}
