CREATE TABLE `admin_audit` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text NOT NULL,
	`action` text NOT NULL,
	`entity_id` text NOT NULL,
	`summary` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `admin_audit_time` ON `admin_audit` (`created`);--> statement-breakpoint
CREATE TABLE `admin_owners` (
	`slot` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created` integer NOT NULL,
	`claim_operation` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_owners_user_id_unique` ON `admin_owners` (`user_id`);--> statement-breakpoint
CREATE TABLE `chapter_saves` (
	`user_id` text NOT NULL,
	`chapter_id` text NOT NULL,
	`data` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`complete` integer DEFAULT 0 NOT NULL,
	`created` integer NOT NULL,
	`updated` integer NOT NULL,
	`completed_at` integer,
	PRIMARY KEY(`user_id`, `chapter_id`)
);
--> statement-breakpoint
CREATE INDEX `chapter_progress_totals` ON `chapter_saves` (`chapter_id`,`complete`);--> statement-breakpoint
CREATE TABLE `operational_faults` (
	`day` text NOT NULL,
	`area` text NOT NULL,
	`code` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`reviewed_count` integer DEFAULT 0 NOT NULL,
	`first_seen` integer NOT NULL,
	`last_seen` integer NOT NULL,
	`last_operation` text NOT NULL,
	PRIMARY KEY(`day`, `area`, `code`)
);
--> statement-breakpoint
CREATE TABLE `studio_chapters` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`spec` text NOT NULL,
	`board` text NOT NULL,
	`content_hash` text NOT NULL,
	`search_text` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`created` integer NOT NULL,
	`updated` integer NOT NULL,
	`published` integer,
	`last_operation` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `studio_public_catalogue` ON `studio_chapters` (`status`,`published`);