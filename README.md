# Quranic Verb Roots — 3D Explorer

An interactive 3D visualization and study tool for Quranic Arabic verb roots, featuring conjugation tables, quiz mode, surah-based filtering, and full offline PWA support.

## Features

- **3D Space View** — All verb roots rendered as interactive nodes in 3D space, color-coded by bab (form)
- **Tree View** — Detailed conjugation tables for each root across all verb forms (I–X)
- **Quiz Mode** — Practice conjugation recognition
- **Explore Panel** — Filter roots by tense type, verb form, or Surah
- **Offline PWA** — Works fully offline after first load; all root data is cached automatically in the background

## Data

The Quranic verb data was collected from publicly available sources on the internet in scattered formats and consolidated into a single structured dataset. The data includes:

- **1,716 verb roots** extracted from the Quranic corpus
- **Conjugation tables** covering 10 verb forms (أبواب) and 5 tense types (ماضي، مضارع، أمر، مبني للمجهول)
- **Derivational forms** per bab: masdar (مصدر), active participle (اسم فاعل), passive participle (اسم مفعول)
- **Quranic references** — every surah:ayah occurrence for each root across all 114 surahs

### AI Enrichment

The dataset was enriched using the **Claude API (Anthropic)**:
- Irregular masdar forms for Form I verbs (Form I masdars are unpredictable and must be looked up)
- Derivational forms for weak roots (roots containing و، ي، or doubled letters) where mechanical rules do not apply
- Validation of root entries to confirm verbal usage in the Quran

The enrichment scripts are not included in this repository.

## Tech Stack

- **React 18** + **TypeScript**
- **Three.js** / **@react-three/fiber** — 3D rendering
- **Zustand** — state management
- **Fuse.js** — fuzzy search
- **Vite** + **vite-plugin-pwa** (Workbox) — build tooling and PWA

## Running Locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Copyright

© 2026 Quranic Verbs Project. All rights reserved.

The source code in this repository is proprietary and may not be copied, modified, or distributed without permission. The Quranic text itself is the revealed word of Allah and is in the public domain. The derived linguistic dataset (conjugation tables, derivational forms, glosses, and Quranic reference mappings) was compiled, structured, and enriched for educational purposes and is covered by this copyright.
