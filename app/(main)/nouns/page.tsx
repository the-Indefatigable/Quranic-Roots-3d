import { db, dbQuery } from '@/db';
import { nouns, roots } from '@/db/schema';
import { asc } from 'drizzle-orm';
import { NounsBrowserClient } from '@/components/nouns/NounsBrowserClient';

export const revalidate = 86400; // 24h — noun data is immutable

export const metadata = {
  title: 'Quranic Nouns — QuRoots',
  description: 'Browse 3,000 derived nouns and participles from Quranic Arabic roots.',
};

export default async function NounsPage() {
  const [allNouns, rootRows] = await Promise.all([
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
    dbQuery(() =>
      db.select({ id: roots.id, root: roots.root }).from(roots)
    ),
  ]);

  const rootMap = new Map(rootRows.map((r) => [r.id, r.root]));

  const data = allNouns.map((n) => ({
    id: n.id,
    lemma: n.lemma,
    type: n.type,
    meaning: n.meaning || '',
    totalFreq: n.totalFreq || 0,
    root: n.rootId ? rootMap.get(n.rootId) || '' : '',
  }));

  return <NounsBrowserClient nouns={data} />;
}
