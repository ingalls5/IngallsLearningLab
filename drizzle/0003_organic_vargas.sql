ALTER TABLE `activities` ADD `submitted_by` text;--> statement-breakpoint
CREATE INDEX `idx_activities_submitter_created` ON `activities` (`submitted_by`,`created_at`);