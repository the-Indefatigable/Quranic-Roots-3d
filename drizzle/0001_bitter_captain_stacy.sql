CREATE TABLE "user_verb_progress" (
	"user_id" uuid NOT NULL,
	"verb_id" text NOT NULL,
	"remembered_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_verb_progress_user_id_verb_id_pk" PRIMARY KEY("user_id","verb_id")
);
--> statement-breakpoint
ALTER TABLE "user_verb_progress" ADD CONSTRAINT "user_verb_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;