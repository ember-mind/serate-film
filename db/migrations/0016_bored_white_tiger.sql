ALTER TABLE `movies` ADD `wikidata_id` text;--> statement-breakpoint
ALTER TABLE `movies` ADD `imdb_id` text;--> statement-breakpoint
ALTER TABLE `movies` ADD `rotten_tomatoes_id` text;--> statement-breakpoint
ALTER TABLE `movies` ADD `youtube_trailer_id` text;--> statement-breakpoint
ALTER TABLE `movies` ADD `trailer_title` text;--> statement-breakpoint
ALTER TABLE `movies` ADD `trailer_channel` text;--> statement-breakpoint
ALTER TABLE `movies` ADD `imdb_rating` text;--> statement-breakpoint
ALTER TABLE `movies` ADD `rotten_tomatoes_score` text;--> statement-breakpoint
ALTER TABLE `movies` ADD `awards` text;--> statement-breakpoint
ALTER TABLE `movies` ADD `metadata_updated_at` text;
--> statement-breakpoint
-- Snapshot metadati film recuperato da Wikidata e YouTube.
UPDATE `movies` SET
  `wikidata_id` = 'Q374172',
  `imdb_id` = 'tt0012349',
  `rotten_tomatoes_id` = 'm/1052609-kid',
  `youtube_trailer_id` = 'J-tcqW0dtFE',
  `trailer_title` = 'Il monello | Trailer | Indiecinema',
  `trailer_channel` = 'Indiecinema',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '100%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:41:29.707Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il monello'
  AND `year` IS 1921;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q151895',
  `imdb_id` = 'tt0013442',
  `rotten_tomatoes_id` = 'm/nosferatu',
  `youtube_trailer_id` = 'UPOtj74BrL8',
  `trailer_title` = 'Nosferatu (1922) Official Trailer | Max Schreck, Alexander Granach, Gustav von Wangenheim Movie',
  `trailer_channel` = 'Movie Trailers',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '97%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:39:39.392Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Nosferatu'
  AND `year` IS 1922;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q152350',
  `imdb_id` = 'tt0015648',
  `rotten_tomatoes_id` = 'm/battleship_potemkin',
  `youtube_trailer_id` = 'j1h-VQoQnfo',
  `trailer_title` = 'BATTLESHIP POTEMKIN (1925) Official Trailer - Aleksandr Antonov, Vladimir Barskiy',
  `trailer_channel` = 'Biggest Trailer DataBase',
  `imdb_rating` = '7.9/10',
  `rotten_tomatoes_score` = '100%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:41:31.677Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'La corazzata Potëmkin'
  AND `year` IS 1925;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q151599',
  `imdb_id` = 'tt0017136',
  `rotten_tomatoes_id` = 'm/metropolis',
  `youtube_trailer_id` = 'bjxOpXweu_g',
  `trailer_title` = 'Metropolis | Trailer ufficiale (ITA)',
  `trailer_channel` = 'Nerdface Official',
  `imdb_rating` = '8.2/10',
  `rotten_tomatoes_score` = '97%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:20:07.041Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Metropolis'
  AND `year` IS 1927;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q238211',
  `imdb_id` = 'tt0021749',
  `rotten_tomatoes_id` = 'm/city_lights',
  `youtube_trailer_id` = '7vl7F8S4cpQ',
  `trailer_title` = 'City Lights (1931) Trailer #1 | Movieclips Classic Trailers',
  `trailer_channel` = 'Rotten Tomatoes Classic Trailers',
  `imdb_rating` = '8.5/10',
  `rotten_tomatoes_score` = '95%',
  `awards` = '["national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:46:48.135Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Luci della città'
  AND `year` IS 1931;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q127021',
  `imdb_id` = 'tt0022100',
  `rotten_tomatoes_id` = 'm/1012928-m',
  `youtube_trailer_id` = '18kPm2gOIhY',
  `trailer_title` = 'TRAILER IL MOSTRO DI DUSSELDORF',
  `trailer_channel` = 'Lab Buster Keaton - Scienze della Comunicazione (labaudiovideosdc)',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '100%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:20:07.501Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'M - Il mostro di Düsseldorf'
  AND `year` IS 1931;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q309048',
  `imdb_id` = 'tt0024216',
  `rotten_tomatoes_id` = 'm/1011615-king_kong',
  `youtube_trailer_id` = 'scQqFQd7m7w',
  `trailer_title` = 'KING KONG (film 1933) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '7.9/10',
  `rotten_tomatoes_score` = '96%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:49:49.021Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'King Kong'
  AND `year` IS 1933;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q45602',
  `imdb_id` = 'tt0027977',
  `rotten_tomatoes_id` = 'm/modern_times',
  `youtube_trailer_id` = 'FQI1_aad40I',
  `trailer_title` = 'Tempi moderni (film 1936) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.5/10',
  `rotten_tomatoes_score` = '98%',
  `awards` = '["national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:20:08.362Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Tempi moderni'
  AND `year` IS 1936;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q134430',
  `imdb_id` = 'tt0029583',
  `rotten_tomatoes_id` = 'm/snow_white_and_the_seven_dwarfs',
  `youtube_trailer_id` = '6QyrJ2SbYE8',
  `trailer_title` = 'BIANCANEVE E I SETTE NANI (1937) | Trailer italiano del primo Classico Disney',
  `trailer_channel` = 'MovieDigger',
  `imdb_rating` = '7.6/10',
  `rotten_tomatoes_score` = '97%',
  `awards` = '["national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:20:08.955Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Biancaneve e i sette nani'
  AND `year` IS 1937;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q470336',
  `imdb_id` = 'tt0028950',
  `rotten_tomatoes_id` = 'm/la_grande_illusion',
  `youtube_trailer_id` = 'vcO8rEjoG0c',
  `trailer_title` = 'LA GRANDE ILLUSION - Trailer ufficiale - Celebra il suo 75° anniversario',
  `trailer_channel` = 'StudiocanalUK',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '97%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:41:33.805Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'La grande illusione'
  AND `year` IS 1937;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q193695',
  `imdb_id` = 'tt0032138',
  `rotten_tomatoes_id` = 'm/the_wizard_of_oz_1939',
  `youtube_trailer_id` = 'dfpIHArL-zM',
  `trailer_title` = 'Il Mago di Oz - Trailer ITA (Il Cinema Ritrovato al cinema)',
  `trailer_channel` = 'CinetecaBologna',
  `imdb_rating` = '8.1/10',
  `rotten_tomatoes_score` = '98%',
  `awards` = '["Oscar alla migliore colonna sonora"]',
  `metadata_updated_at` = '2026-07-28T15:41:37.054Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il mago di Oz'
  AND `year` IS 1939;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q2875',
  `imdb_id` = 'tt0031381',
  `rotten_tomatoes_id` = 'm/gone_with_the_wind',
  `youtube_trailer_id` = 'vSIQiWvMQhQ',
  `trailer_title` = 'Via Col Vento (film 1939) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.2/10',
  `rotten_tomatoes_score` = '90%',
  `awards` = '["Oscar al miglior film","Oscar al miglior montaggio","Oscar al miglior regista","Oscar alla miglior attrice","Oscar alla miglior attrice non protagonista","Oscar alla migliore sceneggiatura non originale","Oscar alla migliore scenografia","Academy Award for Best Cinematography, Color","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:20:09.909Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Via col vento'
  AND `year` IS 1939;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q109116',
  `imdb_id` = 'tt0032553',
  `rotten_tomatoes_id` = 'm/great_dictator',
  `youtube_trailer_id` = 'OfiLkOwJXdg',
  `trailer_title` = 'Il grande dittatore (film 1940) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '92%',
  `awards` = '["national Board Review Top Ten Films","New York Film Critics Circle Award al miglior attore protagonista"]',
  `metadata_updated_at` = '2026-07-28T15:20:10.050Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il grande dittatore'
  AND `year` IS 1940;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q24815',
  `imdb_id` = 'tt0033467',
  `rotten_tomatoes_id` = 'm/citizen_kane',
  `youtube_trailer_id` = 'rteA_wdQeAA',
  `trailer_title` = 'QUARTO POTERE - Citizen Kane | Trailer italiano ufficiale HD',
  `trailer_channel` = 'I Wonder Pictures',
  `imdb_rating` = '8.2/10',
  `rotten_tomatoes_score` = '99%',
  `awards` = '["Oscar alla migliore sceneggiatura originale","National Board of Review Award al miglior film","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:21:39.408Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Quarto potere'
  AND `year` IS 1941;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q132689',
  `imdb_id` = 'tt0034583',
  `rotten_tomatoes_id` = 'm/1003707-casablanca',
  `youtube_trailer_id` = 'BkL9l7qovsE',
  `trailer_title` = 'Casablanca (1942) Official Trailer - Humphrey Bogart, Ingrid Bergman Movie HD',
  `trailer_channel` = 'Rotten Tomatoes Classic Trailers',
  `imdb_rating` = '8.5/10',
  `rotten_tomatoes_score` = '99%',
  `awards` = '["Oscar al miglior film","Oscar al miglior regista","Oscar alla migliore sceneggiatura non originale","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:20:11.394Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Casablanca'
  AND `year` IS 1942;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q478209',
  `imdb_id` = 'tt0036775',
  `rotten_tomatoes_id` = 'm/double_indemnity',
  `youtube_trailer_id` = 'jIkdgP06zmM',
  `trailer_title` = 'La fiamma del peccato trailer ita HD 1944',
  `trailer_channel` = 'registandre',
  `imdb_rating` = '8.3/10',
  `rotten_tomatoes_score` = '97%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:20:10.742Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'La fiamma del peccato'
  AND `year` IS 1944;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q721146',
  `imdb_id` = 'tt0038890',
  `rotten_tomatoes_id` = 'm/open_city',
  `youtube_trailer_id` = 'npEtzK7Jbl8',
  `trailer_title` = 'Cicero in Rome presenta: Roma città aperta - Official Trailer',
  `trailer_channel` = 'Cicero in Rome',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '100%',
  `awards` = '["national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:20:12.508Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Roma città aperta'
  AND `year` IS 1945;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q204191',
  `imdb_id` = 'tt0038650',
  `rotten_tomatoes_id` = 'm/its_a_wonderful_life',
  `youtube_trailer_id` = 'oKK1NvOREMQ',
  `trailer_title` = 'La vita è meravigliosa - Trailer',
  `trailer_channel` = 'Great Jupiter Pictures',
  `imdb_rating` = '8.6/10',
  `rotten_tomatoes_score` = '94%',
  `awards` = '["national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:20:14.794Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'La vita è meravigliosa'
  AND `year` IS 1946;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q172837',
  `imdb_id` = 'tt0040522',
  `rotten_tomatoes_id` = 'm/bicycle_thieves',
  `youtube_trailer_id` = '_I_LgU9Hw5s',
  `trailer_title` = 'Ladri di biciclette (Vittorio De Sica, 1948) Trailer Originale Italiano d''epoca',
  `trailer_channel` = 'Discovering Cinema',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '99%',
  `awards` = '["Oscar onorario","National Board of Review Award al miglior film","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:20:18.178Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Ladri di biciclette'
  AND `year` IS 1948;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q271830',
  `imdb_id` = 'tt0041959',
  `rotten_tomatoes_id` = 'm/the_third_man',
  `youtube_trailer_id` = 'hl1Sv-eN9LI',
  `trailer_title` = 'IL TERZO UOMO - Trailer Ufficiale n. 2 - Restaurato in uno sbalorditivo 4K',
  `trailer_channel` = 'StudiocanalUK',
  `imdb_rating` = '8.1/10',
  `rotten_tomatoes_score` = '99%',
  `awards` = '["BAFTA al miglior film britannico","Academy Award for Best Cinematography, Black-and-White","Grand Prix Speciale della Giuria"]',
  `metadata_updated_at` = '2026-07-28T15:20:16.609Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il terzo uomo'
  AND `year` IS 1949;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q135465',
  `imdb_id` = 'tt0042876',
  `rotten_tomatoes_id` = 'm/rashomon',
  `youtube_trailer_id` = 'xCZ9TguVOIA',
  `trailer_title` = 'Rashomon Trailer (Akira Kurosawa, 1950)',
  `trailer_channel` = 'JANUS',
  `imdb_rating` = '8.1/10',
  `rotten_tomatoes_score` = '98%',
  `awards` = '["Leone d''oro","Oscar onorario"]',
  `metadata_updated_at` = '2026-07-28T15:41:40.278Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Rashomon'
  AND `year` IS 1950;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q193570',
  `imdb_id` = 'tt0043014',
  `rotten_tomatoes_id` = 'm/sunset_boulevard',
  `youtube_trailer_id` = 'yuXpuxiwpa4',
  `trailer_title` = 'Viale del tramonto I Trailer ufficiale HD',
  `trailer_channel` = 'MYmovies',
  `imdb_rating` = '8.4/10',
  `rotten_tomatoes_score` = '98%',
  `awards` = '["Oscar alla migliore sceneggiatura originale","Academy Award for Best Art Direction, Black and White","Academy Award for Best Original Dramatic or Comedy Score","National Board of Review Award al miglior film","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:21:41.078Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Viale del tramonto'
  AND `year` IS 1950;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q309153',
  `imdb_id` = 'tt0045152',
  `rotten_tomatoes_id` = 'm/singin_in_the_rain',
  `youtube_trailer_id` = 'jyjloKQBWic',
  `trailer_title` = 'Cantando sotto la pioggia - Trailer',
  `trailer_channel` = 'TeatroBrancaccioRoma',
  `imdb_rating` = '8.3/10',
  `rotten_tomatoes_score` = '100%',
  `awards` = '["national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:21:41.262Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Cantando sotto la pioggia'
  AND `year` IS 1952;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q651982',
  `imdb_id` = 'tt0045274',
  `rotten_tomatoes_id` = 'm/umberto_d',
  `youtube_trailer_id` = 'jCTt568fAgg',
  `trailer_title` = 'UMBERTO D. de Vittorio De Sica - Official trailer - 1952',
  `trailer_channel` = 'FURY',
  `imdb_rating` = '8.1/10',
  `rotten_tomatoes_score` = '97%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:21:42.022Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Umberto D.'
  AND `year` IS 1952;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q211372',
  `imdb_id` = 'tt0047296',
  `rotten_tomatoes_id` = 'm/on_the_waterfront',
  `youtube_trailer_id` = 'a2FtM9wwAJo',
  `trailer_title` = 'Fronte del porto (film 1954) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.1/10',
  `rotten_tomatoes_score` = '99%',
  `awards` = '["Oscar al miglior attore","Oscar al miglior film","Oscar al miglior montaggio","Oscar al miglior regista","Oscar alla miglior attrice non protagonista","Oscar alla migliore sceneggiatura originale","Academy Award for Best Art Direction, Black and White","Academy Award for Best Cinematography, Black-and-White","National Board of Review Award al miglior film","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:21:42.545Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Fronte del porto'
  AND `year` IS 1954;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q189540',
  `imdb_id` = 'tt0047478',
  `rotten_tomatoes_id` = 'm/seven_samurai_1956',
  `youtube_trailer_id` = 'jGBqGQ7sRlU',
  `trailer_title` = 'I Sette Samurai | Trailer ufficiale',
  `trailer_channel` = 'CinetecaBologna',
  `imdb_rating` = '8.6/10',
  `rotten_tomatoes_score` = '100%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:21:42.991Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'I sette samurai'
  AND `year` IS 1954;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q34414',
  `imdb_id` = 'tt0047396',
  `rotten_tomatoes_id` = 'm/1017289-rear_window',
  `youtube_trailer_id` = 'qG9AHVb69Q4',
  `trailer_title` = 'La finestra sul cortile (film 1954) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.5/10',
  `rotten_tomatoes_score` = '99%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:21:43.607Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'La finestra sul cortile'
  AND `year` IS 1954;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q426346',
  `imdb_id` = 'tt0048545',
  `rotten_tomatoes_id` = 'm/rebel_without_a_cause',
  `youtube_trailer_id` = 'Jr-G3fK60hg',
  `trailer_title` = 'Gioventù Bruciata (film 1955) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '7.6/10',
  `rotten_tomatoes_score` = '91%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:21:44.133Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Gioventù bruciata'
  AND `year` IS 1955;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q188718',
  `imdb_id` = 'tt0050212',
  `rotten_tomatoes_id` = 'm/bridge_on_the_river_kwai',
  `youtube_trailer_id` = 'f05UVPHPgL0',
  `trailer_title` = 'Il ponte sul fiume kwai (Versione originale) - Trailer',
  `trailer_channel` = 'SonyPicsHomeEntItaly',
  `imdb_rating` = '8.1/10',
  `rotten_tomatoes_score` = '96%',
  `awards` = '["Oscar al miglior attore","Oscar al miglior film","Oscar al miglior montaggio","Oscar al miglior regista","Oscar alla migliore fotografia","Oscar alla migliore sceneggiatura non originale","Academy Award for Best Score, Adaptation or Treatment","National Board of Review Award al miglior film","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:21:45.616Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il ponte sul fiume Kwai'
  AND `year` IS 1957;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q217189',
  `imdb_id` = 'tt0050976',
  `rotten_tomatoes_id` = 'm/seventh_seal',
  `youtube_trailer_id` = 'hzLWN33eWCc',
  `trailer_title` = 'Il settimo sigillo (film 1957) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.1/10',
  `rotten_tomatoes_score` = '93%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:41:43.988Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il settimo sigillo'
  AND `year` IS 1957;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q2345',
  `imdb_id` = 'tt0050083',
  `rotten_tomatoes_id` = 'm/1000013_12_angry_men',
  `youtube_trailer_id` = 'I-Jw_yZSwIw',
  `trailer_title` = 'La Parola Ai Giurati trailer',
  `trailer_channel` = 'tagmoviespuntoit',
  `imdb_rating` = '9.0/10',
  `rotten_tomatoes_score` = '100%',
  `awards` = '["BAFTA Award for Best Foreign Actor","Orso d''oro","Grand Prix","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:21:47.173Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'La parola ai giurati'
  AND `year` IS 1957;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q18405',
  `imdb_id` = 'tt0050783',
  `rotten_tomatoes_id` = 'm/nights_of_cabiria',
  `youtube_trailer_id` = 'BF80dxdQDlU',
  `trailer_title` = 'LES NUITS DE CABIRIA (Le notti di Cabiria) de Federico Fellini - Official trailer - 1957',
  `trailer_channel` = 'FURY',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '100%',
  `awards` = '["Oscar al miglior film in lingua straniera","Grolla d''oro alla miglior attrice"]',
  `metadata_updated_at` = '2026-07-28T15:21:48.468Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Le notti di Cabiria'
  AND `year` IS 1957;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q747936',
  `imdb_id` = 'tt0050825',
  `rotten_tomatoes_id` = 'm/paths_of_glory',
  `youtube_trailer_id` = 'rPIC8zk_-AQ',
  `trailer_title` = 'Orizzonti di gloria (film 1957) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.4/10',
  `rotten_tomatoes_score` = '96%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:21:50.079Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Orizzonti di gloria'
  AND `year` IS 1957;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q202548',
  `imdb_id` = 'tt0052357',
  `rotten_tomatoes_id` = 'm/vertigo',
  `youtube_trailer_id` = 'uEZqLNtZiPs',
  `trailer_title` = 'La donna che visse due volte (film 1958) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.2/10',
  `rotten_tomatoes_score` = '93%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:21:51.267Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'La donna che visse due volte'
  AND `year` IS 1958;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q190086',
  `imdb_id` = 'tt0053291',
  `rotten_tomatoes_id` = 'm/some_like_it_hot',
  `youtube_trailer_id` = '97TYs2YXbJw',
  `trailer_title` = 'Some Like It Hot (1959) Trailer | MGM Studios',
  `trailer_channel` = 'Amazon MGM Studios',
  `imdb_rating` = '8.2/10',
  `rotten_tomatoes_score` = '94%',
  `awards` = '["Academy Award for Best Costume Design, Black-and-White","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:46:48.311Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'A qualcuno piace caldo'
  AND `year` IS 1959;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q180098',
  `imdb_id` = 'tt0052618',
  `rotten_tomatoes_id` = 'm/benhur',
  `youtube_trailer_id` = 'Lu8N6qtOJQA',
  `trailer_title` = 'BEN-HUR - Trailer italiano ufficiale',
  `trailer_channel` = 'Universal Pictures International Italy',
  `imdb_rating` = '8.1/10',
  `rotten_tomatoes_score` = '87%',
  `awards` = '["Oscar al miglior attore","Oscar al miglior attore non protagonista","Oscar al miglior film","Oscar al miglior montaggio","Oscar al miglior regista","Oscar al miglior sonoro","Academy Award for Best Art Direction, Color","Academy Award for Best Cinematography, Color","Academy Award for Best Costume Design, Color","Academy Award for Best Original Dramatic or Comedy Score","Academy Award for Best Special Effects","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:46:48.435Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Ben-Hur'
  AND `year` IS 1959;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q162331',
  `imdb_id` = 'tt0053198',
  `rotten_tomatoes_id` = 'm/400_blows',
  `youtube_trailer_id` = 'EIv0xXjBfAQ',
  `trailer_title` = 'I 400 COLPI - Trailer (Il Cinema Ritrovato al cinema)',
  `trailer_channel` = 'CinetecaBologna',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '99%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:22:18.570Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'I 400 colpi'
  AND `year` IS 1959;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q223139',
  `imdb_id` = 'tt0053125',
  `rotten_tomatoes_id` = 'm/north_by_northwest',
  `youtube_trailer_id` = 'xSeIH8F69DU',
  `trailer_title` = 'INTRIGO INTERNAZIONALE (1959) TRAILER ITA',
  `trailer_channel` = 'Movies & TV',
  `imdb_rating` = '8.3/10',
  `rotten_tomatoes_score` = '97%',
  `awards` = '["national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:22:19.548Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Intrigo internazionale'
  AND `year` IS 1959;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q86427',
  `imdb_id` = 'tt0053472',
  `rotten_tomatoes_id` = 'm/breathless',
  `youtube_trailer_id` = 'heOL2z5o5no',
  `trailer_title` = 'FINO ALL''ULTIMO RESPIRO ( 1960 ) - Trailer italiano',
  `trailer_channel` = 'Norberto Fedele',
  `imdb_rating` = '7.6/10',
  `rotten_tomatoes_score` = '96%',
  `awards` = '["French Syndicate of Cinema Critics Awards","Orso d''argento per il miglior regista","Premio Jean Vigo"]',
  `metadata_updated_at` = '2026-07-28T15:22:20.337Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Fino all''ultimo respiro'
  AND `year` IS 1960;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q270510',
  `imdb_id` = 'tt0053604',
  `rotten_tomatoes_id` = 'm/1001115-apartment',
  `youtube_trailer_id` = 'OcslkrBMLGc',
  `trailer_title` = 'The Apartment (1960) | Official Trailer | MGM Studios',
  `trailer_channel` = 'Amazon MGM Studios',
  `imdb_rating` = '8.3/10',
  `rotten_tomatoes_score` = '94%',
  `awards` = '["Oscar al miglior film","Oscar al miglior montaggio","Oscar al miglior regista","Oscar alla migliore sceneggiatura originale","Academy Award for Best Art Direction, Black and White","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:41:46.369Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'L''appartamento'
  AND `year` IS 1960;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q514531',
  `imdb_id` = 'tt0053619',
  `rotten_tomatoes_id` = 'm/lavventura',
  `youtube_trailer_id` = 'OeTTaScAHLU',
  `trailer_title` = 'L''Avventura (1960) ORIGINAL TRAILER [FHD]',
  `trailer_channel` = 'HD Retro Trailers',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '94%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:41:48.532Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'L''avventura'
  AND `year` IS 1960;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q18407',
  `imdb_id` = 'tt0053779',
  `rotten_tomatoes_id` = 'm/la_dolce_vita',
  `youtube_trailer_id` = 'pNnWxcT4X5k',
  `trailer_title` = 'La dolce vita (film 1960) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.0/10',
  `rotten_tomatoes_score` = '95%',
  `awards` = '["Palma d''oro","Academy Award for Best Costume Design, Black-and-White"]',
  `metadata_updated_at` = '2026-07-28T15:22:23.298Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'La dolce vita'
  AND `year` IS 1960;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q163038',
  `imdb_id` = 'tt0054215',
  `rotten_tomatoes_id` = 'm/psycho',
  `youtube_trailer_id` = 'Wz719b9QUqY',
  `trailer_title` = 'Psycho Official Trailer 1960 HD',
  `trailer_channel` = 'Damontager',
  `imdb_rating` = '8.5/10',
  `rotten_tomatoes_score` = '97%',
  `awards` = '["Golden Globe per la migliore attrice non protagonista"]',
  `metadata_updated_at` = '2026-07-28T15:22:22.875Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Psycho'
  AND `year` IS 1960;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q273704',
  `imdb_id` = 'tt0055614',
  `rotten_tomatoes_id` = 'm/west_side_story',
  `youtube_trailer_id` = 'HpKbrpPiExA',
  `trailer_title` = 'WEST SIDE STORY (1961) | Official Trailer | MGM',
  `trailer_channel` = 'Amazon MGM Studios',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '92%',
  `awards` = '["Oscar al miglior attore non protagonista","Oscar al miglior film","Oscar al miglior montaggio","Oscar al miglior regista","Oscar al miglior sonoro","Oscar alla miglior attrice non protagonista","Academy Award for Best Art Direction, Color","Academy Award for Best Cinematography, Color","Academy Award for Best Costume Design, Color","Academy Award for Best Original Musical Score","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:22:25.619Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'West Side Story'
  AND `year` IS 1961;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q228186',
  `imdb_id` = 'tt0056172',
  `rotten_tomatoes_id` = 'm/lawrence_of_arabia',
  `youtube_trailer_id` = '_AznzZAlwVA',
  `trailer_title` = 'Lawrence of Arabia - official trailer - presented in 70mm',
  `trailer_channel` = 'Park Circus',
  `imdb_rating` = '8.3/10',
  `rotten_tomatoes_score` = '93%',
  `awards` = '["Oscar al miglior film","Oscar al miglior montaggio","Oscar al miglior regista","Oscar al miglior sonoro","Oscar alla migliore colonna sonora","Academy Award for Best Art Direction, Color","Academy Award for Best Cinematography, Color","national Board Review Top Ten Films","Silver nugget for the best foreign film"]',
  `metadata_updated_at` = '2026-07-28T15:22:29.210Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Lawrence d''Arabia'
  AND `year` IS 1962;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q12018',
  `imdb_id` = 'tt0056801',
  `rotten_tomatoes_id` = 'm/8-12',
  `youtube_trailer_id` = '0SKINxYigLc',
  `trailer_title` = '8 1/2 Official Trailer (1963, Marcello Mastroianni, Anouk Aimée, Claudia Cardinale)',
  `trailer_channel` = 'Trailer World',
  `imdb_rating` = '8.0/10',
  `rotten_tomatoes_score` = '97%',
  `awards` = '["Oscar al miglior film in lingua straniera","Academy Award for Best Costume Design, Black-and-White","National Board of Review Award al miglior film straniero"]',
  `metadata_updated_at` = '2026-07-28T15:22:27.359Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = '8½'
  AND `year` IS 1963;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q596623',
  `imdb_id` = 'tt0057091',
  `rotten_tomatoes_id` = 'm/the_leopard_1963',
  `youtube_trailer_id` = 'b54uUkDwc08',
  `trailer_title` = 'il Gattopardo (film 1963) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '7.9/10',
  `rotten_tomatoes_score` = '98%',
  `awards` = '["Palma d''oro"]',
  `metadata_updated_at` = '2026-07-28T15:46:50.234Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il Gattopardo'
  AND `year` IS 1963;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q105702',
  `imdb_id` = 'tt0057012',
  `rotten_tomatoes_id` = 'm/dr_strangelove',
  `youtube_trailer_id` = 'oQuG_N2o63g',
  `trailer_title` = 'Il dottor Stranamore (film 1964) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.3/10',
  `rotten_tomatoes_score` = '98%',
  `awards` = '["BAFTA al miglior film","BAFTA al miglior film britannico","Bodil Award for Best Non-American Film","New York Film Critics Circle Award al miglior regista","Premio Hugo per la miglior rappresentazione drammatica","United Nations Awards"]',
  `metadata_updated_at` = '2026-07-28T15:46:50.474Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il dottor Stranamore'
  AND `year` IS 1964;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q209170',
  `imdb_id` = 'tt0058331',
  `rotten_tomatoes_id` = 'm/mary_poppins',
  `youtube_trailer_id` = 'EhDGhx-FIFU',
  `trailer_title` = 'Il Ritorno di Mary Poppins - Trailer Italiano Ufficiale | HD',
  `trailer_channel` = 'Disney IT',
  `imdb_rating` = '7.8/10',
  `rotten_tomatoes_score` = '97%',
  `awards` = '["Oscar ai migliori effetti speciali","Oscar al miglior montaggio","Oscar alla miglior attrice","Oscar alla migliore canzone","Oscar alla migliore colonna sonora"]',
  `metadata_updated_at` = '2026-07-28T15:22:58.575Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Mary Poppins'
  AND `year` IS 1964;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q41483',
  `imdb_id` = 'tt0060196',
  `rotten_tomatoes_id` = 'm/the_good_the_bad_and_the_ugly',
  `youtube_trailer_id` = 'ULJW7nzPOJ4',
  `trailer_title` = 'IL BUONO IL BRUTTO IL CATTIVO (film 1966) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.8/10',
  `rotten_tomatoes_score` = '97%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:41:50.817Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il buono, il brutto, il cattivo'
  AND `year` IS 1966;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q784812',
  `imdb_id` = 'tt0058946',
  `rotten_tomatoes_id` = 'm/the_battle_of_algiers',
  `youtube_trailer_id` = 'Vzq8wJkJG74',
  `trailer_title` = 'La battaglia di Algeri di Gillo Pontecorvo (1966) trailer in italiano',
  `trailer_channel` = 'Archivio Gino Peguri',
  `imdb_rating` = '8.1/10',
  `rotten_tomatoes_score` = '99%',
  `awards` = '["Leone d''oro"]',
  `metadata_updated_at` = '2026-07-28T15:23:01.373Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'La battaglia di Algeri'
  AND `year` IS 1966;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q695255',
  `imdb_id` = 'tt0060827',
  `rotten_tomatoes_id` = 'm/persona',
  `youtube_trailer_id` = 'amxvetvKfho',
  `trailer_title` = 'Persona Official Trailer #1 - Liv Ullmann Movie (1966) HD',
  `trailer_channel` = 'Rotten Tomatoes Classic Trailers',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '91%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:23:02.711Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Persona'
  AND `year` IS 1966;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q217627',
  `imdb_id` = 'tt0061722',
  `rotten_tomatoes_id` = 'm/graduate',
  `youtube_trailer_id` = 'ynYuiPhOqXo',
  `trailer_title` = 'Il laureato (film 1967) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.0/10',
  `rotten_tomatoes_score` = '87%',
  `awards` = '["Oscar al miglior regista","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:41:54.211Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il laureato'
  AND `year` IS 1967;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q103474',
  `imdb_id` = 'tt0062622',
  `rotten_tomatoes_id` = 'm/2001_a_space_odyssey',
  `youtube_trailer_id` = 'ivPu3t2j4Fg',
  `trailer_title` = '2001: ODISSEA NELLO SPAZIO - Trailer Ufficiale Italiano',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '92%',
  `awards` = '["BAFTA al miglior sonoro","David di Donatello per il miglior produttore straniero","Oscar ai migliori effetti speciali","Kansas City Film Critics Circle Award per il miglior film","Kansas City Film Critics Circle Award per il miglior regista","national Board Review Top Ten Films","Premio Hugo per la miglior rappresentazione drammatica"]',
  `metadata_updated_at` = '2026-07-28T15:23:23.000Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = '2001: Odissea nello spazio'
  AND `year` IS 1968;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q168154',
  `imdb_id` = 'tt0064116',
  `rotten_tomatoes_id` = 'm/once_upon_a_time_in_the_west',
  `youtube_trailer_id` = 'xTsbuHA5XqE',
  `trailer_title` = 'C''era una volta il West (film 1968) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.5/10',
  `rotten_tomatoes_score` = '96%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:39:07.779Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'C''era una volta il West'
  AND `year` IS 1968;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q59534',
  `imdb_id` = 'tt0063442',
  `rotten_tomatoes_id` = 'm/1016397-planet_of_the_apes',
  `youtube_trailer_id` = 'cln2Xn2RbvE',
  `trailer_title` = 'IL REGNO DEL PIANETA DELLE SCIMMIE | Trailer Ufficiale | Italiano',
  `trailer_channel` = '20th Century Studios & Searchlight Pictures CH',
  `imdb_rating` = '8.0/10',
  `rotten_tomatoes_score` = '86%',
  `awards` = '["national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:23:26.461Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il pianeta delle scimmie'
  AND `year` IS 1968;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q623051',
  `imdb_id` = 'tt0063350',
  `rotten_tomatoes_id` = 'm/night_of_the_living_dead',
  `youtube_trailer_id` = '-GW5yv5ORcc',
  `trailer_title` = 'La Notte dei Morti Viventi (film 1968) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '7.8/10',
  `rotten_tomatoes_score` = '95%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:23:24.837Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'La notte dei morti viventi'
  AND `year` IS 1968;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q181086',
  `imdb_id` = 'tt0066921',
  `rotten_tomatoes_id` = 'm/clockwork_orange',
  `youtube_trailer_id` = 'T54uZPI4Z8A',
  `trailer_title` = 'Arancia meccanica | Trailer | Warner Bros. Entertainment',
  `trailer_channel` = 'Warner Bros. Entertainment',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '88%',
  `awards` = '["Premio Hugo per la miglior rappresentazione drammatica"]',
  `metadata_updated_at` = '2026-07-28T15:23:29.405Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Arancia meccanica'
  AND `year` IS 1971;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q47703',
  `imdb_id` = 'tt0068646',
  `rotten_tomatoes_id` = 'm/the_godfather',
  `youtube_trailer_id` = 'uNBv9bcig0k',
  `trailer_title` = 'Il Padrino (film 1972) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '9.2/10',
  `rotten_tomatoes_score` = '97%',
  `awards` = '["Golden Globe per il miglior attore in un film drammatico","Golden Globe per il miglior film drammatico","Golden Globe per la migliore sceneggiatura","Oscar al miglior attore","Oscar al miglior film","Oscar alla migliore sceneggiatura non originale","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:40:26.214Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il padrino'
  AND `year` IS 1972;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q125772',
  `imdb_id` = 'tt0069293',
  `rotten_tomatoes_id` = 'm/solaris_1976',
  `youtube_trailer_id` = 'wT8Y7DGQn7M',
  `trailer_title` = 'SOLARIS (1972) Trailer | Lem 2021: I''ve Seen the Future',
  `trailer_channel` = 'AFISilverTheatre',
  `imdb_rating` = '7.9/10',
  `rotten_tomatoes_score` = '93%',
  `awards` = '["Grand Prix Speciale della Giuria"]',
  `metadata_updated_at` = '2026-07-28T15:41:57.370Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Solaris'
  AND `year` IS 1972;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q18428',
  `imdb_id` = 'tt0071129',
  `rotten_tomatoes_id` = 'm/amarcord',
  `youtube_trailer_id` = '6hbti1OafvM',
  `trailer_title` = 'Amarcord (1973) Trailer | Directed by Federico Fellini',
  `trailer_channel` = 'avids | network',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '87%',
  `awards` = '["David di Donatello per il miglior film","Oscar al miglior film in lingua straniera"]',
  `metadata_updated_at` = '2026-07-28T15:23:46.818Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Amarcord'
  AND `year` IS 1973;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q274167',
  `imdb_id` = 'tt0070047',
  `rotten_tomatoes_id` = 'm/exorcist',
  `youtube_trailer_id` = 'BU2eYAO31Cc',
  `trailer_title` = 'L''esorcista | Trailer ufficiale 4K Ultra HD | Warner Bros. Entertainment',
  `trailer_channel` = 'Warner Bros. Entertainment',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '84%',
  `awards` = '["Golden Globe per il miglior film drammatico","Golden Globe per il miglior regista","Golden Globe per la migliore attrice non protagonista","Golden Globe per la migliore sceneggiatura","Oscar al miglior sonoro","Oscar alla migliore sceneggiatura non originale","Saturn Award per il miglior film horror"]',
  `metadata_updated_at` = '2026-07-28T15:23:49.600Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'L''esorcista'
  AND `year` IS 1973;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q644987',
  `imdb_id` = 'tt0071315',
  `rotten_tomatoes_id` = 'm/chinatown',
  `youtube_trailer_id` = 'FDxS-UVKBxQ',
  `trailer_title` = 'Chinatown (film 1974) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.1/10',
  `rotten_tomatoes_score` = '98%',
  `awards` = '["Oscar alla migliore sceneggiatura originale","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:46:51.166Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Chinatown'
  AND `year` IS 1974;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q184768',
  `imdb_id` = 'tt0071562',
  `rotten_tomatoes_id` = 'm/godfather_part_ii',
  `youtube_trailer_id` = 'x0jdvVzHSkU',
  `trailer_title` = 'Il Padrino - Parte II (film 1974) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '9.0/10',
  `rotten_tomatoes_score` = '96%',
  `awards` = '["Oscar al miglior attore non protagonista","Oscar al miglior film","Oscar al miglior regista","Oscar alla migliore sceneggiatura non originale","Oscar alla migliore scenografia","Academy Award for Best Original Dramatic Score"]',
  `metadata_updated_at` = '2026-07-28T15:39:11.237Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il padrino - Parte II'
  AND `year` IS 1974;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q1009788',
  `imdb_id` = 'tt0071360',
  `rotten_tomatoes_id` = 'm/the_conversation',
  `youtube_trailer_id` = 'GjSat4CQM5I',
  `trailer_title` = 'La conversazione (film 1974) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '7.7/10',
  `rotten_tomatoes_score` = '94%',
  `awards` = '["BAFTA al miglior montaggio","BAFTA al miglior sonoro","Palma d''oro","National Board of Review Award al miglior attore","National Board of Review Award al miglior film","National Board of Review Award al miglior regista","national Board Review Top Ten Films","National Society of Film Critics Award per il miglior regista"]',
  `metadata_updated_at` = '2026-07-28T15:46:52.204Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'La conversazione'
  AND `year` IS 1974;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q375725',
  `imdb_id` = 'tt0071486',
  `rotten_tomatoes_id` = 'm/fantozzi',
  `youtube_trailer_id` = '_iG2IRyIKYk',
  `trailer_title` = 'Fantozzi I Trailer Ufficiale HD',
  `trailer_channel` = 'MYmovies',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = NULL,
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:24:22.834Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Fantozzi'
  AND `year` IS 1975;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q189505',
  `imdb_id` = 'tt0073195',
  `rotten_tomatoes_id` = 'm/jaws',
  `youtube_trailer_id` = 'u90wr5cp2JM',
  `trailer_title` = 'Lo Squalo (film 1975) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.1/10',
  `rotten_tomatoes_score` = '97%',
  `awards` = '["Oscar al miglior montaggio","Oscar al miglior sonoro","Academy Award for Best Original Dramatic Score"]',
  `metadata_updated_at` = '2026-07-28T15:24:20.984Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Lo squalo'
  AND `year` IS 1975;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q171669',
  `imdb_id` = 'tt0073486',
  `rotten_tomatoes_id` = 'm/one_flew_over_the_cuckoos_nest',
  `youtube_trailer_id` = '-FLAyG93K7k',
  `trailer_title` = 'Qualcuno volò sul nido del cuculo (film 1975) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.6/10',
  `rotten_tomatoes_score` = '93%',
  `awards` = '["BAFTA al miglior attore protagonista","BAFTA al miglior film","Oscar al miglior attore","Oscar al miglior film","Oscar al miglior regista","Oscar alla miglior attrice","Oscar alla migliore sceneggiatura non originale","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:24:24.320Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Qualcuno volò sul nido del cuculo'
  AND `year` IS 1975;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = NULL,
  `imdb_id` = NULL,
  `rotten_tomatoes_id` = NULL,
  `youtube_trailer_id` = 'T7bMHs737HQ',
  `trailer_title` = 'Obsession | Trailer Ufficiale (Universal Pictures)',
  `trailer_channel` = 'Universal Pictures International Italy',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = NULL,
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:24:27.783Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Obsession'
  AND `year` IS 1976;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q572165',
  `imdb_id` = 'tt0074958',
  `rotten_tomatoes_id` = 'm/network',
  `youtube_trailer_id` = 'ygaOl5TvsYk',
  `trailer_title` = 'Il Quinto Potere - trailer ufficiale italiano',
  `trailer_channel` = '01Distribution',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '90%',
  `awards` = '["Oscar al miglior attore","Oscar alla miglior attrice","Oscar alla miglior attrice non protagonista","Oscar alla migliore sceneggiatura originale","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:24:26.464Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Quinto potere'
  AND `year` IS 1976;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q188652',
  `imdb_id` = 'tt0075148',
  `rotten_tomatoes_id` = 'm/1017776-rocky',
  `youtube_trailer_id` = '-Hk-LYcavrw',
  `trailer_title` = 'ROCKY (1976) | Trailer ufficiale | MGM',
  `trailer_channel` = 'Amazon MGM Studios',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '91%',
  `awards` = '["Oscar al miglior film","Oscar al miglior montaggio","Oscar al miglior regista","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:24:48.495Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Rocky'
  AND `year` IS 1976;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q47221',
  `imdb_id` = 'tt0075314',
  `rotten_tomatoes_id` = 'm/taxi_driver',
  `youtube_trailer_id` = 'T5IligQP7Fo',
  `trailer_title` = 'TAXI DRIVER [1976] - Official Trailer (HD)',
  `trailer_channel` = 'Sony Pictures Entertainment',
  `imdb_rating` = '8.2/10',
  `rotten_tomatoes_score` = '89%',
  `awards` = '["Palma d''oro"]',
  `metadata_updated_at` = '2026-07-28T15:24:46.603Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Taxi Driver'
  AND `year` IS 1976;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q17738',
  `imdb_id` = 'tt0076759',
  `rotten_tomatoes_id` = 'm/star_wars_episode_iv_a_new_hope',
  `youtube_trailer_id` = 'fzikKDE30Q4',
  `trailer_title` = 'Trailer di Guerre Stellari (1977) - edizione "despecializzata" in HD',
  `trailer_channel` = 'I videocommentatori',
  `imdb_rating` = '8.6/10',
  `rotten_tomatoes_score` = '94%',
  `awards` = '["BAFTA alla migliore colonna sonora","Golden Globe per la migliore colonna sonora originale","Oscar ai migliori costumi","Oscar ai migliori effetti speciali","Oscar al miglior montaggio","Oscar al miglior sonoro","Oscar alla migliore colonna sonora","Oscar alla migliore scenografia","Oscar Special Achievement Award","Grammy Award alla miglior colonna sonora per i media visivi","national Board Review Top Ten Films","Premio Hugo per la miglior rappresentazione drammatica","Saturn Award for Best Set Decoration","Saturn Award per i migliori costumi","Saturn Award per i migliori effetti speciali","Saturn Award per il miglior attore non protagonista","Saturn Award per il miglior film di fantascienza","Saturn Award per il miglior trucco","Saturn Award per la miglior colonna sonora","Saturn Award per la miglior regia","Saturn Award per la miglior sceneggiatura"]',
  `metadata_updated_at` = '2026-07-28T15:24:50.463Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Guerre stellari'
  AND `year` IS 1977;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q546900',
  `imdb_id` = 'tt0076786',
  `rotten_tomatoes_id` = 'm/1020662-suspiria',
  `youtube_trailer_id` = 'hPs2ExUL_bc',
  `trailer_title` = 'Trailer ufficiale: Suspiria (1977)',
  `trailer_channel` = 'nickbtube',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '94%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:24:53.561Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Suspiria'
  AND `year` IS 1977;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q221103',
  `imdb_id` = 'tt0077651',
  `rotten_tomatoes_id` = 'm/1009113-halloween',
  `youtube_trailer_id` = 'QKxTrYNWrSk',
  `trailer_title` = 'Halloween   La notte delle streghe   Trailer ufficiale',
  `trailer_channel` = 'Empire Italia',
  `imdb_rating` = '7.7/10',
  `rotten_tomatoes_score` = '97%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:24:52.334Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Halloween - La notte delle streghe'
  AND `year` IS 1978;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q201674',
  `imdb_id` = 'tt0077416',
  `rotten_tomatoes_id` = 'm/the_deer_hunter',
  `youtube_trailer_id` = 'Dl8CHCCkO_w',
  `trailer_title` = 'Il cacciatore (film 1978) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.1/10',
  `rotten_tomatoes_score` = '86%',
  `awards` = '["Oscar al miglior attore non protagonista","Oscar al miglior film","Oscar al miglior montaggio","Oscar al miglior regista","Oscar al miglior sonoro"]',
  `metadata_updated_at` = '2026-07-28T15:46:52.976Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il cacciatore'
  AND `year` IS 1978;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q103569',
  `imdb_id` = 'tt0078748',
  `rotten_tomatoes_id` = 'm/alien',
  `youtube_trailer_id` = 'k5nkPuZRQXM',
  `trailer_title` = 'ALIEN (film 1979) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.5/10',
  `rotten_tomatoes_score` = '93%',
  `awards` = '["BAFTA al miglior sonoro","Oscar ai migliori effetti speciali","Premio Hugo per la miglior rappresentazione drammatica","Saturn Award per il miglior film di fantascienza","Saturn Award per la miglior attrice non protagonista","Saturn Award per la miglior regia"]',
  `metadata_updated_at` = '2026-07-28T15:46:53.031Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Alien'
  AND `year` IS 1979;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q182692',
  `imdb_id` = 'tt0078788',
  `rotten_tomatoes_id` = 'm/apocalypse_now',
  `youtube_trailer_id` = '9l-ViOOFH-s',
  `trailer_title` = 'APOCALYPSE NOW | Official Trailer | Starring Marlon Brando, Martin Sheen',
  `trailer_channel` = 'StudiocanalUK',
  `imdb_rating` = '8.4/10',
  `rotten_tomatoes_score` = '91%',
  `awards` = '["Oscar al miglior sonoro","Oscar alla migliore fotografia","Palma d''oro","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:25:21.685Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Apocalypse Now'
  AND `year` IS 1979;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q186341',
  `imdb_id` = 'tt0081505',
  `rotten_tomatoes_id` = 'm/shining',
  `youtube_trailer_id` = 'vBgoizYTy_4',
  `trailer_title` = 'Shining Extended Edition | Trailer Ufficiale Italiano',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '84%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:25:22.374Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Shining'
  AND `year` IS 1980;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q109767',
  `imdb_id` = 'tt0080455',
  `rotten_tomatoes_id` = 'm/blues_brothers',
  `youtube_trailer_id` = '2HCR4c1zPyk',
  `trailer_title` = 'The Blues Brothers Official Trailer #1 - Dan Aykroyd Movie (1980) HD',
  `trailer_channel` = 'Rotten Tomatoes Classic Trailers',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '72%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:25:22.927Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'The Blues Brothers'
  AND `year` IS 1980;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q220780',
  `imdb_id` = 'tt0081398',
  `rotten_tomatoes_id` = 'm/raging_bull',
  `youtube_trailer_id` = '5dyAW5Q2LwM',
  `trailer_title` = 'Toro Scatenato - Il capolavoro di Martin Scorsese restaurato in 4K solo 8-9-10 maggio | Trailer HD',
  `trailer_channel` = 'Lucky Red',
  `imdb_rating` = '8.1/10',
  `rotten_tomatoes_score` = '92%',
  `awards` = '["Oscar al miglior attore","Oscar al miglior montaggio","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:25:23.641Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Toro scatenato'
  AND `year` IS 1980;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q174284',
  `imdb_id` = 'tt0082971',
  `rotten_tomatoes_id` = 'm/raiders_of_the_lost_ark',
  `youtube_trailer_id` = 'zV1PsPTOQVI',
  `trailer_title` = 'INDIANA JONES E I PREDATORI DELL''ARCA PERDUTA | Trailer Ufficiale | Film di primaria importanza',
  `trailer_channel` = 'Paramount Entertainment Italia',
  `imdb_rating` = '8.4/10',
  `rotten_tomatoes_score` = '94%',
  `awards` = '["Oscar ai migliori effetti speciali","Oscar al miglior montaggio","Oscar al miglior sonoro","Oscar alla migliore scenografia","national Board Review Top Ten Films","Premio Hugo per la miglior rappresentazione drammatica"]',
  `metadata_updated_at` = '2026-07-28T15:25:24.125Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'I predatori dell''arca perduta'
  AND `year` IS 1981;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q184843',
  `imdb_id` = 'tt0083658',
  `rotten_tomatoes_id` = 'm/blade_runner',
  `youtube_trailer_id` = '1BY0XjWtc-c',
  `trailer_title` = 'Blade Runner - The Final Cut - Trailer Italiano Ufficiale | HD',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = '8.1/10',
  `rotten_tomatoes_score` = '89%',
  `awards` = '["BAFTA alla migliore fotografia","BAFTA alla migliore scenografia","Los Angeles Film Critics Association Award alla miglior fotografia","Premio Hugo per la miglior rappresentazione drammatica"]',
  `metadata_updated_at` = '2026-07-28T15:25:25.074Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Blade Runner'
  AND `year` IS 1982;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q11621',
  `imdb_id` = 'tt0083866',
  `rotten_tomatoes_id` = 'm/et_the_extraterrestrial',
  `youtube_trailer_id` = 'DAAjVP-quto',
  `trailer_title` = 'E T  l''extra terrestre (film 1982) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '7.9/10',
  `rotten_tomatoes_score` = '99%',
  `awards` = '["BAFTA alla migliore colonna sonora","David di Donatello per il miglior regista straniero","Golden Globe per il miglior film drammatico","Golden Globe per la migliore colonna sonora originale","Oscar ai migliori effetti speciali","Oscar al miglior montaggio sonoro","Oscar al miglior sonoro","Oscar alla migliore colonna sonora","Award of the Japanese Academy al miglior film in lingua straniera","Boston Society of Film Critics Award per il miglior regista","Grammy Award alla miglior colonna sonora per i media visivi","Los Angeles Film Critics Association Award al miglior film","Los Angeles Film Critics Association Award al miglior regista","national Board Review Top Ten Films","National Society of Film Critics Award per il miglior regista","Saturn Award for Best Classic Film DVD Release","Saturn Award per i migliori effetti speciali","Saturn Award per il miglior film di fantascienza","Saturn Award per la miglior colonna sonora","Saturn Award per la miglior sceneggiatura"]',
  `metadata_updated_at` = '2026-07-28T15:41:59.696Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'E.T. l''extra-terrestre'
  AND `year` IS 1982;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q206388',
  `imdb_id` = 'tt0087843',
  `rotten_tomatoes_id` = 'm/once_upon_a_time_in_america',
  `youtube_trailer_id` = 'oqmO25K1s98',
  `trailer_title` = 'C''era una volta in America (film 1984) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.3/10',
  `rotten_tomatoes_score` = '86%',
  `awards` = '["Silver nugget for the best foreign film"]',
  `metadata_updated_at` = '2026-07-28T15:39:12.773Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'C''era una volta in America'
  AND `year` IS 1984;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q108745',
  `imdb_id` = 'tt0087332',
  `rotten_tomatoes_id` = 'm/ghostbusters',
  `youtube_trailer_id` = 'wvfbprMDU9o',
  `trailer_title` = 'Ghostbusters - Trailer Ufficiale Italiano | HD',
  `trailer_channel` = 'Sony Pictures Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '95%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:25:26.730Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Ghostbusters'
  AND `year` IS 1984;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q162255',
  `imdb_id` = 'tt0088247',
  `rotten_tomatoes_id` = 'm/terminator',
  `youtube_trailer_id` = 'w-mrPcMlK8M',
  `trailer_title` = 'Terminator Salvation - Nuovo Trailer Ufficiale in alta qualità (ITA)',
  `trailer_channel` = 'Sony Pictures Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '90%',
  `awards` = '["Saturn Award per il miglior film di fantascienza"]',
  `metadata_updated_at` = '2026-07-28T15:25:29.461Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Terminator'
  AND `year` IS 1984;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q91540',
  `imdb_id` = 'tt0088763',
  `rotten_tomatoes_id` = 'm/back_to_the_future',
  `youtube_trailer_id` = 'C3_QKplUQP0',
  `trailer_title` = 'Ritorno al futuro I Trailer Ufficiale HD',
  `trailer_channel` = 'MYmovies',
  `imdb_rating` = '8.5/10',
  `rotten_tomatoes_score` = '92%',
  `awards` = '["David di Donatello","Oscar al miglior montaggio sonoro","Award of the Japanese Academy al miglior film in lingua straniera","Goldene Leinwand","International Film Music Critics Association Awards","Jupiter Awards","national Board Review Top Ten Films","Premio Hugo per la miglior rappresentazione drammatica","Saturn Award per i migliori effetti speciali","Saturn Award per il miglior attore","Saturn Award per il miglior film di fantascienza","Young Artist Awards"]',
  `metadata_updated_at` = '2026-07-28T15:25:28.019Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Ritorno al futuro'
  AND `year` IS 1985;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q3951536',
  `imdb_id` = 'tt0089967',
  `rotten_tomatoes_id` = NULL,
  `youtube_trailer_id` = NULL,
  `trailer_title` = NULL,
  `trailer_channel` = NULL,
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = NULL,
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:46:57.541Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Scandalosa Gilda'
  AND `year` IS 1985;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q104814',
  `imdb_id` = 'tt0090605',
  `rotten_tomatoes_id` = 'm/1000617-aliens',
  `youtube_trailer_id` = 'nwDJFqgjoFU',
  `trailer_title` = 'ALIENS | 1986 | Unofficial Trailer HD',
  `trailer_channel` = 'Retro Hideout',
  `imdb_rating` = '8.4/10',
  `rotten_tomatoes_score` = '93%',
  `awards` = '["BAFTA ai migliori effetti speciali","Oscar ai migliori effetti speciali","Oscar al miglior montaggio sonoro","Premio Hugo per la miglior rappresentazione drammatica","Saturn Award per il miglior film di fantascienza","Saturn Award per la miglior regia"]',
  `metadata_updated_at` = '2026-07-28T15:46:55.420Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Aliens - Scontro finale'
  AND `year` IS 1986;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q39571',
  `imdb_id` = 'tt0096283',
  `rotten_tomatoes_id` = 'm/my_neighbor_totoro',
  `youtube_trailer_id` = 'yX_J7fiPSR4',
  `trailer_title` = 'IL MIO VICINO TOTORO (1988) | Trailer italiano del film di Hayao Miyazaki',
  `trailer_channel` = 'MovieDigger',
  `imdb_rating` = '8.1/10',
  `rotten_tomatoes_score` = '93%',
  `awards` = '["Blue Ribbon Awards","Kinema Junpo Award for Best Film of the Year","Mainichi Film Concours","Ōfuji Noburō Award"]',
  `metadata_updated_at` = '2026-07-28T15:25:33.505Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il mio vicino Totoro'
  AND `year` IS 1988;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q464032',
  `imdb_id` = 'tt0095765',
  `rotten_tomatoes_id` = 'm/cinema_paradiso',
  `youtube_trailer_id` = 'URiOXvzYBtE',
  `trailer_title` = 'Nuovo Cinema Paradiso (film 1988) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.5/10',
  `rotten_tomatoes_score` = '90%',
  `awards` = '["Oscar al miglior film in lingua straniera","European Film Academy Special Jury Award","European Film Awards per il miglior attore","Grand Prix Speciale della Giuria","Silver nugget for the best foreign film"]',
  `metadata_updated_at` = '2026-07-28T15:46:55.267Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Nuovo Cinema Paradiso'
  AND `year` IS 1988;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q105598',
  `imdb_id` = 'tt0095016',
  `rotten_tomatoes_id` = 'm/die_hard',
  `youtube_trailer_id` = '1EhDBpYQVUA',
  `trailer_title` = 'Die Hard - Trappola di cristallo (film 1988) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.2/10',
  `rotten_tomatoes_score` = '94%',
  `awards` = '["Award of the Japanese Academy al miglior film in lingua straniera"]',
  `metadata_updated_at` = '2026-07-28T15:47:00.086Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Trappola di cristallo'
  AND `year` IS 1988;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q42047',
  `imdb_id` = 'tt0099685',
  `rotten_tomatoes_id` = 'm/1032176-goodfellas',
  `youtube_trailer_id` = 'XAAW0wMKzc0',
  `trailer_title` = 'Quei Bravi ragazzi I Trailer ufficiale HD',
  `trailer_channel` = 'MYmovies',
  `imdb_rating` = '8.7/10',
  `rotten_tomatoes_score` = '93%',
  `awards` = '["Oscar al miglior attore non protagonista","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:26:03.159Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Quei bravi ragazzi'
  AND `year` IS 1990;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q133654',
  `imdb_id` = 'tt0102926',
  `rotten_tomatoes_id` = 'm/silence_of_the_lambs',
  `youtube_trailer_id` = 'mjFRGJ1728c',
  `trailer_title` = 'Il silenzio degli innocenti - Trailer italiano ufficiale',
  `trailer_channel` = 'film__ita',
  `imdb_rating` = '8.6/10',
  `rotten_tomatoes_score` = '95%',
  `awards` = '["BAFTA al miglior attore protagonista","BAFTA alla migliore attrice protagonista","Golden Globe per la migliore attrice in un film drammatico","Oscar al miglior attore","Oscar al miglior film","Oscar al miglior regista","Oscar alla miglior attrice","Oscar alla migliore sceneggiatura non originale","Boston Society of Film Critics Award per il miglior attore non protagonista","Chicago Film Critics Association Award per il miglior attore","Dallas-Fort Worth Film Critics Association Award per il miglior attore","Directors Guild of America Award for Outstanding Directing – Feature Film","Kansas City Film Critics Circle Award per il miglior attore","National Board of Review Award al miglior attore non protagonista","National Board of Review Award al miglior film","National Board of Review Award al miglior regista","national Board Review Top Ten Films","New York Film Critics Circle Award al miglior attore protagonista","New York Film Critics Circle Award al miglior regista","New York Film Critics Circle Award alla miglior attrice protagonista","Saturn Award per il miglior attore","Writers Guild of America Award for Best Adapted Screenplay"]',
  `metadata_updated_at` = '2026-07-28T15:26:03.303Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il silenzio degli innocenti'
  AND `year` IS 1991;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q170564',
  `imdb_id` = 'tt0103064',
  `rotten_tomatoes_id` = 'm/terminator_2_judgment_day',
  `youtube_trailer_id` = 'xr1_IopdS8E',
  `trailer_title` = 'Terminator 2 - Il giorno del giudizio  (film 1991) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.6/10',
  `rotten_tomatoes_score` = '90%',
  `awards` = '["Oscar ai migliori effetti speciali","Oscar al miglior montaggio sonoro","Oscar al miglior sonoro","Oscar al miglior trucco","Premio Hugo per la miglior rappresentazione drammatica","Saturn Award per il miglior film di fantascienza"]',
  `metadata_updated_at` = '2026-07-28T15:26:04.520Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Terminator 2 - Il giorno del giudizio'
  AND `year` IS 1991;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q72962',
  `imdb_id` = 'tt0105236',
  `rotten_tomatoes_id` = 'm/reservoir_dogs',
  `youtube_trailer_id` = 'N8n7R3kEb00',
  `trailer_title` = 'Le Iene - Trailer ufficiale italiano - Sceglilfilm.it',
  `trailer_channel` = 'sceglilfilm2',
  `imdb_rating` = '8.3/10',
  `rotten_tomatoes_score` = '90%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:26:04.426Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Le iene'
  AND `year` IS 1992;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q167726',
  `imdb_id` = 'tt0107290',
  `rotten_tomatoes_id` = 'm/jurassic_park',
  `youtube_trailer_id` = 'IBzNjFSpDUA',
  `trailer_title` = 'Jurassic Park - Jurassic World Trailer Italiano Ufficiale HD',
  `trailer_channel` = 'Series&Movie Trailer HD',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '92%',
  `awards` = '["Oscar ai migliori effetti speciali","Oscar al miglior montaggio sonoro","Oscar al miglior sonoro","KCA al miglior film","Premio Hugo per la miglior rappresentazione drammatica","Saturn Award per il miglior film di fantascienza","Saturn Award per la miglior regia"]',
  `metadata_updated_at` = '2026-07-28T15:26:05.813Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Jurassic Park'
  AND `year` IS 1993;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q483941',
  `imdb_id` = 'tt0108052',
  `rotten_tomatoes_id` = 'm/schindlers_list',
  `youtube_trailer_id` = 'mxphAlJID9U',
  `trailer_title` = 'Schindler''s List 25th Anniversary - Official Trailer - In Theaters December 7',
  `trailer_channel` = 'Universal Pictures',
  `imdb_rating` = '9.0/10',
  `rotten_tomatoes_score` = '98%',
  `awards` = '["BAFTA al miglior film","Oscar al miglior film","Oscar al miglior montaggio","Oscar al miglior regista","Oscar alla migliore colonna sonora","Oscar alla migliore fotografia","Oscar alla migliore sceneggiatura non originale","Oscar alla migliore scenografia","Amanda Award for Best Foreign Feature Film","Dallas-Fort Worth Film Critics Association Award per il miglior film","National Board of Review Award al miglior film","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:26:05.824Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Schindler''s List'
  AND `year` IS 1993;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q134773',
  `imdb_id` = 'tt0109830',
  `rotten_tomatoes_id` = 'm/forrest_gump',
  `youtube_trailer_id` = 'Mj9IA9tTfio',
  `trailer_title` = 'FORREST GUMP | Official 25th Anniversary Trailer | Paramount Movies',
  `trailer_channel` = 'Paramount Movies',
  `imdb_rating` = '8.8/10',
  `rotten_tomatoes_score` = '75%',
  `awards` = '["Oscar ai migliori effetti speciali","Oscar al miglior attore","Oscar al miglior film","Oscar al miglior montaggio","Oscar al miglior regista","Oscar alla migliore sceneggiatura non originale","Amanda Award for Best Foreign Feature Film","National Board of Review Award al miglior film","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:26:07.223Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Forrest Gump'
  AND `year` IS 1994;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q172241',
  `imdb_id` = 'tt0111161',
  `rotten_tomatoes_id` = 'm/shawshank_redemption',
  `youtube_trailer_id` = 'PLl99DlL6b4',
  `trailer_title` = 'Le ali della libertà | Trailer ufficiale | Warner Bros. Entertainment',
  `trailer_channel` = 'Warner Bros. Entertainment',
  `imdb_rating` = '9.3/10',
  `rotten_tomatoes_score` = '89%',
  `awards` = '["American Society of Cinematographers Award for Outstanding Achievement in Cinematography in Theatrical Releases","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:26:07.140Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Le ali della libertà'
  AND `year` IS 1994;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q104123',
  `imdb_id` = 'tt0110912',
  `rotten_tomatoes_id` = 'm/pulp_fiction',
  `youtube_trailer_id` = 's7EdQ4FqbhY',
  `trailer_title` = 'Pulp Fiction Official Trailer #1 - (1994) HD',
  `trailer_channel` = 'Movieclips',
  `imdb_rating` = '8.8/10',
  `rotten_tomatoes_score` = '92%',
  `awards` = '["BAFTA al miglior attore non protagonista","BAFTA alla migliore sceneggiatura originale","David di Donatello per il miglior attore straniero","Golden Globe per la migliore sceneggiatura","Oscar alla migliore sceneggiatura originale","Palma d''oro","Dallas-Fort Worth Film Critics Association Award per il miglior film","Independent Spirit Award per il miglior attore protagonista","Independent Spirit Award per il miglior regista","Independent Spirit Award per la miglior sceneggiatura","London Critics Circle Film Award all''attore dell''anno","Los Angeles Film Critics Association Award al miglior attore","Los Angeles Film Critics Association Award al miglior film","Los Angeles Film Critics Association Award al miglior regista","MTV Movie Award al miglior film","MTV Movie Award alla miglior sequenza di ballo","National Board of Review Award al miglior film","National Board of Review Award al miglior regista","national Board Review Top Ten Films","National Society of Film Critics Award per il miglior film","National Society of Film Critics Award per il miglior regista","National Society of Film Critics Award per la miglior sceneggiatura","New York Film Critics Circle Award al miglior regista"]',
  `metadata_updated_at` = '2026-07-28T15:26:08.556Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Pulp Fiction'
  AND `year` IS 1994;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q162729',
  `imdb_id` = 'tt0112573',
  `rotten_tomatoes_id` = 'm/1065684-braveheart',
  `youtube_trailer_id` = '3xGxxhImMcI',
  `trailer_title` = 'Braveheart (1995) OFFICIAL TRAILER [HD 1080p]',
  `trailer_channel` = 'HD Retro Trailers',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '74%',
  `awards` = '["Oscar al miglior film","Oscar al miglior montaggio sonoro","Oscar al miglior regista","Oscar al miglior trucco","Oscar alla migliore fotografia","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:26:08.476Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Braveheart'
  AND `year` IS 1995;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q42198',
  `imdb_id` = 'tt0113277',
  `rotten_tomatoes_id` = 'm/heat_1995',
  `youtube_trailer_id` = 'Ra3Kl1hMAtI',
  `trailer_title` = 'THE HEAT: la sfida | Trailer ITALIANO Ufficiale',
  `trailer_channel` = 'Diego Cuciniello',
  `imdb_rating` = '8.3/10',
  `rotten_tomatoes_score` = '84%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:26:10.510Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Heat - La sfida'
  AND `year` IS 1995;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q132351',
  `imdb_id` = 'tt0114814',
  `rotten_tomatoes_id` = 'm/usual_suspects',
  `youtube_trailer_id` = 'eocdEgFh7gE',
  `trailer_title` = 'I soliti sospetti (trailer non ufficiale)',
  `trailer_channel` = 'Cinefilo Moviebook',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '87%',
  `awards` = '["Oscar al miglior attore non protagonista","Oscar alla migliore sceneggiatura originale","National Board of Review Award al miglior cast","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:26:12.291Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'I soliti sospetti'
  AND `year` IS 1995;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q190908',
  `imdb_id` = 'tt0114369',
  `rotten_tomatoes_id` = 'm/seven',
  `youtube_trailer_id` = 'KPOuJGkpblk',
  `trailer_title` = 'Seven | Official Trailer 4K Ultra HD | Warner Bros. Entertainment',
  `trailer_channel` = 'Warner Bros. Entertainment',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '84%',
  `awards` = '["MTV Movie Award al miglior cattivo"]',
  `metadata_updated_at` = '2026-07-28T15:26:14.139Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Seven'
  AND `year` IS 1995;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q171048',
  `imdb_id` = 'tt0114709',
  `rotten_tomatoes_id` = 'm/toy_story',
  `youtube_trailer_id` = 'mGXHH9iAfLA',
  `trailer_title` = 'Toy Story - Official Trailer #2 ( 1995 ) [ HD ]',
  `trailer_channel` = 'WaltDisneyPlanet',
  `imdb_rating` = '8.3/10',
  `rotten_tomatoes_score` = '100%',
  `awards` = '["Oscar Special Achievement Award","Annie Award al miglior film d''animazione","Annie Award for Best Production Design in an Animated Feature Production","Annie Award for Character Animation in a Feature Production","Annie Award for Directing in a Feature Production","Annie Award for Music in a Feature Production","Annie Award for Writing in a Feature Production"]',
  `metadata_updated_at` = '2026-07-28T15:26:15.961Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Toy Story'
  AND `year` IS 1995;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q222720',
  `imdb_id` = 'tt0116282',
  `rotten_tomatoes_id` = 'm/fargo',
  `youtube_trailer_id` = 'ju75Sd4yAZw',
  `trailer_title` = 'Fargo (1996) | Official Trailer | MGM Studios',
  `trailer_channel` = 'Amazon MGM Studios',
  `imdb_rating` = '8.1/10',
  `rotten_tomatoes_score` = '94%',
  `awards` = '["Oscar alla miglior attrice","Oscar alla migliore sceneggiatura originale","Dallas-Fort Worth Film Critics Association Award per il miglior film","London Critics Circle Film Award al film dell''anno","national Board Review Top Ten Films","New York Film Critics Circle Award al miglior film","Writers Guild of America Award for Best Original Screenplay"]',
  `metadata_updated_at` = '2026-07-28T15:26:18.120Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Fargo'
  AND `year` IS 1996;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q105387',
  `imdb_id` = 'tt0116629',
  `rotten_tomatoes_id` = 'm/1071806-independence_day',
  `youtube_trailer_id` = 'B1E7h3SeMDk',
  `trailer_title` = 'Independence Day | Trailer ufficiale n. 1 | 1996',
  `trailer_channel` = '20th Century Studios UK',
  `imdb_rating` = '7.0/10',
  `rotten_tomatoes_score` = '67%',
  `awards` = '["Oscar ai migliori effetti speciali","Amanda Award for Best Foreign Feature Film","KCA al miglior film","MTV Movie Award al miglior bacio","Satellite Award per i migliori effetti visivi","Satellite Award per il miglior montaggio","Saturn Award per il miglior film di fantascienza","Saturn Award per la miglior regia"]',
  `metadata_updated_at` = '2026-07-28T15:26:37.119Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Independence Day'
  AND `year` IS 1996;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q109135',
  `imdb_id` = 'tt0117951',
  `rotten_tomatoes_id` = 'm/trainspotting',
  `youtube_trailer_id` = 'TzEMYHTKGDU',
  `trailer_title` = 'T2 Trainspotting - Trailer italiano ufficiale',
  `trailer_channel` = 'Sony Pictures Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '90%',
  `awards` = '["BAFTA alla migliore sceneggiatura non originale","Bodil Award for Best Non-American Film","Boston Society of Film Critics Award per il miglior film in lingua straniera","Golden Space Needle","London Film Critics Circle Award for British Actor of the Year","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:26:38.916Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Trainspotting'
  AND `year` IS 1996;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q775970',
  `imdb_id` = 'tt0119164',
  `rotten_tomatoes_id` = 'm/full_monty',
  `youtube_trailer_id` = 'fd5Vbe6zjhk',
  `trailer_title` = 'Full Monty - Squattrinati organizzati (film 1997) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '96%',
  `awards` = '["Academy Award for Best Original Musical or Comedy Score","European Film Awards per il miglior film","national Board Review Top Ten Films","Premio del pubblico al miglior film europeo"]',
  `metadata_updated_at` = '2026-07-28T15:42:05.946Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Full Monty - Squattrinati organizzati'
  AND `year` IS 1997;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q339876',
  `imdb_id` = 'tt0119488',
  `rotten_tomatoes_id` = 'm/la_confidential',
  `youtube_trailer_id` = '6sOXrY5yV4g',
  `trailer_title` = 'LA Confidential (1997) Official Trailer - Kevin Spacey, Guy Pearce Movie HD',
  `trailer_channel` = 'Rotten Tomatoes Classic Trailers',
  `imdb_rating` = '8.2/10',
  `rotten_tomatoes_score` = '99%',
  `awards` = '["Oscar alla miglior attrice non protagonista","Oscar alla migliore sceneggiatura non originale","Dallas-Fort Worth Film Critics Association Award per il miglior film","National Board of Review Award al miglior film","national Board Review Top Ten Films","Silver nugget for the best foreign film"]',
  `metadata_updated_at` = '2026-07-28T15:26:42.364Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'L.A. Confidential'
  AND `year` IS 1997;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q19355',
  `imdb_id` = 'tt0118799',
  `rotten_tomatoes_id` = 'm/1084398-life_is_beautiful',
  `youtube_trailer_id` = 'OeAqsjIntsk',
  `trailer_title` = 'La vita è bella Official Trailer 4K 1997 No 27 top 250 movies',
  `trailer_channel` = 'Trailers Vibe',
  `imdb_rating` = '8.6/10',
  `rotten_tomatoes_score` = '81%',
  `awards` = '["David di Donatello per il miglior film","Oscar al miglior attore","Oscar al miglior film in lingua straniera","Premio César per il miglior film straniero","Academy Award for Best Original Dramatic Score","European Film Awards per il miglior attore","European Film Awards per il miglior film","Grand Prix Speciale della Giuria"]',
  `metadata_updated_at` = '2026-07-28T15:26:44.039Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'La vita è bella'
  AND `year` IS 1997;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q51416',
  `imdb_id` = 'tt0119654',
  `rotten_tomatoes_id` = 'm/men_in_black',
  `youtube_trailer_id` = 'ktDmTu2H1zA',
  `trailer_title` = 'Men In Black: International | Trailer italiano ufficiale',
  `trailer_channel` = 'Sony Pictures Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '91%',
  `awards` = '["Oscar al miglior trucco","Saturn Award per il miglior film di fantascienza"]',
  `metadata_updated_at` = '2026-07-28T15:27:00.073Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Men in Black'
  AND `year` IS 1997;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q186572',
  `imdb_id` = 'tt0119698',
  `rotten_tomatoes_id` = 'm/princess_mononoke',
  `youtube_trailer_id` = 'FJNd6RC2PUI',
  `trailer_title` = 'Principessa Mononoke - Trailer Ufficiale ita',
  `trailer_channel` = 'HD Trailers',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '93%',
  `awards` = '["Animation Kobe Theatrical Film Award","Award of the Japanese Academy al miglior film"]',
  `metadata_updated_at` = '2026-07-28T15:27:02.238Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Principessa Mononoke'
  AND `year` IS 1997;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q44578',
  `imdb_id` = 'tt0120338',
  `rotten_tomatoes_id` = 'm/titanic',
  `youtube_trailer_id` = 'IhTpfdA8EJU',
  `trailer_title` = 'TITANIC in 3D | Trailer Ufficiale [HD] | 20th Century Fox',
  `trailer_channel` = '20th Century Studios Italia',
  `imdb_rating` = '8.0/10',
  `rotten_tomatoes_score` = '88%',
  `awards` = '["Golden Globe per il miglior film drammatico","Golden Globe per il miglior regista","Golden Globe per la migliore canzone originale","Golden Globe per la migliore colonna sonora originale","Oscar ai migliori costumi","Oscar ai migliori effetti speciali","Oscar al miglior film","Oscar al miglior montaggio","Oscar al miglior montaggio sonoro","Oscar al miglior regista","Oscar al miglior sonoro","Oscar alla migliore canzone","Oscar alla migliore fotografia","Oscar alla migliore scenografia","Academy Award for Best Original Dramatic Score","Amanda Award for Best Foreign Feature Film","Art Directors Guild Award for Excellence in Production Design for a Feature Film","Award of the Japanese Academy al miglior film in lingua straniera","Chicago Film Critics Association Award per la miglior fotografia","Directors Guild of America Award for Outstanding Directing – Feature Film","Jameson People''s Choice Award for Best Actress","KCA al miglior film","Las Vegas Film Critics Society Award per la miglior canzone","MTV Movie Award for Best Male Performance","national Board Review Top Ten Films","Producers Guild of America Award for Best Theatrical Motion Picture","Satellite Award per il miglior film","Saturn Award per la miglior attrice non protagonista","Screen Actors Guild Award per la migliore attrice non protagonista cinematografica"]',
  `metadata_updated_at` = '2026-07-28T15:27:04.042Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Titanic'
  AND `year` IS 1997;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q337078',
  `imdb_id` = 'tt0118715',
  `rotten_tomatoes_id` = 'm/the_big_lebowski',
  `youtube_trailer_id` = 'kgfDjLkKV8c',
  `trailer_title` = 'Il Grande Lebowski (film 1998) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '79%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:27:05.137Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il grande Lebowski'
  AND `year` IS 1998;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q851095',
  `imdb_id` = 'tt0120735',
  `rotten_tomatoes_id` = 'm/lock_stock_and_two_smoking_barrels',
  `youtube_trailer_id` = 'EfioahQoDZA',
  `trailer_title` = 'Lock & Stock - Pazzi scatenati (film 1998) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '75%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:27:06.789Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Lock & Stock - Pazzi scatenati'
  AND `year` IS 1998;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q165817',
  `imdb_id` = 'tt0120815',
  `rotten_tomatoes_id` = 'm/saving_private_ryan',
  `youtube_trailer_id` = '1rKTUM0sUK0',
  `trailer_title` = 'SALVATE IL SOLDATO RYAN (1998) | Trailer italiano del film di guerra di Steven Spielberg',
  `trailer_channel` = 'MovieDigger',
  `imdb_rating` = '8.6/10',
  `rotten_tomatoes_score` = '94%',
  `awards` = '["Golden Globe per il miglior film drammatico","Oscar al miglior montaggio","Oscar al miglior montaggio sonoro","Oscar al miglior regista","Oscar al miglior sonoro","Oscar alla migliore fotografia","Dallas-Fort Worth Film Critics Association Award per il miglior film","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:27:23.608Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Salvate il soldato Ryan'
  AND `year` IS 1998;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q214801',
  `imdb_id` = 'tt0120382',
  `rotten_tomatoes_id` = 'm/truman_show',
  `youtube_trailer_id` = 'ueYcdeYGndI',
  `trailer_title` = 'The Truman Show - Trailer Italiano Ufficiale',
  `trailer_channel` = 'film__ita',
  `imdb_rating` = '8.2/10',
  `rotten_tomatoes_score` = '94%',
  `awards` = '["European Film Awards per il miglior film internazionale","Premio Hugo per la miglior rappresentazione drammatica"]',
  `metadata_updated_at` = '2026-07-28T15:27:27.248Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'The Truman Show'
  AND `year` IS 1998;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q25139',
  `imdb_id` = 'tt0169547',
  `rotten_tomatoes_id` = 'm/american_beauty',
  `youtube_trailer_id` = 'WU0wh5NJ49k',
  `trailer_title` = 'American Beauty Official Trailer (1999)',
  `trailer_channel` = 'Universal Pictures Home Entertainment Benelux',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '87%',
  `awards` = '["BAFTA al miglior film","Oscar al miglior attore","Oscar al miglior film","Oscar al miglior regista","Oscar alla migliore fotografia","Oscar alla migliore sceneggiatura originale","Amanda Award for Best Foreign Feature Film","Dallas-Fort Worth Film Critics Association Award per il miglior film","National Board of Review Award al miglior film","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:27:25.452Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'American Beauty'
  AND `year` IS 1999;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q190050',
  `imdb_id` = 'tt0137523',
  `rotten_tomatoes_id` = 'm/fight_club',
  `youtube_trailer_id` = 'BdJKm16Co6M',
  `trailer_title` = 'Fight Club | #TBT Trailer | 20th Century FOX',
  `trailer_channel` = '20th Century Studios',
  `imdb_rating` = '8.8/10',
  `rotten_tomatoes_score` = '81%',
  `awards` = '["Empire Awards, UK for best british actress","Online Film and Television Association","Online Film Critics Society Awards","Premio Jupiter","Total Film Magazine Award"]',
  `metadata_updated_at` = '2026-07-28T15:27:29.119Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Fight Club'
  AND `year` IS 1999;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q208263',
  `imdb_id` = 'tt0120689',
  `rotten_tomatoes_id` = 'm/green_mile',
  `youtube_trailer_id` = '9osEOVZki-Y',
  `trailer_title` = 'Il miglio verde - Trailer Italiano Ufficiale',
  `trailer_channel` = 'film__ita',
  `imdb_rating` = '8.6/10',
  `rotten_tomatoes_score` = '78%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:27:30.120Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il miglio verde'
  AND `year` IS 1999;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q183063',
  `imdb_id` = 'tt0167404',
  `rotten_tomatoes_id` = 'm/sixth_sense',
  `youtube_trailer_id` = 'sueGL_tKyLg',
  `trailer_title` = 'IL SESTO SENSO (film 1999) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '86%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:27:48.703Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il sesto senso'
  AND `year` IS 1999;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q83495',
  `imdb_id` = 'tt0133093',
  `rotten_tomatoes_id` = 'm/matrix',
  `youtube_trailer_id` = '8-UEA3SLKQI',
  `trailer_title` = 'Matrix Resurrections – Trailer Ufficiale Italiano 1',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = '8.7/10',
  `rotten_tomatoes_score` = '83%',
  `awards` = '["BAFTA ai migliori effetti speciali","BAFTA al miglior sonoro","Oscar ai migliori effetti speciali","Oscar al miglior montaggio","Oscar al miglior montaggio sonoro","Oscar al miglior sonoro","Saturn Award per il miglior film di fantascienza","Saturn Award per la miglior regia"]',
  `metadata_updated_at` = '2026-07-28T15:27:50.682Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Matrix'
  AND `year` IS 1999;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q213411',
  `imdb_id` = 'tt0162222',
  `rotten_tomatoes_id` = 'm/cast_away',
  `youtube_trailer_id` = 'fpJE4uE-7vM',
  `trailer_title` = 'CAST AWAY (2000) | Trailer italiano del film di Robert Zemeckis con Tom Hanks',
  `trailer_channel` = 'MovieDigger',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '89%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:43:07.340Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Cast Away'
  AND `year` IS 2000;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q128518',
  `imdb_id` = 'tt0172495',
  `rotten_tomatoes_id` = 'm/gladiator',
  `youtube_trailer_id` = 'j2RMySmRHKg',
  `trailer_title` = 'Il Gladiatore | Trailer Ufficiale Italiano',
  `trailer_channel` = 'Raffaele Zito',
  `imdb_rating` = '8.5/10',
  `rotten_tomatoes_score` = '80%',
  `awards` = '["BAFTA al miglior film","Oscar ai migliori costumi","Oscar ai migliori effetti speciali","Oscar al miglior attore","Oscar al miglior film","Oscar al miglior sonoro","National Board of Review Award for Outstanding Production Design","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:27:53.513Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il gladiatore'
  AND `year` IS 2000;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q273978',
  `imdb_id` = 'tt0190332',
  `rotten_tomatoes_id` = 'm/crouching_tiger_hidden_dragon',
  `youtube_trailer_id` = 'EHhZ6EfEEQg',
  `trailer_title` = 'La tigre e il dragone 2000 Trailer sottotitolato',
  `trailer_channel` = 'Adoro Cinema',
  `imdb_rating` = '7.9/10',
  `rotten_tomatoes_score` = '97%',
  `awards` = '["Golden Globe per il miglior film straniero","Oscar al miglior film in lingua straniera","Golden Bauhinia Award for Best Film","Golden Horse Award for Best Feature Film","Hong Kong Film Award for Best Film","Premio Hugo per la miglior rappresentazione drammatica","Saturn Award per il miglior film d''azione/di avventura/thriller"]',
  `metadata_updated_at` = '2026-07-28T15:27:54.884Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'La tigre e il dragone'
  AND `year` IS 2000;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q190525',
  `imdb_id` = 'tt0209144',
  `rotten_tomatoes_id` = 'm/memento',
  `youtube_trailer_id` = 'F4k7-rNgh8Y',
  `trailer_title` = 'MEMENTO (film 2000) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.4/10',
  `rotten_tomatoes_score` = '94%',
  `awards` = '["national Board Review Top Ten Films","The Waldo Salt Screenwriting Award"]',
  `metadata_updated_at` = '2026-07-28T15:39:00.509Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Memento'
  AND `year` IS 2000;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q487181',
  `imdb_id` = 'tt0180093',
  `rotten_tomatoes_id` = 'm/requiem_for_a_dream',
  `youtube_trailer_id` = 'NEKjZSTo0Uk',
  `trailer_title` = 'Requiem for a Dream 25th Anniversary - 4K Lenticular Gift Box - Official Trailer',
  `trailer_channel` = 'Lionsgate Movies',
  `imdb_rating` = '8.3/10',
  `rotten_tomatoes_score` = '80%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:28:13.365Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Requiem for a Dream'
  AND `year` IS 2000;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q335160',
  `imdb_id` = 'tt0208092',
  `rotten_tomatoes_id` = 'm/snatch',
  `youtube_trailer_id` = 'W206IbOhd0w',
  `trailer_title` = 'Snatch - Lo strappo (film 2000) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '74%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:42:07.809Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Snatch - Lo strappo'
  AND `year` IS 2000;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q164103',
  `imdb_id` = 'tt0268978',
  `rotten_tomatoes_id` = 'm/beautiful_mind',
  `youtube_trailer_id` = '9wZM7CQY130',
  `trailer_title` = 'A Beautiful Mind (2001) Official HD Trailer [1080p]',
  `trailer_channel` = 'DeFilmBlog',
  `imdb_rating` = '8.2/10',
  `rotten_tomatoes_score` = '74%',
  `awards` = '["Oscar al miglior film","Oscar al miglior regista","Oscar alla miglior attrice non protagonista","Oscar alla migliore sceneggiatura non originale","Dallas-Fort Worth Film Critics Association Award per il miglior film"]',
  `metadata_updated_at` = '2026-07-28T15:28:15.510Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'A Beautiful Mind'
  AND `year` IS 2001;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q426828',
  `imdb_id` = 'tt0246578',
  `rotten_tomatoes_id` = 'm/donnie_darko',
  `youtube_trailer_id` = 'bzLn8sYeM9o',
  `trailer_title` = 'Donnie Darko - Trailer ufficiale',
  `trailer_channel` = 'Madman Films',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '87%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:28:18.543Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Donnie Darko'
  AND `year` IS 2001;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q102438',
  `imdb_id` = 'tt0241527',
  `rotten_tomatoes_id` = 'm/harry_potter_and_the_sorcerers_stone',
  `youtube_trailer_id` = '6iWegeSeLh4',
  `trailer_title` = 'Harry Potter e la pietra filosofale (film 2001) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '80%',
  `awards` = '["Critics'' Choice Award al miglior film per famiglie","Saturn Award per i migliori costumi"]',
  `metadata_updated_at` = '2026-07-28T15:46:57.566Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Harry Potter e la pietra filosofale'
  AND `year` IS 2001;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q127367',
  `imdb_id` = 'tt0120737',
  `rotten_tomatoes_id` = 'm/the_lord_of_the_rings_the_fellowship_of_the_ring',
  `youtube_trailer_id` = 'KwubSeCqu4E',
  `trailer_title` = 'il Signore degli Anelli: la Compagnia dell''Anello (film 2001) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.9/10',
  `rotten_tomatoes_score` = '91%',
  `awards` = '["BAFTA al miglior film","Oscar ai migliori effetti speciali","Oscar al miglior trucco","Oscar alla migliore colonna sonora","Oscar alla migliore fotografia","Premio Hugo per la miglior rappresentazione drammatica"]',
  `metadata_updated_at` = '2026-07-28T15:46:59.889Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il Signore degli Anelli - La Compagnia dell''Anello'
  AND `year` IS 2001;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q484048',
  `imdb_id` = 'tt0211915',
  `rotten_tomatoes_id` = 'm/amelie',
  `youtube_trailer_id` = 'Bzp-7OeINFY',
  `trailer_title` = 'Il favoloso mondo di Amélie (film 2001) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '90%',
  `awards` = '["Amanda Award for Best Foreign Feature Film","European Film Award - People''s Choice Award for Best Director","European Film Awards per il miglior film","European Film Awards per il miglior regista","European Film Awards per la miglior fotografia","Globo di Cristallo","Premio Lumière per il miglior film","Premio Lumière per la miglior attrice","Premio Lumière per la migliore sceneggiatura","Silver nugget for the best foreign film"]',
  `metadata_updated_at` = '2026-07-28T15:28:46.655Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il favoloso mondo di Amélie'
  AND `year` IS 2001;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q155653',
  `imdb_id` = 'tt0245429',
  `rotten_tomatoes_id` = 'm/spirited_away',
  `youtube_trailer_id` = '-zXTTk1CTM8',
  `trailer_title` = 'La città incantata | Trailer Ufficiale',
  `trailer_channel` = 'MYmovies',
  `imdb_rating` = '8.6/10',
  `rotten_tomatoes_score` = '96%',
  `awards` = '["Orso d''oro","Oscar al miglior film d''animazione","Animation Kobe Theatrical Film Award","Annie Award al miglior film d''animazione","Critics'' Choice Award al miglior film d''animazione"]',
  `metadata_updated_at` = '2026-07-28T15:28:48.040Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'La città incantata'
  AND `year` IS 2001;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q530812',
  `imdb_id` = 'tt0208990',
  `rotten_tomatoes_id` = 'm/la_stanza_del_figlio',
  `youtube_trailer_id` = 'zzamSDDEuRA',
  `trailer_title` = 'The Son''s Room  Official Trailer!',
  `trailer_channel` = 'isthemoviegood',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '85%',
  `awards` = '["David di Donatello per il miglior film","Palma d''oro"]',
  `metadata_updated_at` = '2026-07-28T15:42:11.302Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'La stanza del figlio'
  AND `year` IS 2001;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q272608',
  `imdb_id` = 'tt0166924',
  `rotten_tomatoes_id` = 'm/mulholland_dr',
  `youtube_trailer_id` = 'jbZJ487oJlY',
  `trailer_title` = 'Mulholland Drive | Official Trailer | Starring Naomi Watts',
  `trailer_channel` = 'StudiocanalUK',
  `imdb_rating` = '7.9/10',
  `rotten_tomatoes_score` = '84%',
  `awards` = '["Premio César per il miglior film straniero","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:28:49.979Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Mulholland Drive'
  AND `year` IS 2001;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q483815',
  `imdb_id` = 'tt0126029',
  `rotten_tomatoes_id` = 'm/shrek',
  `youtube_trailer_id` = 'YZYuipOx3lI',
  `trailer_title` = 'Shrek 5 | Teaser Trailer Ufficiale',
  `trailer_channel` = 'Universal Pictures International Italy',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '88%',
  `awards` = '["BAFTA''s Children & Young People Award - Feature Film","Oscar al miglior film d''animazione","Annie Award al miglior film d''animazione","Critics'' Choice Award al miglior film d''animazione"]',
  `metadata_updated_at` = '2026-07-28T15:28:49.285Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Shrek'
  AND `year` IS 2001;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q220741',
  `imdb_id` = 'tt0317248',
  `rotten_tomatoes_id` = 'm/city_of_god',
  `youtube_trailer_id` = 'A8KjXYW0Eug',
  `trailer_title` = 'City of God - La città di Dio (2002) - Trailer Italiano Ufficiale',
  `trailer_channel` = 'film__ita',
  `imdb_rating` = '8.6/10',
  `rotten_tomatoes_score` = '91%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:28:51.024Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'City of God - La città di Dio'
  AND `year` IS 2002;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q164963',
  `imdb_id` = 'tt0167261',
  `rotten_tomatoes_id` = 'm/the_lord_of_the_rings_the_two_towers',
  `youtube_trailer_id` = 'b3ckwVt3O7E',
  `trailer_title` = 'Il Signore degli Anelli - Le due torri (film 2002) TRAILER ITALIANO HD',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.8/10',
  `rotten_tomatoes_score` = '95%',
  `awards` = '["Oscar ai migliori effetti speciali","Oscar al miglior montaggio sonoro","Premio Hugo per la miglior rappresentazione drammatica, forma lunga"]',
  `metadata_updated_at` = '2026-07-28T15:28:51.376Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il Signore degli Anelli - Le due torri'
  AND `year` IS 2002;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q150804',
  `imdb_id` = 'tt0253474',
  `rotten_tomatoes_id` = 'm/pianist',
  `youtube_trailer_id` = 'yw4rVmRkqHw',
  `trailer_title` = 'Il pianista (film 2002) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.5/10',
  `rotten_tomatoes_score` = '95%',
  `awards` = '["BAFTA al miglior film","BAFTA al miglior regista","Oscar al miglior attore","Oscar al miglior regista","Oscar alla migliore sceneggiatura non originale","Palma d''oro","European Film Awards per la miglior fotografia","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:28:58.920Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il pianista'
  AND `year` IS 2002;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q208108',
  `imdb_id` = 'tt0264464',
  `rotten_tomatoes_id` = 'm/catch_me_if_you_can',
  `youtube_trailer_id` = 'GSdhIZeDla8',
  `trailer_title` = 'Prova a Prendermi (film 2002) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '96%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:28:59.220Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Prova a prendermi'
  AND `year` IS 2002;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q132863',
  `imdb_id` = 'tt0266543',
  `rotten_tomatoes_id` = 'm/finding_nemo',
  `youtube_trailer_id` = 'hKFKDwE73FI',
  `trailer_title` = 'Disney Pixar Alla Ricerca di Nemo 3D - Trailer Ufficiale italiano | HD',
  `trailer_channel` = 'Disney IT',
  `imdb_rating` = '8.2/10',
  `rotten_tomatoes_score` = '99%',
  `awards` = '["Oscar al miglior film d''animazione","Annie Award al miglior film d''animazione","Critics'' Choice Award al miglior film d''animazione","Genesis Awards","KCA al miglior film"]',
  `metadata_updated_at` = '2026-07-28T15:28:58.917Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Alla ricerca di Nemo'
  AND `year` IS 2003;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q131074',
  `imdb_id` = 'tt0167260',
  `rotten_tomatoes_id` = 'm/the_lord_of_the_rings_the_return_of_the_king',
  `youtube_trailer_id` = '_3Kndai9xRA',
  `trailer_title` = 'll Signore degli Anelli - il Ritorno del Re  (film 2003) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '9.0/10',
  `rotten_tomatoes_score` = '94%',
  `awards` = '["Oscar ai migliori costumi","Oscar ai migliori effetti speciali","Oscar al miglior film","Oscar al miglior montaggio","Oscar al miglior regista","Oscar al miglior sonoro","Oscar al miglior trucco","Oscar alla migliore canzone","Oscar alla migliore colonna sonora","Oscar alla migliore sceneggiatura non originale","Oscar alla migliore scenografia","Amanda Award for Best Foreign Feature Film","Dallas-Fort Worth Film Critics Association Award per il miglior film","International Cinephile Society Award for Best Film","Premio Hugo per la miglior rappresentazione drammatica, forma lunga"]',
  `metadata_updated_at` = '2026-07-28T15:29:00.811Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il Signore degli Anelli - Il ritorno del re'
  AND `year` IS 2003;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q165325',
  `imdb_id` = 'tt0266697',
  `rotten_tomatoes_id` = 'm/kill_bill_vol_1',
  `youtube_trailer_id` = '7kSuas6mRpk',
  `trailer_title` = 'Kill Bill: Vol. 1 (2003) Official Trailer - Uma Thurman, Lucy Liu Action Movie HD',
  `trailer_channel` = 'Rotten Tomatoes Classic Trailers',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '85%',
  `awards` = '["International Cinephile Society Award for Best Actress","MTV Movie Award al miglior cattivo"]',
  `metadata_updated_at` = '2026-07-28T15:42:13.691Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Kill Bill: Volume 1'
  AND `year` IS 2003;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q1217941',
  `imdb_id` = 'tt0346336',
  `rotten_tomatoes_id` = 'm/best_of_youth',
  `youtube_trailer_id` = 'Ildd37cdwgs',
  `trailer_title` = 'La meglio gioventù (film 2003) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.4/10',
  `rotten_tomatoes_score` = '94%',
  `awards` = '["David di Donatello per il miglior film"]',
  `metadata_updated_at` = '2026-07-28T15:29:00.433Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'La meglio gioventù'
  AND `year` IS 2003;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q107270',
  `imdb_id` = 'tt0335266',
  `rotten_tomatoes_id` = 'm/lost_in_translation',
  `youtube_trailer_id` = '3OPXdk48Fe8',
  `trailer_title` = 'Lost in Translation - L''amore tradotto (2003) - Trailer ITALIANO',
  `trailer_channel` = 'DrugO Lebowski',
  `imdb_rating` = '7.7/10',
  `rotten_tomatoes_score` = '95%',
  `awards` = '["BAFTA al miglior attore protagonista","BAFTA al miglior montaggio","BAFTA alla migliore attrice protagonista","Golden Globe per il miglior attore in un film commedia o musicale","Golden Globe per il miglior film commedia o musicale","Golden Globe per la migliore sceneggiatura","Oscar alla migliore sceneggiatura originale","Premio César per il miglior film straniero","Bodil Award for Best American Film","Boston Society of Film Critics Award per il miglior attore","Boston Society of Film Critics Award per il miglior regista","Boston Society of Film Critics Award per la migliore attrice","Chicago Film Critics Association Award for Best Screenplay","Chicago Film Critics Association Award per il miglior attore","Chicago Film Critics Association Award per la miglior fotografia","Chlotrudis Award for Best Director","Chlotrudis Award for Best Film","Chlotrudis Award for Best Original Screenplay","Florida Film Critics Circle Award for Best Screenplay","German Film Award for Best No-German Film","Independent Spirit Award per il miglior attore protagonista","Independent Spirit Award per il miglior regista","Independent Spirit Award per la miglior sceneggiatura","International Cinephile Society Award for Best Actor","Los Angeles Film Critics Association Award al miglior attore","national Board Review Top Ten Films","National Society of Film Critics Award per il miglior attore","New York Film Critics Circle Award al miglior attore protagonista","New York Film Critics Circle Award al miglior regista","Online Film Critics Society Award for Best Actor","Online Film Critics Society Award for Best Original Screenplay","San Francisco Film Critics Circle Award for Best Actor","San Francisco Film Critics Circle Award for Best Film","Satellite Award for Best Actor in a Musical or Comedy","Satellite Award per la migliore sceneggiatura originale","Southeastern Film Critics Association Award for Best Actor","Southeastern Film Critics Association Award for Best Original Screenplay","Toronto Film Critics Association Award for Best Actor","Toronto Film Critics Association Award for Best Film","Vancouver Film Critics Circle Award for Best Film","Washington D.C. Area Film Critics Association Award for Best Director","Washington D.C. Area Film Critics Association Award for Best Film","Washington D.C. Area Film Critics Association Award for Best Original Screenplay","Writers Guild of America Award for Best Original Screenplay"]',
  `metadata_updated_at` = '2026-07-28T15:42:16.420Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Lost in Translation - L''amore tradotto'
  AND `year` IS 2003;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q475693',
  `imdb_id` = 'tt0364569',
  `rotten_tomatoes_id` = 'm/oldboy',
  `youtube_trailer_id` = '_MBE9NAwJDU',
  `trailer_title` = 'Old Boy (2003) - Trailer ITALIANO',
  `trailer_channel` = 'DrugO Lebowski',
  `imdb_rating` = '8.3/10',
  `rotten_tomatoes_score` = '82%',
  `awards` = '["Grand Prix Speciale della Giuria","Premio al miglior film del Festival del Cinema di Sitges"]',
  `metadata_updated_at` = '2026-07-28T15:42:18.637Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Old Boy'
  AND `year` IS 2003;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q213326',
  `imdb_id` = 'tt0317705',
  `rotten_tomatoes_id` = 'm/the_incredibles',
  `youtube_trailer_id` = '1N-a6ZJqw94',
  `trailer_title` = 'Gli Incredibili 2 | Trailer italiano ufficiale | Disney•Pixar | HD',
  `trailer_channel` = 'Disney IT',
  `imdb_rating` = '8.0/10',
  `rotten_tomatoes_score` = '97%',
  `awards` = '["BAFTA''s Children & Young People Award - Feature Film","Oscar al miglior film d''animazione","Oscar al miglior montaggio sonoro","Annie Award al miglior film d''animazione","Annie Award for Best Character Animation","Critics'' Choice Award al miglior film d''animazione","KCA al miglior film","Premio Hugo per la miglior rappresentazione drammatica, forma lunga"]',
  `metadata_updated_at` = '2026-07-28T15:29:02.012Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Gli Incredibili'
  AND `year` IS 2004;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q29011',
  `imdb_id` = 'tt0347149',
  `rotten_tomatoes_id` = 'm/howls_moving_castle',
  `youtube_trailer_id` = 'iwROgK94zcM',
  `trailer_title` = 'Il castello errante di Howl - Trailer ufficiale',
  `trailer_channel` = 'Crunchyroll Store Australia',
  `imdb_rating` = '8.2/10',
  `rotten_tomatoes_score` = '88%',
  `awards` = '["Nebula Award for Best Script"]',
  `metadata_updated_at` = '2026-07-28T15:29:02.744Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il castello errante di Howl'
  AND `year` IS 2004;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q1058226',
  `imdb_id` = 'tt0398883',
  `rotten_tomatoes_id` = NULL,
  `youtube_trailer_id` = 'tP-V_br2bRs',
  `trailer_title` = 'LE CONSEGUENZE DELL'' AMORE (2004) Trailer cinematografico',
  `trailer_channel` = 'Nuovissimo Millefilm 2',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = NULL,
  `awards` = '["David di Donatello per il miglior attore protagonista","David di Donatello per il miglior film","David di Donatello per il miglior regista"]',
  `metadata_updated_at` = '2026-07-28T15:42:21.130Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Le conseguenze dell''amore'
  AND `year` IS 2004;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q184255',
  `imdb_id` = 'tt0405159',
  `rotten_tomatoes_id` = 'm/million_dollar_baby',
  `youtube_trailer_id` = 'mFJmJVgtARU',
  `trailer_title` = 'Million Dollar Baby: il film completo è su Chili (Trailer ufficiale italiano)',
  `trailer_channel` = 'CHILI IT',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '90%',
  `awards` = '["Oscar al miglior attore non protagonista","Oscar al miglior film","Oscar al miglior regista","Oscar alla miglior attrice","Premio César per il miglior film straniero","Dallas-Fort Worth Film Critics Association Award per il miglior film","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:29:03.840Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Million Dollar Baby'
  AND `year` IS 2004;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q208269',
  `imdb_id` = 'tt0338013',
  `rotten_tomatoes_id` = 'm/eternal_sunshine_of_the_spotless_mind',
  `youtube_trailer_id` = 'KeJJI9GMeLY',
  `trailer_title` = 'se mi lasci ti cancello trailer NON ufficiale',
  `trailer_channel` = 'paolo saracino',
  `imdb_rating` = '8.3/10',
  `rotten_tomatoes_score` = '93%',
  `awards` = '["Oscar alla migliore sceneggiatura originale","Saturn Award per il miglior film di fantascienza"]',
  `metadata_updated_at` = '2026-07-28T15:29:06.899Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Se mi lasci ti cancello'
  AND `year` IS 2004;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q166262',
  `imdb_id` = 'tt0372784',
  `rotten_tomatoes_id` = 'm/batman_begins',
  `youtube_trailer_id` = 'NKApsLjLbh0',
  `trailer_title` = 'Batman Begins - Teaser Trailer Ufficiale ITA',
  `trailer_channel` = 'Luca',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '85%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:29:03.992Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Batman Begins'
  AND `year` IS 2005;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q160618',
  `imdb_id` = 'tt0388795',
  `rotten_tomatoes_id` = 'm/brokeback_mountain',
  `youtube_trailer_id` = 'NB3MiovZ5bQ',
  `trailer_title` = 'I segreti di Brokeback Mountain - trailer ita HD',
  `trailer_channel` = 'clohill',
  `imdb_rating` = '7.7/10',
  `rotten_tomatoes_score` = '88%',
  `awards` = '["BAFTA al miglior film","Leone d''oro","Oscar al miglior regista","Oscar alla migliore colonna sonora","Oscar alla migliore sceneggiatura non originale","Dallas-Fort Worth Film Critics Association Award per il miglior film","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:42:23.651Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'I segreti di Brokeback Mountain'
  AND `year` IS 2005;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q218235',
  `imdb_id` = 'tt0367594',
  `rotten_tomatoes_id` = 'm/charlie_and_the_chocolate_factory',
  `youtube_trailer_id` = 'v64Ky_kxWdw',
  `trailer_title` = 'La Fabbrica di Cioccolato - Trailer Ufficiale',
  `trailer_channel` = 'Charlie e la Fabbrica di Cioccolato',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '83%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:29:05.303Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'La fabbrica di cioccolato'
  AND `year` IS 2005;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q5890',
  `imdb_id` = 'tt0434409',
  `rotten_tomatoes_id` = 'm/v_for_vendetta',
  `youtube_trailer_id` = '15xOie41Dbg',
  `trailer_title` = 'V per Vendetta: il film completo è su Chili (Trailer ufficiale italiano)',
  `trailer_channel` = 'CHILI IT',
  `imdb_rating` = '8.1/10',
  `rotten_tomatoes_score` = '73%',
  `awards` = '["Saturn Award per la miglior attrice"]',
  `metadata_updated_at` = '2026-07-28T15:29:27.927Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'V per Vendetta'
  AND `year` IS 2005;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q186323',
  `imdb_id` = 'tt0443453',
  `rotten_tomatoes_id` = 'm/borat',
  `youtube_trailer_id` = 'QgY6k6wU8YE',
  `trailer_title` = 'Borat ≣ 2006 ≣ Trailer ≣ German | Deutsch',
  `trailer_channel` = 'TrailerTracker',
  `imdb_rating` = '7.4/10',
  `rotten_tomatoes_score` = '91%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:42:26.821Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Borat'
  AND `year` IS 2006;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q151904',
  `imdb_id` = 'tt0381061',
  `rotten_tomatoes_id` = 'm/casino_royale',
  `youtube_trailer_id` = 'ZtbxeCJOl5c',
  `trailer_title` = 'CASINO ROYALE (2006) | Trailer italiano ufficiale del primo capitolo di James Bond con Daniel Craig',
  `trailer_channel` = 'MovieDigger',
  `imdb_rating` = '8.0/10',
  `rotten_tomatoes_score` = '94%',
  `awards` = '["BAFTA al miglior sonoro"]',
  `metadata_updated_at` = '2026-07-28T15:29:09.087Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Casino Royale'
  AND `year` IS 2006;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q223316',
  `imdb_id` = 'tt0458352',
  `rotten_tomatoes_id` = 'm/the_devil_wears_prada',
  `youtube_trailer_id` = '3qAP2PXdOXU',
  `trailer_title` = 'IL DIAVOLO VESTE PRADA 2 | Trailer Ufficiale | Italiano',
  `trailer_channel` = '20th Century Studios & Searchlight Pictures CH',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '75%',
  `awards` = '["national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:29:10.903Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il diavolo veste Prada'
  AND `year` IS 2006;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q216006',
  `imdb_id` = 'tt0457430',
  `rotten_tomatoes_id` = 'm/pans_labyrinth',
  `youtube_trailer_id` = 'jVZRnnVSQ8k',
  `trailer_title` = 'IL LABIRINTO DEL FAUNO - Trailer ufficiale - Regia di Guillermo del Toro',
  `trailer_channel` = 'StudiocanalUK',
  `imdb_rating` = '8.2/10',
  `rotten_tomatoes_score` = '95%',
  `awards` = '["Oscar al miglior trucco","Oscar alla migliore fotografia","Oscar alla migliore scenografia","Central Ohio Film Critics Association Award for Best Foreign Language Film","Ignotus Award for Best Audiovisual Production","Premio Hugo per la miglior rappresentazione drammatica, forma lunga","Saturn Award per il miglior film internazionale"]',
  `metadata_updated_at` = '2026-07-28T15:29:29.505Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il labirinto del fauno'
  AND `year` IS 2006;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q153882',
  `imdb_id` = 'tt0405094',
  `rotten_tomatoes_id` = 'm/the_lives_of_others',
  `youtube_trailer_id` = 'JPPl-aWB1To',
  `trailer_title` = 'Rental Family - Nelle Vite degli Altri | Trailer Ufficiale',
  `trailer_channel` = 'Searchlight Pictures Italia',
  `imdb_rating` = '8.4/10',
  `rotten_tomatoes_score` = '92%',
  `awards` = '["Oscar al miglior film in lingua straniera","Premio César per il miglior film straniero","Central Ohio Film Critics Association Award for Best Foreign Language Film","European Film Awards per il miglior attore","European Film Awards per il miglior film","European Film Awards per la miglior sceneggiatura"]',
  `metadata_updated_at` = '2026-07-28T15:29:12.702Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Le vite degli altri'
  AND `year` IS 2006;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q192073',
  `imdb_id` = 'tt0449059',
  `rotten_tomatoes_id` = 'm/little_miss_sunshine',
  `youtube_trailer_id` = 'HJubCsATvyk',
  `trailer_title` = 'Little Miss Sunshine – Trailer Italiano Non Ufficiale 🇮🇹',
  `trailer_channel` = 'BuddySergeant',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '91%',
  `awards` = '["Oscar al miglior attore non protagonista","Oscar alla migliore sceneggiatura originale","Premio César per il miglior film straniero","Grand prix du Festival de Deauville","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:29:26.470Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Little Miss Sunshine'
  AND `year` IS 2006;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q1881132',
  `imdb_id` = 'tt0772187',
  `rotten_tomatoes_id` = NULL,
  `youtube_trailer_id` = 'k4sr5T_f3BA',
  `trailer_title` = 'NOTTE PRIMA DEGLI ESAMI | Trailer italiano',
  `trailer_channel` = 'MovieDigger',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = NULL,
  `awards` = '["David di Donatello per il miglior film","David di Donatello per il miglior produttore","David di Donatello per il miglior regista esordiente","David di Donatello per la migliore sceneggiatura"]',
  `metadata_updated_at` = '2026-07-28T15:43:32.616Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Notte prima degli esami'
  AND `year` IS 2006;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q172975',
  `imdb_id` = 'tt0407887',
  `rotten_tomatoes_id` = 'm/departed',
  `youtube_trailer_id` = 'r-MiSNsCdQ4',
  `trailer_title` = 'The Departed - Il bene e il male | Trailer ufficiale 4K Ultra HD | Warner Bros. Entertainment',
  `trailer_channel` = 'Warner Bros. Entertainment',
  `imdb_rating` = '8.5/10',
  `rotten_tomatoes_score` = '91%',
  `awards` = '["Oscar al miglior film","Oscar al miglior montaggio","Oscar al miglior regista","Oscar alla migliore sceneggiatura non originale","Amanda Award for Best Foreign Feature Film","MTV Movie Award al miglior cattivo","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:29:31.034Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'The Departed - Il bene e il male'
  AND `year` IS 2006;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q46551',
  `imdb_id` = 'tt0482571',
  `rotten_tomatoes_id` = 'm/prestige',
  `youtube_trailer_id` = 'FDhJW75unJ8',
  `trailer_title` = 'THE PRESTIGE (2006) | Trailer italiano del film di Christopher Nolan con con Christian Bale',
  `trailer_channel` = 'MovieDigger',
  `imdb_rating` = '8.5/10',
  `rotten_tomatoes_score` = '77%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:42:29.642Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'The Prestige'
  AND `year` IS 2006;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q244315',
  `imdb_id` = 'tt0469494',
  `rotten_tomatoes_id` = 'm/there_will_be_blood',
  `youtube_trailer_id` = 'cCybATcWI3E',
  `trailer_title` = 'Il Petroliere (film 2007) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.2/10',
  `rotten_tomatoes_score` = '91%',
  `awards` = '["Oscar al miglior attore","Oscar alla migliore fotografia","Amanda Award for Best Foreign Feature Film"]',
  `metadata_updated_at` = '2026-07-28T15:42:32.068Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il petroliere'
  AND `year` IS 2007;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q269912',
  `imdb_id` = 'tt0758758',
  `rotten_tomatoes_id` = 'm/into_the_wild',
  `youtube_trailer_id` = 'jm_b3cPov2E',
  `trailer_title` = 'Into the Wild - Nelle terre selvagge (film 2007) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '83%',
  `awards` = '["national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:29:43.980Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Into the Wild - Nelle terre selvagge'
  AND `year` IS 2007;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q79503',
  `imdb_id` = 'tt0467406',
  `rotten_tomatoes_id` = 'm/juno',
  `youtube_trailer_id` = 'k0w4MCc_56o',
  `trailer_title` = 'Juno (film 2007) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '93%',
  `awards` = '["Oscar alla migliore sceneggiatura originale","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:43:35.388Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Juno'
  AND `year` IS 2007;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q183081',
  `imdb_id` = 'tt0477348',
  `rotten_tomatoes_id` = 'm/no_country_for_old_men',
  `youtube_trailer_id` = '8aBeITTDCxs',
  `trailer_title` = 'NON È UN PAESE PER VECCHI di Ethan e Joel Coen - Trailer italiano ufficiale',
  `trailer_channel` = 'Universal Pictures International Italy',
  `imdb_rating` = '8.2/10',
  `rotten_tomatoes_score` = '93%',
  `awards` = '["Oscar al miglior attore non protagonista","Oscar al miglior film","Oscar al miglior regista","Oscar alla migliore sceneggiatura non originale","Dallas-Fort Worth Film Critics Association Award per il miglior film","National Board of Review Award al miglior film","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:29:49.960Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Non è un paese per vecchi'
  AND `year` IS 2007;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q170035',
  `imdb_id` = 'tt0382932',
  `rotten_tomatoes_id` = 'm/ratatouille',
  `youtube_trailer_id` = 'eNKLaULSFkc',
  `trailer_title` = 'Ratatouille - Trailer italiano ufficiale',
  `trailer_channel` = 'film__ita',
  `imdb_rating` = '8.1/10',
  `rotten_tomatoes_score` = '96%',
  `awards` = '["Oscar al miglior film d''animazione","Annie Award al miglior film d''animazione","Critics'' Choice Award al miglior film d''animazione","KCA al miglior film d''animazione"]',
  `metadata_updated_at` = '2026-07-28T15:29:59.854Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Ratatouille'
  AND `year` IS 2007;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q1165770',
  `imdb_id` = 'tt0929425',
  `rotten_tomatoes_id` = 'm/gomorrah',
  `youtube_trailer_id` = 'HT7Wok6jPzI',
  `trailer_title` = 'GOMORRAH - Official Trailer - Italian Crime Drama',
  `trailer_channel` = 'StudiocanalUK',
  `imdb_rating` = '7.0/10',
  `rotten_tomatoes_score` = '91%',
  `awards` = '["David di Donatello per il miglior film","David di Donatello per il miglior regista","European Film Awards per il miglior attore","European Film Awards per il miglior film","European Film Awards per il miglior regista","European Film Awards per la miglior fotografia","European Film Awards per la miglior sceneggiatura","Grand Prix Speciale della Giuria"]',
  `metadata_updated_at` = '2026-07-28T15:30:01.670Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Gomorra'
  AND `year` IS 2008;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q126699',
  `imdb_id` = 'tt1205489',
  `rotten_tomatoes_id` = 'm/gran_torino',
  `youtube_trailer_id` = 'D6wR1SGIAmo',
  `trailer_title` = 'Gran Torino - Il primo trailer ufficiale in HD',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '81%',
  `awards` = '["Premio César per il miglior film straniero","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:30:03.056Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Gran Torino'
  AND `year` IS 2008;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q163872',
  `imdb_id` = 'tt0468569',
  `rotten_tomatoes_id` = 'm/the_dark_knight',
  `youtube_trailer_id` = '6Mvl_s-9clE',
  `trailer_title` = 'Il Cavaliere Oscuro - Primo trailer italiano ufficiale',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = '9.1/10',
  `rotten_tomatoes_score` = '94%',
  `awards` = '["Oscar al miglior attore non protagonista","Oscar al miglior montaggio sonoro","MTV Movie Award al miglior cattivo","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:30:04.715Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il cavaliere oscuro'
  AND `year` IS 2008;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q115385',
  `imdb_id` = 'tt1023490',
  `rotten_tomatoes_id` = 'm/il_divo',
  `youtube_trailer_id` = 'cw-qm-liCPA',
  `trailer_title` = 'Official US IL DIVO Trailer',
  `trailer_channel` = 'MPI Home Video',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '92%',
  `awards` = '["David di Donatello per i migliori effetti speciali visivi","David di Donatello per il miglior attore protagonista","David di Donatello per il miglior trucco","David di Donatello per il migliore autore della fotografia","David di Donatello per la migliore acconciatura","European Film Awards per il miglior attore","Premio della giuria"]',
  `metadata_updated_at` = '2026-07-28T15:30:23.601Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il divo'
  AND `year` IS 2008;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q244931',
  `imdb_id` = 'tt0780536',
  `rotten_tomatoes_id` = 'm/in_bruges',
  `youtube_trailer_id` = 'abhTYv9cS-M',
  `trailer_title` = 'In Bruges - La coscienza dell''assassino (film 2008) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '84%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:30:06.670Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'In Bruges - La coscienza dell''assassino'
  AND `year` IS 2008;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q125076',
  `imdb_id` = 'tt1010048',
  `rotten_tomatoes_id` = 'm/slumdog_millionaire',
  `youtube_trailer_id` = 'CtSTC4OmN6Q',
  `trailer_title` = 'The Millionaire - trailer ita 1080 HD',
  `trailer_channel` = 'clohill',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '92%',
  `awards` = '["BAFTA al miglior film","Golden Globe per il miglior film drammatico","Golden Globe per la migliore colonna sonora originale","Oscar al miglior film","Oscar al miglior montaggio","Oscar al miglior regista","Oscar al miglior sonoro","Oscar alla migliore colonna sonora","Oscar alla migliore fotografia","Oscar alla migliore sceneggiatura non originale","Amanda Award for Best Foreign Feature Film","Dallas-Fort Worth Film Critics Association Award per il miglior film","European Film Awards per la miglior fotografia","National Board of Review Award al miglior film","national Board Review Top Ten Films","Premio del pubblico al miglior film europeo"]',
  `metadata_updated_at` = '2026-07-28T15:47:02.740Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'The Millionaire'
  AND `year` IS 2008;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q104905',
  `imdb_id` = 'tt0910970',
  `rotten_tomatoes_id` = 'm/wall_e',
  `youtube_trailer_id` = '81nYibxXWCo',
  `trailer_title` = 'WALL•E Official Trailer',
  `trailer_channel` = 'Disney IT',
  `imdb_rating` = '8.4/10',
  `rotten_tomatoes_score` = '95%',
  `awards` = '["BAFTA al miglior film d''animazione","BAFTA''s Children & Young People Award - Feature Film","Golden Globe per il miglior film d''animazione","Oscar al miglior film d''animazione","Animation Kobe Theatrical Film Award","Critics'' Choice Award al miglior film d''animazione","Los Angeles Film Critics Association Award al miglior film","national Board Review Top Ten Films","Nebula Award for Best Script","Premio Hugo per la miglior rappresentazione drammatica, forma lunga","Satellite Award per il miglior film d''animazione o a tecnica mista"]',
  `metadata_updated_at` = '2026-07-28T15:30:25.320Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'WALL·E'
  AND `year` IS 2008;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q24871',
  `imdb_id` = 'tt0499549',
  `rotten_tomatoes_id` = 'm/avatar',
  `youtube_trailer_id` = 'iF6v4BVnkmY',
  `trailer_title` = 'AVATAR: THE WAY OF WATER | Teaser Trailer Ufficiale #1 | Italiano',
  `trailer_channel` = '20th Century Studios & Searchlight Pictures CH',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '81%',
  `awards` = '["Golden Globe per il miglior film drammatico","Golden Globe per il miglior regista","Oscar ai migliori effetti speciali","Oscar alla migliore fotografia","Oscar alla migliore scenografia","Nastro d''argento al migliore film in 3D","Saturn Award for Best Production Design","Saturn Award per la miglior regia"]',
  `metadata_updated_at` = '2026-07-28T15:30:26.485Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Avatar'
  AND `year` IS 2009;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q153723',
  `imdb_id` = 'tt0361748',
  `rotten_tomatoes_id` = 'm/inglourious_basterds',
  `youtube_trailer_id` = 'hElgeePRb-Y',
  `trailer_title` = 'Bastardi senza gloria (film 2009) TRAILER ITALIANO',
  `trailer_channel` = 'HOME CINEMA TRAILER',
  `imdb_rating` = '8.4/10',
  `rotten_tomatoes_score` = '89%',
  `awards` = '["Oscar al miglior attore non protagonista","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:30:33.346Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Bastardi senza gloria'
  AND `year` IS 2009;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q201819',
  `imdb_id` = 'tt1136608',
  `rotten_tomatoes_id` = 'm/district_9',
  `youtube_trailer_id` = 'DyLUwOcR5pk',
  `trailer_title` = 'District 9 - Official Trailer (HD)',
  `trailer_channel` = 'Sony Pictures Entertainment',
  `imdb_rating` = '7.9/10',
  `rotten_tomatoes_score` = '90%',
  `awards` = '["Saturn Award per il miglior film internazionale"]',
  `metadata_updated_at` = '2026-07-28T15:30:41.649Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'District 9'
  AND `year` IS 2009;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q1061541',
  `imdb_id` = 'tt1235166',
  `rotten_tomatoes_id` = 'm/1213205-prophet',
  `youtube_trailer_id` = 'sAn2JS0A_Vg',
  `trailer_title` = 'IL PROFETA - trailer ufficiale',
  `trailer_channel` = 'bimdistribuzione',
  `imdb_rating` = '7.8/10',
  `rotten_tomatoes_score` = '96%',
  `awards` = '["BAFTA Award for Best Film Not in the English Language","Premio César per il miglior film","Premio César per il miglior montaggio","Premio César per il miglior regista","Premio César per il migliore attore","Premio César per il migliore attore non protagonista","Premio César per la migliore fotografia","Premio César per la migliore promessa maschile","Premio César per la migliore sceneggiatura originale","Premio César per la migliore scenografia","British Independent Film Award al miglior film indipendente internazionale","European Film Academy Prix d''Excellence","European Film Awards per il miglior attore","Grand Prix Speciale della Giuria","International Cinephile Society Award for Best Director","International Cinephile Society Award for Best Film","International Cinephile Society Award for Best Supporting Actor","National Board of Review Award al miglior film straniero","premio Louis-Delluc"]',
  `metadata_updated_at` = '2026-07-28T15:47:23.869Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il profeta'
  AND `year` IS 2009;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q219315',
  `imdb_id` = 'tt1119646',
  `rotten_tomatoes_id` = 'm/10010667-hangover',
  `youtube_trailer_id` = 'lk7O0ktB7Uw',
  `trailer_title` = 'Una notte da leoni - Il primo trailer ufficiale in esclusiva!',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = '7.7/10',
  `rotten_tomatoes_score` = '79%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:30:35.680Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Una notte da leoni'
  AND `year` IS 2009;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q174811',
  `imdb_id` = 'tt1049413',
  `rotten_tomatoes_id` = 'm/up',
  `youtube_trailer_id` = 'HWEW_qTLSEE',
  `trailer_title` = 'UP Official Trailer',
  `trailer_channel` = 'Pixar',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '98%',
  `awards` = '["BAFTA''s Children & Young People Award - Feature Film","Oscar al miglior film d''animazione","Oscar alla migliore colonna sonora","Annie Award al miglior film d''animazione","Critics'' Choice Award al miglior film d''animazione","Genesis Awards","KCA al miglior film d''animazione","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:30:37.986Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Up'
  AND `year` IS 2009;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q532579',
  `imdb_id` = 'tt1529235',
  `rotten_tomatoes_id` = NULL,
  `youtube_trailer_id` = 'tjk7wlNn_RI',
  `trailer_title` = 'Benvenuti al Sud - Trailer Ufficiale Italiano - HD',
  `trailer_channel` = 'MegaVideoCinemaTvHD',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = NULL,
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:30:40.087Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Benvenuti al Sud'
  AND `year` IS 2010;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q180214',
  `imdb_id` = 'tt0947798',
  `rotten_tomatoes_id` = 'm/black_swan_2010',
  `youtube_trailer_id` = 'JP4iAg1Af2A',
  `trailer_title` = 'Il cigno nero | Trailer ufficiale [HD] | 20th Century Fox',
  `trailer_channel` = '20th Century Studios Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '85%',
  `awards` = '["Oscar alla miglior attrice","Tromsø International Film Festival''s audience award","TV Krant Filmposter Award"]',
  `metadata_updated_at` = '2026-07-28T15:31:01.502Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il cigno nero'
  AND `year` IS 2010;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q160060',
  `imdb_id` = 'tt1504320',
  `rotten_tomatoes_id` = 'm/the_kings_speech',
  `youtube_trailer_id` = 'YaW3lyOYcA0',
  `trailer_title` = 'Trailer ufficiale del film IL DISCORSO DEL RE',
  `trailer_channel` = 'Eagle Pictures',
  `imdb_rating` = '8.0/10',
  `rotten_tomatoes_score` = '94%',
  `awards` = '["BAFTA al miglior film","Oscar al miglior attore","Oscar al miglior film","Oscar al miglior regista","Oscar alla migliore sceneggiatura originale","European Film Awards per il miglior attore","European Film Awards per il miglior montaggio","national Board Review Top Ten Films","Premio del pubblico al miglior film europeo"]',
  `metadata_updated_at` = '2026-07-28T15:31:01.768Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il discorso del re'
  AND `year` IS 2010;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q25188',
  `imdb_id` = 'tt1375666',
  `rotten_tomatoes_id` = 'm/inception',
  `youtube_trailer_id` = 'ZVbG_OIRPfE',
  `trailer_title` = 'Inception - Il secondo trailer ufficiale in esclusiva e in HD',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = '8.8/10',
  `rotten_tomatoes_score` = '87%',
  `awards` = '["national Board Review Top Ten Films","Oscar ai migliori effetti speciali","Oscar al miglior montaggio sonoro","Oscar al miglior sonoro","Oscar alla migliore fotografia","Premio Hugo per la miglior rappresentazione drammatica, forma lunga","Saturn Award per il miglior film di fantascienza"]',
  `metadata_updated_at` = '2026-07-28T15:19:45.559Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Inception'
  AND `year` IS 2010;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q2171533',
  `imdb_id` = 'tt1612774',
  `rotten_tomatoes_id` = 'm/rubber',
  `youtube_trailer_id` = '6XM7oCKC-L8',
  `trailer_title` = 'RUBBER - Trailer - Il miglior film di sempre sui pneumatici',
  `trailer_channel` = 'StudiocanalUK',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '68%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:42:35.057Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Rubber'
  AND `year` IS 2010;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q210364',
  `imdb_id` = 'tt1130884',
  `rotten_tomatoes_id` = 'm/1198124-shutter_island',
  `youtube_trailer_id` = '5iaYLCiq5RM',
  `trailer_title` = '"Shutter Island" - Official Trailer [HD]',
  `trailer_channel` = 'watchCulturetainment',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '68%',
  `awards` = '["national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:31:03.638Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Shutter Island'
  AND `year` IS 2010;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q185888',
  `imdb_id` = 'tt1285016',
  `rotten_tomatoes_id` = 'm/the-social-network',
  `youtube_trailer_id` = 'uctcm8C6x3E',
  `trailer_title` = 'The Social Network - nuovo trailer ufficiale',
  `trailer_channel` = 'Sony Pictures Italia',
  `imdb_rating` = '7.8/10',
  `rotten_tomatoes_score` = '96%',
  `awards` = '["Oscar al miglior montaggio","Oscar alla migliore colonna sonora","Oscar alla migliore sceneggiatura non originale","Premio César per il miglior film straniero","Dallas-Fort Worth Film Critics Association Award per il miglior film","i 100 migliori film del XXI secolo secondo la BBC","National Board of Review Award al miglior film","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:31:04.435Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'The Social Network'
  AND `year` IS 2010;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q187278',
  `imdb_id` = 'tt0435761',
  `rotten_tomatoes_id` = 'm/toy_story_3',
  `youtube_trailer_id` = '2Gu6hs4v_Q4',
  `trailer_title` = 'TOY STORY 3 - Il trailer italiano',
  `trailer_channel` = 'Disney IT',
  `imdb_rating` = '8.3/10',
  `rotten_tomatoes_score` = '98%',
  `awards` = '["Oscar al miglior film d''animazione","Critics'' Choice Award al miglior film d''animazione","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:42:37.310Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Toy Story 3 - La grande fuga'
  AND `year` IS 2010;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q732960',
  `imdb_id` = 'tt0780504',
  `rotten_tomatoes_id` = 'm/drive_2011',
  `youtube_trailer_id` = 'oFiLrgCuFXo',
  `trailer_title` = 'Baby Driver - Il genio della fuga | Trailer ufficiale italiano',
  `trailer_channel` = 'Sony Pictures Italia',
  `imdb_rating` = '7.8/10',
  `rotten_tomatoes_score` = '93%',
  `awards` = '["Amanda Award for Best Foreign Feature Film","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:31:05.683Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Drive'
  AND `year` IS 2011;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q206124',
  `imdb_id` = 'tt1605783',
  `rotten_tomatoes_id` = 'm/midnight_in_paris',
  `youtube_trailer_id` = 'FAfR8omt-CY',
  `trailer_title` = 'Midnight in Paris | Official Trailer HD (2011)',
  `trailer_channel` = 'Sony Pictures Classics',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '93%',
  `awards` = '["Oscar alla migliore sceneggiatura originale"]',
  `metadata_updated_at` = '2026-07-28T15:31:06.487Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Midnight in Paris'
  AND `year` IS 2011;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q595',
  `imdb_id` = 'tt1675434',
  `rotten_tomatoes_id` = 'm/the_intouchables',
  `youtube_trailer_id` = 'hy4P-EYzzFE',
  `trailer_title` = 'Quasi amici  TRAILER ufficiale ita',
  `trailer_channel` = 'Mattia Montefusco',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '76%',
  `awards` = '["David di Donatello per il miglior film dell''Unione europea","Satellite Award per il miglior film in lingua straniera"]',
  `metadata_updated_at` = '2026-07-28T15:31:06.960Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Quasi amici'
  AND `year` IS 2011;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q171861',
  `imdb_id` = 'tt1655442',
  `rotten_tomatoes_id` = 'm/the_artist',
  `youtube_trailer_id` = 'dMx_mbM2ut0',
  `trailer_title` = 'Trailer - The Artist - Il trailer italiano del film - Film (2011) da sito ufficiale',
  `trailer_channel` = 'Oltrecultura',
  `imdb_rating` = '7.8/10',
  `rotten_tomatoes_score` = '95%',
  `awards` = '["Golden Globe per il miglior attore in un film commedia o musicale","Oscar ai migliori costumi","Oscar al miglior attore","Oscar al miglior film","Oscar al miglior regista","Oscar alla migliore colonna sonora","Premio César per il miglior film","European Film Awards per la miglior colonna sonora","national Board Review Top Ten Films","Palm Dog Award","Premio Lumière per il miglior film"]',
  `metadata_updated_at` = '2026-07-28T15:31:08.495Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'The Artist'
  AND `year` IS 2011;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q640561',
  `imdb_id` = 'tt1832382',
  `rotten_tomatoes_id` = 'm/a_separation_2011',
  `youtube_trailer_id` = '58Onuy5USTc',
  `trailer_title` = 'A Separation | Official Trailer HD (2011)',
  `trailer_channel` = 'Sony Pictures Classics',
  `imdb_rating` = '8.3/10',
  `rotten_tomatoes_score` = '99%',
  `awards` = '["Orso d''oro","Oscar al miglior film in lingua straniera","Premio César per il miglior film straniero","Asia Pacific Screen Award for Best Feature Film","Orso d''argento per il miglior attore","Orso d''argento per la migliore attrice"]',
  `metadata_updated_at` = '2026-07-28T15:47:01.977Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Una separazione'
  AND `year` IS 2011;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q637820',
  `imdb_id` = 'tt1602620',
  `rotten_tomatoes_id` = 'm/amour_2013',
  `youtube_trailer_id` = 'F7D-Y3T0XFA',
  `trailer_title` = 'Amour (2012) - Official Trailer [HD]',
  `trailer_channel` = '@HOLLYWOOD',
  `imdb_rating` = '7.9/10',
  `rotten_tomatoes_score` = '93%',
  `awards` = '["Oscar al miglior film in lingua straniera","Palma d''oro","European Film Awards per il miglior attore","European Film Awards per il miglior film","European Film Awards per il miglior regista","European Film Awards per la miglior attrice"]',
  `metadata_updated_at` = '2026-07-28T15:47:06.663Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Amour'
  AND `year` IS 2012;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q59653',
  `imdb_id` = 'tt1024648',
  `rotten_tomatoes_id` = 'm/argo_2012',
  `youtube_trailer_id` = 'tVDZxevktOE',
  `trailer_title` = 'Argo - Trailer italiano ufficiale in HD',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = '7.7/10',
  `rotten_tomatoes_score` = '96%',
  `awards` = '["BAFTA al miglior film","Oscar al miglior film","Oscar al miglior montaggio","Oscar alla migliore sceneggiatura non originale","Premio César per il miglior film straniero","Dorian Award for Film of the Year","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:47:18.045Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Argo'
  AND `year` IS 2012;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q571032',
  `imdb_id` = 'tt1853728',
  `rotten_tomatoes_id` = 'm/django_unchained_2012',
  `youtube_trailer_id` = 'Sb0Jq_RnUwA',
  `trailer_title` = 'Django Unchained - Nuovo trailer ufficiale in italiano HD',
  `trailer_channel` = 'Sony Pictures Italia',
  `imdb_rating` = '8.5/10',
  `rotten_tomatoes_score` = '87%',
  `awards` = '["Oscar al miglior attore non protagonista","Oscar alla migliore sceneggiatura originale","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:31:36.851Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Django Unchained'
  AND `year` IS 2012;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q189330',
  `imdb_id` = 'tt1345836',
  `rotten_tomatoes_id` = 'm/the_dark_knight_rises',
  `youtube_trailer_id` = 'UwU4WpPRSvA',
  `trailer_title` = 'Il Cavaliere Oscuro - Il Ritorno | Primo trailer italiano ufficiale',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '87%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:31:36.150Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il cavaliere oscuro - Il ritorno'
  AND `year` IS 2012;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q4941',
  `imdb_id` = 'tt1074638',
  `rotten_tomatoes_id` = 'm/skyfall',
  `youtube_trailer_id` = 'eo_YbFbnYG4',
  `trailer_title` = '007 Skyfall - Trailer ufficiale italiano',
  `trailer_channel` = 'Sony Pictures Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '92%',
  `awards` = '["Oscar al miglior montaggio sonoro"]',
  `metadata_updated_at` = '2026-07-28T15:31:36.598Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Skyfall'
  AND `year` IS 2012;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q182218',
  `imdb_id` = 'tt0848228',
  `rotten_tomatoes_id` = 'm/marvels_the_avengers',
  `youtube_trailer_id` = 'WJvZI33O_J4',
  `trailer_title` = 'The Avengers  - Trailer Ufficiale italiano',
  `trailer_channel` = 'TopGirlTopYou',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '91%',
  `awards` = '["MTV Movie Award al miglior cattivo","Premio Hugo per la miglior rappresentazione drammatica, forma lunga","Saturn Award per il miglior film di fantascienza"]',
  `metadata_updated_at` = '2026-07-28T15:31:38.463Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'The Avengers'
  AND `year` IS 2012;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q152780',
  `imdb_id` = 'tt0454876',
  `rotten_tomatoes_id` = 'm/life-of-pi',
  `youtube_trailer_id` = 'VaY9exBvJfs',
  `trailer_title` = 'La Vita di Adele - Trailer Ufficiale Italiano',
  `trailer_channel` = 'Lucky Red',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '86%',
  `awards` = '["BAFTA''s Children & Young People Award - Feature Film","Oscar ai migliori effetti speciali","Oscar al miglior regista","Oscar alla migliore colonna sonora","Oscar alla migliore fotografia","TV Krant Filmposter Award"]',
  `metadata_updated_at` = '2026-07-28T15:31:38.213Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Vita di Pi'
  AND `year` IS 2012;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q3023357',
  `imdb_id` = 'tt2024544',
  `rotten_tomatoes_id` = 'm/12_years_a_slave',
  `youtube_trailer_id` = '8PQYQ_Cfz0U',
  `trailer_title` = '12 Anni Schiavo - Trailer ufficiale italiano',
  `trailer_channel` = 'bimdistribuzione',
  `imdb_rating` = '8.1/10',
  `rotten_tomatoes_score` = '95%',
  `awards` = '["BAFTA al miglior film","Golden Globe per il miglior film drammatico","Oscar al miglior film","Oscar alla miglior attrice non protagonista","Oscar alla migliore sceneggiatura non originale","AACTA al miglior attore internazionale","Critics'' Choice Movie Award al miglior film","Dallas-Fort Worth Film Critics Association Award per il miglior film","Dorian Award for Film of the Year","Independent Spirit Award per la miglior fotografia","Independent Spirit Award per la miglior sceneggiatura","national Board Review Top Ten Films","Satellite Award per il miglior film","Toronto International Film Festival People''s Choice Award"]',
  `metadata_updated_at` = '2026-07-28T15:31:39.077Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = '12 anni schiavo'
  AND `year` IS 2013;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q2579784',
  `imdb_id` = 'tt1454468',
  `rotten_tomatoes_id` = 'm/gravity_2013',
  `youtube_trailer_id` = 'Z2An9nmjOR8',
  `trailer_title` = 'Gravity - Nuovo Trailer Ufficiale Italiano | HD',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = '7.7/10',
  `rotten_tomatoes_score` = '96%',
  `awards` = '["Oscar ai migliori effetti speciali","Oscar al miglior montaggio","Oscar al miglior montaggio sonoro","Oscar al miglior regista","Oscar al miglior sonoro","Oscar alla migliore colonna sonora","Oscar alla migliore fotografia","AACTA al miglior film internazionale","Empire Awards per il miglior film","Los Angeles Film Critics Association Award al miglior film","national Board Review Top Ten Films","Premio Hugo per la miglior rappresentazione drammatica, forma lunga","Saturn Award per il miglior film di fantascienza"]',
  `metadata_updated_at` = '2026-07-28T15:31:40.395Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Gravity'
  AND `year` IS 2013;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q788822',
  `imdb_id` = 'tt1798709',
  `rotten_tomatoes_id` = 'm/her',
  `youtube_trailer_id` = 'ne6p6MfLBxc',
  `trailer_title` = 'Her - Official Trailer 2 [HD]',
  `trailer_channel` = 'Warner Bros.',
  `imdb_rating` = '8.0/10',
  `rotten_tomatoes_score` = '94%',
  `awards` = '["Golden Globe per la migliore sceneggiatura","Oscar alla migliore sceneggiatura originale","Critics'' Choice Movie Award alla migliore sceneggiatura","National Board of Review Award al miglior film","national Board Review Top Ten Films","Saturn Award per il miglior film fantasy","Writers Guild of America Award for Best Original Screenplay"]',
  `metadata_updated_at` = '2026-07-28T15:31:39.989Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Her'
  AND `year` IS 2013;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q6379279',
  `imdb_id` = 'tt2358891',
  `rotten_tomatoes_id` = 'm/the_great_beauty',
  `youtube_trailer_id` = 'xo9t7Ce_dU8',
  `trailer_title` = 'La Grande Bellezza - Trailer ufficiale in italiano (2013)',
  `trailer_channel` = 'Cinema e Tv',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '91%',
  `awards` = '["BAFTA Award for Best Film Not in the English Language","David di Donatello per il miglior regista","Golden Globe per il miglior film straniero","Oscar al miglior film in lingua straniera","Amanda Award for Best Foreign Feature Film","European Film Awards per il miglior attore","European Film Awards per il miglior film","European Film Awards per il miglior montaggio","European Film Awards per il miglior regista"]',
  `metadata_updated_at` = '2026-07-28T15:31:40.936Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'La grande bellezza'
  AND `year` IS 2013;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q3404003',
  `imdb_id` = 'tt1392214',
  `rotten_tomatoes_id` = 'm/prisoners_2013',
  `youtube_trailer_id` = 'XbmM0QIXNG4',
  `trailer_title` = 'Prisoners - Nuovo Trailer Ufficiale Italiano | HD',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = '8.2/10',
  `rotten_tomatoes_score` = '81%',
  `awards` = '["national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:31:42.010Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Prisoners'
  AND `year` IS 2013;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q1392744',
  `imdb_id` = 'tt0993846',
  `rotten_tomatoes_id` = 'm/the_wolf_of_wall_street_2013',
  `youtube_trailer_id` = 'iszwuX1AK6A',
  `trailer_title` = 'The Wolf of Wall Street Official Trailer',
  `trailer_channel` = 'Paramount Pictures',
  `imdb_rating` = '8.2/10',
  `rotten_tomatoes_score` = '80%',
  `awards` = '["national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:31:41.605Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'The Wolf of Wall Street'
  AND `year` IS 2013;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q13255497',
  `imdb_id` = 'tt2562232',
  `rotten_tomatoes_id` = 'm/birdman_2014',
  `youtube_trailer_id` = 'Dd3xWZjWFzg',
  `trailer_title` = 'Birdman - O L''imprevedibile virtù dell''ignoranza | Trailer Ufficiale HD | 2014',
  `trailer_channel` = '20th Century Studios Italia',
  `imdb_rating` = '7.7/10',
  `rotten_tomatoes_score` = '91%',
  `awards` = '["Oscar al miglior film","Oscar al miglior regista","Oscar alla migliore fotografia","Oscar alla migliore sceneggiatura originale","AACTA al miglior film internazionale","Dallas-Fort Worth Film Critics Association Award per il miglior film","Florida Film Critics Circle Award for Best Film","Independent Spirit Award per il miglior film","Las Vegas Film Critics Society Award per il miglior film","national Board Review Top Ten Films","Satellite Award per il miglior film"]',
  `metadata_updated_at` = '2026-07-28T15:31:46.462Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Birdman'
  AND `year` IS 2014;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q4103201',
  `imdb_id` = 'tt1065073',
  `rotten_tomatoes_id` = 'm/boyhood',
  `youtube_trailer_id` = 'oONTvACrOug',
  `trailer_title` = 'Boyhood di Richard Linklater - Trailer italiano ufficiale',
  `trailer_channel` = 'Universal Pictures International Italy',
  `imdb_rating` = '7.9/10',
  `rotten_tomatoes_score` = '97%',
  `awards` = '["BAFTA al miglior film","Oscar alla miglior attrice non protagonista","Dorian Award for Film of the Year","FIPRESCI Grand Prix","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:31:43.484Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Boyhood'
  AND `year` IS 2014;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q3521099',
  `imdb_id` = 'tt2278388',
  `rotten_tomatoes_id` = 'm/the_grand_budapest_hotel',
  `youtube_trailer_id` = '6bdLeEEOEXA',
  `trailer_title` = 'Grand Budapest Hotel | Trailer ufficiale HD | 2014',
  `trailer_channel` = '20th Century Studios Italia',
  `imdb_rating` = '8.1/10',
  `rotten_tomatoes_score` = '92%',
  `awards` = '["Oscar ai migliori costumi","Oscar al miglior trucco","Oscar alla migliore colonna sonora","Oscar alla migliore scenografia","Orso d''argento, gran premio della giuria"]',
  `metadata_updated_at` = '2026-07-28T15:31:44.710Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Grand Budapest Hotel'
  AND `year` IS 2014;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q13417189',
  `imdb_id` = 'tt0816692',
  `rotten_tomatoes_id` = 'm/interstellar_2014',
  `youtube_trailer_id` = 'gnOCZhluoow',
  `trailer_title` = 'Interstellar - Nuovo Trailer Ufficiale Italiano | HD',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = '8.7/10',
  `rotten_tomatoes_score` = '73%',
  `awards` = '["Oscar ai migliori effetti speciali","Saturn Award per il miglior film di fantascienza"]',
  `metadata_updated_at` = '2026-07-28T15:31:47.946Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Interstellar'
  AND `year` IS 2014;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q15732802',
  `imdb_id` = 'tt2911666',
  `rotten_tomatoes_id` = 'm/john_wick',
  `youtube_trailer_id` = 'puoCudROYi0',
  `trailer_title` = 'John Wick Capitolo 2 (Keanu Reeves) - Trailer italiano ufficiale [HD]',
  `trailer_channel` = 'Eagle Pictures',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '86%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:31:50.611Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'John Wick'
  AND `year` IS 2014;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q14920425',
  `imdb_id` = 'tt2267998',
  `rotten_tomatoes_id` = 'm/gone_girl',
  `youtube_trailer_id` = 'Ax3ptN5ZtUw',
  `trailer_title` = 'L''amore bugiardo - Gone Girl | Trailer Ufficiale [HD] | 20th Century Fox Italia',
  `trailer_channel` = '20th Century Studios Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '88%',
  `awards` = '["national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:47:12.946Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'L''amore bugiardo - Gone Girl'
  AND `year` IS 2014;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q16606856',
  `imdb_id` = 'tt3438354',
  `rotten_tomatoes_id` = 'm/smetto_quando_voglio',
  `youtube_trailer_id` = 'seEhOShK0cc',
  `trailer_title` = 'Smetto Quando Voglio - Trailer Ufficiale',
  `trailer_channel` = 'Fandango',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = NULL,
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:32:08.965Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Smetto quando voglio'
  AND `year` IS 2014;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q15648198',
  `imdb_id` = 'tt2582802',
  `rotten_tomatoes_id` = 'm/whiplash_2014',
  `youtube_trailer_id` = 'bzGzdWUy7HU',
  `trailer_title` = 'Whiplash - Trailer Ufficiale Italiano',
  `trailer_channel` = 'Sony Pictures Italia',
  `imdb_rating` = '8.5/10',
  `rotten_tomatoes_score` = '94%',
  `awards` = '["Oscar al miglior attore non protagonista","Oscar al miglior montaggio","Oscar al miglior sonoro","Gran premio della giuria: U.S. Dramatic","Grand prix du Festival de Deauville","Sundance Audience Award: U.S. Dramatic"]',
  `metadata_updated_at` = '2026-07-28T15:47:16.063Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Whiplash'
  AND `year` IS 2014;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q16635326',
  `imdb_id` = 'tt0470752',
  `rotten_tomatoes_id` = 'm/ex_machina',
  `youtube_trailer_id` = 'zg23CSUm1qk',
  `trailer_title` = 'EX MACHINA - Trailer italiano ufficiale',
  `trailer_channel` = 'Universal Pictures International Italy',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '92%',
  `awards` = '["Oscar ai migliori effetti speciali"]',
  `metadata_updated_at` = '2026-07-28T15:32:19.579Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Ex Machina'
  AND `year` IS 2015;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q18154496',
  `imdb_id` = 'tt1895587',
  `rotten_tomatoes_id` = 'm/spotlight_2015',
  `youtube_trailer_id` = 'fF5e35u_LNc',
  `trailer_title` = 'Il Caso Spotlight - Trailer Ufficiale Italiano HD - Michael Keaton, Mark Ruffalo',
  `trailer_channel` = 'bimdistribuzione',
  `imdb_rating` = '8.1/10',
  `rotten_tomatoes_score` = '97%',
  `awards` = '["Oscar al miglior film","Oscar alla migliore sceneggiatura originale","Dallas-Fort Worth Film Critics Association Award per il miglior film","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:32:25.642Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il caso Spotlight'
  AND `year` IS 2015;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q6144664',
  `imdb_id` = 'tt2096673',
  `rotten_tomatoes_id` = 'm/inside_out_2015',
  `youtube_trailer_id` = 'pI1PY1dxdYs',
  `trailer_title` = 'Inside Out – Nuovo Trailer Ufficiale Italiano | HD',
  `trailer_channel` = 'Disney IT',
  `imdb_rating` = '8.1/10',
  `rotten_tomatoes_score` = '98%',
  `awards` = '["Oscar al miglior film d''animazione","Annie Award al miglior film d''animazione","Critics'' Choice Award al miglior film d''animazione","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:32:24.071Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Inside Out'
  AND `year` IS 2015;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q21313531',
  `imdb_id` = 'tt3775086',
  `rotten_tomatoes_id` = 'm/they_call_me_jeeg',
  `youtube_trailer_id` = 'zHwZ1qFHEC4',
  `trailer_title` = 'LO CHIAMAVANO JEEG ROBOT - Torna al Cinema - Trailer Ufficiale Italiano | HD',
  `trailer_channel` = 'Lucky Red',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '82%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:32:22.191Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Lo chiamavano Jeeg Robot'
  AND `year` IS 2015;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q1757288',
  `imdb_id` = 'tt1392190',
  `rotten_tomatoes_id` = 'm/mad_max_fury_road',
  `youtube_trailer_id` = 'gBZlfbCnUOE',
  `trailer_title` = 'Mad Max: Fury Road - Nuovo Trailer Italiano Ufficiale | HD',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = '8.1/10',
  `rotten_tomatoes_score` = '97%',
  `awards` = '["Oscar ai migliori costumi","Oscar al miglior montaggio","Oscar al miglior montaggio sonoro","Oscar al miglior sonoro","Oscar al miglior trucco","Oscar alla migliore scenografia","AACTA al miglior film","AACTA al miglior regista","AACTA Award for Best Cinematography","AACTA Award for Best Editing","AACTA Award for Best Original Music Score","AACTA Award for Best Production Design","AACTA Award for Best Sound","FIPRESCI Grand Prix","National Board of Review Award al miglior film","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:32:27.122Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Mad Max: Fury Road'
  AND `year` IS 2015;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q18002795',
  `imdb_id` = 'tt1663202',
  `rotten_tomatoes_id` = 'm/the_revenant_2015',
  `youtube_trailer_id` = 'xrctuMnFDc4',
  `trailer_title` = 'Revenant Redivivo | Trailer Ufficiale [HD] | 20th Century Fox',
  `trailer_channel` = '20th Century Studios Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '78%',
  `awards` = '["BAFTA al miglior film","Oscar al miglior attore","Oscar al miglior regista","Oscar alla migliore fotografia"]',
  `metadata_updated_at` = '2026-07-28T15:32:46.743Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Revenant - Redivivo'
  AND `year` IS 2015;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q17337292',
  `imdb_id` = 'tt3397884',
  `rotten_tomatoes_id` = 'm/sicario_2015',
  `youtube_trailer_id` = '_DIn-wexhbA',
  `trailer_title` = 'Sicario: Ultimo incarico - Trailer italiano ufficiale [HD]',
  `trailer_channel` = 'Eagle Pictures',
  `imdb_rating` = '7.7/10',
  `rotten_tomatoes_score` = '92%',
  `awards` = '["national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:32:48.738Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Sicario'
  AND `year` IS 2015;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q18547944',
  `imdb_id` = 'tt3659388',
  `rotten_tomatoes_id` = 'm/the_martian',
  `youtube_trailer_id` = 'lRBzBhwbswo',
  `trailer_title` = 'Sopravvissuto - The martian | Trailer Ufficiale [HD] | 20th Century Fox',
  `trailer_channel` = '20th Century Studios Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '91%',
  `awards` = '["national Board Review Top Ten Films","Premio Hugo per la miglior rappresentazione drammatica, forma lunga"]',
  `metadata_updated_at` = '2026-07-28T15:47:21.231Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Sopravvissuto - The Martian'
  AND `year` IS 2015;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = NULL,
  `imdb_id` = NULL,
  `rotten_tomatoes_id` = NULL,
  `youtube_trailer_id` = '5_1OJmzRW5M',
  `trailer_title` = 'Star Wars: Il Risveglio della Forza | Trailer ufficiale #1 | Italiano',
  `trailer_channel` = 'Disney Schweiz',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = NULL,
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:32:52.754Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Star Wars: Il risveglio della Forza'
  AND `year` IS 2015;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q18225084',
  `imdb_id` = 'tt3460252',
  `rotten_tomatoes_id` = 'm/the_hateful_eight',
  `youtube_trailer_id` = 'AljKC5utdBY',
  `trailer_title` = 'THE HATEFUL EIGHT (2016) di Quentin Tarantino - Trailer ufficiale ITA HD',
  `trailer_channel` = '01Distribution',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '74%',
  `awards` = '["Oscar alla migliore colonna sonora","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:33:00.639Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'The Hateful Eight'
  AND `year` IS 2015;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q20382729',
  `imdb_id` = 'tt2543164',
  `rotten_tomatoes_id` = 'm/arrival_2016',
  `youtube_trailer_id` = 'IaUYPiTiMw8',
  `trailer_title` = 'Arrival - Trailer Ufficiale Italiano | HD',
  `trailer_channel` = 'Sony Pictures Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '94%',
  `awards` = '["Oscar al miglior montaggio sonoro","Critics'' Choice Movie Award for Best Sci-Fi/Horror Movie","national Board Review Top Ten Films","Premio Hugo per la miglior rappresentazione drammatica, forma lunga"]',
  `metadata_updated_at` = '2026-07-28T15:32:58.125Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Arrival'
  AND `year` IS 2016;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q18703094',
  `imdb_id` = 'tt3553976',
  `rotten_tomatoes_id` = 'm/captain_fantastic',
  `youtube_trailer_id` = 'zQgz1l2TQEE',
  `trailer_title` = 'Captain Fantastic: Il Trailer Italiano Ufficiale del film con Viggo Mortensen | HD',
  `trailer_channel` = 'Coming Soon',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '82%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:33:00.098Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Captain Fantastic'
  AND `year` IS 2016;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q20856802',
  `imdb_id` = 'tt3783958',
  `rotten_tomatoes_id` = 'm/la_la_land',
  `youtube_trailer_id` = 'YbtJyxjXpMI',
  `trailer_title` = 'La La Land - Trailer  Italiano Ufficiale',
  `trailer_channel` = 'Leone Film Group',
  `imdb_rating` = '8.0/10',
  `rotten_tomatoes_score` = '91%',
  `awards` = '["Golden Globe per il miglior attore in un film commedia o musicale","Golden Globe per il miglior film commedia o musicale","Golden Globe per il miglior regista","Golden Globe per la migliore attrice in un film commedia o musicale","Golden Globe per la migliore canzone originale","Golden Globe per la migliore colonna sonora originale","Golden Globe per la migliore sceneggiatura","Oscar al miglior regista","Oscar alla miglior attrice","Oscar alla migliore canzone","Oscar alla migliore colonna sonora","Oscar alla migliore fotografia","Oscar alla migliore scenografia"]',
  `metadata_updated_at` = '2026-07-28T15:49:01.848Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'La La Land'
  AND `year` IS 2016;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q19864603',
  `imdb_id` = 'tt4034228',
  `rotten_tomatoes_id` = 'm/manchester_by_the_sea',
  `youtube_trailer_id` = 'a82uYNanBtg',
  `trailer_title` = 'MANCHESTER BY THE SEA di Kenneth Lonergan - Trailer italiano ufficiale',
  `trailer_channel` = 'Universal Pictures International Italy',
  `imdb_rating` = '7.8/10',
  `rotten_tomatoes_score` = '96%',
  `awards` = '["Oscar al miglior attore","Oscar alla migliore sceneggiatura originale","AACTA al miglior attore internazionale","AACTA alla miglior sceneggiatura internazionale","Chicago Film Critics Association Award per il miglior attore","National Board of Review Award al miglior film","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:39:02.745Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Manchester by the Sea'
  AND `year` IS 2016;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q21527875',
  `imdb_id` = 'tt4975722',
  `rotten_tomatoes_id` = 'm/moonlight_2016',
  `youtube_trailer_id` = 'a8c1-Ha3hs4',
  `trailer_title` = 'Magic in The Moonlight - Trailer italiano ufficiale | HD',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = '7.4/10',
  `rotten_tomatoes_score` = '98%',
  `awards` = '["Golden Globe per il miglior film drammatico","Oscar al miglior attore non protagonista","Oscar al miglior film","Oscar alla migliore sceneggiatura non originale","Boston Society of Film Critics Award per il miglior attore non protagonista","Dallas-Fort Worth Film Critics Association Award per il miglior film","Dorian Award for Film of the Year","Dorian Award for LGBTQ Film of the Year","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:33:03.521Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Moonlight'
  AND `year` IS 2016;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q22078244',
  `imdb_id` = 'tt4901306',
  `rotten_tomatoes_id` = 'm/perfetti_sconosciuti',
  `youtube_trailer_id` = 'Kp8JX3-b9tw',
  `trailer_title` = 'Perfetti Sconosciuti - Trailer Ufficiale',
  `trailer_channel` = 'Medusa Film Official',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '77%',
  `awards` = '["David di Donatello per il miglior film"]',
  `metadata_updated_at` = '2026-07-28T15:33:05.120Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Perfetti sconosciuti'
  AND `year` IS 2016;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q21915467',
  `imdb_id` = 'tt5290524',
  `rotten_tomatoes_id` = 'm/quo_vado',
  `youtube_trailer_id` = '_SEzZMZLTE4',
  `trailer_title` = 'QUO VADO   TRAILER UFFICIALE ITA',
  `trailer_channel` = 'Coming Film',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '60%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:33:26.461Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Quo vado?'
  AND `year` IS 2016;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q21697406',
  `imdb_id` = 'tt5311514',
  `rotten_tomatoes_id` = 'm/your_name_2017',
  `youtube_trailer_id` = 'fk0iJgWpddg',
  `trailer_title` = 'Your Name. (Trailer)',
  `trailer_channel` = 'DYNITchannel',
  `imdb_rating` = '8.4/10',
  `rotten_tomatoes_score` = '98%',
  `awards` = '["Mainichi Film Award for Best Animation Film","Synergy Award"]',
  `metadata_updated_at` = '2026-07-28T15:47:26.982Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Your Name.'
  AND `year` IS 2016;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q21500755',
  `imdb_id` = 'tt1856101',
  `rotten_tomatoes_id` = 'm/blade_runner_2049',
  `youtube_trailer_id` = 'f2jW75Q8EaI',
  `trailer_title` = 'Blade Runner 2049 | Trailer italiano ufficiale | Da Ottobre al cinema',
  `trailer_channel` = 'Sony Pictures Italia',
  `imdb_rating` = '8.0/10',
  `rotten_tomatoes_score` = '88%',
  `awards` = '["Oscar ai migliori effetti speciali","Oscar alla migliore fotografia","Saturn Award per il miglior film di fantascienza"]',
  `metadata_updated_at` = '2026-07-28T15:33:34.747Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Blade Runner 2049'
  AND `year` IS 2017;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q25136757',
  `imdb_id` = 'tt5726616',
  `rotten_tomatoes_id` = 'm/call_me_by_your_name',
  `youtube_trailer_id` = 'kOCqNdDtCn4',
  `trailer_title` = 'Chiamami Col Tuo Nome - Trailer italiano ufficiale | Dal 25 gennaio al cinema',
  `trailer_channel` = 'Sony Pictures Italia',
  `imdb_rating` = '7.8/10',
  `rotten_tomatoes_score` = '94%',
  `awards` = '["Oscar alla migliore sceneggiatura non originale","American Film Institute Awards","Dorian Award for Film of the Year","Dorian Award for LGBTQ Film of the Year","Gotham Awards","national Board Review Top Ten Films","Premio del pubblico al miglior film europeo"]',
  `metadata_updated_at` = '2026-07-28T15:33:45.378Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Chiamami col tuo nome'
  AND `year` IS 2017;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q5815826',
  `imdb_id` = 'tt2380307',
  `rotten_tomatoes_id` = 'm/coco_2017',
  `youtube_trailer_id` = 'ro2mnwYOp50',
  `trailer_title` = 'Disney•Pixar Coco - Trailer Ufficiale Italiano',
  `trailer_channel` = 'Disney IT',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '97%',
  `awards` = '["BAFTA al miglior film d''animazione","Golden Globe per il miglior film d''animazione","Oscar al miglior film d''animazione","Oscar alla migliore canzone","Annie Award al miglior film d''animazione","Annie Award for Best Production Design in an Animated Feature Production","Annie Award for Character Animation in a Feature Production","Annie Award for Character Design in a Feature Production","Annie Award for Directing in a Feature Production","Annie Award for Music in a Feature Production","Annie Award for Storyboarding in a Feature Production","Annie Award for Voice Acting in a Feature Production","Annie Award for Writing in a Feature Production","Critics'' Choice Award al miglior film d''animazione","Critics'' Choice Award alla miglior canzone","KCA al miglior film d''animazione","Satellite Award per il miglior film d''animazione o a tecnica mista","Saturn Award per il miglior film di animazione","Saturn Award per la miglior colonna sonora"]',
  `metadata_updated_at` = '2026-07-28T15:33:33.079Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Coco'
  AND `year` IS 2017;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q21935651',
  `imdb_id` = 'tt5013056',
  `rotten_tomatoes_id` = 'm/dunkirk_2017',
  `youtube_trailer_id` = 'gYQ1d3Rgo5w',
  `trailer_title` = 'Dunkirk - Trailer ufficiale italiano',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = '7.8/10',
  `rotten_tomatoes_score` = '92%',
  `awards` = '["Oscar al miglior montaggio","Oscar al miglior montaggio sonoro","Oscar al miglior sonoro","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:33:36.195Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Dunkirk'
  AND `year` IS 2017;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q25136484',
  `imdb_id` = 'tt1396484',
  `rotten_tomatoes_id` = 'm/it_2017',
  `youtube_trailer_id` = 'w7Zv5nPLDqw',
  `trailer_title` = 'IT - Teaser Trailer ufficiale | HD',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '85%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:33:37.940Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'It'
  AND `year` IS 2017;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q26698156',
  `imdb_id` = 'tt5580390',
  `rotten_tomatoes_id` = 'm/the_shape_of_water_2017',
  `youtube_trailer_id` = 'lr8D5D92lCc',
  `trailer_title` = 'La Forma dell''Acqua - The Shape of Water | Trailer Ufficiale HD | Fox Searchlight 2018',
  `trailer_channel` = '20th Century Studios Italia',
  `imdb_rating` = '7.3/10',
  `rotten_tomatoes_score` = '92%',
  `awards` = '["Leone d''oro","Oscar al miglior film","Oscar al miglior regista","Oscar alla migliore colonna sonora","Oscar alla migliore scenografia","Dallas-Fort Worth Film Critics Association Award per il miglior film"]',
  `metadata_updated_at` = '2026-07-28T15:33:46.807Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'La forma dell''acqua'
  AND `year` IS 2017;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q25136235',
  `imdb_id` = 'tt5052448',
  `rotten_tomatoes_id` = 'm/get_out',
  `youtube_trailer_id` = '6A-9yr8j2iE',
  `trailer_title` = 'SCAPPA - GET OUT - Trailer italiano ufficiale',
  `trailer_channel` = 'Universal Pictures International Italy',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '98%',
  `awards` = '["Oscar alla migliore sceneggiatura originale","national Board Review Top Ten Films","Producers Guild Stanley Kramer Award"]',
  `metadata_updated_at` = '2026-07-28T15:33:42.775Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Scappa - Get Out'
  AND `year` IS 2017;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = NULL,
  `imdb_id` = NULL,
  `rotten_tomatoes_id` = NULL,
  `youtube_trailer_id` = 'hSxEGQM8J6s',
  `trailer_title` = 'Tre Manifesti a Ebbing, Missouri | Trailer Ufficiale HD | Fox Searchlight 2018',
  `trailer_channel` = '20th Century Studios Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = NULL,
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:33:48.271Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Tre manifesti a Ebbing, Missouri'
  AND `year` IS 2017;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q39070473',
  `imdb_id` = 'tt6644200',
  `rotten_tomatoes_id` = 'm/a_quiet_place_2018',
  `youtube_trailer_id` = '078_Fp2Ou2k',
  `trailer_title` = 'A Quiet Place - Un posto tranquillo | Trailer Ufficiale #2 HD | Paramount Pictures 2018',
  `trailer_channel` = '20th Century Studios Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '96%',
  `awards` = '["national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:33:49.871Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'A Quiet Place - Un posto tranquillo'
  AND `year` IS 2018;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q3286391',
  `imdb_id` = 'tt1517451',
  `rotten_tomatoes_id` = 'm/a_star_is_born_2018',
  `youtube_trailer_id` = 'jvMaHOOY5VA',
  `trailer_title` = 'A Star is Born - Trailer Ufficiale Italiano',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = '7.6/10',
  `rotten_tomatoes_score` = '90%',
  `awards` = '["Golden Globe per la migliore canzone originale","Oscar alla migliore canzone","Dallas-Fort Worth Film Critics Association Award per il miglior film","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:34:09.429Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'A Star Is Born'
  AND `year` IS 2018;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q23780914',
  `imdb_id` = 'tt4154756',
  `rotten_tomatoes_id` = 'm/avengers_infinity_war',
  `youtube_trailer_id` = 'gow1kuRimaQ',
  `trailer_title` = 'Avengers: Infinity War – Trailer Ufficiale Italiano | HD',
  `trailer_channel` = 'Marvel Italia',
  `imdb_rating` = '8.4/10',
  `rotten_tomatoes_score` = '85%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:34:10.644Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Avengers: Infinity War'
  AND `year` IS 2018;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q27894574',
  `imdb_id` = 'tt1727824',
  `rotten_tomatoes_id` = 'm/bohemian_rhapsody',
  `youtube_trailer_id` = 'K1buCCC7e48',
  `trailer_title` = 'Bohemian Rhapsody | Trailer Ufficiale HD | 20th Century Fox 2018',
  `trailer_channel` = '20th Century Studios Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '60%',
  `awards` = '["BAFTA al miglior attore protagonista","BAFTA al miglior sonoro","Golden Globe per il miglior attore in un film drammatico","Golden Globe per il miglior film drammatico","Oscar al miglior attore","Oscar al miglior montaggio","Oscar al miglior montaggio sonoro","Oscar al miglior sonoro","Satellite Award per il miglior attore"]',
  `metadata_updated_at` = '2026-07-28T15:34:12.356Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Bohemian Rhapsody'
  AND `year` IS 2018;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q51800111',
  `imdb_id` = 'tt6768578',
  `rotten_tomatoes_id` = 'm/dogman_2019',
  `youtube_trailer_id` = 's1KIAfuH2vU',
  `trailer_title` = 'Dogman di Luc Besson con Caleb Landry Jones in concorso a Venezia 80 | Trailer ufficiale ITA HD',
  `trailer_channel` = 'Lucky Red',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '84%',
  `awards` = '["David di Donatello per il miglior film","David di Donatello per il miglior regista","European Film Awards per i migliori costumi","European Film Awards per il miglior attore","European Film Awards per il miglior trucco"]',
  `metadata_updated_at` = '2026-07-28T15:34:14.100Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Dogman'
  AND `year` IS 2018;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q48673898',
  `imdb_id` = 'tt6966692',
  `rotten_tomatoes_id` = 'm/green_book',
  `youtube_trailer_id` = 'GmqdPdCC5CQ',
  `trailer_title` = 'Green Book - Trailer italiano ufficiale [HD]',
  `trailer_channel` = 'Eagle Pictures',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '77%',
  `awards` = '["Oscar al miglior attore non protagonista","Oscar al miglior film","Oscar alla migliore sceneggiatura originale","National Board of Review Award al miglior film","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:47:31.452Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Green Book'
  AND `year` IS 2018;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q47524071',
  `imdb_id` = 'tt7784604',
  `rotten_tomatoes_id` = 'm/hereditary',
  `youtube_trailer_id` = '7s67m3DjTR8',
  `trailer_title` = 'HEREDITARY – LE RADICI DEL MALE - Trailer Ufficiale Italiano',
  `trailer_channel` = 'Lucky Red',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '90%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:34:15.626Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Hereditary - Le radici del male'
  AND `year` IS 2018;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q22001133',
  `imdb_id` = 'tt5083738',
  `rotten_tomatoes_id` = 'm/the_favourite_2018',
  `youtube_trailer_id` = 'j5hVe5rK7gc',
  `trailer_title` = 'La Favorita | Trailer Ufficiale #2 HD | Fox Searchlight 2018',
  `trailer_channel` = '20th Century Studios Italia',
  `imdb_rating` = '7.5/10',
  `rotten_tomatoes_score` = '93%',
  `awards` = '["Oscar alla miglior attrice","Dorian Award for Film of the Year","European Film Awards per i migliori costumi","European Film Awards per il miglior film","European Film Awards per il miglior film commedia","European Film Awards per il miglior montaggio","European Film Awards per il miglior regista","European Film Awards per il miglior trucco","European Film Awards per la miglior attrice","European Film Awards per la miglior fotografia","Leone d''argento - Gran premio della giuria"]',
  `metadata_updated_at` = '2026-07-28T15:34:32.573Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'La favorita'
  AND `year` IS 2018;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q27959455',
  `imdb_id` = 'tt6155172',
  `rotten_tomatoes_id` = 'm/roma_2018',
  `youtube_trailer_id` = '6BS27ngZtxg',
  `trailer_title` = 'ROMA | Official Trailer | Netflix',
  `trailer_channel` = 'Netflix',
  `imdb_rating` = '7.6/10',
  `rotten_tomatoes_score` = '96%',
  `awards` = '["BAFTA al miglior film","Leone d''oro","Oscar al miglior film in lingua straniera","Oscar al miglior regista","APRECI Award for Best International Premiere","Boston Society of Film Critics Award per la miglior fotografia","British Independent Film Award al miglior film indipendente internazionale","Chicago Film Critics Association Award per il miglior regista","Los Angeles Film Critics Association Award al miglior film","national Board Review Top Ten Films","New York Film Critics Circle Award al miglior film","San Francisco Film Critics Circle Award for Best Film"]',
  `metadata_updated_at` = '2026-07-28T15:47:34.715Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Roma'
  AND `year` IS 2018;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = NULL,
  `imdb_id` = NULL,
  `rotten_tomatoes_id` = NULL,
  `youtube_trailer_id` = 'TKehaiKHvlg',
  `trailer_title` = 'Spider-Man: Un Nuovo Universo - Trailer Italiano Ufficiale',
  `trailer_channel` = 'Sony Pictures Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = NULL,
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:34:38.782Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Spider-Man: Un nuovo universo'
  AND `year` IS 2018;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q62721520',
  `imdb_id` = 'tt8579674',
  `rotten_tomatoes_id` = 'm/1917_2019',
  `youtube_trailer_id` = 'YqNYrYUiMfg',
  `trailer_title` = '1917 - Official Trailer [HD]',
  `trailer_channel` = 'Universal Pictures',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '88%',
  `awards` = '["Golden Globe per il miglior film drammatico","Golden Globe per il miglior regista","Oscar ai migliori effetti speciali","Oscar al miglior sonoro","Oscar alla migliore fotografia","Dallas-Fort Worth Film Critics Association Award per il miglior film","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:34:40.821Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = '1917'
  AND `year` IS 2019;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q23781155',
  `imdb_id` = 'tt4154796',
  `rotten_tomatoes_id` = 'm/avengers_endgame',
  `youtube_trailer_id` = 'CcoMZHqxA_U',
  `trailer_title` = 'Avengers: Endgame - NUOVO TRAILER UFFICIALE ITALIANO | HD',
  `trailer_channel` = 'Marvel Italia',
  `imdb_rating` = '8.4/10',
  `rotten_tomatoes_score` = '94%',
  `awards` = '["KCA al miglior film","MTV Movie Award al miglior cattivo","Teen Choice Award for Best Villain"]',
  `metadata_updated_at` = '2026-07-28T15:34:42.755Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Avengers: Endgame'
  AND `year` IS 2019;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q47300912',
  `imdb_id` = 'tt7131622',
  `rotten_tomatoes_id` = 'm/once_upon_a_time_in_hollywood',
  `youtube_trailer_id` = 'gA_DzZCT7R4',
  `trailer_title` = 'C''era una volta a... Hollywood (2019) - Trailer Italiano Ufficiale',
  `trailer_channel` = 'film__ita',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '85%',
  `awards` = '["Oscar al miglior attore non protagonista","Oscar alla migliore scenografia","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:39:04.368Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'C''era una volta a... Hollywood'
  AND `year` IS 2019;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q57982486',
  `imdb_id` = 'tt8946378',
  `rotten_tomatoes_id` = 'm/knives_out',
  `youtube_trailer_id` = 'YejFxic6W4Q',
  `trailer_title` = 'CENA CON DELITTO - KNIVES OUT (2019) - Trailer Italiano Ufficiale HD',
  `trailer_channel` = '01Distribution',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '97%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:42:39.484Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Cena con delitto - Knives Out'
  AND `year` IS 2019;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q63213307',
  `imdb_id` = 'tt7736478',
  `rotten_tomatoes_id` = 'm/the_traitor_2020',
  `youtube_trailer_id` = '7nvYMRpKzak',
  `trailer_title` = 'IL TRADITORE di Marco Bellocchio (2019) - Trailer Ufficiale HD',
  `trailer_channel` = '01Distribution',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '85%',
  `awards` = '["David di Donatello per il miglior attore non protagonista","David di Donatello per il miglior attore protagonista","David di Donatello per il miglior film","David di Donatello per il miglior montatore","David di Donatello per il miglior regista","David di Donatello per la migliore sceneggiatura originale"]',
  `metadata_updated_at` = '2026-07-28T15:42:42.490Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il traditore'
  AND `year` IS 2019;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q54862508',
  `imdb_id` = 'tt2584384',
  `rotten_tomatoes_id` = 'm/jojo_rabbit',
  `youtube_trailer_id` = 'vW_NBzWHv6A',
  `trailer_title` = 'Jojo Rabbit | Trailer Ufficiale HD | Searchlight Pictures',
  `trailer_channel` = '20th Century Studios Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '80%',
  `awards` = '["Oscar alla migliore sceneggiatura non originale","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:34:49.376Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Jojo Rabbit'
  AND `year` IS 2019;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q42759035',
  `imdb_id` = 'tt7286456',
  `rotten_tomatoes_id` = 'm/joker_2019',
  `youtube_trailer_id` = '5FyE_oRni1Q',
  `trailer_title` = 'Joker: Due per la strada | Trailer ufficiale',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = '8.3/10',
  `rotten_tomatoes_score` = '68%',
  `awards` = '["Oscar al miglior attore","Oscar alla migliore colonna sonora","Robert Award for Best English Language Film"]',
  `metadata_updated_at` = '2026-07-28T15:34:47.730Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Joker'
  AND `year` IS 2019;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q61448040',
  `imdb_id` = 'tt6751668',
  `rotten_tomatoes_id` = 'm/parasite_2019',
  `youtube_trailer_id` = 'iPOugEDF8tk',
  `trailer_title` = 'PARASITE - Trailer Italiano Ufficiale',
  `trailer_channel` = 'Academy Two',
  `imdb_rating` = '8.5/10',
  `rotten_tomatoes_score` = '99%',
  `awards` = '["BAFTA alla migliore sceneggiatura originale","BAFTA Award for Best Film Not in the English Language","Golden Globe per il miglior film straniero","Oscar al miglior film","Oscar al miglior film in lingua straniera","Oscar al miglior regista","Oscar alla migliore sceneggiatura originale","Palma d''oro","AACTA al miglior film internazionale","Critics'' Choice Award al miglior film straniero","Critics'' Choice Movie Award al miglior regista","Dorian Award for Film of the Year","Gilde Film Price","Screen Actors Guild Award per il miglior cast cinematografico"]',
  `metadata_updated_at` = '2026-07-28T15:34:50.966Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Parasite'
  AND `year` IS 2019;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q48671199',
  `imdb_id` = 'tt7653254',
  `rotten_tomatoes_id` = 'm/marriage_story_2019',
  `youtube_trailer_id` = 't6YNekYevQ0',
  `trailer_title` = 'Storia di un matrimonio | Trailer ufficiale | Netflix Italia',
  `trailer_channel` = 'Netflix Italia',
  `imdb_rating` = '7.9/10',
  `rotten_tomatoes_score` = '95%',
  `awards` = '["Oscar alla miglior attrice non protagonista","national Board Review Top Ten Films"]',
  `metadata_updated_at` = '2026-07-28T15:34:52.310Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Storia di un matrimonio'
  AND `year` IS 2019;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q61740820',
  `imdb_id` = 'tt9770150',
  `rotten_tomatoes_id` = 'm/nomadland',
  `youtube_trailer_id` = 'r2BBEyQ1ViY',
  `trailer_title` = 'NOMADLAND | Trailer Ufficiale #1 | Italiano',
  `trailer_channel` = '20th Century Studios & Searchlight Pictures CH',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '93%',
  `awards` = '["Leone d''oro","Oscar al miglior film","Oscar al miglior regista","Oscar alla miglior attrice","Dallas-Fort Worth Film Critics Association Award per il miglior film","Dorian Award for Film of the Year"]',
  `metadata_updated_at` = '2026-07-28T15:35:11.504Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Nomadland'
  AND `year` IS 2020;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q64744044',
  `imdb_id` = 'tt2948372',
  `rotten_tomatoes_id` = 'm/soul',
  `youtube_trailer_id` = 'Gs--6c7Hn_A',
  `trailer_title` = 'Disney and Pixar’s Soul | Official Trailer 2 | Disney+',
  `trailer_channel` = 'Pixar',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '95%',
  `awards` = '["Oscar al miglior film d''animazione","Annie Award al miglior film d''animazione","Critics'' Choice Award al miglior film d''animazione","KCA al miglior film d''animazione"]',
  `metadata_updated_at` = '2026-07-28T15:34:53.894Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Soul'
  AND `year` IS 2020;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q63985561',
  `imdb_id` = 'tt6723592',
  `rotten_tomatoes_id` = 'm/tenet',
  `youtube_trailer_id` = 'xH463AYuYQE',
  `trailer_title` = 'TENET - Trailer Ufficiale Italiano',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = '7.3/10',
  `rotten_tomatoes_score` = '69%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:47:36.768Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Tenet'
  AND `year` IS 2020;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q65066669',
  `imdb_id` = 'tt10272386',
  `rotten_tomatoes_id` = 'm/the_father_2021',
  `youtube_trailer_id` = 'raBjVWglTIk',
  `trailer_title` = 'The Father - Nulla è come sembra (2021): Trailer ITA del Film col premio Oscar Anthony Hopkins',
  `trailer_channel` = 'Coming Soon',
  `imdb_rating` = '8.2/10',
  `rotten_tomatoes_score` = '98%',
  `awards` = '["Oscar al miglior attore","Oscar alla migliore sceneggiatura non originale","Premio César per il miglior film straniero","European Film Awards per il miglior attore","European Film Awards per la miglior sceneggiatura"]',
  `metadata_updated_at` = '2026-07-28T15:47:58.715Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'The Father - Nulla è come sembra'
  AND `year` IS 2020;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q69303989',
  `imdb_id` = 'tt10288566',
  `rotten_tomatoes_id` = 'm/another_round',
  `youtube_trailer_id` = 'hFbDh58QHzw',
  `trailer_title` = 'Un Altro Giro | Trailer Ufficiale | Dal 20 Maggio al cinema',
  `trailer_channel` = 'Medusa Film Official',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '92%',
  `awards` = '["BAFTA Award for Best Film Not in the English Language","Oscar al miglior film in lingua straniera","Amanda Award for Best Foreign Feature Film","Concha de Plata al miglior attore","European Film Awards per il miglior attore","European Film Awards per il miglior film","European Film Awards per il miglior regista","European Film Awards per la miglior sceneggiatura","Gaudí Award for Best European Film","Medal from the Circle of Cinematographic Writers for the best foreign film","Premio Goya per il miglior film europeo"]',
  `metadata_updated_at` = '2026-07-28T15:35:30.659Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Un altro giro'
  AND `year` IS 2020;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q84163499',
  `imdb_id` = 'tt8478554',
  `rotten_tomatoes_id` = 'm/hidden_away_2020',
  `youtube_trailer_id` = 'tlUzhVLwh1c',
  `trailer_title` = 'VOLEVO NASCONDERMI (2020) di Giorgio Diritti  - Trailer Ufficiale HD',
  `trailer_channel` = '01Distribution',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = NULL,
  `awards` = '["David di Donatello per il miglior film","David di Donatello per il miglior regista","European Film Awards per i migliori costumi","European Film Awards per la miglior fotografia"]',
  `metadata_updated_at` = '2026-07-28T15:35:24.649Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Volevo nascondermi'
  AND `year` IS 2020;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q107107865',
  `imdb_id` = 'tt14039582',
  `rotten_tomatoes_id` = 'm/drive_my_car',
  `youtube_trailer_id` = 'x9M12mz2VNY',
  `trailer_title` = 'DRIVE MY CAR - Trailer ufficiale',
  `trailer_channel` = 'TuckerFilm',
  `imdb_rating` = '7.5/10',
  `rotten_tomatoes_score` = '97%',
  `awards` = '["Golden Globe per il miglior film straniero","Oscar al miglior film in lingua straniera","Award of the Japanese Academy al miglior film","FIPRESCI Grand Prix"]',
  `metadata_updated_at` = '2026-07-28T15:35:22.440Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Drive My Car'
  AND `year` IS 2021;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q60834962',
  `imdb_id` = 'tt1160419',
  `rotten_tomatoes_id` = 'm/dune_2021',
  `youtube_trailer_id` = 'SWbxKwlc1Vc',
  `trailer_title` = 'Dune - Trailer Ufficiale Italiano',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = '8.0/10',
  `rotten_tomatoes_score` = '83%',
  `awards` = '["Hollywood Music in Media Award for Best Original Score in a Sci-Fi/Fantasy/Horror Film","Washington D.C. Area Film Critics Association Award for Best Art Direction","Washington D.C. Area Film Critics Association Award for Best Score"]',
  `metadata_updated_at` = '2026-07-28T15:35:29.290Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Dune'
  AND `year` IS 2021;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q100156260',
  `imdb_id` = 'tt7270808',
  `rotten_tomatoes_id` = 'm/freaks_vs_the_reich',
  `youtube_trailer_id` = 'qRBf-afXhVQ',
  `trailer_title` = 'Freaks Out - Trailer Italiano Ufficiale',
  `trailer_channel` = 'screenWEEK',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '67%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:35:26.741Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Freaks Out'
  AND `year` IS 2021;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q85323337',
  `imdb_id` = 'tt10293406',
  `rotten_tomatoes_id` = 'm/the_power_of_the_dog',
  `youtube_trailer_id` = 'CJAs-Zr7LQ4',
  `trailer_title` = 'Il potere del cane | Trailer ufficiale | Netflix Italia',
  `trailer_channel` = 'Netflix Italia',
  `imdb_rating` = '6.8/10',
  `rotten_tomatoes_score` = '94%',
  `awards` = '["Golden Globe per il miglior film drammatico","Dallas-Fort Worth Film Critics Association Award per il miglior film","Dorian Award for Film of the Year"]',
  `metadata_updated_at` = '2026-07-28T15:47:39.089Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Il potere del cane'
  AND `year` IS 2021;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q107089587',
  `imdb_id` = 'tt10370710',
  `rotten_tomatoes_id` = 'm/the_worst_person_in_the_world',
  `youtube_trailer_id` = '4xyJJQNMaos',
  `trailer_title` = 'La Persona Peggiore Del Mondo (2021): Trailer ITA della commedia romantica con Renate Reinsve - HD',
  `trailer_channel` = 'Coming Soon',
  `imdb_rating` = '7.7/10',
  `rotten_tomatoes_score` = '96%',
  `awards` = '["Amanda Award for Best Nordic Feature Film","Lumière Award for Best International Co-Production","The Amanda Public Choice Award"]',
  `metadata_updated_at` = '2026-07-28T15:47:43.461Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'La persona peggiore del mondo'
  AND `year` IS 2021;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q68934496',
  `imdb_id` = 'tt10872600',
  `rotten_tomatoes_id` = 'm/spider_man_no_way_home',
  `youtube_trailer_id` = 'JRqzozaNUqU',
  `trailer_title` = 'Spider-Man No Way Home | 2021 | Nuovo Trailer Italiano | Marvel Studios | Sony | Disney Italy',
  `trailer_channel` = 'Disney Italy',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '93%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:47:51.535Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Spider-Man: No Way Home'
  AND `year` IS 2021;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q104856751',
  `imdb_id` = 'tt12680684',
  `rotten_tomatoes_id` = 'm/the_hand_of_god',
  `youtube_trailer_id` = 'ahJbjvSjFGo',
  `trailer_title` = 'È stata la mano di Dio | Trailer Ufficiale | Netflix Italia',
  `trailer_channel` = 'Netflix Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '83%',
  `awards` = '["Leone d''argento - Gran premio della giuria"]',
  `metadata_updated_at` = '2026-07-28T15:35:57.934Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'È stata la mano di Dio'
  AND `year` IS 2021;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q3604746',
  `imdb_id` = 'tt1630029',
  `rotten_tomatoes_id` = 'm/avatar_the_way_of_water',
  `youtube_trailer_id` = 'RBAAK-7By-E',
  `trailer_title` = 'AVATAR: LA VIA DELL''AQUA | Trailer ufficiale | Italiano',
  `trailer_channel` = '20th Century Studios & Searchlight Pictures CH',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '76%',
  `awards` = '["Oscar ai migliori effetti speciali"]',
  `metadata_updated_at` = '2026-07-28T15:35:58.431Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Avatar - La via dell''acqua'
  AND `year` IS 2022;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q83808444',
  `imdb_id` = 'tt6710474',
  `rotten_tomatoes_id` = 'm/everything_everywhere_all_at_once',
  `youtube_trailer_id` = '4c54mh9Yu-Q',
  `trailer_title` = 'Everything Everywhere All At Once | Trailer Italiano Ufficiale HD - Vincitore di 7 Premi Oscar®',
  `trailer_channel` = 'I Wonder Pictures',
  `imdb_rating` = '7.7/10',
  `rotten_tomatoes_score` = '93%',
  `awards` = '["Oscar al miglior film","Oscar alla migliore sceneggiatura originale","Amanda Award for Best Foreign Feature Film","Dallas-Fort Worth Film Critics Association Award per il miglior film","Dorian Award for Film of the Year","Dorian Award for LGBTQ Film of the Year","Premio Hugo per la miglior rappresentazione drammatica, forma lunga","Screen Actors Guild Award per il miglior cast cinematografico"]',
  `metadata_updated_at` = '2026-07-28T15:35:59.746Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Everything Everywhere All at Once'
  AND `year` IS 2022;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q108314506',
  `imdb_id` = 'tt11813216',
  `rotten_tomatoes_id` = 'm/the_banshees_of_inisherin',
  `youtube_trailer_id` = 'vAGX4Vd6ryQ',
  `trailer_title` = 'Gli Spiriti dell''Isola | Trailer Ufficiale',
  `trailer_channel` = 'Searchlight Pictures Italia',
  `imdb_rating` = '7.6/10',
  `rotten_tomatoes_score` = '96%',
  `awards` = '["Golden Globe per il miglior film commedia o musicale"]',
  `metadata_updated_at` = '2026-07-28T15:42:45.764Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Gli spiriti dell''isola'
  AND `year` IS 2022;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q111751446',
  `imdb_id` = 'tt14641542',
  `rotten_tomatoes_id` = 'm/the_eight_mountains',
  `youtube_trailer_id` = 'sq4Y8IB_jgA',
  `trailer_title` = 'LE OTTO MONTAGNE (2022) - TRAILER UFFICIALE',
  `trailer_channel` = 'Vision Distribution',
  `imdb_rating` = '7.7/10',
  `rotten_tomatoes_score` = '90%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:35:59.415Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Le otto montagne'
  AND `year` IS 2022;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q108837349',
  `imdb_id` = 'tt1016150',
  `rotten_tomatoes_id` = 'm/all_quiet_on_the_western_front_2022',
  `youtube_trailer_id` = 'VdFeDaGu5FM',
  `trailer_title` = 'Niente di nuovo sul fronte occidentale | Trailer ufficiale | Netflix',
  `trailer_channel` = 'Netflix Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '90%',
  `awards` = '["BAFTA al miglior film","Oscar al miglior film in lingua straniera","Oscar alla migliore colonna sonora","Oscar alla migliore fotografia","Oscar alla migliore scenografia","European Film Award for Best Visual Effects","European Film Awards per il miglior trucco"]',
  `metadata_updated_at` = '2026-07-28T15:36:01.619Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Niente di nuovo sul fronte occidentale'
  AND `year` IS 2022;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q61117344',
  `imdb_id` = 'tt1877830',
  `rotten_tomatoes_id` = 'm/the_batman',
  `youtube_trailer_id` = 'Io_d_woiis8',
  `trailer_title` = 'THE BATMAN – Main Trailer Ufficiale Italiano',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '85%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:36:01.636Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'The Batman'
  AND `year` IS 2022;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q31202708',
  `imdb_id` = 'tt1745960',
  `rotten_tomatoes_id` = 'm/top_gun_maverick',
  `youtube_trailer_id` = 'cGdz-QZ2_LM',
  `trailer_title` = 'Top Gun: Maverick | Trailer ITA Ufficiale - Paramount+',
  `trailer_channel` = 'Paramount+ Italia',
  `imdb_rating` = '8.2/10',
  `rotten_tomatoes_score` = '96%',
  `awards` = '["Oscar al miglior sonoro","AFI Movie of the Year","Saturn Award for Best Editing","Saturn Award per il miglior attore","Saturn Award per il miglior film d''azione/di avventura/thriller"]',
  `metadata_updated_at` = '2026-07-28T15:36:04.271Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Top Gun: Maverick'
  AND `year` IS 2022;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q97304180',
  `imdb_id` = 'tt7322224',
  `rotten_tomatoes_id` = 'm/triangle_of_sadness',
  `youtube_trailer_id` = 'TbswTAPWzzU',
  `trailer_title` = 'TRIANGLE OF SADNESS (2022) Trailer ITA del Film con Woody Harrelson, Palma D''Oro a Cannes',
  `trailer_channel` = 'FilmIsNow Trailer Italia',
  `imdb_rating` = '7.2/10',
  `rotten_tomatoes_score` = '72%',
  `awards` = '["Palma d''oro","European Film Awards per il miglior attore","European Film Awards per il miglior film","European Film Awards per il miglior regista","European Film Awards per la miglior sceneggiatura","Premio Guldbagge per il miglior film","Robert Award for Best English Language Film"]',
  `metadata_updated_at` = '2026-07-28T15:47:54.633Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Triangle of Sadness'
  AND `year` IS 2022;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q117037697',
  `imdb_id` = 'tt17009710',
  `rotten_tomatoes_id` = 'm/anatomy_of_a_fall',
  `youtube_trailer_id` = '5WNNdy-eeXM',
  `trailer_title` = 'ANATOMIA DI UNA CADUTA (2023) Trailer ITA del Film Thriller #Oscars2024',
  `trailer_channel` = 'FilmIsNow Trailer Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '96%',
  `awards` = '["Golden Globe per il miglior film straniero in lingua inglese","Palma d''oro","Premio César per il miglior film","European Film Awards per il miglior film","European University Film Award (EUFA)","Gaudí Award for Best European Film","Premio Lumière per la miglior attrice"]',
  `metadata_updated_at` = '2026-07-28T15:42:48.217Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Anatomia di una caduta'
  AND `year` IS 2023;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q55436290',
  `imdb_id` = 'tt1517268',
  `rotten_tomatoes_id` = 'm/barbie',
  `youtube_trailer_id` = 'NVIpIMqeJVM',
  `trailer_title` = 'Barbie | Trailer ufficiale',
  `trailer_channel` = 'Warner Bros. Pictures Brasil',
  `imdb_rating` = '6.8/10',
  `rotten_tomatoes_score` = '88%',
  `awards` = '["KCA al miglior film"]',
  `metadata_updated_at` = '2026-07-28T15:36:05.589Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Barbie'
  AND `year` IS 2023;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q123179308',
  `imdb_id` = 'tt21800162',
  `rotten_tomatoes_id` = 'm/theres_still_tomorrow',
  `youtube_trailer_id` = 'dD8ru7mFXuo',
  `trailer_title` = 'C''è ancora domani (2023) - Al cinema! - Trailer ufficiale',
  `trailer_channel` = 'Vision Distribution',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '100%',
  `awards` = '["Sydney Film Prize"]',
  `metadata_updated_at` = '2026-07-28T15:48:08.127Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'C''è ancora domani'
  AND `year` IS 2023;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q120900212',
  `imdb_id` = 'tt14225838',
  `rotten_tomatoes_id` = 'm/io_capitano',
  `youtube_trailer_id` = 'idErmD0bA_M',
  `trailer_title` = 'IO CAPITANO di Matteo Garrone (2023) - Trailer Ufficiale HD',
  `trailer_channel` = '01Distribution',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '96%',
  `awards` = '["Leone d''Argento - Premio speciale per la regia","Premio Marcello Mastroianni"]',
  `metadata_updated_at` = '2026-07-28T15:48:02.312Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Io capitano'
  AND `year` IS 2023;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q66316924',
  `imdb_id` = 'tt5537002',
  `rotten_tomatoes_id` = 'm/killers_of_the_flower_moon',
  `youtube_trailer_id` = '7cx9nCHsemc',
  `trailer_title` = 'Killers of the Flower Moon | Official Trailer 2 (2023 Movie)',
  `trailer_channel` = 'Paramount Pictures',
  `imdb_rating` = '7.5/10',
  `rotten_tomatoes_score` = '93%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:36:34.391Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Killers of the Flower Moon'
  AND `year` IS 2023;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q115993222',
  `imdb_id` = 'tt7160372',
  `rotten_tomatoes_id` = 'm/the_zone_of_interest',
  `youtube_trailer_id` = 'YgSDrBHOia0',
  `trailer_title` = 'LA ZONA D''INTERESSE | Trailer italiano ufficiale HD - VINCITORE DI 2 PREMI OSCAR',
  `trailer_channel` = 'I Wonder Pictures',
  `imdb_rating` = '7.3/10',
  `rotten_tomatoes_score` = '93%',
  `awards` = '["Oscar al miglior film in lingua straniera","FIPRESCI Prize of the Festival de Cannes","Gilde Film Price","Grand Prix Speciale della Giuria","National Society of Film Critics Award per il miglior regista","Robert Award for Best Non-American Film"]',
  `metadata_updated_at` = '2026-07-28T15:36:36.233Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'La zona d''interesse'
  AND `year` IS 2023;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q108839994',
  `imdb_id` = 'tt15398776',
  `rotten_tomatoes_id` = 'm/oppenheimer_2023',
  `youtube_trailer_id` = 'tTcE_yRnANc',
  `trailer_title` = 'OPPENHEIMER - Trailer Ufficiale (Universal Studios) - HD',
  `trailer_channel` = 'Universal Pictures International Italy',
  `imdb_rating` = '8.2/10',
  `rotten_tomatoes_score` = '93%',
  `awards` = '["BAFTA al miglior film","Golden Globe per il miglior film drammatico","Oscar al miglior attore","Oscar al miglior attore non protagonista","Oscar al miglior film","Oscar al miglior regista"]',
  `metadata_updated_at` = '2026-07-28T15:36:36.766Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Oppenheimer'
  AND `year` IS 2023;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q116025865',
  `imdb_id` = 'tt13238346',
  `rotten_tomatoes_id` = 'm/past_lives',
  `youtube_trailer_id` = 'kA244xewjcI',
  `trailer_title` = 'Past Lives | Official Trailer HD | A24',
  `trailer_channel` = 'A24',
  `imdb_rating` = '7.8/10',
  `rotten_tomatoes_score` = '95%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:36:35.348Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Past Lives'
  AND `year` IS 2023;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q108760382',
  `imdb_id` = 'tt14230458',
  `rotten_tomatoes_id` = 'm/poor_things',
  `youtube_trailer_id` = 'tBKWXtdpbNQ',
  `trailer_title` = 'Povere Creature! (Poor Things) | Trailer Ufficiale',
  `trailer_channel` = 'Searchlight Pictures Italia',
  `imdb_rating` = '7.7/10',
  `rotten_tomatoes_score` = '92%',
  `awards` = '["Golden Globe per il miglior film commedia o musicale","Leone d''oro","Oscar alla migliore scenografia","Amanda Award for Best Foreign Feature Film","FIPRESCI Grand Prix"]',
  `metadata_updated_at` = '2026-07-28T15:36:37.890Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Povere creature!'
  AND `year` IS 2023;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q112114745',
  `imdb_id` = 'tt14849194',
  `rotten_tomatoes_id` = 'm/the_holdovers',
  `youtube_trailer_id` = 'BL0AqNyvLdg',
  `trailer_title` = 'The Holdovers - Lezioni di Vita | Primo Trailer Ufficiale',
  `trailer_channel` = 'Universal Pictures International Italy',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '97%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:36:37.866Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'The Holdovers - Lezioni di vita'
  AND `year` IS 2023;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q118175825',
  `imdb_id` = 'tt11563598',
  `rotten_tomatoes_id` = 'm/a_complete_unknown',
  `youtube_trailer_id` = 'pHvskfTszoU',
  `trailer_title` = 'A Complete Unknown | Trailer Ufficiale | Dal 23 Gennaio al Cinema',
  `trailer_channel` = 'Searchlight Pictures Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '82%',
  `awards` = '["Oscar al miglior attore non protagonista"]',
  `metadata_updated_at` = '2026-07-28T15:36:40.465Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'A Complete Unknown'
  AND `year` IS 2024;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q123185887',
  `imdb_id` = 'tt28607951',
  `rotten_tomatoes_id` = 'm/anora',
  `youtube_trailer_id` = 'LsGvnMLqW1Q',
  `trailer_title` = 'ANORA | Trailer Ufficiale (Universal Studios) - HD',
  `trailer_channel` = 'Universal Pictures International Italy',
  `imdb_rating` = '7.4/10',
  `rotten_tomatoes_score` = '93%',
  `awards` = '["Oscar al miglior film","Oscar al miglior montaggio","Oscar al miglior regista","Oscar alla miglior attrice","Oscar alla migliore sceneggiatura originale","Palma d''oro"]',
  `metadata_updated_at` = '2026-07-28T15:36:43.317Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Anora'
  AND `year` IS 2024;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q111458251',
  `imdb_id` = 'tt16426418',
  `rotten_tomatoes_id` = 'm/challengers_2024',
  `youtube_trailer_id` = 'urW8aPwEBN0',
  `trailer_title` = 'CHALLENGERS | Trailer Ufficiale',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '88%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:36:38.909Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Challengers'
  AND `year` IS 2024;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q116701124',
  `imdb_id` = 'tt20215234',
  `rotten_tomatoes_id` = 'm/conclave',
  `youtube_trailer_id` = 'F0fy5iD3joA',
  `trailer_title` = 'Conclave | Trailer Ufficiale',
  `trailer_channel` = 'Eagle Pictures',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '93%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:36:41.886Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Conclave'
  AND `year` IS 2024;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q109228991',
  `imdb_id` = 'tt15239678',
  `rotten_tomatoes_id` = 'm/dune_part_two',
  `youtube_trailer_id` = 'UgcRr6cAh2E',
  `trailer_title` = 'Dune - Parte Due | Trailer Ufficiale',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = '8.4/10',
  `rotten_tomatoes_score` = '92%',
  `awards` = '["Bradbury Award","Premio Hugo per la miglior rappresentazione drammatica, forma lunga"]',
  `metadata_updated_at` = '2026-07-28T15:36:59.639Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Dune - Parte due'
  AND `year` IS 2024;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q125622088',
  `imdb_id` = 'tt4772188',
  `rotten_tomatoes_id` = 'm/flow_2024',
  `youtube_trailer_id` = 'ZJgQ_jnRFlk',
  `trailer_title` = 'FLOW: Un mondo Da Salvare Trailer Ufficiale Italiano (2024)',
  `trailer_channel` = 'ONE Media Italiano',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '97%',
  `awards` = '["Oscar al miglior film d''animazione","European Film Awards per il miglior film d''animazione","Gan Foundation Award for Distribution","Gaudí Award for Best European Film","Lumière Award for Best Animated Film"]',
  `metadata_updated_at` = '2026-07-28T15:48:04.853Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Flow - Un mondo da salvare'
  AND `year` IS 2024;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q116361132',
  `imdb_id` = 'tt5040012',
  `rotten_tomatoes_id` = 'm/nosferatu_2024',
  `youtube_trailer_id` = '62nHfDtR7lc',
  `trailer_title` = 'NOSFERATU Trailer Italiano Ufficiale (2024)',
  `trailer_channel` = 'Boxoffice ITALY | Trailers & Clips',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '84%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:39:14.133Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Nosferatu'
  AND `year` IS 2024;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q122169131',
  `imdb_id` = 'tt23853982',
  `rotten_tomatoes_id` = 'm/parthenope',
  `youtube_trailer_id` = 'uT5PGHBugic',
  `trailer_title` = 'Parthenope | Official Trailer HD | A24',
  `trailer_channel` = 'A24',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '46%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:37:02.414Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Parthenope'
  AND `year` IS 2024;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q101112656',
  `imdb_id` = 'tt8999762',
  `rotten_tomatoes_id` = 'm/the_brutalist',
  `youtube_trailer_id` = 'zi3_AVjtI1k',
  `trailer_title` = 'The Brutalist | Nuovo Trailer Ufficiale',
  `trailer_channel` = 'Universal Pictures International Italy',
  `imdb_rating` = '7.3/10',
  `rotten_tomatoes_score` = '93%',
  `awards` = '["Golden Globe per il miglior film drammatico","Oscar al miglior attore","Oscar alla migliore colonna sonora","Oscar alla migliore fotografia","Amanda Award for Best Foreign Feature Film","FIPRESCI","Leone d''Argento - Premio speciale per la regia"]',
  `metadata_updated_at` = '2026-07-28T15:37:10.671Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'The Brutalist'
  AND `year` IS 2024;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q113380226',
  `imdb_id` = 'tt17526714',
  `rotten_tomatoes_id` = 'm/the_substance',
  `youtube_trailer_id` = 'XbESiU4GDS4',
  `trailer_title` = 'THE SUBSTANCE | Trailer italiano ufficiale HD - DAL 30 OTTOBRE AL CINEMA',
  `trailer_channel` = 'I Wonder Pictures',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '89%',
  `awards` = '["Golden Globe per il miglior attore in un film commedia o musicale","Prix du scénario"]',
  `metadata_updated_at` = '2026-07-28T15:37:11.817Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'The Substance'
  AND `year` IS 2024;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q127699542',
  `imdb_id` = 'tt28618488',
  `rotten_tomatoes_id` = 'm/vermiglio',
  `youtube_trailer_id` = 'veSSKsfx-N4',
  `trailer_title` = 'Vermiglio di Maura Delpero - Gran Premio della Giuria a Venezia 81 | Trailer HD',
  `trailer_channel` = 'Lucky Red',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '93%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:48:26.741Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Vermiglio'
  AND `year` IS 2024;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q29580929',
  `imdb_id` = 'tt1757678',
  `rotten_tomatoes_id` = 'm/avatar_fire_and_ash',
  `youtube_trailer_id` = 'MzVvd9ekYOE',
  `trailer_title` = 'Avatar: Fuoco e Cenere | Trailer Ufficiale | Dal 17 Dicembre al Cinema',
  `trailer_channel` = '20th Century Studios Italia',
  `imdb_rating` = '7,6/10',
  `rotten_tomatoes_score` = '68%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:37:14.292Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Avatar - Fuoco e cenere'
  AND `year` IS 2025;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q114246242',
  `imdb_id` = 'tt16311594',
  `rotten_tomatoes_id` = 'm/f1_the_movie',
  `youtube_trailer_id` = 'ugEHJNIWzOM',
  `trailer_title` = 'F1 | Trailer Ufficiale',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = '7.6/10',
  `rotten_tomatoes_score` = '82%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:37:15.395Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'F1 - Il film'
  AND `year` IS 2025;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q124393045',
  `imdb_id` = 'tt1312221',
  `rotten_tomatoes_id` = 'm/frankenstein_2025',
  `youtube_trailer_id` = 'CwhYNCvli7g',
  `trailer_title` = 'Frankenstein | Guillermo del Toro | Trailer ufficiale | Netflix Italia',
  `trailer_channel` = 'Netflix Italia',
  `imdb_rating` = '7.7/10',
  `rotten_tomatoes_score` = '85%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:37:17.335Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Frankenstein'
  AND `year` IS 2025;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q122741016',
  `imdb_id` = 'tt14905854',
  `rotten_tomatoes_id` = 'm/hamnet',
  `youtube_trailer_id` = 'Cn0KweKBY1Q',
  `trailer_title` = 'Hamnet - Nel nome del figlio | Trailer Ufficiale (Universal Pictures) - HD',
  `trailer_channel` = 'Universal Pictures International Italy',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '86%',
  `awards` = '["Golden Globe per il miglior film drammatico","Golden Globe per la migliore attrice in un film drammatico"]',
  `metadata_updated_at` = '2026-07-28T15:37:35.681Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Hamnet'
  AND `year` IS 2025;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q125473145',
  `imdb_id` = 'tt31193180',
  `rotten_tomatoes_id` = 'm/sinners_2025',
  `youtube_trailer_id` = '_6T94P6zjEk',
  `trailer_title` = 'I Peccatori | Trailer Ufficiale',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '97%',
  `awards` = '["Oscar al miglior attore","Oscar alla migliore colonna sonora","Oscar alla migliore fotografia","Oscar alla migliore sceneggiatura originale","Black Reel Award for Best Film","Black Reel Award for Best Screenplay, Adapted or Original","Black Reel Award for Outstanding Ensemble"]',
  `metadata_updated_at` = '2026-07-28T15:37:36.984Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'I peccatori'
  AND `year` IS 2025;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q117085614',
  `imdb_id` = 'tt30144839',
  `rotten_tomatoes_id` = 'm/one_battle_after_another',
  `youtube_trailer_id` = 'uGlcwqplrIg',
  `trailer_title` = 'Una battaglia dopo l’altra | Trailer Ufficiale',
  `trailer_channel` = 'Warner Bros. Italia',
  `imdb_rating` = '7.9/10',
  `rotten_tomatoes_score` = '94%',
  `awards` = '["Golden Globe per il miglior film commedia o musicale","Golden Globe per il miglior regista","Golden Globe per la migliore attrice non protagonista","Golden Globe per la migliore sceneggiatura","Oscar al miglior attore non protagonista","Oscar al miglior casting","Oscar al miglior film","Oscar al miglior montaggio","Oscar al miglior regista","Oscar alla migliore sceneggiatura non originale"]',
  `metadata_updated_at` = '2026-07-28T15:37:38.491Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Una battaglia dopo l''altra'
  AND `year` IS 2025;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q126487478',
  `imdb_id` = 'tt26581740',
  `rotten_tomatoes_id` = 'm/weapons',
  `youtube_trailer_id` = 'pn3ffzc04r0',
  `trailer_title` = 'WEAPONS Trailer Ufficiale Italiano (2025) Josh Brolin, Julia Garner | Al Cinema',
  `trailer_channel` = 'Mr. Movie Italia',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = '93%',
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:49:05.782Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Weapons'
  AND `year` IS 2025;
--> statement-breakpoint
UPDATE `movies` SET
  `wikidata_id` = 'Q125131076',
  `imdb_id` = 'tt26657236',
  `rotten_tomatoes_id` = 'm/backrooms',
  `youtube_trailer_id` = 'Glc2LWw_S5g',
  `trailer_title` = 'BACKROOMS | Trailer Italiano Ufficiale HD',
  `trailer_channel` = 'I Wonder Pictures',
  `imdb_rating` = NULL,
  `rotten_tomatoes_score` = NULL,
  `awards` = NULL,
  `metadata_updated_at` = '2026-07-28T15:48:10.581Z'
WHERE `metadata_updated_at` IS NULL
  AND `title` = 'Backrooms'
  AND `year` IS 2026;
