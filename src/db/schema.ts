import { pgTable, uuid, text, integer, jsonb, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

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
});

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
