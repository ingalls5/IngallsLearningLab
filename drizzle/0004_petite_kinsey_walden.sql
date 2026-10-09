CREATE TABLE `student_login_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`tries` integer NOT NULL,
	`started_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `student_logins` (
	`user_id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`code_salt` text NOT NULL,
	`code_hash` text NOT NULL,
	`failed_attempts` integer DEFAULT 0 NOT NULL,
	`locked_until` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `family_members`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `student_logins_username_unique` ON `student_logins` (`username`);--> statement-breakpoint
CREATE TABLE `student_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `student_logins`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_student_sessions_user` ON `student_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_student_sessions_expires` ON `student_sessions` (`expires_at`);