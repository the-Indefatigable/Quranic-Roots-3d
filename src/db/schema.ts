import { pgTable, uuid, text, integer, jsonb, timestamp, boolean, date, uniqueIndex, index, primaryKey } from 'drizzle-orm/pg-core';

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
