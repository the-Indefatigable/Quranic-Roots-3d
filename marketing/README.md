# QuRoots — launch asset kit

Generated assets for the product launch. Every file's dimensions are verified
exact. Regenerate any time with the two scripts described at the bottom.

## Product Hunt

Upload in this order — the first gallery image is the one that shows in the feed.

| File | Size | Where it goes |
|---|---|---|
| `product-hunt/gallery-01-understand.png` | 2540×1520 | Gallery image 1 (the feed thumbnail) |
| `product-hunt/gallery-02-course.png` | 2540×1520 | Gallery image 2 |
| `product-hunt/gallery-03-wordbyword.png` | 2540×1520 | Gallery image 3 |
| `product-hunt/gallery-04-roots.png` | 2540×1520 | Gallery image 4 |
| `product-hunt/gallery-05-conjugation.png` | 2540×1520 | Gallery image 5 |
| `product-hunt/gallery-06-habit.png` | 2540×1520 | Gallery image 6 |
| `product-hunt/gallery-07-daily.png` | 2540×1520 | Gallery image 7 |
| `product-hunt/gallery-08-mobile.png` | 2540×1520 | Gallery image 8 |
| `product-hunt/thumbnail.png` | 240×240 | Product thumbnail / logo |

Gallery images are rendered at 2× the 1270×760 Product Hunt spec so they stay
sharp on retina; Product Hunt downsamples them itself.

## Social

| File | Size | Where it goes |
|---|---|---|
| `social/x-card-01..04-*.png` | 2400×1350 | X/Twitter posts (16:9) |
| `social/linkedin-01..03-*.png` | 2400×1254 | LinkedIn posts (1.91:1) |

Both are 2× their nominal sizes (1200×675 and 1200×627).

## Site & README

| File | Size | Where it goes |
|---|---|---|
| `hero/hero-wide.png` | 2560×1440 | Landing page hero / OG source |
| `hero/hero-1080.png` | 1920×1080 | Standard hero, presentations |
| `hero/readme-banner.png` | 2560×1280 | Top of the repo README (2× of 1280×640) |

## Raw captures

`raw/` holds the unframed screenshots the composed slides are built from —
desktop at 2880×1800 and mobile at 780×1688, both 2× device pixel ratio.

**`raw/` is gitignored** — it is ~32MB and fully regenerable (see
"Regenerating" below). Only the finished assets are committed, so the repo
doesn't carry a permanent 60MB of PNGs in its history.

## Where each shot came from

Content pages are captured from **production** (`quroots.com`) so the data is
real — 1,517 verb roots, 3,000 nouns, 455 particles, the full word-by-word
Quran. The signed-in gamified screens are captured from a **local instance**
seeded with a demo learner, because production can only be browsed signed-out.

| Raw shot | Source |
|---|---|
| `home-hero`, `roots-browser`, `root-detail`, `quran-index`, `quran-reader`, `blog-index`, `mobile-quran`, `mobile-roots` | production |
| `learn-path`, `dashboard`, `achievements`, `leaderboard`, `profile`, `daily-ayah`, `mobile-path`, `mobile-dash` | local demo instance |

The demo learner is "Aisha Rahman" — 17-day streak, 2,480 XP, 340 gems, 6 of 50
units complete, 7% Quran coverage. All of it is seeded data, not a real user.

## Regenerating

```bash
# 1. Raw captures
node scripts/capture-screenshots.mjs --target=prod  --out=marketing/raw
node scripts/capture-screenshots.mjs --target=local --out=marketing/raw   # needs the local instance

# 2. Framed marketing images
node scripts/compose-marketing.mjs
```

`--only=id1,id2` limits a run to specific shots. The local target needs a
seeded database and `npm start` running on port 3000; see
`scripts/seed-demo-learner.mjs`, which prints the session token the capture
harness uses to browse as a signed-in user.

Headline copy lives in the `SLIDES` array in `scripts/compose-marketing.mjs`,
and output sizes in `TARGETS` — edit either and re-run step 2.

## Known issues visible in these captures

Two live bugs were spotted while shooting these. Neither appears in the final
framed images (both are cropped out), but both are real and worth fixing:

- **Homepage stat tiles render tofu boxes.** Each stat shows a second line in
  Arabic-Indic numerals (`١٬٧١٦`), but the font stack has no face covering
  those glyphs, so it renders as boxes. Live on the homepage now.
- **Word-by-word glosses are clipped from the left** in the Quran reader —
  "…y crookedness", "…ive glad tidings", "…ood reward (is)". An overflow issue
  on the gloss labels.
