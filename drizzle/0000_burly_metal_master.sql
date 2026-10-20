CREATE TABLE `dailies` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`nickname` text NOT NULL,
	`day` text NOT NULL,
	`data` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`completed` integer DEFAULT 0 NOT NULL,
	`duration` integer DEFAULT 0 NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `one_daily_attempt` ON `dailies` (`user_id`,`day`);--> statement-breakpoint
CREATE INDEX `daily_ranking` ON `dailies` (`day`,`completed`,`duration`);--> statement-breakpoint
CREATE TABLE `members` (
	`room_id` text NOT NULL,
	`user_id` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`room_id`, `user_id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `one_active_room_per_player` ON `members` (`user_id`) WHERE "members"."active"=1;--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`nickname` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `results` (
	`room_id` text NOT NULL,
	`user_id` text NOT NULL,
	`nickname` text NOT NULL,
	`score` integer NOT NULL,
	`win` integer NOT NULL,
	`created` integer NOT NULL,
	PRIMARY KEY(`room_id`, `user_id`)
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`kind` text NOT NULL,
	`phase` text NOT NULL,
	`data` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`expires` integer NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rooms_code_unique` ON `rooms` (`code`);--> statement-breakpoint
CREATE INDEX `room_queue` ON `rooms` (`kind`,`phase`,`expires`);