CREATE TABLE "account" (
	"userId" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"icon_svg" text,
	"xp_bonus" integer DEFAULT 0,
	"unlock_criteria" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "achievements_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE "ayahs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"surah_number" integer NOT NULL,
	"ayah_number" integer NOT NULL,
	"text_uthmani" text NOT NULL,
	"text_simple" text,
	"juz_number" integer,
	"hizb_quarter" integer,
	"page_number" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"root_id" uuid,
	"noun_id" uuid,
	"surah_id" integer,
	"ayah_number" integer,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"room" text DEFAULT 'general' NOT NULL,
	"body" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkpoint_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"after_unit_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" jsonb NOT NULL,
	"passing_score" smallint DEFAULT 14 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"goal_date" date NOT NULL,
	"target_xp" integer DEFAULT 30 NOT NULL,
	"earned_xp" integer DEFAULT 0 NOT NULL,
	"lessons_completed" integer DEFAULT 0 NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_quests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"quest_date" date NOT NULL,
	"quest_type" text NOT NULL,
	"title" text NOT NULL,
	"target" integer NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"gem_reward" integer DEFAULT 5 NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "edit_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid,
	"table_name" text NOT NULL,
	"record_id" uuid NOT NULL,
	"field_name" text NOT NULL,
	"old_value" text,
	"new_value" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category" text DEFAULT 'suggestion' NOT NULL,
	"body" text NOT NULL,
	"page" text,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"root_id" uuid NOT NULL,
	"form_number" text NOT NULL,
	"arabic_pattern" text NOT NULL,
	"meaning" text,
	"semantic_meaning" text,
	"verb_meaning" text,
	"masdar" text,
	"masdar_alternatives" text[],
	"faaeil" text,
	"mafool" text,
	"prepositions" jsonb DEFAULT '[]'::jsonb,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gem_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leaderboard_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"rank" integer NOT NULL,
	"total_xp" integer NOT NULL,
	"period" text NOT NULL,
	"period_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "league_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"league_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"weekly_xp" integer DEFAULT 0 NOT NULL,
	"rank" integer,
	"promoted" boolean,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "learning_lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"sort_order" integer NOT NULL,
	"lesson_type" text DEFAULT 'standard',
	"content" jsonb NOT NULL,
	"xp_reward" integer DEFAULT 15,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "learning_units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"title_ar" text,
	"description" text,
	"icon_emoji" text DEFAULT '📖',
	"color" text DEFAULT '#D4A246',
	"sort_order" integer NOT NULL,
	"checkpoint_after" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "learning_units_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "nouns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"root_id" uuid,
	"lemma" text NOT NULL,
	"lemma_clean" text NOT NULL,
	"type" text NOT NULL,
	"type_ar" text,
	"baab" text,
	"meaning" text,
	"total_freq" integer DEFAULT 0,
	"references" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "particles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form" text NOT NULL,
	"form_buckwalter" text NOT NULL,
	"type" text NOT NULL,
	"meaning" text,
	"frequency" integer DEFAULT 0,
	"example_location" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"question_id" text,
	"item_type" text NOT NULL,
	"item_id" uuid NOT NULL,
	"question_type" text NOT NULL,
	"quest_prompt" text,
	"user_answer" text NOT NULL,
	"correct_answer" text NOT NULL,
	"is_correct" boolean NOT NULL,
	"response_time_ms" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"quiz_type" text NOT NULL,
	"item_count" integer NOT NULL,
	"correct_count" integer NOT NULL,
	"score" integer NOT NULL,
	"duration_s" integer,
	"questions" jsonb DEFAULT '[]'::jsonb,
	"session_started_at" timestamp with time zone DEFAULT now(),
	"session_ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quran_words" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"surah_number" integer NOT NULL,
	"ayah_number" integer NOT NULL,
	"position" integer NOT NULL,
	"text_uthmani" text NOT NULL,
	"text_simple" text,
	"transliteration" text,
	"translation" text,
	"root_arabic" text,
	"char_type" text DEFAULT 'word',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"root" text NOT NULL,
	"root_letters" text[] NOT NULL,
	"meaning" text NOT NULL,
	"total_freq" integer DEFAULT 0,
	"all_references" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "roots_root_unique" UNIQUE("root")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "surahs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" integer NOT NULL,
	"arabic_name" text NOT NULL,
	"english_name" text NOT NULL,
	"revelation_type" text,
	"verses_count" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "surahs_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "tafsir_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tafsir_id" uuid NOT NULL,
	"surah_number" integer NOT NULL,
	"ayah_number" integer NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tafsirs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"author_name" text,
	"language_code" text DEFAULT 'en',
	"resource_id" integer,
	"slug" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"type" text NOT NULL,
	"arabic_name" text NOT NULL,
	"english_name" text NOT NULL,
	"occurrences" integer DEFAULT 0,
	"references" jsonb DEFAULT '[]'::jsonb,
	"conjugations" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "translation_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"translation_id" uuid NOT NULL,
	"surah_number" integer NOT NULL,
	"ayah_number" integer NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"author_name" text,
	"language_code" text DEFAULT 'en',
	"resource_id" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"user_id" uuid NOT NULL,
	"achievement_id" uuid NOT NULL,
	"unlocked_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_achievements_user_id_achievement_id_pk" PRIMARY KEY("user_id","achievement_id")
);
--> statement-breakpoint
CREATE TABLE "user_activity" (
	"user_id" uuid NOT NULL,
	"activity_date" date NOT NULL,
	"quizzes_taken" integer DEFAULT 0,
	"roots_studied" integer DEFAULT 0,
	"lessons_done" integer DEFAULT 0,
	"time_spent_s" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "user_gems" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"total_earned" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_hearts" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"hearts" smallint DEFAULT 5 NOT NULL,
	"max_hearts" smallint DEFAULT 5 NOT NULL,
	"last_refill_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_lesson_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"status" text DEFAULT 'locked',
	"score" integer,
	"best_score" integer,
	"attempts" integer DEFAULT 0,
	"mistakes" jsonb DEFAULT '[]'::jsonb,
	"completed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_noun_mastery" (
	"user_id" uuid NOT NULL,
	"noun_id" uuid NOT NULL,
	"mastery" integer DEFAULT 0,
	"next_review" timestamp with time zone,
	"total_attempts" integer DEFAULT 0,
	"correct_attempts" integer DEFAULT 0,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_particle_mastery" (
	"user_id" uuid NOT NULL,
	"particle_id" uuid NOT NULL,
	"mastery" integer DEFAULT 0,
	"next_review" timestamp with time zone,
	"total_attempts" integer DEFAULT 0,
	"correct_attempts" integer DEFAULT 0,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_root_mastery" (
	"user_id" uuid NOT NULL,
	"root_id" uuid NOT NULL,
	"mastery" integer DEFAULT 0,
	"next_review" timestamp with time zone,
	"total_attempts" integer DEFAULT 0,
	"correct_attempts" integer DEFAULT 0,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_streaks" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_active_date" date,
	"streak_freezes_owned" smallint DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_unit_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"unit_id" uuid NOT NULL,
	"status" text DEFAULT 'locked',
	"crown_level" smallint DEFAULT 0,
	"lessons_completed" integer DEFAULT 0,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_word_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"vocab_id" uuid NOT NULL,
	"due_at" timestamp with time zone DEFAULT now() NOT NULL,
	"interval_days" real DEFAULT 0 NOT NULL,
	"ease" real DEFAULT 2.5 NOT NULL,
	"reps" integer DEFAULT 0 NOT NULL,
	"lapses" integer DEFAULT 0 NOT NULL,
	"last_answered" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"email_verified" timestamp with time zone,
	"password_hash" text,
	"name" text,
	"image" text,
	"avatar_url" text,
	"role" text DEFAULT 'student' NOT NULL,
	"preferred_lang" text DEFAULT 'en',
	"streak_days" integer DEFAULT 0,
	"last_active" date,
	"total_xp" integer DEFAULT 0,
	"user_level" integer DEFAULT 1,
	"level_progress" integer DEFAULT 0,
	"digest_opt_in" boolean DEFAULT false NOT NULL,
	"unsubscribe_token" uuid DEFAULT gen_random_uuid() NOT NULL,
	"is_supporter" boolean DEFAULT false NOT NULL,
	"supporter_since" timestamp with time zone,
	"supporter_order_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_token" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "verification_token_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "vocabulary_bank" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"word_ar" text NOT NULL,
	"transliteration" text NOT NULL,
	"english" text NOT NULL,
	"word_type" text NOT NULL,
	"gender" text,
	"number" text,
	"grammar_case" text,
	"unit_id" uuid,
	"quranic_ref" text,
	"difficulty" smallint DEFAULT 1,
	"root_arabic" text,
	"token_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "weekly_leagues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"week_start" date NOT NULL,
	"tier" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_root_id_roots_id_fk" FOREIGN KEY ("root_id") REFERENCES "public"."roots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_noun_id_nouns_id_fk" FOREIGN KEY ("noun_id") REFERENCES "public"."nouns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkpoint_tests" ADD CONSTRAINT "checkpoint_tests_after_unit_id_learning_units_id_fk" FOREIGN KEY ("after_unit_id") REFERENCES "public"."learning_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_goals" ADD CONSTRAINT "daily_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_quests" ADD CONSTRAINT "daily_quests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_root_id_roots_id_fk" FOREIGN KEY ("root_id") REFERENCES "public"."roots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gem_transactions" ADD CONSTRAINT "gem_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_snapshots" ADD CONSTRAINT "leaderboard_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league_members" ADD CONSTRAINT "league_members_league_id_weekly_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."weekly_leagues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league_members" ADD CONSTRAINT "league_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_lessons" ADD CONSTRAINT "learning_lessons_unit_id_learning_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."learning_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nouns" ADD CONSTRAINT "nouns_root_id_roots_id_fk" FOREIGN KEY ("root_id") REFERENCES "public"."roots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_session_id_quiz_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."quiz_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tafsir_entries" ADD CONSTRAINT "tafsir_entries_tafsir_id_tafsirs_id_fk" FOREIGN KEY ("tafsir_id") REFERENCES "public"."tafsirs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenses" ADD CONSTRAINT "tenses_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "translation_entries" ADD CONSTRAINT "translation_entries_translation_id_translations_id_fk" FOREIGN KEY ("translation_id") REFERENCES "public"."translations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_gems" ADD CONSTRAINT "user_gems_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_hearts" ADD CONSTRAINT "user_hearts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_lesson_id_learning_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."learning_lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_noun_mastery" ADD CONSTRAINT "user_noun_mastery_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_noun_mastery" ADD CONSTRAINT "user_noun_mastery_noun_id_nouns_id_fk" FOREIGN KEY ("noun_id") REFERENCES "public"."nouns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_particle_mastery" ADD CONSTRAINT "user_particle_mastery_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_particle_mastery" ADD CONSTRAINT "user_particle_mastery_particle_id_particles_id_fk" FOREIGN KEY ("particle_id") REFERENCES "public"."particles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_root_mastery" ADD CONSTRAINT "user_root_mastery_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_root_mastery" ADD CONSTRAINT "user_root_mastery_root_id_roots_id_fk" FOREIGN KEY ("root_id") REFERENCES "public"."roots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_streaks" ADD CONSTRAINT "user_streaks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_unit_progress" ADD CONSTRAINT "user_unit_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_unit_progress" ADD CONSTRAINT "user_unit_progress_unit_id_learning_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."learning_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_word_reviews" ADD CONSTRAINT "user_word_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_word_reviews" ADD CONSTRAINT "user_word_reviews_vocab_id_vocabulary_bank_id_fk" FOREIGN KEY ("vocab_id") REFERENCES "public"."vocabulary_bank"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocabulary_bank" ADD CONSTRAINT "vocabulary_bank_unit_id_learning_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."learning_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "achievements_category_idx" ON "achievements" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "ayahs_surah_ayah_unique" ON "ayahs" USING btree ("surah_number","ayah_number");--> statement-breakpoint
CREATE INDEX "chat_messages_room_created_idx" ON "chat_messages" USING btree ("room","created_at");--> statement-breakpoint
CREATE INDEX "chat_messages_user_created_idx" ON "chat_messages" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "checkpoint_tests_unit_unique" ON "checkpoint_tests" USING btree ("after_unit_id");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_goals_user_date" ON "daily_goals" USING btree ("user_id","goal_date");--> statement-breakpoint
CREATE INDEX "daily_goals_user_idx" ON "daily_goals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "daily_quests_user_date_idx" ON "daily_quests" USING btree ("user_id","quest_date");--> statement-breakpoint
CREATE INDEX "feedback_status_created_idx" ON "feedback" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "feedback_user_created_idx" ON "feedback" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "forms_root_form_unique" ON "forms" USING btree ("root_id","form_number");--> statement-breakpoint
CREATE INDEX "gem_transactions_user_idx" ON "gem_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "gem_transactions_created_idx" ON "gem_transactions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "leaderboard_snapshots_user_idx" ON "leaderboard_snapshots" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "leaderboard_snapshots_period_idx" ON "leaderboard_snapshots" USING btree ("period","period_date","rank");--> statement-breakpoint
CREATE INDEX "leaderboard_snapshots_rank_idx" ON "leaderboard_snapshots" USING btree ("period","period_date","total_xp");--> statement-breakpoint
CREATE UNIQUE INDEX "league_members_unique" ON "league_members" USING btree ("league_id","user_id");--> statement-breakpoint
CREATE INDEX "league_members_league_xp_idx" ON "league_members" USING btree ("league_id","weekly_xp");--> statement-breakpoint
CREATE UNIQUE INDEX "learning_lessons_unit_slug" ON "learning_lessons" USING btree ("unit_id","slug");--> statement-breakpoint
CREATE INDEX "learning_lessons_unit_sort_idx" ON "learning_lessons" USING btree ("unit_id","sort_order");--> statement-breakpoint
CREATE INDEX "learning_units_sort_idx" ON "learning_units" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "nouns_root_id_idx" ON "nouns" USING btree ("root_id");--> statement-breakpoint
CREATE UNIQUE INDEX "particles_form_type_unique" ON "particles" USING btree ("form","type");--> statement-breakpoint
CREATE INDEX "quiz_attempts_session_id_idx" ON "quiz_attempts" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "quiz_attempts_user_item_idx" ON "quiz_attempts" USING btree ("user_id","item_id","item_type");--> statement-breakpoint
CREATE UNIQUE INDEX "quiz_attempts_session_question_unique" ON "quiz_attempts" USING btree ("session_id","question_id");--> statement-breakpoint
CREATE INDEX "quiz_sessions_user_id_idx" ON "quiz_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "quiz_sessions_started_idx" ON "quiz_sessions" USING btree ("user_id","session_started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "quran_words_verse_pos" ON "quran_words" USING btree ("surah_number","ayah_number","position");--> statement-breakpoint
CREATE INDEX "quran_words_root_arabic_idx" ON "quran_words" USING btree ("root_arabic");--> statement-breakpoint
CREATE INDEX "quran_words_surah_idx" ON "quran_words" USING btree ("surah_number");--> statement-breakpoint
CREATE UNIQUE INDEX "tafsir_entry_unique" ON "tafsir_entries" USING btree ("tafsir_id","surah_number","ayah_number");--> statement-breakpoint
CREATE INDEX "tafsir_entries_surah_idx" ON "tafsir_entries" USING btree ("surah_number");--> statement-breakpoint
CREATE UNIQUE INDEX "tenses_form_type_unique" ON "tenses" USING btree ("form_id","type");--> statement-breakpoint
CREATE UNIQUE INDEX "trans_entry_unique" ON "translation_entries" USING btree ("translation_id","surah_number","ayah_number");--> statement-breakpoint
CREATE INDEX "user_achievements_user_id_idx" ON "user_achievements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_achievements_unlocked_idx" ON "user_achievements" USING btree ("user_id","unlocked_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_activity_pkey_idx" ON "user_activity" USING btree ("user_id","activity_date");--> statement-breakpoint
CREATE UNIQUE INDEX "user_lesson_progress_unique" ON "user_lesson_progress" USING btree ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX "user_lesson_progress_user_idx" ON "user_lesson_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_lesson_progress_status_idx" ON "user_lesson_progress" USING btree ("user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "user_noun_mastery_pkey_idx" ON "user_noun_mastery" USING btree ("user_id","noun_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_particle_mastery_pkey_idx" ON "user_particle_mastery" USING btree ("user_id","particle_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_root_mastery_pkey_idx" ON "user_root_mastery" USING btree ("user_id","root_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_unit_progress_unique" ON "user_unit_progress" USING btree ("user_id","unit_id");--> statement-breakpoint
CREATE INDEX "user_unit_progress_user_idx" ON "user_unit_progress" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_word_reviews_unique" ON "user_word_reviews" USING btree ("user_id","vocab_id");--> statement-breakpoint
CREATE INDEX "user_word_reviews_due_idx" ON "user_word_reviews" USING btree ("user_id","due_at");--> statement-breakpoint
CREATE UNIQUE INDEX "verification_token_composite_idx" ON "verification_token" USING btree ("identifier","token");--> statement-breakpoint
CREATE INDEX "vocabulary_bank_unit_idx" ON "vocabulary_bank" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "vocabulary_bank_type_idx" ON "vocabulary_bank" USING btree ("word_type");--> statement-breakpoint
CREATE INDEX "vocabulary_bank_root_idx" ON "vocabulary_bank" USING btree ("root_arabic");--> statement-breakpoint
CREATE INDEX "weekly_leagues_week_tier_idx" ON "weekly_leagues" USING btree ("week_start","tier");