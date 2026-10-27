/**
 * Writes every email template to HTML files for review, with sample data. Sends nothing.
 *   npx tsx scripts/preview-emails.ts <out-dir>
 */
import fs from 'fs';
import { WEEKLY_VERSES, weeklyEmail, dayReminder, pathOfferReminder, streakReminder } from '../src/lib/emails';
import { PATH, previewLine } from '../src/lib/salahPath';

const out = process.argv[2] ?? 'out/emails';
fs.mkdirSync(out, { recursive: true });
const token = '00000000-0000-0000-0000-000000000000';
const d3 = PATH.days[2], d4 = PATH.days[3];
const files: Record<string, { subject: string; html: string }> = {
  'weekly-path': weeklyEmail({ firstName: 'Aisha', verse: WEEKLY_VERSES[7], token, progress: { day: 3, title: d3.title, pct: d3.pctSalah, paid: false }, next: { day: 4, title: d4.title } }),
  'weekly-new': weeklyEmail({ firstName: 'Aisha', verse: WEEKLY_VERSES[1], token, progress: null, next: null }),
  'reminder-day': dayReminder({ firstName: 'Aisha', day: 4, title: d4.title, pctNow: d3.pctSalah, line: previewLine(4), token }),
  'reminder-offer': pathOfferReminder({ firstName: 'Aisha', pctNow: PATH.days[6].pctSalah, priceCents: 2900, token, finishedFatiha: true }),
  'reminder-streak': streakReminder({ firstName: 'Aisha', streak: 5, token }),
};
for (const [name, e] of Object.entries(files)) {
  fs.writeFileSync(`${out}/${name}.html`, e.html);
  console.log(`${name}: ${e.subject}`);
}
