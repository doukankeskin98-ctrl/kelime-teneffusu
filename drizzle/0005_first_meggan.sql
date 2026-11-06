CREATE TABLE `deleted_players` (
	`user_id` text PRIMARY KEY NOT NULL,
	`provider_id` text,
	`receipt_hash` text NOT NULL,
	`provider_done` integer DEFAULT 0 NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `deleted_players_provider_id_unique` ON `deleted_players` (`provider_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `deleted_players_receipt_hash_unique` ON `deleted_players` (`receipt_hash`);--> statement-breakpoint
CREATE TABLE `player_blocks` (
	`user_id` text NOT NULL,
	`blocked_id` text NOT NULL,
	`created` integer NOT NULL,
	PRIMARY KEY(`user_id`, `blocked_id`)
);
--> statement-breakpoint
CREATE TABLE `player_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`reporter_id` text NOT NULL,
	`target_id` text NOT NULL,
	`reason` text NOT NULL,
	`name_snapshot` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created` integer NOT NULL,
	`reviewed` integer,
	`reviewer_id` text
);
--> statement-breakpoint
CREATE INDEX `reports_queue` ON `player_reports` (`status`,`created`);--> statement-breakpoint
CREATE TABLE `player_restrictions` (
	`user_id` text PRIMARY KEY NOT NULL,
	`name_locked` integer DEFAULT 1 NOT NULL,
	`created` integer NOT NULL
);

--> statement-breakpoint
CREATE TRIGGER erased_players_insert BEFORE INSERT ON players WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_players_update BEFORE UPDATE ON players WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_accounts_insert BEFORE INSERT ON accounts WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.game_user_id OR d.provider_id=NEW.provider_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_accounts_update BEFORE UPDATE ON accounts WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.game_user_id OR d.provider_id=NEW.provider_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_game_sessions_insert BEFORE INSERT ON game_sessions WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_game_sessions_update BEFORE UPDATE ON game_sessions WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_campaign_saves_insert BEFORE INSERT ON campaign_saves WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_campaign_saves_update BEFORE UPDATE ON campaign_saves WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_chapter_saves_insert BEFORE INSERT ON chapter_saves WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_chapter_saves_update BEFORE UPDATE ON chapter_saves WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_dailies_insert BEFORE INSERT ON dailies WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_dailies_update BEFORE UPDATE ON dailies WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_challenge_runs_insert BEFORE INSERT ON challenge_runs WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_challenge_runs_update BEFORE UPDATE ON challenge_runs WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_friend_invites_insert BEFORE INSERT ON friend_invites WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_friend_invites_update BEFORE UPDATE ON friend_invites WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_ratings_insert BEFORE INSERT ON ratings WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_ratings_update BEFORE UPDATE ON ratings WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_arena_seen_insert BEFORE INSERT ON arena_seen WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_arena_seen_update BEFORE UPDATE ON arena_seen WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_members_insert BEFORE INSERT ON members WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_members_update BEFORE UPDATE ON members WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_friendships_insert BEFORE INSERT ON friendships WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id OR d.user_id=NEW.friend_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_friendships_update BEFORE UPDATE ON friendships WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id OR d.user_id=NEW.friend_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_results_insert BEFORE INSERT ON results WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_results_update BEFORE UPDATE ON results WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_challenges_insert BEFORE INSERT ON challenges WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.creator_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_challenges_update BEFORE UPDATE ON challenges WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.creator_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_player_blocks_insert BEFORE INSERT ON player_blocks WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id OR d.user_id=NEW.blocked_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_player_blocks_update BEFORE UPDATE ON player_blocks WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id OR d.user_id=NEW.blocked_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_player_reports_insert BEFORE INSERT ON player_reports WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.reporter_id OR d.user_id=NEW.target_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_player_reports_update BEFORE UPDATE ON player_reports WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.reporter_id OR d.user_id=NEW.target_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_player_restrictions_insert BEFORE INSERT ON player_restrictions WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_player_restrictions_update BEFORE UPDATE ON player_restrictions WHEN EXISTS(SELECT 1 FROM deleted_players d WHERE d.user_id=NEW.user_id) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_rooms_insert BEFORE INSERT ON rooms WHEN EXISTS(SELECT 1 FROM json_tree(NEW.data) j JOIN deleted_players d ON d.user_id=j.value OR (j.type='integer' AND d.user_id=j.key)) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER blocked_rooms_insert BEFORE INSERT ON rooms WHEN NEW.phase IN ('waiting','ready','active') AND EXISTS(SELECT 1 FROM json_each(NEW.data,'$.players') a JOIN json_each(NEW.data,'$.players') b JOIN player_blocks p ON p.user_id=json_extract(a.value,'$.id') AND p.blocked_id=json_extract(b.value,'$.id') WHERE COALESCE(json_extract(a.value,'$.left'),0)=0 AND COALESCE(json_extract(b.value,'$.left'),0)=0) BEGIN SELECT RAISE(ABORT,'PLAYER_BLOCKED'); END;

--> statement-breakpoint
CREATE TRIGGER erased_rooms_update BEFORE UPDATE ON rooms WHEN EXISTS(SELECT 1 FROM json_tree(NEW.data) j JOIN deleted_players d ON d.user_id=j.value OR (j.type='integer' AND d.user_id=j.key)) BEGIN SELECT RAISE(ABORT,'PLAYER_ERASED'); END;

--> statement-breakpoint
CREATE TRIGGER blocked_rooms_update BEFORE UPDATE ON rooms WHEN NEW.phase IN ('waiting','ready','active') AND EXISTS(SELECT 1 FROM json_each(NEW.data,'$.players') a JOIN json_each(NEW.data,'$.players') b JOIN player_blocks p ON p.user_id=json_extract(a.value,'$.id') AND p.blocked_id=json_extract(b.value,'$.id') WHERE COALESCE(json_extract(a.value,'$.left'),0)=0 AND COALESCE(json_extract(b.value,'$.left'),0)=0) BEGIN SELECT RAISE(ABORT,'PLAYER_BLOCKED'); END;

--> statement-breakpoint
CREATE TRIGGER blocked_friends_insert BEFORE INSERT ON friendships WHEN EXISTS(SELECT 1 FROM player_blocks WHERE (user_id=NEW.user_id AND blocked_id=NEW.friend_id) OR (user_id=NEW.friend_id AND blocked_id=NEW.user_id)) BEGIN SELECT RAISE(ABORT,'PLAYER_BLOCKED'); END;

--> statement-breakpoint
CREATE TRIGGER blocked_friends_update BEFORE UPDATE ON friendships WHEN EXISTS(SELECT 1 FROM player_blocks WHERE (user_id=NEW.user_id AND blocked_id=NEW.friend_id) OR (user_id=NEW.friend_id AND blocked_id=NEW.user_id)) BEGIN SELECT RAISE(ABORT,'PLAYER_BLOCKED'); END;

--> statement-breakpoint
CREATE TRIGGER moderated_name_update BEFORE UPDATE OF nickname ON players WHEN NEW.nickname<>'Oyuncu' AND EXISTS(SELECT 1 FROM player_restrictions WHERE user_id=NEW.id AND name_locked=1) BEGIN SELECT RAISE(ABORT,'NAME_RESTRICTED'); END;
--> statement-breakpoint
CREATE TRIGGER blocked_challenge_insert BEFORE INSERT ON challenge_runs WHEN EXISTS(SELECT 1 FROM challenges c JOIN player_blocks b ON (b.user_id=NEW.user_id AND b.blocked_id=c.creator_id) OR (b.user_id=c.creator_id AND b.blocked_id=NEW.user_id) WHERE c.id=NEW.challenge_id) BEGIN SELECT RAISE(ABORT,'PLAYER_BLOCKED'); END;
--> statement-breakpoint
CREATE TRIGGER blocked_challenge_update BEFORE UPDATE ON challenge_runs WHEN EXISTS(SELECT 1 FROM challenges c JOIN player_blocks b ON (b.user_id=NEW.user_id AND b.blocked_id=c.creator_id) OR (b.user_id=c.creator_id AND b.blocked_id=NEW.user_id) WHERE c.id=NEW.challenge_id) BEGIN SELECT RAISE(ABORT,'PLAYER_BLOCKED'); END;
