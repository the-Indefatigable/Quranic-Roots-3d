# Database

**`src/db/schema.ts` is the source of truth.** Schema changes are generated from
it with `drizzle-kit`; do not hand-write DDL.

## Setting up a database

```bash
createdb quroots
psql "$DATABASE_URL" -c 'CREATE EXTENSION IF NOT EXISTS "pgcrypto";'
npm run db:migrate      # applies everything in drizzle/
```

Then populate content:

```bash
npm run populate:all            # surahs, ayahs, translations, words (quran.com API)
npm run populate:roots-backfill # tags words with their roots
node scripts/seed-learning-units.ts && node scripts/seed-stage-*.mjs
```

## Changing the schema

1. Edit `src/db/schema.ts`.
2. `npm run db:generate` — writes a new file to `drizzle/`.
3. Review the generated SQL. It is not automatically correct for destructive
   changes; a column rename in particular is emitted as drop + add.
4. `npm run db:migrate` to apply.

## Why there are two directories

`drizzle/` is generated and authoritative. `db/*.sql` is the historical,
hand-written set, kept only so existing databases have a record of what was
applied to them.

**`db/*.sql` cannot build a working database.** It had drifted from the code in
four separate ways, each of which was found by actually trying to run it:

1. `003_quiz_system.sql` has a foreign key to a `particles` table that no
   migration creates — it was only ever created as a side effect of
   `scripts/populate-particles.mjs`. Applying `db/` in order fails here.
2. `002_nextauth_migration.sql` creates `sessions` and `accounts` (plural), but
   `src/db/schema.ts` maps NextAuth to `session` and `account` (singular). A
   database built from `db/` cannot authenticate at all.
3. `005_learning_system.sql` uses `CREATE TABLE IF NOT EXISTS
   user_lesson_progress`, but `001` already created a different table of that
   name — with a foreign key to the old `lessons` table and no
   `best_score` / `attempts` / `mistakes`. The migration silently does nothing
   and the resulting table does not match the schema.
4. `001_initial_schema.sql`'s content tables describe an older data model
   entirely: `surahs.name_arabic` vs `arabic_name`, `ayahs.surah_id` vs
   `surah_number`, a completely different `quran_words`. The real content
   schema lived inside the `populate-*.mjs` scripts, each doing its own
   `CREATE TABLE IF NOT EXISTS`.

Production works because it was assembled by hand and by those scripts over
time, not because `db/` describes it. That meant there was no path to rebuild
production if it were ever lost — which is what `drizzle/` now provides.

`drizzle/0000_baseline_from_schema.sql` was generated from the current
`schema.ts` and verified to build all 44 tables cleanly against an empty
database.

## Applying the baseline to the existing production database

Do **not** run the baseline against production — it would try to create tables
that already exist. Instead, mark it as already applied so future generated
migrations stack on top of it correctly:

```bash
npx drizzle-kit migrate --config drizzle.config.ts   # on a fresh DB
```

For the existing production database, take a dump first, then diff it against
the baseline and reconcile any differences by hand once. After that, the
generated flow applies.
