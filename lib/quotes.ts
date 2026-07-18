// Citazione del giorno: brevi battute iconiche, attribuite.
const QUOTES: { text: string; film: string; year: number }[] = [
  { text: "Che la Forza sia con te.", film: "Guerre stellari", year: 1977 },
  { text: "Francamente, me ne infischio.", film: "Via col vento", year: 1939 },
  { text: "Al mio segnale, scatenate l'inferno.", film: "Il gladiatore", year: 2000 },
  { text: "La vita è come una scatola di cioccolatini.", film: "Forrest Gump", year: 1994 },
  { text: "Io ne ho viste cose che voi umani…", film: "Blade Runner", year: 1982 },
  { text: "Carpe diem. Cogliete l'attimo, ragazzi.", film: "L'attimo fuggente", year: 1989 },
  { text: "Houston, abbiamo un problema.", film: "Apollo 13", year: 1995 },
  { text: "Sono il re del mondo!", film: "Titanic", year: 1997 },
  { text: "Nessuno mette Baby in un angolo.", film: "Dirty Dancing", year: 1987 },
  { text: "Gli farò un'offerta che non potrà rifiutare.", film: "Il padrino", year: 1972 },
  { text: "A domanda semplice, risposta semplice: coraggio.", film: "Non ci resta che piangere", year: 1984 },
  { text: "E.T. telefono casa.", film: "E.T. l'extra-terrestre", year: 1982 },
];

export function quoteOfTheDay(date = new Date()) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const day = Math.floor((date.getTime() - start) / 86_400_000);
  return QUOTES[day % QUOTES.length];
}
