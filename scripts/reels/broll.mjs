/**
 * Phone-sized screen recording of the live site for "build in public" posts: scrolls /salah,
 * then opens day 1. Run: node scripts/reels/broll.mjs out/salah-broll.mp4
 * Needs Google Chrome and ffmpeg.
 */
import fs from 'fs';
import path from 'path';
import { spawn, execFileSync } from 'child_process';

const out = process.argv[2] || 'out/salah-broll.mp4';
const FPS = 30, W = 360, H = 640, SCALE = 3;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const tmp = fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'broll-'));
const CH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const chrome = spawn(CH, ['--headless=new', '--hide-scrollbars', '--no-first-run', `--user-data-dir=${tmp}/profile`, '--remote-debugging-port=9335', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let list; for (let i = 0; i < 60 && !list; i++) { try { list = await (await fetch('http://127.0.0.1:9335/json')).json(); } catch { await sleep(250); } }
const ws = new WebSocket(list.find((t) => t.type === 'page').webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const pend = new Map(); ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const js = (expression) => send('Runtime.evaluate', { expression, awaitPromise: true });

await send('Page.enable');
await send('Network.setUserAgentOverride', { userAgent: UA });
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: SCALE, mobile: true });
let f = 0;
const shoot = async (n = 1) => {
  const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
  for (let k = 0; k < n; k++) fs.writeFileSync(`${tmp}/f${String(f++).padStart(5, '0')}.jpg`, Buffer.from(r.result.data, 'base64'));
};
const hold = (secs) => shoot(Math.round(secs * FPS));
// Eased scroll, one screenshot per frame.
const glide = async (to, secs) => {
  const from = (await js('scrollY')).result.result.value, n = Math.round(secs * FPS);
  for (let i = 1; i <= n; i++) { const t = i / n, e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2; await js(`scrollTo(0, ${from + (to - from) * e})`); await shoot(); }
};

// Load once to mark the sign-up prompt as already seen today, so it does not cover the recording.
await send('Page.navigate', { url: 'https://quroots.com/salah' }); await sleep(3000);
await js(`localStorage.setItem('signup_modal_seen_on', new Date().toISOString().slice(0, 10))`);
await send('Page.navigate', { url: 'https://quroots.com/salah' }); await sleep(4000);
await hold(2);
await glide(900, 4); await hold(1);
await glide(2200, 4); await hold(1);
await glide(0, 2.5);
await send('Page.navigate', { url: 'https://quroots.com/salah/1' }); await sleep(4000);
await hold(3);
await glide(500, 3); await hold(2);

ws.close(); chrome.kill();
fs.mkdirSync(path.dirname(out), { recursive: true });
execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', `${tmp}/f%05d.jpg`, '-vf', 'scale=1080:1920', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-r', String(FPS), '-movflags', '+faststart', out]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log('wrote', out, f, 'frames');
