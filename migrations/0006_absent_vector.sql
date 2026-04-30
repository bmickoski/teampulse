CREATE INDEX "activity_logs_org_created_idx" ON "activity_logs" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "activity_logs_pulse_created_idx" ON "activity_logs" USING btree ("pulse_id","created_at");--> statement-breakpoint
CREATE INDEX "memberships_user_idx" ON "memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "memberships_org_idx" ON "memberships" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "notifications_user_created_idx" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "notifications_user_read_idx" ON "notifications" USING btree ("user_id","read");--> statement-breakpoint
CREATE INDEX "pulse_assignments_user_idx" ON "pulse_assignments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pulse_comments_pulse_created_idx" ON "pulse_comments" USING btree ("pulse_id","created_at");--> statement-breakpoint
CREATE INDEX "pulses_org_created_idx" ON "pulses" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "pulses_org_status_idx" ON "pulses" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "pulses_org_priority_idx" ON "pulses" USING btree ("organization_id","priority");--> statement-breakpoint
CREATE INDEX "pulses_org_deleted_idx" ON "pulses" USING btree ("organization_id","deleted_at");