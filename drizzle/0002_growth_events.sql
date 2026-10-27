CREATE TABLE "growth_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"visitor_id" text NOT NULL,
	"user_id" uuid,
	"day" smallint,
	"source" text,
	"campaign" text,
	"variant" text,
	"path" text,
	"value" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "growth_events" ADD CONSTRAINT "growth_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "growth_events_name_created_idx" ON "growth_events" USING btree ("name","created_at");--> statement-breakpoint
CREATE INDEX "growth_events_visitor_idx" ON "growth_events" USING btree ("visitor_id");--> statement-breakpoint
CREATE INDEX "growth_events_user_idx" ON "growth_events" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "growth_events" ENABLE ROW LEVEL SECURITY;