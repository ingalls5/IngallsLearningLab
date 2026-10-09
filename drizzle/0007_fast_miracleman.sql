CREATE TABLE `teacher_students` (
	`user_id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `family_members`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `student_logins`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_teacher_students_student` ON `teacher_students` (`student_id`);