export type CategoryId = "organize" | "online" | "social" | "memory" | "trust";

export type Feature = {
  id: string;
  category: CategoryId;
  title: string;
  tagline: string;
  description: string;
  outcome: string;
  recommendation: "Costruire" | "Testare" | "Più avanti";
  effort: "S" | "M" | "L" | "XL";
  impact: 1 | 2 | 3 | 4 | 5;
  monetizable?: boolean;
};

export const categories: Array<{
  id: CategoryId;
  number: string;
  title: string;
  subtitle: string;
  accent: string;
}> = [
  {
    id: "organize",
    number: "01",
    title: "Organizzare senza chat infinite",
    subtitle: "Dalla proposta al divano, con meno attrito e più consenso.",
    accent: "#e9bc6a",
  },
  {
    id: "online",
    number: "02",
    title: "Una vera sala online",
    subtitle: "Sincronizzare le persone senza ritrasmettere illegalmente il film.",
    accent: "#86b6b2",
  },
  {
    id: "social",
    number: "03",
    title: "Social, ma tra persone giuste",
    subtitle: "Conversazioni e scoperte con privacy di default.",
    accent: "#ce7f8c",
  },
  {
    id: "memory",
    number: "04",
    title: "La memoria del gruppo",
    subtitle: "Trasformare ogni serata in una storia che vale tornare a vedere.",
    accent: "#a9a0d8",
  },
  {
    id: "trust",
    number: "05",
    title: "Fiducia e controllo",
    subtitle: "Ogni espansione sociale ha bisogno di confini chiari.",
    accent: "#98b982",
  },
];

export const features: Feature[] = [
  {
    id: "smart-rsvp",
    category: "organize",
    title: "RSVP intelligente",
    tagline: "Sì, forse, no — con scadenza.",
    description:
      "Ogni invitato risponde, indica quante persone porta e riceve un promemoria solo se serve.",
    outcome: "L’organizzatore sa davvero per quante persone preparare.",
    recommendation: "Costruire",
    effort: "S",
    impact: 5,
  },
  {
    id: "ranked-choice",
    category: "organize",
    title: "Scelta film a consenso",
    tagline: "Non vince solo chi vota per primo.",
    description:
      "Classifica 3 film, voto a punti oppure duelli rapidi. Il sistema spiega perché un titolo è il miglior compromesso.",
    outcome: "Più partecipazione, meno pareggi e meno discussioni.",
    recommendation: "Costruire",
    effort: "M",
    impact: 5,
  },
  {
    id: "group-filters",
    category: "organize",
    title: "Trova il film giusto stasera",
    tagline: "Umore, durata, piattaforme, persone.",
    description:
      "Un selettore incrocia mood, tempo disponibile, servizi streaming del gruppo e film già visti.",
    outcome: "La watchlist diventa una decisione, non un parcheggio.",
    recommendation: "Testare",
    effort: "L",
    impact: 5,
    monetizable: true,
  },
  {
    id: "where-to-watch",
    category: "organize",
    title: "Dove si vede",
    tagline: "Disponibilità e costo prima del voto.",
    description:
      "Mostra streaming, noleggio e sala cinema per territorio, con filtro sui servizi già posseduti dagli amici.",
    outcome: "Niente film scelti e poi impossibili da trovare.",
    recommendation: "Costruire",
    effort: "M",
    impact: 4,
    monetizable: true,
  },
  {
    id: "recurring-clubs",
    category: "organize",
    title: "Club e stagioni ricorrenti",
    tagline: "Ogni giovedì, ogni mese, ogni saga.",
    description:
      "Crea una stagione, ruota automaticamente l’host e il proponente, duplica checklist e regole.",
    outcome: "Da evento occasionale a vera abitudine del gruppo.",
    recommendation: "Costruire",
    effort: "M",
    impact: 4,
    monetizable: true,
  },
  {
    id: "calendar-reminders",
    category: "organize",
    title: "Calendario e promemoria",
    tagline: "Un tap e la serata è in agenda.",
    description:
      "File calendario, link Google/Apple, conferma il giorno prima e avviso quando manca qualcosa da portare.",
    outcome: "Meno assenze dimenticate e rincorse manuali.",
    recommendation: "Costruire",
    effort: "S",
    impact: 4,
  },
  {
    id: "sync-lobby",
    category: "online",
    title: "Lobby sincronizzata",
    tagline: "Countdown, timecode e controllo host.",
    description:
      "Ognuno apre il film col proprio abbonamento; la stanza sincronizza play, pausa, timecode e stato dei partecipanti.",
    outcome: "Watch party fattibile subito, senza trasmettere il contenuto.",
    recommendation: "Costruire",
    effort: "L",
    impact: 5,
    monetizable: true,
  },
  {
    id: "youtube-room",
    category: "online",
    title: "Sala YouTube e public domain",
    tagline: "Player integrato quando i diritti lo permettono.",
    description:
      "Esperienza completa con embed ufficiale per trailer, corti, contenuti YouTube autorizzati e opere libere.",
    outcome: "Il modo più rapido per provare una visione realmente sincronizzata.",
    recommendation: "Costruire",
    effort: "M",
    impact: 4,
  },
  {
    id: "streamer-watchalong",
    category: "online",
    title: "Watch-along con streamer",
    tagline: "Il creator si vede; il film no.",
    description:
      "Lo streamer trasmette volto, commento e reazioni. Gli spettatori avviano legalmente il film in locale sullo stesso timecode.",
    outcome: "Format pubblico scalabile senza incorporare audio o video del film.",
    recommendation: "Testare",
    effort: "L",
    impact: 5,
    monetizable: true,
  },
  {
    id: "live-room",
    category: "online",
    title: "Reazioni, chat e sondaggi live",
    tagline: "Parlare senza coprire il film.",
    description:
      "Emoji temporanee, chat silenziosa, domande del creator, spoiler marker e votazione alla fine dei titoli.",
    outcome: "La distanza diventa parte del rito, non un limite.",
    recommendation: "Testare",
    effort: "M",
    impact: 4,
  },
  {
    id: "licensed-events",
    category: "online",
    title: "Proiezioni pubbliche con licenza",
    tagline: "Biglietti e film integrato, ma solo con diritti.",
    description:
      "Flusso dedicato a cineclub e creator: capienza, territorio, licenza, biglietti, moderazione e rendiconto.",
    outcome: "Nuova linea B2B/eventi, con complessità legale e commerciale alta.",
    recommendation: "Più avanti",
    effort: "XL",
    impact: 4,
    monetizable: true,
  },
  {
    id: "private-feed",
    category: "social",
    title: "Feed privato degli amici",
    tagline: "Solo segnali utili, niente rumore.",
    description:
      "Nuove recensioni, film aggiunti, serate create e traguardi dei propri circoli. Nessun algoritmo infinito.",
    outcome: "Motivo naturale per tornare tra una serata e l’altra.",
    recommendation: "Costruire",
    effort: "M",
    impact: 5,
  },
  {
    id: "review-threads",
    category: "social",
    title: "Conversazioni sulle pagelle",
    tagline: "Like, risposta, menzione, spoiler.",
    description:
      "Estende i like già presenti con thread brevi, citazioni, menzioni e sezioni nascoste fino alla visione.",
    outcome: "Le recensioni diventano conversazioni, non schede isolate.",
    recommendation: "Costruire",
    effort: "M",
    impact: 4,
  },
  {
    id: "circles",
    category: "social",
    title: "Circoli di amici",
    tagline: "Horror crew, famiglia, cinefili.",
    description:
      "Gruppi riutilizzabili con ruoli, gusti condivisi, disponibilità e impostazioni di privacy proprie.",
    outcome: "Selezionare le persone per una serata richiede un solo tap.",
    recommendation: "Costruire",
    effort: "M",
    impact: 5,
    monetizable: true,
  },
  {
    id: "taste-match",
    category: "social",
    title: "Affinità cinematografica",
    tagline: "82% compatibili. Ma non sui western.",
    description:
      "Confronta voti, generi e sorprese condivise; suggerisce chi invitare e quale film potrebbe unire il gruppo.",
    outcome: "La personalizzazione nasce dalle relazioni, non da un catalogo generico.",
    recommendation: "Testare",
    effort: "L",
    impact: 4,
    monetizable: true,
  },
  {
    id: "public-clubs",
    category: "social",
    title: "Profili e club scopribili",
    tagline: "Seguire l’host, non essere seguiti da tutti.",
    description:
      "Profilo pubblico opzionale per creator e cineclub, calendario eventi e follow. Gli account normali restano privati.",
    outcome: "Crescita organica senza trasformare subito il prodotto in social aperto.",
    recommendation: "Più avanti",
    effort: "L",
    impact: 4,
    monetizable: true,
  },
  {
    id: "year-in-film",
    category: "memory",
    title: "L’anno del gruppo",
    tagline: "La vostra storia, film dopo film.",
    description:
      "Statistiche annuali: chi ha proposto i cult, voto medio, generi, ritardi, snack e disaccordi memorabili.",
    outcome: "Un payoff emotivo forte e condivisibile.",
    recommendation: "Costruire",
    effort: "M",
    impact: 5,
    monetizable: true,
  },
  {
    id: "recap-cards",
    category: "memory",
    title: "Cartoline dalla serata",
    tagline: "Un recap pronto da condividere.",
    description:
      "Genera una card con film, partecipanti, voto del gruppo, migliore recensione e contributi della serata.",
    outcome: "Ogni evento invita naturalmente il prossimo amico.",
    recommendation: "Costruire",
    effort: "S",
    impact: 4,
  },
  {
    id: "memory-roll",
    category: "memory",
    title: "Rullino dei ricordi",
    tagline: "Foto, citazioni e momenti.",
    description:
      "Un diario visuale privato per ogni club: foto, inside joke, biglietti, locandine e commenti preferiti.",
    outcome: "Un archivio affettivo difficile da sostituire con un’altra app.",
    recommendation: "Testare",
    effort: "M",
    impact: 4,
  },
  {
    id: "privacy-controls",
    category: "trust",
    title: "Privacy a strati",
    tagline: "Privato di default, pubblico per scelta.",
    description:
      "Visibilità per evento e profilo, blocco e segnalazione, export dati, strumenti host e consenso per foto e menzioni.",
    outcome: "La crescita sociale non erode la fiducia del gruppo.",
    recommendation: "Costruire",
    effort: "M",
    impact: 5,
  },
];

export const competitors = [
  {
    name: "Cinema Circle",
    strength: "Crew privata, voti live, reaction, poll, calendario, statistiche.",
    gap: "Meno centrato sulla logistica concreta e sul rito della serata.",
    lesson: "La privacy del gruppo è una proposta forte, non un limite.",
    url: "https://cinemacircle.mov/",
  },
  {
    name: "Friday Movie Club",
    strength: "Proposte, ranking Borda, RSVP, link condivisibili, ruoli.",
    gap: "Esperienza più funzionale; poco catalogo personale e memoria sociale.",
    lesson: "Il voto a consenso e il piano host sono già monetizzabili.",
    url: "https://www.friday-movie.club/",
  },
  {
    name: "Movie Club",
    strength: "Club virtuali, turni di scelta, ricorrenze, chat live, discussioni.",
    gap: "Meno adatto alla coordinazione di una vera serata in presenza.",
    lesson: "Rotazione host + live room è una combinazione credibile.",
    url: "https://www.movieclub.app/",
  },
  {
    name: "Letterboxd",
    strength: "Diario personale, recensioni, liste, follow, statistiche e discovery.",
    gap: "Non organizza il momento collettivo della visione.",
    lesson: "Statistiche e personalizzazione sono un buon premium non invasivo.",
    url: "https://letterboxd.com/about/pro/",
  },
  {
    name: "Teleparty",
    strength: "Sincronizzazione del playback e chat su servizi streaming supportati.",
    gap: "È una stanza tecnica, non una relazione che continua prima e dopo.",
    lesson: "Ogni partecipante usa il proprio accesso al servizio streaming.",
    url: "https://ww1.teleparty.com/support",
  },
];

export const revenuePaths = [
  {
    id: "host-plus",
    title: "Host Plus",
    price: "€4,99/mese · €39/anno",
    target: "Chi organizza",
    includes: "Club multipli, ricorrenze, reminder avanzati, sondaggi, analytics e capienza.",
    verdict: "Prima scelta",
  },
  {
    id: "supporter",
    title: "Supporter",
    price: "€24/anno",
    target: "Cinefili del gruppo",
    includes: "Statistiche personali, poster e recap premium, export e personalizzazioni.",
    verdict: "Seconda scelta",
  },
  {
    id: "cineclub",
    title: "Cineclub Pro",
    price: "€19–49/mese",
    target: "Associazioni, scuole, locali",
    includes: "Più host, eventi pubblici, check-in, lista presenze, branding e report.",
    verdict: "Validare",
  },
  {
    id: "tickets",
    title: "Eventi con biglietto",
    price: "5–10% per transazione",
    target: "Creator e rassegne",
    includes: "Pagina evento, pagamento, accesso alla sala e supporto al flusso licenze.",
    verdict: "Solo con diritti",
  },
  {
    id: "affiliate",
    title: "Affiliazioni trasparenti",
    price: "Commissione variabile",
    target: "Tutti",
    includes: "Link a noleggio, biglietti cinema e prodotti della serata, sempre dichiarati.",
    verdict: "Ricavo accessorio",
  },
];

export const sources = [
  {
    label: "Cinema Circle",
    url: "https://cinemacircle.mov/",
  },
  {
    label: "Friday Movie Club",
    url: "https://www.friday-movie.club/",
  },
  {
    label: "Movie Club",
    url: "https://www.movieclub.app/docs/welcome",
  },
  {
    label: "Letterboxd Pro",
    url: "https://letterboxd.com/about/pro/",
  },
  {
    label: "Teleparty support",
    url: "https://ww1.teleparty.com/support",
  },
  {
    label: "Apple SharePlay",
    url: "https://developer.apple.com/documentation/avfoundation/supporting-coordinated-media-playback",
  },
  {
    label: "Twitch copyright",
    url: "https://safety.twitch.tv/s/article/Community-Guidelines",
  },
  {
    label: "SIAE · proiezioni",
    url: "https://www.siae.it/it/utilizzatori/eventi-spettacolo-intrattenimento/proiezioni-cinematografiche-audiovisive/",
  },
  {
    label: "SIAE · streaming",
    url: "https://www.siae.it/it/utilizzatori/online/film-serie-tv-opere-audiovisive-streaming-download",
  },
  {
    label: "MPLC Italia",
    url: "https://www.mplc.it/",
  },
];
