INSERT INTO family_members (user_id,email,name,role,status,created_at,updated_at) VALUES ('student-c9aeb535-2525-4731-a5db-ffef01a2dd79','','Owen','student','approved',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) ON CONFLICT(user_id) DO NOTHING;
--> statement-breakpoint
-- Legacy first-time credential material is excluded from the GitHub handoff.
-- Empty verifiers reject legacy setup codes; current button login still works.
INSERT INTO student_logins (user_id,username,code_salt,code_hash,password_set,updated_at) VALUES ('student-c9aeb535-2525-4731-a5db-ffef01a2dd79','owen','','',0,CURRENT_TIMESTAMP) ON CONFLICT(username) DO NOTHING;
