import { pgTable, uuid, text, integer, jsonb, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';

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
