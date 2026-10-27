CREATE TABLE "email_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"granted" boolean NOT NULL,
	"wording" text NOT NULL,
	"source" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reminders_opt_in" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "email_consents" ADD CONSTRAINT "email_consents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_consents_user_idx" ON "email_consents" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "email_consents" ENABLE ROW LEVEL SECURITY;