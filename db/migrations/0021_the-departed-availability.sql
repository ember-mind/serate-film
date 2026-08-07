INSERT INTO `movie_availability` (`movie_id`, `country`, `provider`, `type`, `url`, `price`, `updated_at`)
SELECT `id`, 'IT', 'Infinity Selection', 'subscription', 'https://mediasetinfinity.mediaset.it/movie/thedepartedilbeneeilmale/the-departed-il-bene-e-il-male_F012166901000102', NULL, datetime('now')
FROM `movies`
WHERE `title` = 'The Departed - Il bene e il male' AND `year` = 2006
ON CONFLICT(`movie_id`, `country`, `provider`, `type`) DO UPDATE SET
  `url` = excluded.`url`,
  `price` = excluded.`price`,
  `updated_at` = excluded.`updated_at`;--> statement-breakpoint
INSERT INTO `movie_availability` (`movie_id`, `country`, `provider`, `type`, `url`, `price`, `updated_at`)
SELECT `id`, 'IT', 'Prime Video', 'rent', 'https://www.primevideo.com/-/it/detail/0NFUQ5A9TFWZJ3VFTFOJ4R89RU?tr=be', 'da 3,99 €', datetime('now')
FROM `movies`
WHERE `title` = 'The Departed - Il bene e il male' AND `year` = 2006
ON CONFLICT(`movie_id`, `country`, `provider`, `type`) DO UPDATE SET
  `url` = excluded.`url`,
  `price` = excluded.`price`,
  `updated_at` = excluded.`updated_at`;--> statement-breakpoint
INSERT INTO `movie_availability` (`movie_id`, `country`, `provider`, `type`, `url`, `price`, `updated_at`)
SELECT `id`, 'IT', 'Prime Video', 'buy', 'https://www.primevideo.com/-/it/detail/0NFUQ5A9TFWZJ3VFTFOJ4R89RU?tr=be', NULL, datetime('now')
FROM `movies`
WHERE `title` = 'The Departed - Il bene e il male' AND `year` = 2006
ON CONFLICT(`movie_id`, `country`, `provider`, `type`) DO UPDATE SET
  `url` = excluded.`url`,
  `price` = excluded.`price`,
  `updated_at` = excluded.`updated_at`;--> statement-breakpoint
INSERT INTO `movie_availability` (`movie_id`, `country`, `provider`, `type`, `url`, `price`, `updated_at`)
SELECT `id`, 'IT', 'Apple TV Store', 'rent', 'https://tv.apple.com/it/movie/the-departed/umc.cmc.6795ameca08rcfnqch2u5vmj8', 'da 3,99 €', datetime('now')
FROM `movies`
WHERE `title` = 'The Departed - Il bene e il male' AND `year` = 2006
ON CONFLICT(`movie_id`, `country`, `provider`, `type`) DO UPDATE SET
  `url` = excluded.`url`,
  `price` = excluded.`price`,
  `updated_at` = excluded.`updated_at`;--> statement-breakpoint
INSERT INTO `movie_availability` (`movie_id`, `country`, `provider`, `type`, `url`, `price`, `updated_at`)
SELECT `id`, 'IT', 'Apple TV Store', 'buy', 'https://tv.apple.com/it/movie/the-departed/umc.cmc.6795ameca08rcfnqch2u5vmj8', NULL, datetime('now')
FROM `movies`
WHERE `title` = 'The Departed - Il bene e il male' AND `year` = 2006
ON CONFLICT(`movie_id`, `country`, `provider`, `type`) DO UPDATE SET
  `url` = excluded.`url`,
  `price` = excluded.`price`,
  `updated_at` = excluded.`updated_at`;
