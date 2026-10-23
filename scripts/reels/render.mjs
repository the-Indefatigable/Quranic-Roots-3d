/**
 * Render a reel page to MP4: step window.render(t) in headless Chrome, screenshot each frame,
 * then join the frames with the recitation audio.
 *
 * Run: node scripts/reels/render.mjs scripts/reels/rahma.html out/rahma.mp4 [seconds] [audio-url-or-file] [cues.json]
 * With cues.json the page gets window.setCues(cues) and the audio is used as a finished soundtrack.
 * Needs Google Chrome and ffmpeg.
 */
import fs from 'fs';
import path from 'path';
import { spawn, execFileSync } from 'child_process';

const [page, out, secs = '18', audio = 'https://everyayah.com/data/Alafasy_128kbps/001001.mp3', cues] = process.argv.slice(2);
const FPS = 30, DUR = Number(secs), W = 1080, H = 1920;
const tmp = fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'reel-'));
const CH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const chrome = spawn(CH, ['--headless=new', '--hide-scrollbars', '--no-first-run', `--user-data-dir=${tmp}/profile`, '--remote-debugging-port=9334', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let list; for (let i = 0; i < 60 && !list; i++) { try { list = await (await fetch('http://127.0.0.1:9334/json')).json(); } catch { await sleep(250); } }
const ws = new WebSocket(list.find((t) => t.type === 'page').webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const pend = new Map(); ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: 'file://' + path.resolve(page) }); await sleep(2500);
await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
if (cues) await send('Runtime.evaluate', { expression: `setCues(${fs.readFileSync(cues, 'utf8')})` });
const frames = Math.round(DUR * FPS);
for (let f = 0; f < frames; f++) {
  await send('Runtime.evaluate', { expression: `render(${(f / FPS).toFixed(4)})` });
  const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
  fs.writeFileSync(`${tmp}/f${String(f).padStart(5, '0')}.jpg`, Buffer.from(r.result.data, 'base64'));
  if (f % 90 === 0) process.stdout.write(`frame ${f}/${frames}\n`);
}
ws.close(); chrome.kill();
let a = audio;
if (/^https?:/.test(audio)) { a = `${tmp}/audio.mp3`; fs.writeFileSync(a, Buffer.from(await (await fetch(audio)).arrayBuffer())); }
fs.mkdirSync(path.dirname(out), { recursive: true });
execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', `${tmp}/f%05d.jpg`, '-i', a,
  '-filter_complex', cues ? '[1:a]apad[a]' : `[1:a]adelay=500|500,afade=t=in:d=0.4,apad[a]`, '-map', '0:v', '-map', '[a]', '-t', String(DUR),
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'slow', '-r', String(FPS), '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log('wrote', out);
