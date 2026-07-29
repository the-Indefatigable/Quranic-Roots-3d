/**
 * Capture raw product screenshots for the launch kit.
 *
 * Two sources:
 *   --target=prod    https://quroots.com — real content (all 1,716 roots, the
 *                    full word-by-word Quran). Signed out.
 *   --target=local   http://localhost:3000 — a seeded demo instance, browsed as
 *                    a signed-in learner via the session token from
 *                    scripts/seed-demo-learner.mjs. This is the only way to
 *                    capture the gamified screens (XP, streaks, lesson player).
 *
 * Raw output goes to --out (default: marketing/raw). Framing is a separate
 * step — see scripts/compose-marketing.mjs.
 *
 * Run: node scripts/capture-screenshots.mjs --target=prod --out=marketing/raw
 */
import { chromium } from 'playwright-core';
import { mkdir } from 'fs/promises';
import path from 'path';

const CHROME = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);

const TARGET = args.target || 'prod';
const OUT_DIR = path.resolve(args.out || 'marketing/raw');
const ONLY = args.only ? String(args.only).split(',') : null;

const BASE = TARGET === 'local' ? 'http://localhost:3000' : 'https://quroots.com';
const SESSION_TOKEN = process.env.DEMO_SESSION_TOKEN || 'demo-session-quroots-launch-2026';

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

/**
 * Each shot: where to go, how big, and what to wait for.
 *   waitFor    — selector that must appear before we shoot (content is loaded)
 *   scrollTo   — selector to bring into view first
 *   fullPage   — capture the whole scroll height instead of the viewport
 *   settle     — extra ms for entrance animations that aren't Web Animations
 */
const SHOTS = [
  // ── prod: real content, signed out ────────────────────────────────────
  // The homepage hero counts its stat tiles up with a JS animation, which a
  // short settle catches mid-tween — hence the longer wait.
  { id: 'home-hero',      target: 'prod',  url: '/',            viewport: DESKTOP, settle: 4500 },
  { id: 'roots-browser',  target: 'prod',  url: '/roots',       viewport: DESKTOP, settle: 1500 },
  { id: 'root-detail',    target: 'prod',  url: '/roots/قول',   viewport: DESKTOP, settle: 1500 },
  { id: 'quran-index',    target: 'prod',  url: '/quran',       viewport: DESKTOP, settle: 1000 },
  { id: 'quran-reader',   target: 'prod',  url: '/quran/18',    viewport: DESKTOP, settle: 2000 },
  { id: 'blog-index',     target: 'prod',  url: '/blog',        viewport: DESKTOP, settle: 1000 },
  { id: 'mobile-quran',   target: 'prod',  url: '/quran/18',    viewport: MOBILE,  settle: 2000 },
  { id: 'mobile-roots',   target: 'prod',  url: '/roots',       viewport: MOBILE,  settle: 1500 },

  // ── local: signed-in demo learner ─────────────────────────────────────
  // Past the tall hero, onto the unit path itself.
  { id: 'learn-path',     target: 'local', url: '/learn/path',   viewport: DESKTOP, settle: 2000, scrollY: 620 },
  { id: 'daily-ayah',     target: 'local', url: '/daily',        viewport: DESKTOP, settle: 1800 },
  { id: 'dashboard',      target: 'local', url: '/dashboard',    viewport: DESKTOP, settle: 2000 },
  { id: 'achievements',   target: 'local', url: '/achievements', viewport: DESKTOP, settle: 1500 },
  { id: 'leaderboard',    target: 'local', url: '/leaderboard',  viewport: DESKTOP, settle: 1500 },
  { id: 'profile',        target: 'local', url: '/profile',      viewport: DESKTOP, settle: 1500 },
  { id: 'mobile-path',    target: 'local', url: '/learn/path',   viewport: MOBILE,  settle: 2000 },
  { id: 'mobile-dash',    target: 'local', url: '/dashboard',    viewport: MOBILE,  settle: 2000 },
];

/**
 * Hide the persistent widgets and any overlay that would date the screenshot
 * or cover the content. Runs after load, before the shot.
 */
async function cleanUp(page) {
  await page.addStyleTag({
    content: `
      /* Freeze carets so no blinking cursor lands in a shot */
      *, *::before, *::after { caret-color: transparent !important; }
      /* Kill scrollbars so the frame edge is clean */
      ::-webkit-scrollbar { display: none !important; }
      html { scrollbar-width: none !important; }
    `,
  });

  // Hide floating overlays (feedback button, digest nudge, streak guard). They
  // are Tailwind-utility styled with no stable hook, so match on behaviour:
  // fixed-position, stacked above the page, and not the nav chrome we want.
  await page.evaluate(() => {
    const isNav = (el) => ['ASIDE', 'HEADER', 'NAV'].includes(el.tagName);
    for (const el of document.querySelectorAll('*')) {
      const s = getComputedStyle(el);
      if (s.position !== 'fixed') continue;
      const z = parseInt(s.zIndex) || 0;
      const text = (el.textContent || '').toLowerCase();
      const isOverlay = z >= 40 && !isNav(el);
      const isNudge = /digest|feedback|streak freeze|subscribe/.test(text) && z >= 40;
      if (isOverlay || isNudge) el.style.setProperty('display', 'none', 'important');
    }
  });

  // Finish every running animation/transition so nothing is caught mid-flight.
  await page.evaluate(() => {
    document.getAnimations().forEach((a) => {
      try { a.finish(); } catch { /* infinite animations can't finish; ignore */ }
    });
  });

  // Dismiss anything that looks like a cookie/consent/close affordance.
  for (const sel of ['button:has-text("Accept")', 'button:has-text("Got it")', '[aria-label="Close"]']) {
    const el = page.locator(sel).first();
    if (await el.count().catch(() => 0)) {
      await el.click({ timeout: 1000 }).catch(() => {});
    }
  }
}

async function capture(browser, shot) {
  const failedRequests = [];
  const base = shot.target === 'local' ? 'http://localhost:3000' : 'https://quroots.com';
  const context = await browser.newContext({
    viewport: shot.viewport,
    deviceScaleFactor: 2,
    isMobile: shot.viewport.width < 500,
    hasTouch: shot.viewport.width < 500,
    colorScheme: 'dark',
    locale: 'en-US',
    timezoneId: 'UTC',
    reducedMotion: 'reduce',
  });

  if (shot.target === 'local') {
    await context.addCookies([{
      name: 'authjs.session-token',
      value: SESSION_TOKEN,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    }]);
  }

  // Chromium's CONNECT is reset by this environment's egress proxy, but Node's
  // fetch goes through it fine. So for remote targets we intercept every
  // request and serve it from Node instead of letting the browser dial out.
  if (shot.target !== 'local') {
    await context.route('**/*', async (route) => {
      const req = route.request();
      // The proxy occasionally drops a request under parallel load, and an
      // aborted stylesheet silently renders the page unstyled — so retry
      // before giving up, and surface anything that still fails.
      let lastErr;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await fetch(req.url(), {
            method: req.method(),
            headers: { ...req.headers(), 'accept-encoding': 'identity' },
            body: ['GET', 'HEAD'].includes(req.method()) ? undefined : req.postDataBuffer(),
            redirect: 'follow',
          });
          const body = Buffer.from(await res.arrayBuffer());
          const headers = {};
          res.headers.forEach((v, k) => {
            // fetch already decoded the body; passing these through corrupts it.
            if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(k)) {
              headers[k] = v;
            }
          });
          await route.fulfill({ status: res.status, headers, body });
          return;
        } catch (err) {
          lastErr = err;
          await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
        }
      }
      failedRequests.push(`${req.resourceType()} ${req.url().slice(0, 90)} — ${lastErr?.message}`);
      await route.abort();
    });
  }

  // Floating widgets (feedback button, digest nudge, streak guard) mount on
  // their own timers, so a one-shot cleanup races them. Install an observer
  // before any app code runs and let it hide them for the page's lifetime.
  await context.addInitScript(() => {
    const hide = () => {
      for (const el of document.querySelectorAll('body *')) {
        const s = getComputedStyle(el);
        if (s.position !== 'fixed' || s.display === 'none') continue;
        const z = parseInt(s.zIndex) || 0;
        if (z < 40) continue;
        if (['ASIDE', 'HEADER', 'NAV'].includes(el.tagName)) continue;
        el.style.setProperty('display', 'none', 'important');
      }
    };
    const start = () => {
      hide();
      new MutationObserver(hide).observe(document.body, { childList: true, subtree: true });
      setInterval(hide, 300);
    };
    if (document.body) start();
    else document.addEventListener('DOMContentLoaded', start);
  });

  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  const url = base + shot.url;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 45000 }).catch(() => {});

  if (shot.waitFor) {
    await page.waitForSelector(shot.waitFor, { timeout: 20000 }).catch(() => {});
  }
  if (shot.scrollTo) {
    await page.locator(shot.scrollTo).first().scrollIntoViewIfNeeded().catch(() => {});
  }
  if (shot.scrollY) {
    // Push past a tall page header so the shot lands on the actual content.
    await page.evaluate((y) => window.scrollTo(0, y), shot.scrollY);
    await page.waitForTimeout(500);
  }

  // Settle first: nudges and entrance animations are on timers, so anything
  // cleaned up before this window would just reappear.
  await cleanUp(page);
  if (shot.settle) await page.waitForTimeout(shot.settle);
  await cleanUp(page);

  const file = path.join(OUT_DIR, `${shot.id}.png`);
  await page.screenshot({ path: file, fullPage: !!shot.fullPage });

  const dims = shot.fullPage
    ? 'fullPage'
    : `${shot.viewport.width * 2}x${shot.viewport.height * 2}`;
  console.log(`  ✓ ${shot.id.padEnd(16)} ${dims.padEnd(12)} ${url}`);
  if (failedRequests.length) {
    console.log(`    ⚠ ${failedRequests.length} request(s) failed — the shot may be unstyled:`);
    for (const f of failedRequests.slice(0, 3)) console.log(`      ${f}`);
  }

  await context.close();
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  let shots = SHOTS.filter((s) => s.target === TARGET);
  if (ONLY) shots = shots.filter((s) => ONLY.includes(s.id));

  console.log(`\nCapturing ${shots.length} shots from ${BASE} → ${OUT_DIR}\n`);

  // Chromium does not read HTTPS_PROXY from the environment, so pass it
  // explicitly. localhost is bypassed so the local demo target is direct.
  const proxyServer = process.env.HTTPS_PROXY || process.env.https_proxy;
  const launchOpts = {
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
  };
  if (proxyServer) {
    launchOpts.proxy = { server: proxyServer, bypass: 'localhost,127.0.0.1,::1' };
    console.log(`  (routing through proxy ${proxyServer})\n`);
  }

  const browser = await chromium.launch(launchOpts);

  let failed = 0;
  for (const shot of shots) {
    try {
      await capture(browser, shot);
    } catch (err) {
      failed++;
      console.log(`  ✗ ${shot.id.padEnd(16)} ${err.message.split('\n')[0]}`);
    }
  }

  await browser.close();
  console.log(`\nDone. ${shots.length - failed}/${shots.length} captured.`);
  if (failed) process.exitCode = 1;
}

main();
