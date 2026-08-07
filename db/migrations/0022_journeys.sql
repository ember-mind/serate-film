CREATE TABLE `journeys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`subject_type` text NOT NULL,
	`subject_name` text NOT NULL,
	`subject_slug` text NOT NULL,
	`mode` text DEFAULT 'chronological' NOT NULL,
	`created_by` integer NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
CREATE UNIQUE INDEX `journeys_creator_subject_mode_unique` ON `journeys` (`created_by`,`subject_type`,`subject_slug`,`mode`);--> statement-breakpoint
CREATE TABLE `journey_movies` (
	`journey_id` integer NOT NULL,
	`movie_id` integer NOT NULL,
	`position` integer NOT NULL,
	PRIMARY KEY(`journey_id`, `movie_id`),
	FOREIGN KEY (`journey_id`) REFERENCES `journeys`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
CREATE UNIQUE INDEX `journey_movies_position_unique` ON `journey_movies` (`journey_id`,`position`);--> statement-breakpoint
CREATE TABLE `journey_members` (
	`journey_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`status` text DEFAULT 'invited' NOT NULL,
	`invited_by` integer NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`accepted_at` text,
	PRIMARY KEY(`journey_id`, `user_id`),
	FOREIGN KEY (`journey_id`) REFERENCES `journeys`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
