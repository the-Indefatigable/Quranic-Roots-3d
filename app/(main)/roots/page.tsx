import { db, dbQuery } from '@/db';
import { roots } from '@/db/schema';
import { asc, sql } from 'drizzle-orm';
import { RootsBrowserClient } from '@/components/roots/RootsBrowserClient';

export const revalidate = 86400; // 24h — root data is immutable

export const metadata = {
  title: 'Quranic Roots — QuRoots',
  description: 'Browse all 1,716 Quranic Arabic verb roots with meanings, frequencies, and verb forms.',
};

export default async function RootsPage() {
  // Fetch only roots that have at least one verb form
  const rootRows = await dbQuery(() =>
    db.select({
      id: roots.id,
      root: roots.root,
      meaning: roots.meaning,
      totalFreq: roots.totalFreq,
      formCount: sql<number>`(SELECT COUNT(*) FROM forms WHERE forms.root_id = ${roots.id})`.as('form_count'),
    }).from(roots)
      .where(sql`EXISTS (SELECT 1 FROM forms WHERE forms.root_id = ${roots.id})`)
      .orderBy(asc(roots.root))
  );

  const data = rootRows.map((r) => ({
    id: r.id,
    root: r.root,
    meaning: r.meaning,
    totalFreq: r.totalFreq || 0,
    formCount: Number(r.formCount) || 0,
  }));

  return <RootsBrowserClient roots={data} />;
}
