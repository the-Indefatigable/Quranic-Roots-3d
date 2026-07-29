# QuRoots

**Learn the language of the Quran — from zero to full iʿrāb.**

[quroots.com](https://quroots.com)

QuRoots is a free platform for learning Quranic Arabic. It combines a gamified grammar course, a word-by-word Quran reader, and a searchable dictionary of every Arabic root in the Quran, so that a complete beginner can work up to parsing any verse.

## Features

- **50-unit grammar course** — Duolingo-style lessons with hearts, XP, streaks and checkpoint tests, taking you from the three word types (ism, fiʿl, harf) to full grammatical parsing (iʿrāb).
- **Word-by-word Quran reader** — all 114 surahs with translation, tafsir, and a popover on every word showing its root, form and meaning.
- **Roots explorer** — 1,716 Quranic Arabic roots (1,517 of them verbs) with meanings, frequencies, all ten verb forms (أبواب), conjugation tables across five tense types, and derived nouns and particles.
- **Daily ayah & hadith** — a small daily habit with streak tracking.
- **Spaced repetition** — vocabulary review scheduled by an SRS engine.
- **Qirat training** — recitation practice with pitch and maqam analysis.
- **Leaderboards & achievements** — weekly leagues, badges, and gem rewards.

## Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS 4** with CSS-variable theme tokens
- **Postgres** + **Drizzle ORM**
- **NextAuth v5** (Google OAuth, database sessions)
- **Framer Motion** for animation, **Zustand** for client state
- **Stripe** for donations
- Deployed on **Vercel**

## Running locally

```bash
npm install
cp .env.example .env.local   # then fill in DATABASE_URL and AUTH_SECRET
npm run dev                  # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

### Database

Schema lives in `src/db/schema.ts` (Drizzle). The migrations in `db/` are plain
SQL, applied in numeric order:

```bash
for f in db/0*.sql; do psql "$DATABASE_URL" -f "$f"; done
```

There is no migration tracking table yet — apply them in order against a fresh
database.

Content is populated by the scripts in `scripts/`:

```bash
npm run populate:all          # surahs, ayahs, translations, words (quran.com API)
npm run populate:tafsirs
node scripts/seed-curriculum-badges.mjs
```

The raw morphology corpus used to build the roots, nouns and particles tables is
not distributed with this repository.

## Marketing assets

Launch screenshots and social cards live in `marketing/` — see
[`marketing/README.md`](marketing/README.md) for sizes and where each one goes.

## Data

The Quranic linguistic data was collected from publicly available sources and
consolidated into a single structured dataset:

- **1,716 roots** extracted from the Quranic corpus, 1,517 of which have verb forms
- **Conjugation tables** covering 10 verb forms (أبواب) and 5 tense types (ماضي، مضارع، أمر، مبني للمجهول)
- **Derivational forms** per bab: masdar (مصدر), active participle (اسم فاعل), passive participle (اسم مفعول)
- **Quranic references** — every surah:ayah occurrence for each root across all 114 surahs

Irregular Form I masdars and the derivational forms of weak roots were enriched
using the Claude API, then reviewed. The enrichment scripts are not included in
this repository.

## Copyright

© 2026 QuRoots. All rights reserved.

The source code in this repository is proprietary and may not be copied,
modified, or distributed without permission. The Quranic text itself is the
revealed word of Allah and is in the public domain. The derived linguistic
dataset (conjugation tables, derivational forms, glosses, and Quranic reference
mappings) was compiled, structured, and enriched for educational purposes and is
covered by this copyright.
