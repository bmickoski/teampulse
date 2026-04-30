CREATE TABLE "invite_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"org_id" uuid NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	CONSTRAINT "invite_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"pulse_id" uuid,
	"message" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pulse_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pulse_id" uuid NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pulse_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pulse_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pulses" ADD COLUMN "due_date" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "active_org_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "dashboard_layout" jsonb;--> statement-breakpoint
ALTER TABLE "invite_tokens" ADD CONSTRAINT "invite_tokens_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_pulse_id_pulses_id_fk" FOREIGN KEY ("pulse_id") REFERENCES "public"."pulses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_assignments" ADD CONSTRAINT "pulse_assignments_pulse_id_pulses_id_fk" FOREIGN KEY ("pulse_id") REFERENCES "public"."pulses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_assignments" ADD CONSTRAINT "pulse_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_comments" ADD CONSTRAINT "pulse_comments_pulse_id_pulses_id_fk" FOREIGN KEY ("pulse_id") REFERENCES "public"."pulses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_comments" ADD CONSTRAINT "pulse_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "pulse_user_unique" ON "pulse_assignments" USING btree ("pulse_id","user_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_active_org_id_organizations_id_fk" FOREIGN KEY ("active_org_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;