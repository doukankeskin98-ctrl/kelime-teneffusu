CREATE TABLE `accounts` (
	`provider_id` text PRIMARY KEY NOT NULL,
	`game_user_id` text NOT NULL,
	`username` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_game_user_id_unique` ON `accounts` (`game_user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_username_unique` ON `accounts` (`username`);