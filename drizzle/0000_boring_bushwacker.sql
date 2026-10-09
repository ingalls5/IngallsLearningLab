CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`subject` text NOT NULL,
	`title` text NOT NULL,
	`score` integer NOT NULL,
	`total` integer NOT NULL,
	`details` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`endpoint` text NOT NULL,
	`subscription` text NOT NULL,
	`created_at` text NOT NULL
);
