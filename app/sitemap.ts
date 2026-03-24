import type { MetadataRoute } from 'next';
import { db, dbQuery } from '@/db';
import { roots, surahs } from '@/db/schema';
import { asc } from 'drizzle-orm';

export const revalidate = false;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://quroots.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/quran`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/roots`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/learn`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/search`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  // Learn / grammar pages
  const learnPages: MetadataRoute.Sitemap = [
    'irab',
    'mufrad-muthanna-jam',
    'murakkab',
    'adad',
    'verb-forms',
  ].map((slug) => ({
    url: `${baseUrl}/learn/${slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }));

  // All 114 surahs
  const allSurahs = await dbQuery(() =>
    db.select({ number: surahs.number }).from(surahs).orderBy(asc(surahs.number))
  );

  const surahPages: MetadataRoute.Sitemap = allSurahs.map((s) => ({
    url: `${baseUrl}/quran/${s.number}`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // All roots
  const allRoots = await dbQuery(() =>
    db.select({ root: roots.root }).from(roots).orderBy(asc(roots.id))
  );

  const rootPages: MetadataRoute.Sitemap = allRoots.map((r) => ({
    url: `${baseUrl}/roots/${encodeURIComponent(r.root)}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...learnPages, ...surahPages, ...rootPages];
}
