-- Inserisce il film completo; idempotente rispetto a seed/import manuali precedenti.
INSERT OR IGNORE INTO `movies`
  (`title`, `year`, `director`, `actors`, `genres`, `runtime`, `synopsis`, `synopsis_source`)
VALUES
  ('Scandalosa Gilda', 1985, 'Gabriele Lavia', 'Monica Guerritore, Gabriele Lavia, Pina Cei', 'Drammatico, Erotico', 85, 'Roma: dopo aver sorpreso il marito con l''amante, Gilda lascia casa e imbocca l''autostrada. In un autogrill incontra un disegnatore di film d''animazione; il loro incontro si trasforma in ventiquattro ore di attrazione, rifiuto e crudeltà psicologica, dove entrambi cercano di umiliare l''altro e sé stessi.', NULL);--> statement-breakpoint
UPDATE `movies`
SET
  `director` = 'Gabriele Lavia',
  `actors` = 'Monica Guerritore, Gabriele Lavia, Pina Cei',
  `genres` = 'Drammatico, Erotico',
  `runtime` = 85,
  `synopsis` = 'Roma: dopo aver sorpreso il marito con l''amante, Gilda lascia casa e imbocca l''autostrada. In un autogrill incontra un disegnatore di film d''animazione; il loro incontro si trasforma in ventiquattro ore di attrazione, rifiuto e crudeltà psicologica, dove entrambi cercano di umiliare l''altro e sé stessi.',
  `synopsis_source` = NULL
WHERE `title` = 'Scandalosa Gilda' AND `year` = 1985;
