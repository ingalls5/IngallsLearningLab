CREATE TABLE `homework_assignments` (
	`sequence` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id` text NOT NULL,
	`student_id` text NOT NULL,
	`subject` text NOT NULL,
	`title` text NOT NULL,
	`config` text NOT NULL,
	`problems` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`completed_activity_id` text,
	`cancelled_at` text,
	FOREIGN KEY (`student_id`) REFERENCES `family_members`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `family_members`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`completed_activity_id`) REFERENCES `activities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `homework_assignments_id_unique` ON `homework_assignments` (`id`);--> statement-breakpoint
CREATE INDEX `idx_assignments_student_queue` ON `homework_assignments` (`student_id`,`cancelled_at`,`completed_activity_id`,`sequence`);