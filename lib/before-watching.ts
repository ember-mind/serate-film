export type BeforeWatchingNote = {
  label: "Impegno" | "Tono" | "Contesto";
  text: string;
};

type MovieForBeforeWatching = {
  genres: string | null;
  runtime: number | null;
  year: number | null;
};

function runtimeNote(runtime: number | null): BeforeWatchingNote | null {
  if (!runtime) return null;

  if (runtime >= 180) {
    return {
      label: "Impegno",
      text: `Visione molto lunga (${runtime} minuti): meglio riservarle una serata senza fretta.`,
    };
  }

  if (runtime >= 140) {
    return {
      label: "Impegno",
      text: `Visione lunga (${runtime} minuti): richiede un po’ di attenzione e tempo.`,
    };
  }

  if (runtime < 90) {
    return {
      label: "Impegno",
      text: `Visione compatta (${runtime} minuti), adatta anche a una serata più corta.`,
    };
  }

  return {
    label: "Impegno",
    text: `Durata di ${runtime} minuti: un impegno nella media per un film.`,
  };
}

function toneNote(genres: string | null): BeforeWatchingNote | null {
  if (!genres) return null;
  const value = genres.toLocaleLowerCase("it");
  const has = (...terms: string[]) => terms.some((term) => value.includes(term));

  if (has("commedia nera")) {
    return {
      label: "Tono",
      text: "Umorismo nero, ambiguità morale e situazioni volutamente scomode.",
    };
  }

  if (has("horror")) {
    return {
      label: "Tono",
      text: "Tensione, paura e immagini che possono risultare disturbanti.",
    };
  }

  if (has("guerra")) {
    return {
      label: "Tono",
      text: "Conflitto, violenza bellica e temi potenzialmente traumatici.",
    };
  }

  if (has("thriller", "mistero", "giallo", "noir")) {
    return {
      label: "Tono",
      text: "Atmosfera tesa: attenzione e piccoli dettagli fanno parte dell’esperienza.",
    };
  }

  if (has("crime", "gangster", "poliziesco")) {
    return {
      label: "Tono",
      text: "Crimine, ambiguità morale e possibili scene di violenza.",
    };
  }

  if (has("azione", "supereroi")) {
    return {
      label: "Tono",
      text: "Ritmo sostenuto, combattimenti e sequenze d’azione in primo piano.",
    };
  }

  if (has("drammatico") && has("commedia")) {
    return {
      label: "Tono",
      text: "Alterna leggerezza e passaggi emotivamente più intensi.",
    };
  }

  if (has("drammatico", "storico", "biografico")) {
    return {
      label: "Tono",
      text: "Tono prevalentemente serio e temi emotivamente intensi.",
    };
  }

  if (has("animazione")) {
    return {
      label: "Tono",
      text: "È un film d’animazione, ma stile e temi non implicano automaticamente un pubblico infantile.",
    };
  }

  if (has("fantascienza")) {
    return {
      label: "Tono",
      text: "Fantascienza di idee e meraviglia: conta il mondo immaginato quanto l’azione.",
    };
  }

  if (has("fantasy", "avventura")) {
    return {
      label: "Tono",
      text: "Avventura e immaginazione guidano il racconto più del realismo.",
    };
  }

  if (has("musical")) {
    return {
      label: "Tono",
      text: "Le sequenze musicali sono parte della narrazione, non semplici intermezzi.",
    };
  }

  if (has("romantico", "sentimentale")) {
    return {
      label: "Tono",
      text: "Relazioni e sviluppo emotivo sono il centro del racconto.",
    };
  }

  if (has("commedia")) {
    return {
      label: "Tono",
      text: "Una visione orientata alla leggerezza e all’umorismo.",
    };
  }

  if (has("documentario")) {
    return {
      label: "Tono",
      text: "Parte dalla realtà: osservazione e contesto contano più della trama tradizionale.",
    };
  }

  return null;
}

function contextNote(year: number | null): BeforeWatchingNote | null {
  if (!year || year >= 2000) return null;

  if (year <= 1930) {
    return {
      label: "Contesto",
      text: "Cinema delle origini: linguaggio visivo e ritmo sono molto lontani da quelli contemporanei.",
    };
  }

  if (year <= 1959) {
    return {
      label: "Contesto",
      text: "Un classico d’epoca: convenzioni narrative e sensibilità riflettono il periodo in cui fu realizzato.",
    };
  }

  if (year <= 1979) {
    return {
      label: "Contesto",
      text: "Ritmo, linguaggio e rappresentazioni vanno letti nel contesto culturale del suo tempo.",
    };
  }

  return {
    label: "Contesto",
    text: "Un classico moderno: alcune convenzioni e sensibilità possono risultare datate.",
  };
}

export function getBeforeWatchingNotes(movie: MovieForBeforeWatching): BeforeWatchingNote[] {
  return [runtimeNote(movie.runtime), toneNote(movie.genres), contextNote(movie.year)].filter(
    (note): note is BeforeWatchingNote => note !== null
  );
}
