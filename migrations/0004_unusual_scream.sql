CREATE TABLE "pulse_comment_mentions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pulse_comment_mentions" ADD CONSTRAINT "pulse_comment_mentions_comment_id_pulse_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."pulse_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pulse_comment_mentions" ADD CONSTRAINT "pulse_comment_mentions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "comment_mention_unique" ON "pulse_comment_mentions" USING btree ("comment_id","user_id");