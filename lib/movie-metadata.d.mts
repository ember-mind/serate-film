export type MovieMetadata = {
  wikidataId: string | null;
  imdbId: string | null;
  rottenTomatoesId: string | null;
  youtubeTrailerId: string | null;
  trailerTitle: string | null;
  trailerChannel: string | null;
  imdbRating: string | null;
  rottenTomatoesScore: string | null;
  awards: string[];
  metadataUpdatedAt: string;
};

export function fetchMovieMetadata(input: {
  title: string;
  year: number | null;
  requireTrailerYear?: boolean;
}): Promise<MovieMetadata>;

export const movieMetadataSources: {
  wikidata: string;
  youtube: string;
};
