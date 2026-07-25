# Serate Film

Cinema club privato per il gruppo: catalogo film autonomo, watchlist condivisa, cineteca personale, sondaggi data+film con approval voting, storico delle serate viste con presenti, stelline e note.

Nessuna API esterna a runtime: il catalogo è nostro (SQLite), pre-caricato con oltre 200 film e ampliabile da qualunque membro. Titoli, anno, regia, cast, generi e durata restano dati locali; le immagini in `public/posters/generated/` sono artwork originali, non poster ufficiali.

## Stack

- Next.js (App Router, server actions) + Tailwind 4
- SQLite via better-sqlite3 + Drizzle ORM (migrazioni auto-applicate all'avvio)
- Sessioni JWT in cookie httpOnly (jose), password con bcrypt

## Setup locale

```bash
npm install
cp .env.example .env.local
# compila SESSION_SECRET (openssl rand -hex 32)

# crea l'utente admin e carica il catalogo
node scripts/seed.mjs manu "Manu" <password>
node scripts/seed-movies.mjs

npm run dev
```

Gli altri membri del gruppo si creano dall'interfaccia: `/admin` (voce "Gruppo", visibile solo agli admin).
Non esiste registrazione pubblica: gli account restano riservati ai membri invitati.

## Come funziona una serata

1. Chiunque aggiunge film alla watchlist dal catalogo (`/film`); se un film manca, lo si aggiunge a mano (titolo, anno, regista, attori).
2. Si crea una serata (`/serate/nuova`): 1–5 date proposte + rosa di film dalla watchlist.
3. Tutti votano: Sì/No sulle date, approval voting sui film (timbra tutti quelli che ti vanno bene).
4. Chi ha creato la serata chiude le votazioni: il sito propone data e film vincenti, modificabili.
5. Dopo la visione: "Segna come vista" (presenti pre-compilati da chi era disponibile), poi ognuno lascia stelline e commento. Tutto finisce nello Storico.

## Cineteca personale

Ogni membro può segnare un film con **"L'ho visto"** senza modificare la watchlist condivisa.
La pagina `/io` raccoglie il suo catalogo personale. Le proiezioni del club entrano
automaticamente nel catalogo dei soli presenti; una correzione delle presenze aggiorna anche
la cineteca personale.

In Cineteca si può filtrare tra tutti i film, quelli da vedere insieme, quelli visti dal membro
e quelli visti insieme al club.

## Deploy (Coolify)

- App Node: build `npm run build`, start `npm run start`.
- Volume persistente montato su `/app/data` (il db è `data/serate.db`, override con `DATABASE_PATH`).
- Env: `SESSION_SECRET`.
- Primo avvio: `node scripts/seed.mjs …` e `node scripts/seed-movies.mjs` dentro il container.

## Suggerimenti

Chiunque può lasciare un suggerimento libero su `/film` ("quel film con De Niro sul jazz…"). I suggerimenti pendenti si evadono con l'AI: identifica il film, poi

```bash
node scripts/add-movie.mjs --title "New York, New York" --year 1977 \
  --director "Martin Scorsese" --actors "Robert De Niro, Liza Minnelli" \
  --genres "Musical, Drammatico" --suggestion <id>
```

(`--suggestion <id>` marca il suggerimento come evaso e lo collega al film). In produzione: `docker exec <container> node scripts/add-movie.mjs …`.

## Script

- `node scripts/seed.mjs <username> <nome> <password>` — crea/aggiorna l'admin (applica anche le migrazioni)
- `node scripts/seed-movies.mjs` — carica/aggiorna il catalogo film (idempotente)
- `node scripts/seed-runtimes.mjs` — popola le durate del catalogo seed (idempotente)
- `node scripts/add-movie.mjs` — aggiunge un singolo film / evade un suggerimento (supporta `--runtime`)
- `npx drizzle-kit generate` — genera una nuova migrazione dopo modifiche a `db/schema.ts`
