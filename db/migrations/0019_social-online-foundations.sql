CREATE TABLE `circle_follows` (
	`circle_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	PRIMARY KEY(`circle_id`, `user_id`),
	FOREIGN KEY (`circle_id`) REFERENCES `circles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `circle_members` (
	`circle_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`invited_by` integer,
	`joined_at` text DEFAULT (datetime('now')) NOT NULL,
	PRIMARY KEY(`circle_id`, `user_id`),
	FOREIGN KEY (`circle_id`) REFERENCES `circles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `circles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`owner_id` integer NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`join_policy` text DEFAULT 'invite' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `circles_slug_unique` ON `circles` (`slug`);--> statement-breakpoint
CREATE TABLE `event_rooms` (
	`event_id` integer PRIMARY KEY NOT NULL,
	`mode` text NOT NULL,
	`media_provider` text NOT NULL,
	`youtube_video_id` text,
	`external_playback_url` text,
	`streamer_url` text,
	`rights_basis` text NOT NULL,
	`rights_source_url` text,
	`playback_status` text DEFAULT 'waiting' NOT NULL,
	`position_seconds` integer DEFAULT 0 NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated_by` integer,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `event_rsvps` (
	`event_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`status` text NOT NULL,
	`guest_count` integer DEFAULT 0 NOT NULL,
	`note` text,
	`responded_at` text DEFAULT (datetime('now')) NOT NULL,
	PRIMARY KEY(`event_id`, `user_id`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `movie_availability` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`movie_id` integer NOT NULL,
	`country` text DEFAULT 'IT' NOT NULL,
	`provider` text NOT NULL,
	`type` text NOT NULL,
	`url` text,
	`price` text,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `movie_availability_unique` ON `movie_availability` (`movie_id`,`country`,`provider`,`type`);--> statement-breakpoint
CREATE TABLE `movie_ballot_items` (
	`ballot_id` integer NOT NULL,
	`event_movie_id` integer NOT NULL,
	`rank` integer,
	`veto` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`ballot_id`, `event_movie_id`),
	FOREIGN KEY (`ballot_id`) REFERENCES `movie_ballots`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`event_movie_id`) REFERENCES `event_movies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `movie_ballot_rank_unique` ON `movie_ballot_items` (`ballot_id`,`rank`);--> statement-breakpoint
CREATE TABLE `movie_ballots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`submitted_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `movie_ballots_event_user_unique` ON `movie_ballots` (`event_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `rating_comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`rating_user_id` integer NOT NULL,
	`author_user_id` integer NOT NULL,
	`body` text NOT NULL,
	`spoiler` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`edited_at` text,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`rating_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `room_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`kind` text DEFAULT 'chat' NOT NULL,
	`body` text NOT NULL,
	`timecode_seconds` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `room_participants` (
	`event_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`ready` integer DEFAULT false NOT NULL,
	`joined_at` text DEFAULT (datetime('now')) NOT NULL,
	`last_seen_at` text DEFAULT (datetime('now')) NOT NULL,
	PRIMARY KEY(`event_id`, `user_id`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `room_poll_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`poll_id` integer NOT NULL,
	`label` text NOT NULL,
	FOREIGN KEY (`poll_id`) REFERENCES `room_polls`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `room_poll_votes` (
	`poll_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`option_id` integer NOT NULL,
	PRIMARY KEY(`poll_id`, `user_id`),
	FOREIGN KEY (`poll_id`) REFERENCES `room_polls`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`option_id`) REFERENCES `room_poll_options`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `room_polls` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`question` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created_by` integer NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `screening_licenses` (
	`event_id` integer PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`territory` text DEFAULT 'IT' NOT NULL,
	`capacity` integer,
	`reference` text,
	`evidence_url` text,
	`expires_at` text,
	`reviewed_by` integer,
	`reviewed_at` text,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`user_id` integer PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`bio` text,
	`favorite_genres` text,
	`visibility` text DEFAULT 'private' NOT NULL,
	`discoverable` integer DEFAULT false NOT NULL,
	`show_stats` integer DEFAULT false NOT NULL,
	`allow_mentions` integer DEFAULT true NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_profiles_slug_unique` ON `user_profiles` (`slug`);--> statement-breakpoint
ALTER TABLE `events` ADD `circle_id` integer REFERENCES circles(id);--> statement-breakpoint
ALTER TABLE `events` ADD `access` text DEFAULT 'club' NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `discoverable` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `viewing_mode` text DEFAULT 'in_person' NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `rsvp_deadline` text;--> statement-breakpoint
ALTER TABLE `events` ADD `voting_deadline` text;--> statement-breakpoint
ALTER TABLE `events` ADD `movie_decision_method` text DEFAULT 'ranked' NOT NULL;--> statement-breakpoint
INSERT INTO `user_profiles` (`user_id`, `slug`, `visibility`, `discoverable`, `show_stats`, `allow_mentions`)
SELECT `id`, `username`, 'private', false, false, true FROM `users`;--> statement-breakpoint
INSERT INTO `circles` (`name`, `slug`, `description`, `owner_id`, `visibility`, `join_policy`)
SELECT 'Serate Film', 'serate-film', 'Il circolo originale della sala.', `id`, 'private', 'invite'
FROM `users`
ORDER BY `is_admin` DESC, `id` ASC
LIMIT 1;--> statement-breakpoint
INSERT INTO `circle_members` (`circle_id`, `user_id`, `role`, `status`, `invited_by`)
SELECT
  (SELECT `id` FROM `circles` WHERE `slug` = 'serate-film'),
  `users`.`id`,
  CASE
    WHEN `users`.`id` = (SELECT `owner_id` FROM `circles` WHERE `slug` = 'serate-film') THEN 'owner'
    ELSE 'member'
  END,
  'active',
  (SELECT `owner_id` FROM `circles` WHERE `slug` = 'serate-film')
FROM `users`
WHERE EXISTS (SELECT 1 FROM `circles` WHERE `slug` = 'serate-film');--> statement-breakpoint
UPDATE `events`
SET
  `circle_id` = (SELECT `id` FROM `circles` WHERE `slug` = 'serate-film'),
  `access` = CASE
    WHEN EXISTS (
      SELECT 1 FROM `event_invitees`
      WHERE `event_invitees`.`event_id` = `events`.`id`
    ) THEN 'invite_only'
    ELSE 'circle'
  END;
