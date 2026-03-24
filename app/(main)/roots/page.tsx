import { db, dbQuery } from '@/db';
import { roots, nouns, particles } from '@/db/schema';
import { asc, sql } from 'drizzle-orm';
import { RootsBrowserClient } from '@/components/roots/RootsBrowserClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'All 1,716 Quranic Arabic Roots — Browse, Search & Learn',
  description:
    'Browse all 1,716 Quranic Arabic verb roots with meanings, frequencies, verb forms, and derived nouns. The most comprehensive Quranic root dictionary online.',
  openGraph: {
    title: 'All 1,716 Quranic Arabic Roots | QuRoots',
    description: 'Browse Quranic Arabic verb roots with meanings, frequencies, and verb forms.',
    url: 'https://quroots.com/roots',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All 1,716 Quranic Arabic Roots | QuRoots',
    description: 'The most comprehensive Quranic root dictionary online.',
    images: ['/og-image.png'],
  },
};

export default async function RootsPage() {
  const [rootRows, allNouns, rootRows2, allParticles] = await Promise.all([
    // Verbs: only roots with at least one form
    dbQuery(() =>
      db.select({
        id: roots.id,
        root: roots.root,
        meaning: roots.meaning,
        totalFreq: roots.totalFreq,
        formCount: sql<number>`(SELECT COUNT(*) FROM forms WHERE forms.root_id = ${roots.id})`.as('form_count'),
      }).from(roots)
        .where(sql`EXISTS (SELECT 1 FROM forms WHERE forms.root_id = ${roots.id})`)
        .orderBy(asc(roots.root))
    ),
    // Nouns
    dbQuery(() =>
      db.select({
        id: nouns.id,
        lemma: nouns.lemma,
        type: nouns.type,
        meaning: nouns.meaning,
        totalFreq: nouns.totalFreq,
        rootId: nouns.rootId,
      }).from(nouns).orderBy(asc(nouns.lemma))
    ),
    // Root lookup for nouns
    dbQuery(() =>
      db.select({ id: roots.id, root: roots.root }).from(roots)
    ),
    // Particles
    dbQuery(() =>
      db.select({
        id: particles.id,
        form: particles.form,
        type: particles.type,
        meaning: particles.meaning,
        frequency: particles.frequency,
      }).from(particles).orderBy(asc(particles.type), asc(particles.form))
    ),
  ]);

  const rootMap = new Map(rootRows2.map((r) => [r.id, r.root]));

  return (
    <RootsBrowserClient
      roots={rootRows.map((r) => ({
        id: r.id,
        root: r.root,
        meaning: r.meaning,
        totalFreq: r.totalFreq || 0,
        formCount: Number(r.formCount) || 0,
      }))}
      nouns={allNouns.map((n) => ({
        id: n.id,
        lemma: n.lemma,
        type: n.type,
        meaning: n.meaning || '',
        totalFreq: n.totalFreq || 0,
        root: n.rootId ? rootMap.get(n.rootId) || '' : '',
      }))}
      particles={allParticles.map((p) => ({
        id: p.id,
        form: p.form,
        type: p.type,
        meaning: p.meaning || '',
        frequency: p.frequency || 0,
      }))}
    />
  );
}
