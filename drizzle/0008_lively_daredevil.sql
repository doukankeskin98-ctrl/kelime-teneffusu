CREATE TABLE `campaign_save_migrations` (
	`user_id` text PRIMARY KEY NOT NULL,
	`source_revision` integer NOT NULL,
	`source_data` text NOT NULL,
	`compact_data` text NOT NULL,
	`backup_data` text,
	`backup_revision` integer,
	`updated` integer NOT NULL
);
