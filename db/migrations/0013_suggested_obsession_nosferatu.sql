INSERT OR IGNORE INTO `movies` (`title`, `year`, `director`, `actors`, `genres`, `runtime`, `synopsis`, `synopsis_source`)
VALUES ('Obsession', 1976, 'Brian De Palma', 'Cliff Robertson, Geneviève Bujold, John Lithgow', 'Thriller, Mistero, Drammatico', 98, 'Nel 1959 l''imprenditore di New Orleans Michael Courtland perde moglie e figlia durante un rapimento finito tragicamente. Sedici anni dopo, a Firenze, incontra Sandra, una giovane identica alla moglie: il tentativo di ricreare il passato lo trascina in un intrigo di colpa, desiderio e inganno.', NULL);
--> statement-breakpoint
UPDATE `movies`
SET `director` = COALESCE(`director`, 'Brian De Palma'),
    `actors` = COALESCE(`actors`, 'Cliff Robertson, Geneviève Bujold, John Lithgow'),
    `genres` = COALESCE(`genres`, 'Thriller, Mistero, Drammatico'),
    `runtime` = COALESCE(`runtime`, 98),
    `synopsis` = COALESCE(`synopsis`, 'Nel 1959 l''imprenditore di New Orleans Michael Courtland perde moglie e figlia durante un rapimento finito tragicamente. Sedici anni dopo, a Firenze, incontra Sandra, una giovane identica alla moglie: il tentativo di ricreare il passato lo trascina in un intrigo di colpa, desiderio e inganno.')
WHERE `title` = 'Obsession' AND `year` = 1976;
--> statement-breakpoint
INSERT OR IGNORE INTO `movies` (`title`, `year`, `director`, `actors`, `genres`, `runtime`, `synopsis`, `synopsis_source`)
VALUES ('Nosferatu', 2024, 'Robert Eggers', 'Lily-Rose Depp, Nicholas Hoult, Bill Skarsgård, Willem Dafoe', 'Horror, Drammatico, Fantasy', 132, 'Nella Germania del 1838, Thomas Hutter parte per la Transilvania per chiudere una vendita con il misterioso conte Orlok. Il viaggio porta il vampiro verso Wisborg e riapre il legame oscuro che lo unisce a Ellen, moglie di Thomas, mentre peste e terrore invadono la città.', NULL);
--> statement-breakpoint
UPDATE `movies`
SET `director` = COALESCE(`director`, 'Robert Eggers'),
    `actors` = COALESCE(`actors`, 'Lily-Rose Depp, Nicholas Hoult, Bill Skarsgård, Willem Dafoe'),
    `genres` = COALESCE(`genres`, 'Horror, Drammatico, Fantasy'),
    `runtime` = COALESCE(`runtime`, 132),
    `synopsis` = COALESCE(`synopsis`, 'Nella Germania del 1838, Thomas Hutter parte per la Transilvania per chiudere una vendita con il misterioso conte Orlok. Il viaggio porta il vampiro verso Wisborg e riapre il legame oscuro che lo unisce a Ellen, moglie di Thomas, mentre peste e terrore invadono la città.')
WHERE `title` = 'Nosferatu' AND `year` = 2024;
