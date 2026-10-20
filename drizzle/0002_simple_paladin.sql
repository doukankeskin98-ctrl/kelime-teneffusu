CREATE TABLE `campaign_saves` (
	`user_id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `challenge_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`challenge_id` text NOT NULL,
	`user_id` text NOT NULL,
	`data` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`finished` integer DEFAULT 0 NOT NULL,
	`duration` integer DEFAULT 0 NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `one_challenge_attempt` ON `challenge_runs` (`challenge_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `challenge_results` ON `challenge_runs` (`challenge_id`,`finished`,`duration`);--> statement-breakpoint
CREATE TABLE `challenges` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`creator_id` text NOT NULL,
	`theme_id` text NOT NULL,
	`level` integer NOT NULL,
	`seed` integer NOT NULL,
	`created` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `challenges_code_unique` ON `challenges` (`code`);--> statement-breakpoint
CREATE TABLE `friend_invites` (
	`code` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `friend_invite_owner` ON `friend_invites` (`user_id`);--> statement-breakpoint
CREATE TABLE `friendships` (
	`user_id` text NOT NULL,
	`friend_id` text NOT NULL,
	`created` integer NOT NULL,
	PRIMARY KEY(`user_id`, `friend_id`)
);
--> statement-breakpoint
CREATE TABLE `game_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `session_expiry` ON `game_sessions` (`expires`);--> statement-breakpoint
CREATE TABLE `metrics` (
	`day` text NOT NULL,
	`event` text NOT NULL,
	`bucket` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`day`, `event`, `bucket`)
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text NOT NULL,
	`window` integer NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`key`, `window`)
);
--> statement-breakpoint
CREATE INDEX `rate_window` ON `rate_limits` (`window`);--> statement-breakpoint
CREATE TABLE `rating_events` (
	`room_id` text PRIMARY KEY NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`value` integer DEFAULT 1000 NOT NULL,
	`played` integer DEFAULT 0 NOT NULL,
	`updated` integer NOT NULL
);
