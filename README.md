# Serate Film

Cinema club privato per il gruppo: catalogo film autonomo, watchlist condivisa, sondaggi data+film con approval voting, storico delle serate viste con presenti, stelline e note.

Nessuna API esterna: il catalogo è nostro (SQLite), pre-caricato con ~200 film noti 1995–2025 (solo fatti: titolo, anno, regista, attori, generi — niente poster né trame di terzi) e ampliabile da qualunque membro dall'interfaccia.

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

## Come funziona una serata

1. Chiunque aggiunge film alla watchlist dal catalogo (`/film`); se un film manca, lo si aggiunge a mano (titolo, anno, regista, attori).
2. Si crea una serata (`/serate/nuova`): 1–5 date proposte + rosa di film dalla watchlist.
3. Tutti votano: Sì/No sulle date, approval voting sui film (timbra tutti quelli che ti vanno bene).
4. Chi ha creato la serata chiude le votazioni: il sito propone data e film vincenti, modificabili.
5. Dopo la visione: "Segna come vista" (presenti pre-compilati da chi era disponibile), poi ognuno lascia stelline e commento. Tutto finisce nello Storico.

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
- `node scripts/add-movie.mjs` — aggiunge un singolo film / evade un suggerimento
- `npx drizzle-kit generate` — genera una nuova migrazione dopo modifiche a `db/schema.ts`
