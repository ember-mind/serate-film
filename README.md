# Serate Film

Cinema club privato per il gruppo: watchlist condivisa (dati TMDb), sondaggi data+film con approval voting, storico delle serate viste con presenti, stelline e note.

## Stack

- Next.js (App Router, server actions) + Tailwind 4
- SQLite via better-sqlite3 + Drizzle ORM (migrazioni auto-applicate all'avvio)
- Sessioni JWT in cookie httpOnly (jose), password con bcrypt
- API [TMDb](https://developer.themoviedb.org/) v3, lingua it-IT

## Setup locale

```bash
npm install
cp .env.example .env.local
# compila TMDB_API_KEY e SESSION_SECRET (openssl rand -hex 32)

# crea l'utente admin
node scripts/seed.mjs manu "Manu" <password>

npm run dev
```

Gli altri membri del gruppo si creano dall'interfaccia: `/admin` (voce "Gruppo", visibile solo agli admin).

## Come funziona una serata

1. Chiunque aggiunge film alla watchlist dal catalogo (`/film`).
2. Si crea una serata (`/serate/nuova`): 1–5 date proposte + rosa di film dalla watchlist.
3. Tutti votano: Sì/No sulle date, approval voting sui film (timbra tutti quelli che ti vanno bene).
4. Chi ha creato la serata chiude le votazioni: il sito propone data e film vincenti, modificabili.
5. Dopo la visione: "Segna come vista" (presenti pre-compilati da chi era disponibile), poi ognuno lascia stelline e commento. Tutto finisce nello Storico.

## Deploy (Coolify)

- App Node: build `npm run build`, start `npm run start`.
- Volume persistente montato su `/app/data` (il db è `data/serate.db`, override con `DATABASE_PATH`).
- Env: `TMDB_API_KEY`, `SESSION_SECRET`.
- Primo avvio: `node scripts/seed.mjs …` dentro il container per creare l'admin.

## Script

- `node scripts/seed.mjs <username> <nome> <password>` — crea/aggiorna l'admin (applica anche le migrazioni)
- `npx drizzle-kit generate` — genera una nuova migrazione dopo modifiche a `db/schema.ts`
