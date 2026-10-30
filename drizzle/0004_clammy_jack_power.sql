CREATE TABLE `arena_pool` (
	`id` text PRIMARY KEY NOT NULL,
	`next` integer DEFAULT 0 NOT NULL,
	`claim` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `arena_seen` (
	`user_id` text NOT NULL,
	`words_key` text NOT NULL,
	`grid_key` text NOT NULL,
	`room_id` text NOT NULL,
	`round` integer NOT NULL,
	`created` integer NOT NULL,
	PRIMARY KEY(`user_id`, `words_key`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `arena_seen_grid` ON `arena_seen` (`user_id`,`grid_key`);