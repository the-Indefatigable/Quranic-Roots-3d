import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { db, dbQuery } from '@/db';
import { surahs } from '@/db/schema';
import { asc } from 'drizzle-orm';

export const metadata = {
  title: 'Quran',
  description: 'Browse all 114 surahs of the Quran with word-by-word analysis',
};

export const revalidate = 86400; // 24h — surah list is immutable

export default async function QuranPage() {
  const allSurahs = await dbQuery(() =>
    db.select().from(surahs).orderBy(asc(surahs.number))
  );

  return (
    <>
      <PageHeader
        title="Quran"
        subtitle="Browse all 114 surahs"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {allSurahs.map((surah) => (
          <Link
            key={surah.number}
            href={`/quran/${surah.number}`}
            prefetch={false}
            className="group flex items-center gap-4 bg-card border border-border rounded-2xl px-5 py-4 transition-colors hover:border-white/[0.12] hover:bg-elevated"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold-dim text-gold text-sm font-medium">
              {surah.number}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white truncate">
                  {surah.englishName}
                </p>
                <span className="font-arabic text-lg text-gold ml-2 shrink-0">
                  {surah.arabicName}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge>{surah.versesCount} ayahs</Badge>
                {surah.revelationType && (
                  <Badge variant={surah.revelationType === 'makkah' ? 'gold' : 'emerald'}>
                    {surah.revelationType === 'makkah' ? 'Meccan' : 'Medinan'}
                  </Badge>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
