/**
 * Frame the raw captures into launch-ready marketing images.
 *
 * Each slide is built as an HTML page — the raw PNG embedded as a data URI
 * inside a browser-chrome mockup on a QuRoots-branded gradient, with a headline
 * — then screenshotted by Chromium at the exact target viewport. Rendering at
 * the final size means the output dimensions are exact by construction, so
 * there is no image library and no resampling step.
 *
 * Brand tokens come from app/globals.css (dark theme).
 *
 * Run: node scripts/compose-marketing.mjs
 */
import { chromium } from 'playwright-core';
import { readFile, mkdir, writeFile } from 'fs/promises';
import path from 'path';

const CHROME = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const RAW = path.resolve('marketing/raw');
const OUT = path.resolve('marketing');

// ── Brand (dark theme, app/globals.css) ────────────────────────────────
const CANVAS = '#111110';
const SURFACE = '#1C1B19';
const GOLD = '#D4A246';
const GOLD_HI = '#E8B84B';
const TEXT = '#EDEDEC';
const TEXT_DIM = '#A09F9B';

/**
 * Slides. `shot` is the raw capture id; `kicker`/`headline`/`sub` are the copy.
 * Wording is drawn from public/llms.txt, the most accurate product description
 * in the repo.
 */
const SLIDES = [
  {
    id: 'understand',
    shot: 'home-hero',
    kicker: 'QuRoots',
    headline: 'Understand every word of the Quran',
    sub: 'A free platform for learning Quranic Arabic — from your first word to full grammatical parsing.',
  },
  {
    id: 'course',
    shot: 'learn-path',
    kicker: 'The course',
    headline: '50 units. Zero to full iʿrāb.',
    sub: 'Step-by-step lessons with hearts, XP and streaks — starting from the three word types.',
  },
  {
    id: 'wordbyword',
    shot: 'quran-reader',
    kicker: 'Word-by-word Quran',
    headline: 'Tap any word. See its root and meaning.',
    sub: 'All 114 surahs with translation, tafsir, and grammar on every word.',
  },
  {
    id: 'roots',
    shot: 'roots-browser',
    kicker: 'Roots explorer',
    headline: 'Every Quranic root, mapped',
    sub: '1,517 verb roots, 3,000 nouns and 455 particles with meanings and frequencies.',
  },
  {
    id: 'conjugation',
    shot: 'root-detail',
    kicker: 'Morphology',
    headline: 'Every verb form, every conjugation',
    sub: 'All ten forms (أبواب) across five tenses, with each root’s Quranic occurrences.',
  },
  {
    id: 'habit',
    shot: 'dashboard',
    kicker: 'Your progress',
    headline: 'Watch the Quran open up',
    sub: 'A coverage meter that shows exactly how much of the Quran you can already read.',
  },
  {
    id: 'daily',
    shot: 'daily-ayah',
    kicker: 'Daily habit',
    headline: 'One ayah a day',
    sub: 'A small daily practice with streaks — the habit that makes the rest stick.',
  },
  {
    id: 'mobile',
    shot: 'mobile-path',
    shot2: 'mobile-quran',
    layout: 'duo',
    kicker: 'Anywhere',
    headline: 'Built for the pocket, too',
    sub: 'The full course and the word-by-word Quran, on any screen.',
  },
];

// ── Output targets ─────────────────────────────────────────────────────
const TARGETS = [
  { dir: 'product-hunt', prefix: 'gallery', width: 1270, height: 760, scale: 2, slides: 'all' },
  { dir: 'social', prefix: 'x-card', width: 1200, height: 675, scale: 2, slides: [0, 1, 2, 3] },
  { dir: 'social', prefix: 'linkedin', width: 1200, height: 627, scale: 2, slides: [0, 1, 2] },
  { dir: 'hero', prefix: 'hero-wide', width: 2560, height: 1440, scale: 1, slides: [0] },
  { dir: 'hero', prefix: 'hero-1080', width: 1920, height: 1080, scale: 1, slides: [0] },
  { dir: 'hero', prefix: 'readme-banner', width: 1280, height: 640, scale: 2, slides: [0] },
];

async function dataUri(file) {
  const buf = await readFile(path.join(RAW, file));
  return `data:image/png;base64,${buf.toString('base64')}`;
}

/**
 * Inline the brand font (Plus Jakarta Sans — the same face app/layout.tsx
 * loads) so the composed page has no external dependencies. Resolves the
 * current woff2 from the Google Fonts CSS rather than hardcoding a URL, since
 * those are versioned and go stale.
 */
async function loadFont() {
  try {
    const css = await (await fetch(
      'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap',
      { headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36' } }
    )).text();

    // Take the latin block — the last @font-face Google emits per weight.
    const urls = [...css.matchAll(/url\((https:\/\/[^)]+\.woff2)\)/g)].map((m) => m[1]);
    const latin = urls[urls.length - 1];
    if (!latin) throw new Error('no woff2 in CSS');

    const buf = Buffer.from(await (await fetch(latin)).arrayBuffer());
    console.log(`  (brand font inlined, ${(buf.length / 1024).toFixed(0)}kB)`);
    return `@font-face{font-family:'Jakarta';src:url(data:font/woff2;base64,${buf.toString('base64')}) format('woff2');font-weight:200 800;font-display:block;}`;
  } catch (e) {
    console.log(`  (brand font unavailable — falling back to system sans: ${e.message})`);
    return '';
  }
}

function slideHtml({ slide, img, img2, width, height, fontFace }) {
  const duo = slide.layout === 'duo';
  // Scale type with the canvas so a 1200px card and a 2560px hero look alike.
  const k = width / 1270;

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    ${fontFace}
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:${width}px;height:${height}px;overflow:hidden}
    body{
      font-family:'Jakarta',system-ui,-apple-system,sans-serif;
      background:${CANVAS};
      color:${TEXT};
      display:flex;flex-direction:column;
      position:relative;
    }
    /* Warm radial wash + a faint gold horizon, echoing the app's Atmosphere */
    body::before{
      content:'';position:absolute;inset:0;
      background:
        radial-gradient(120% 80% at 12% -10%, rgba(212,162,70,.20) 0%, transparent 55%),
        radial-gradient(90% 70% at 100% 110%, rgba(232,184,75,.13) 0%, transparent 60%),
        linear-gradient(160deg, #16150F 0%, ${CANVAS} 45%, #0C0C0B 100%);
    }
    body::after{
      content:'';position:absolute;inset:0;opacity:.35;
      background-image:linear-gradient(rgba(212,162,70,.05) 1px,transparent 1px),
                       linear-gradient(90deg,rgba(212,162,70,.05) 1px,transparent 1px);
      background-size:${44 * k}px ${44 * k}px;
      mask-image:radial-gradient(70% 60% at 50% 40%,#000 0%,transparent 75%);
    }
    .wrap{position:relative;z-index:1;display:flex;flex-direction:column;height:100%;
          padding:${40 * k}px ${58 * k}px ${0}px;}
    .kicker{
      font-size:${14 * k}px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;
      color:${GOLD};margin-bottom:${11 * k}px;display:flex;align-items:center;gap:${10 * k}px;
    }
    .kicker::after{content:'';height:1px;width:${54 * k}px;
      background:linear-gradient(90deg,${GOLD},transparent);}
    h1{
      /* Sized to sit on one line at the widest slide copy. */
      font-size:${duo ? 42 * k : 44 * k}px;line-height:1.06;font-weight:800;letter-spacing:-.022em;
      max-width:${1180 * k}px;text-wrap:balance;
      background:linear-gradient(94deg,${TEXT} 30%,${GOLD_HI} 130%);
      -webkit-background-clip:text;background-clip:text;color:transparent;
    }
    p.sub{margin-top:${10 * k}px;font-size:${17.5 * k}px;line-height:1.45;color:${TEXT_DIM};
          max-width:${900 * k}px;font-weight:400;}
    .stage{flex:1;position:relative;margin-top:${26 * k}px;display:flex;
           justify-content:center;align-items:flex-start;gap:${28 * k}px;}
    /* Browser chrome */
    .frame{
      width:100%;border-radius:${14 * k}px ${14 * k}px 0 0;overflow:hidden;
      background:${SURFACE};
      border:1px solid rgba(212,162,70,.20);border-bottom:none;
      box-shadow:0 ${34 * k}px ${90 * k}px rgba(0,0,0,.62),
                 0 0 0 1px rgba(255,255,255,.03) inset;
    }
    .bar{height:${34 * k}px;display:flex;align-items:center;gap:${7 * k}px;
         padding:0 ${14 * k}px;background:#141311;border-bottom:1px solid rgba(255,255,255,.05);}
    .dot{width:${9 * k}px;height:${9 * k}px;border-radius:50%}
    .url{
      margin-left:${12 * k}px;height:${19 * k}px;flex:1;max-width:${300 * k}px;border-radius:${5 * k}px;
      background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;
      font-size:${10.5 * k}px;color:${TEXT_DIM};letter-spacing:.02em;
    }
    .frame img{display:block;width:100%;height:auto}
    /* Phone pair */
    .phones{display:flex;gap:${52 * k}px;justify-content:center;align-items:flex-start;width:100%}
    .phone{
      width:${300 * k}px;border-radius:${30 * k}px;overflow:hidden;background:#000;
      border:${2.5 * k}px solid rgba(212,162,70,.26);
      box-shadow:0 ${28 * k}px ${70 * k}px rgba(0,0,0,.6);
    }
    .phone img{display:block;width:100%;height:auto}
  </style></head><body><div class="wrap">
    <div class="kicker">${slide.kicker}</div>
    <h1>${slide.headline}</h1>
    <p class="sub">${slide.sub}</p>
    <div class="stage">
      ${duo ? `
        <div class="phones">
          <div class="phone"><img src="${img}"></div>
          <div class="phone"><img src="${img2}"></div>
        </div>` : `
        <div class="frame">
          <div class="bar">
            <div class="dot" style="background:#3A3835"></div>
            <div class="dot" style="background:#3A3835"></div>
            <div class="dot" style="background:#3A3835"></div>
            <div class="url">quroots.com</div>
          </div>
          <img src="${img}">
        </div>`}
    </div>
  </div></body></html>`;
}

/** The 240×240 Product Hunt thumbnail — the mark, not a screenshot. */
function thumbHtml(logo, size) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:${size}px;height:${size}px;overflow:hidden}
    body{display:flex;align-items:center;justify-content:center;
      background:radial-gradient(85% 85% at 30% 15%,#1E1B14 0%,${CANVAS} 70%);}
    .ring{position:absolute;width:${size * 0.82}px;height:${size * 0.82}px;border-radius:50%;
      border:1px solid rgba(212,162,70,.22);}
    img{width:${size * 0.56}px;height:${size * 0.56}px;object-fit:contain;position:relative;z-index:1}
  </style></head><body><div class="ring"></div><img src="${logo}"></body></html>`;
}

async function main() {
  const fontFace = await loadFont();
  const browser = await chromium.launch({
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
  });

  const imgCache = new Map();
  const getImg = async (name) => {
    if (!imgCache.has(name)) imgCache.set(name, await dataUri(`${name}.png`));
    return imgCache.get(name);
  };

  const manifest = [];

  for (const target of TARGETS) {
    const dir = path.join(OUT, target.dir);
    await mkdir(dir, { recursive: true });

    const idxs = target.slides === 'all' ? SLIDES.map((_, i) => i) : target.slides;

    for (let n = 0; n < idxs.length; n++) {
      const slide = SLIDES[idxs[n]];
      const img = await getImg(slide.shot);
      const img2 = slide.shot2 ? await getImg(slide.shot2) : null;

      const html = slideHtml({ slide, img, img2, width: target.width, height: target.height, fontFace });

      const ctx = await browser.newContext({
        viewport: { width: target.width, height: target.height },
        deviceScaleFactor: target.scale,
      });
      const page = await ctx.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(250);

      // Multi-slide targets get numbered names; single-slide ones keep the prefix.
      const name = idxs.length > 1
        ? `${target.prefix}-${String(n + 1).padStart(2, '0')}-${slide.id}.png`
        : `${target.prefix}.png`;
      const file = path.join(dir, name);
      await page.screenshot({ path: file });
      await ctx.close();

      const px = `${target.width * target.scale}×${target.height * target.scale}`;
      console.log(`  ✓ ${path.join(target.dir, name).padEnd(46)} ${px}`);
      manifest.push({ file: path.join(target.dir, name), width: target.width * target.scale, height: target.height * target.scale });
    }
  }

  // Product Hunt thumbnail
  const logo = `data:image/png;base64,${(await readFile('public/logo.png')).toString('base64')}`;
  for (const [dir, size] of [['product-hunt', 240]]) {
    const ctx = await browser.newContext({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.setContent(thumbHtml(logo, size), { waitUntil: 'load' });
    await page.waitForTimeout(200);
    const file = path.join(OUT, dir, 'thumbnail.png');
    await page.screenshot({ path: file });
    await ctx.close();
    console.log(`  ✓ ${path.join(dir, 'thumbnail.png').padEnd(46)} ${size}×${size}`);
    manifest.push({ file: path.join(dir, 'thumbnail.png'), width: size, height: size });
  }

  await browser.close();
  await writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\n${manifest.length} assets written to marketing/`);
}

main();
