CREATE TABLE `user_seen_movies` (
	`user_id` integer NOT NULL,
	`movie_id` integer NOT NULL,
	`watched_at` text DEFAULT (datetime('now')) NOT NULL,
	PRIMARY KEY(`user_id`, `movie_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE no action ON DELETE no action
);
