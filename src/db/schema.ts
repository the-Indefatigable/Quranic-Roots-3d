import { pgTable, uuid, text, integer, jsonb, timestamp, boolean, date, uniqueIndex, index, primaryKey, smallint } from 'drizzle-orm/pg-core';

// ── Roots ──────────────────────────────────────────
export const roots = pgTable('roots', {
  id: uuid('id').primaryKey().defaultRandom(),
  root: text('root').unique().notNull(),
  rootLetters: text('root_letters').array().notNull(),
  meaning: text('meaning').notNull(),
  totalFreq: integer('total_freq').default(0),
  allReferences: jsonb('all_references').default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ── Forms (Babs) ───────────────────────────────────
export const forms = pgTable('forms', {
  id: uuid('id').primaryKey().defaultRandom(),
  rootId: uuid('root_id').notNull().references(() => roots.id, { onDelete: 'cascade' }),
  formNumber: text('form_number').notNull(),
  arabicPattern: text('arabic_pattern').notNull(),
  meaning: text('meaning'),
  semanticMeaning: text('semantic_meaning'),
  verbMeaning: text('verb_meaning'),
  masdar: text('masdar'),
  masdarAlternatives: text('masdar_alternatives').array(),
  faaeil: text('faaeil'),
  mafool: text('mafool'),
  prepositions: jsonb('prepositions').default([]),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex('forms_root_form_unique').on(table.rootId, table.formNumber),
]);

// ── Tenses ─────────────────────────────────────────
export const tenses = pgTable('tenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  formId: uuid('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  arabicName: text('arabic_name').notNull(),
  englishName: text('english_name').notNull(),
  occurrences: integer('occurrences').default(0),
  references: jsonb('references').default([]),
  conjugations: jsonb('conjugations').default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex('tenses_form_type_unique').on(table.formId, table.type),
]);

// ── Nouns ──────────────────────────────────────────
export const nouns = pgTable('nouns', {
  id: uuid('id').primaryKey().defaultRandom(),
  rootId: uuid('root_id').references(() => roots.id),
  lemma: text('lemma').notNull(),
  lemmaClean: text('lemma_clean').notNull(),
  type: text('type').notNull(),
  typeAr: text('type_ar'),
  baab: text('baab'),
  meaning: text('meaning'),
  totalFreq: integer('total_freq').default(0),
  references: jsonb('references').default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('nouns_root_id_idx').on(table.rootId),
]);

// ── Particles (rootless Quranic words) ─────────────
export const particles = pgTable('particles', {
  id: uuid('id').primaryKey().defaultRandom(),
  form: text('form').notNull(),
  formBuckwalter: text('form_buckwalter').notNull(),
  type: text('type').notNull(),
  meaning: text('meaning'),
  frequency: integer('frequency').default(0),
  exampleLocation: text('example_location'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex('particles_form_type_unique').on(table.form, table.type),
]);

// ── Surahs ──────────────────────────────────────────
export const surahs = pgTable('surahs', {
  id: uuid('id').primaryKey().defaultRandom(),
  number: integer('number').unique().notNull(),
  arabicName: text('arabic_name').notNull(),
  englishName: text('english_name').notNull(),
  revelationType: text('revelation_type'), // 'meccan' | 'medinan'
  versesCount: integer('verses_count').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ── Ayahs ───────────────────────────────────────────
export const ayahs = pgTable('ayahs', {
  id: uuid('id').primaryKey().defaultRandom(),
  surahNumber: integer('surah_number').notNull(),
  ayahNumber: integer('ayah_number').notNull(),
  textUthmani: text('text_uthmani').notNull(),
  textSimple: text('text_simple'),
  juzNumber: integer('juz_number'),
  hizbQuarter: integer('hizb_quarter'),
  pageNumber: integer('page_number'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex('ayahs_surah_ayah_unique').on(table.surahNumber, table.ayahNumber),
]);

// ── Translations ────────────────────────────────────
export const translations = pgTable('translations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  authorName: text('author_name'),
  languageCode: text('language_code').default('en'),
  resourceId: integer('resource_id'), // quran.com resource id
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const translationEntries = pgTable('translation_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  translationId: uuid('translation_id').notNull().references(() => translations.id, { onDelete: 'cascade' }),
  surahNumber: integer('surah_number').notNull(),
  ayahNumber: integer('ayah_number').notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex('trans_entry_unique').on(table.translationId, table.surahNumber, table.ayahNumber),
]);

// ── Quran Words ─────────────────────────────────────
export const quranWords = pgTable('quran_words', {
  id: uuid('id').primaryKey().defaultRandom(),
  surahNumber: integer('surah_number').notNull(),
  ayahNumber: integer('ayah_number').notNull(),
  position: integer('position').notNull(),
  textUthmani: text('text_uthmani').notNull(),
  textSimple: text('text_simple'),
  transliteration: text('transliteration'),
  translation: text('translation'),
  rootArabic: text('root_arabic'),         // e.g. "ع ل م" — matches roots.root
  charType: text('char_type').default('word'), // 'word' | 'end' | 'pause'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex('quran_words_verse_pos').on(table.surahNumber, table.ayahNumber, table.position),
  index('quran_words_root_arabic_idx').on(table.rootArabic),
  index('quran_words_surah_idx').on(table.surahNumber),
]);

// ── Tafsirs ────────────────────────────────────────
export const tafsirs = pgTable('tafsirs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  authorName: text('author_name'),
  languageCode: text('language_code').default('en'),
  resourceId: integer('resource_id'), // quran.com resource id
  slug: text('slug'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const tafsirEntries = pgTable('tafsir_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  tafsirId: uuid('tafsir_id').notNull().references(() => tafsirs.id, { onDelete: 'cascade' }),
  surahNumber: integer('surah_number').notNull(),
  ayahNumber: integer('ayah_number').notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex('tafsir_entry_unique').on(table.tafsirId, table.surahNumber, table.ayahNumber),
  index('tafsir_entries_surah_idx').on(table.surahNumber),
]);

// ── Users ─────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  emailVerified: timestamp('email_verified', { withTimezone: true }),
  passwordHash: text('password_hash'),
  name: text('name'),
  image: text('image'),
  avatarUrl: text('avatar_url'), // deprecated, use image
  role: text('role').default('student').notNull(), // 'student' | 'admin' | 'teacher'
  preferredLang: text('preferred_lang').default('en'),
  streakDays: integer('streak_days').default(0),
  lastActive: date('last_active'),
  totalXP: integer('total_xp').default(0),
  userLevel: integer('user_level').default(1),
  levelProgress: integer('level_progress').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ── Sessions (NextAuth compatible) ────────────────
export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { withTimezone: true }).notNull(),
});

// ── Accounts (NextAuth OAuth providers) ─────────────
export const accounts = pgTable('account', {
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (table) => [
  primaryKey({ columns: [table.provider, table.providerAccountId] }),
]);

// ── Verification Tokens (NextAuth) ────────────────
export const verificationTokens = pgTable('verification_token', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: timestamp('expires', { withTimezone: true }).notNull(),
}, (table) => [
  uniqueIndex('verification_token_composite_idx').on(table.identifier, table.token),
]);

// ── Server-side Bookmarks ─────────────────────────
export const bookmarks = pgTable('bookmarks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rootId: uuid('root_id').references(() => roots.id, { onDelete: 'cascade' }),
  nounId: uuid('noun_id').references(() => nouns.id, { onDelete: 'cascade' }),
  surahId: integer('surah_id'),
  ayahNumber: integer('ayah_number'),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ── User Activity ─────────────────────────────────
export const userActivity = pgTable('user_activity', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  activityDate: date('activity_date').notNull(),
  quizzesTaken: integer('quizzes_taken').default(0),
  rootsStudied: integer('roots_studied').default(0),
  lessonsDone: integer('lessons_done').default(0),
  timeSpentS: integer('time_spent_s').default(0),
}, (table) => [
  uniqueIndex('user_activity_pkey_idx').on(table.userId, table.activityDate),
]);

// ── User Root Mastery ─────────────────────────────
export const userRootMastery = pgTable('user_root_mastery', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rootId: uuid('root_id').notNull().references(() => roots.id, { onDelete: 'cascade' }),
  mastery: integer('mastery').default(0), // 0–5
  nextReview: timestamp('next_review', { withTimezone: true }),
  totalAttempts: integer('total_attempts').default(0),
  correctAttempts: integer('correct_attempts').default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex('user_root_mastery_pkey_idx').on(table.userId, table.rootId),
]);

// ── User Noun Mastery ──────────────────────────────
export const userNounMastery = pgTable('user_noun_mastery', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  nounId: uuid('noun_id').notNull().references(() => nouns.id, { onDelete: 'cascade' }),
  mastery: integer('mastery').default(0), // 0–5
  nextReview: timestamp('next_review', { withTimezone: true }),
  totalAttempts: integer('total_attempts').default(0),
  correctAttempts: integer('correct_attempts').default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex('user_noun_mastery_pkey_idx').on(table.userId, table.nounId),
]);

// ── User Particle Mastery ──────────────────────────
export const userParticleMastery = pgTable('user_particle_mastery', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  particleId: uuid('particle_id').notNull().references(() => particles.id, { onDelete: 'cascade' }),
  mastery: integer('mastery').default(0), // 0–5
  nextReview: timestamp('next_review', { withTimezone: true }),
  totalAttempts: integer('total_attempts').default(0),
  correctAttempts: integer('correct_attempts').default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex('user_particle_mastery_pkey_idx').on(table.userId, table.particleId),
]);

// ── Quiz Sessions ───────────────────────────────────
export const quizSessions = pgTable('quiz_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  quizType: text('quiz_type').notNull(), // 'verb_conjugation' | 'noun_translation' | 'particle_translation' | 'mixed'
  itemCount: integer('item_count').notNull(),
  correctCount: integer('correct_count').notNull(),
  score: integer('score').notNull(), // percentage 0-100
  duration_s: integer('duration_s'), // session duration in seconds
  sessionStartedAt: timestamp('session_started_at', { withTimezone: true }).defaultNow(),
  sessionEndedAt: timestamp('session_ended_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('quiz_sessions_user_id_idx').on(table.userId),
  index('quiz_sessions_started_idx').on(table.userId, table.sessionStartedAt),
]);

// ── Quiz Attempts ───────────────────────────────────
export const quizAttempts = pgTable('quiz_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => quizSessions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  itemType: text('item_type').notNull(), // 'root' | 'noun' | 'particle'
  itemId: uuid('item_id').notNull(),
  questionType: text('question_type').notNull(), // 'translate_conjugation', 'translate_noun', 'identify_conjugation', 'identify_root', 'mcq_*'
  questPrompt: text('quest_prompt'), // JSON string with question data
  userAnswer: text('user_answer').notNull(),
  correctAnswer: text('correct_answer').notNull(),
  isCorrect: boolean('is_correct').notNull(),
  responseTime_ms: integer('response_time_ms'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('quiz_attempts_session_id_idx').on(table.sessionId),
  index('quiz_attempts_user_item_idx').on(table.userId, table.itemId, table.itemType),
]);

// ── Edit History ───────────────────────────────────
export const editHistory = pgTable('edit_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminId: uuid('admin_id'),
  tableName: text('table_name').notNull(),
  recordId: uuid('record_id').notNull(),
  fieldName: text('field_name').notNull(),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ── Achievements ────────────────────────────────────
export const achievements = pgTable('achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').unique().notNull(),
  description: text('description'),
  category: text('category').notNull(), // 'milestone' | 'mastery' | 'streak' | 'speed'
  iconSvg: text('icon_svg'),
  xpBonus: integer('xp_bonus').default(0),
  unlockcriteria: jsonb('unlock_criteria'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('achievements_category_idx').on(table.category),
]);

// ── User Achievements ───────────────────────────────
export const userAchievements = pgTable('user_achievements', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  achievementId: uuid('achievement_id').notNull().references(() => achievements.id, { onDelete: 'cascade' }),
  unlockedAt: timestamp('unlocked_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.achievementId] }),
  index('user_achievements_user_id_idx').on(table.userId),
  index('user_achievements_unlocked_idx').on(table.userId, table.unlockedAt),
]);

// ── Leaderboard Snapshots ────────────────────────────
export const leaderboardSnapshots = pgTable('leaderboard_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rank: integer('rank').notNull(),
  totalXP: integer('total_xp').notNull(),
  period: text('period').notNull(), // 'all_time' | 'weekly' | 'monthly'
  periodDate: date('period_date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('leaderboard_snapshots_user_idx').on(table.userId),
  index('leaderboard_snapshots_period_idx').on(table.period, table.periodDate, table.rank),
  index('leaderboard_snapshots_rank_idx').on(table.period, table.periodDate, table.totalXP),
]);

// ════════════════════════════════════════════════════════════════
// ██  DUOLINGO-STYLE LEARNING SYSTEM
// ════════════════════════════════════════════════════════════════

// ── Learning Units (sections on the linear path) ─────────────
export const learningUnits = pgTable('learning_units', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  titleAr: text('title_ar'),
  description: text('description'),
  iconEmoji: text('icon_emoji').default('📖'),
  color: text('color').default('#D4A246'), // node color on path
  sortOrder: integer('sort_order').notNull(),
  checkpointAfter: boolean('checkpoint_after').default(false), // gate test after this unit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('learning_units_sort_idx').on(table.sortOrder),
]);

// ── Learning Lessons (nodes on the path within a unit) ───────
export const learningLessons = pgTable('learning_lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  unitId: uuid('unit_id').notNull().references(() => learningUnits.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  sortOrder: integer('sort_order').notNull(),
  lessonType: text('lesson_type').default('standard'), // 'standard' | 'legendary' | 'checkpoint'
  content: jsonb('content').notNull(), // lesson steps JSON
  xpReward: integer('xp_reward').default(15),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex('learning_lessons_unit_slug').on(table.unitId, table.slug),
  index('learning_lessons_unit_sort_idx').on(table.unitId, table.sortOrder),
]);

// ── Vocabulary Bank (word pool for template-based questions) ──
export const vocabularyBank = pgTable('vocabulary_bank', {
  id: uuid('id').primaryKey().defaultRandom(),
  wordAr: text('word_ar').notNull(),
  transliteration: text('transliteration').notNull(),
  english: text('english').notNull(),
  wordType: text('word_type').notNull(), // 'ism' | 'feel' | 'harf'
  gender: text('gender'), // 'masculine' | 'feminine' | null
  number: text('number'), // 'singular' | 'dual' | 'plural' | null
  grammarCase: text('grammar_case'), // 'raf' | 'nasb' | 'jarr' | null
  unitId: uuid('unit_id').references(() => learningUnits.id),
  quranicRef: text('quranic_ref'), // e.g. "2:255"
  difficulty: smallint('difficulty').default(1), // 1-3
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('vocabulary_bank_unit_idx').on(table.unitId),
  index('vocabulary_bank_type_idx').on(table.wordType),
]);

// ── User Lesson Progress ─────────────────────────────────────
export const userLessonProgress = pgTable('user_lesson_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lessonId: uuid('lesson_id').notNull().references(() => learningLessons.id, { onDelete: 'cascade' }),
  status: text('status').default('locked'), // 'locked' | 'available' | 'in_progress' | 'completed'
  score: integer('score'), // percentage 0-100
  bestScore: integer('best_score'),
  attempts: integer('attempts').default(0),
  mistakes: jsonb('mistakes').default([]), // array of {stepIndex, userAnswer, correctAnswer}
  completedAt: timestamp('completed_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex('user_lesson_progress_unique').on(table.userId, table.lessonId),
  index('user_lesson_progress_user_idx').on(table.userId),
  index('user_lesson_progress_status_idx').on(table.userId, table.status),
]);

// ── User Unit Progress ───────────────────────────────────────
export const userUnitProgress = pgTable('user_unit_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  unitId: uuid('unit_id').notNull().references(() => learningUnits.id, { onDelete: 'cascade' }),
  status: text('status').default('locked'), // 'locked' | 'available' | 'in_progress' | 'completed'
  crownLevel: smallint('crown_level').default(0), // 0=none, 1=bronze, 2=silver, 3=gold, 4=legendary(purple)
  lessonsCompleted: integer('lessons_completed').default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex('user_unit_progress_unique').on(table.userId, table.unitId),
  index('user_unit_progress_user_idx').on(table.userId),
]);

// ── User Hearts (energy system) ──────────────────────────────
export const userHearts = pgTable('user_hearts', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  hearts: smallint('hearts').default(5).notNull(),
  maxHearts: smallint('max_hearts').default(5).notNull(),
  lastRefillAt: timestamp('last_refill_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ── User Streaks (server-side) ───────────────────────────────
export const userStreaks = pgTable('user_streaks', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  lastActiveDate: date('last_active_date'),
  streakFreezesOwned: smallint('streak_freezes_owned').default(0).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ── User Gems ────────────────────────────────────────────────
export const userGems = pgTable('user_gems', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  balance: integer('balance').default(0).notNull(),
  totalEarned: integer('total_earned').default(0).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ── Gem Transactions ─────────────────────────────────────────
export const gemTransactions = pgTable('gem_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // positive = earn, negative = spend
  reason: text('reason').notNull(), // 'daily_goal' | 'streak_milestone' | 'perfect_lesson' | 'league_reward' | 'buy_streak_freeze' | 'buy_heart_refill'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('gem_transactions_user_idx').on(table.userId),
  index('gem_transactions_created_idx').on(table.userId, table.createdAt),
]);

// ── Daily Goals ──────────────────────────────────────────────
export const dailyGoals = pgTable('daily_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  goalDate: date('goal_date').notNull(),
  targetXp: integer('target_xp').default(30).notNull(), // 15/30/50/100
  earnedXp: integer('earned_xp').default(0).notNull(),
  lessonsCompleted: integer('lessons_completed').default(0).notNull(),
  completed: boolean('completed').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex('daily_goals_user_date').on(table.userId, table.goalDate),
  index('daily_goals_user_idx').on(table.userId),
]);

// ── Daily Quests (3 per day per user) ────────────────────────
export const dailyQuests = pgTable('daily_quests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  questDate: date('quest_date').notNull(),
  questType: text('quest_type').notNull(), // 'earn_xp' | 'complete_lessons' | 'correct_streak' | 'practice_review'
  title: text('title').notNull(), // e.g. "Earn 50 XP"
  target: integer('target').notNull(), // e.g. 50
  progress: integer('progress').default(0).notNull(),
  gemReward: integer('gem_reward').default(5).notNull(),
  completed: boolean('completed').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('daily_quests_user_date_idx').on(table.userId, table.questDate),
]);

// ── Weekly Leagues ───────────────────────────────────────────
export const weeklyLeagues = pgTable('weekly_leagues', {
  id: uuid('id').primaryKey().defaultRandom(),
  weekStart: date('week_start').notNull(), // Monday of the week
  tier: smallint('tier').notNull(), // 1=Bronze ... 10=Diamond
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  index('weekly_leagues_week_tier_idx').on(table.weekStart, table.tier),
]);

// ── League Members ───────────────────────────────────────────
export const leagueMembers = pgTable('league_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  leagueId: uuid('league_id').notNull().references(() => weeklyLeagues.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  weeklyXp: integer('weekly_xp').default(0).notNull(),
  rank: integer('rank'),
  promoted: boolean('promoted'), // null during week, true/false at end
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex('league_members_unique').on(table.leagueId, table.userId),
  index('league_members_league_xp_idx').on(table.leagueId, table.weeklyXp),
]);

// ── Checkpoint Tests ─────────────────────────────────────────
export const checkpointTests = pgTable('checkpoint_tests', {
  id: uuid('id').primaryKey().defaultRandom(),
  afterUnitId: uuid('after_unit_id').notNull().references(() => learningUnits.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: jsonb('content').notNull(), // 15 exercise steps JSON
  passingScore: smallint('passing_score').default(14).notNull(), // out of 15
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex('checkpoint_tests_unit_unique').on(table.afterUnitId),
]);
