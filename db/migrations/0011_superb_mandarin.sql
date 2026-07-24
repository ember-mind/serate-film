CREATE TABLE `runoff_votes` (
	`event_movie_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	PRIMARY KEY(`event_movie_id`, `user_id`),
	FOREIGN KEY (`event_movie_id`) REFERENCES `event_movies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `event_movies` ADD `in_runoff` integer DEFAULT false NOT NULL;