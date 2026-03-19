import { db, dbQuery } from '@/db';
import { roots } from '@/db/schema';
import { asc, sql } from 'drizzle-orm';
import { RootsBrowserClient } from '@/components/roots/RootsBrowserClient';

export const revalidate = 3600;

export const metadata = {
  title: 'Quranic Roots — QuRoots',
  description: 'Browse all 1,716 Quranic Arabic verb roots with meanings, frequencies, and verb forms.',
};

export default async function RootsPage() {
  // Fetch all roots with form counts in a single query
  const rootRows = await dbQuery(() =>
    db.select({
      id: roots.id,
      root: roots.root,
      meaning: roots.meaning,
      totalFreq: roots.totalFreq,
      formCount: sql<number>`(SELECT COUNT(*) FROM forms WHERE forms.root_id = ${roots.id})`.as('form_count'),
    }).from(roots).orderBy(asc(roots.root))
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
