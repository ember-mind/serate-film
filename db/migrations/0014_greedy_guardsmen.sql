CREATE TABLE IF NOT EXISTS `user_friends` (
	`user_id` integer NOT NULL,
	`friend_user_id` integer NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	PRIMARY KEY(`user_id`, `friend_user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`friend_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
