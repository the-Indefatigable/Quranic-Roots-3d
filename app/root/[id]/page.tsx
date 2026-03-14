import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import ClientApp from '../../../src/components/ClientApp';
import type { VerbRoot } from '../../../src/data/verbs';

// Read the lightweight index at build time (490KB, has all root data we need for SEO)
function getAllRoots(): VerbRoot[] {
  const filePath = path.join(process.cwd(), 'public', 'data', 'index.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return (JSON.parse(raw) as { roots: VerbRoot[] }).roots;
}

function findRoot(id: string): VerbRoot | undefined {
  return getAllRoots().find(r => r.id === id);
}

export async function generateStaticParams() {
  const roots = getAllRoots();
  // Return raw IDs — Next.js handles URL encoding automatically
  return roots.map(r => ({ id: r.id }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const id = decodeURIComponent(params.id);
  const root = findRoot(id);
  if (!root) return { title: 'Quranic Verb Root' };

  const formCount = root.babs?.length ?? 0;
  const freq = root.totalFreq ?? 0;

  return {
    title: `${root.root} — ${root.meaning} | Quranic Verb Root`,
    description: `Explore the Quranic verb root ${root.root} meaning "${root.meaning}". Appears ${freq} times in the Quran across ${formCount} verb form${formCount !== 1 ? 's' : ''}. Full conjugation tables with Arabic text and English meanings.`,
    alternates: { canonical: `/root/${encodeURIComponent(id)}` },
    openGraph: {
      title: `${root.root} (${root.meaning}) — Quranic Verb Root`,
      description: `Study the Quranic Arabic root ${root.root} — "${root.meaning}". ${freq} occurrences, ${formCount} forms.`,
      url: `https://quranicroots.com/root/${params.id}`,
    },
  };
}

const BAB_COLORS: Record<string, string> = {
  I: '#4a9eff', II: '#f97316', III: '#a855f7', IV: '#22c55e',
  V: '#ec4899', VI: '#14b8a6', VII: '#f59e0b', VIII: '#64748b',
  IX: '#ef4444', X: '#8b5cf6',
};

export default function RootPage({ params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id);
  const root = findRoot(id);

  return (
    <>
      {/* Server-rendered SEO content — visible behind the app for crawlers */}
      {root && (
        <div style={{
          position: 'absolute', width: '1px', height: '1px',
          overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap',
        }}>
          <h1>{root.root} — {root.meaning}</h1>
          <p>
            Quranic Arabic verb root {root.root} meaning &quot;{root.meaning}&quot;.
            Appears {root.totalFreq ?? 0} times in the Quran.
          </p>
          {root.babs?.length > 0 && (
            <section>
              <h2>Verb Forms</h2>
              <ul>
                {root.babs.map(bab => (
                  <li key={bab.id}>
                    <strong>Form {bab.romanNumeral}</strong> ({bab.arabicPattern}):
                    {bab.verbMeaning || bab.meaning}
                    {bab.semanticMeaning ? ` — ${bab.semanticMeaning}` : ''}
                    {bab.tenses?.map(t => (
                      <span key={t.id}> | {t.englishName}: {t.occurrences} occurrences</span>
                    ))}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {/* Full interactive app — pre-selects this root on mount */}
      <ClientApp />
    </>
  );
}
