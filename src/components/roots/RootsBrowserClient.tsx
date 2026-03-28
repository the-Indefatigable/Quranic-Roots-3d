'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArabicText } from '@/components/ui/ArabicText';

interface RootSummary {
  id: string;
  root: string;
  meaning: string;
  totalFreq: number;
  formCount: number;
}

interface NounSummary {
  id: string;
  lemma: string;
  type: string;
  meaning: string;
  totalFreq: number;
  root: string;
}

interface ParticleSummary {
  id: string;
  form: string;
  type: string;
  meaning: string;
  frequency: number;
}

const nounTypeLabels: Record<string, string> = {
  noun: 'Noun',
  active_participle: 'Active Participle',
  passive_participle: 'Passive Participle',
  adjective: 'Adjective',
  masdar: 'Masdar',
  proper_noun: 'Proper Noun',
};

type Tab = 'verbs' | 'nouns' | 'particles';
type SortVerbs = 'alpha' | 'freq' | 'forms';
type SortNouns = 'alpha' | 'freq' | 'type';
type SortParticles = 'alpha' | 'freq' | 'type';

export function RootsBrowserClient({
  roots,
  nouns,
  particles,
}: {
  roots: RootSummary[];
  nouns: NounSummary[];
  particles: ParticleSummary[];
}) {
  const [tab, setTab] = useState<Tab>('verbs');
  const [search, setSearch] = useState('');
  const [sortVerbs, setSortVerbs] = useState<SortVerbs>('freq');
  const [sortNouns, setSortNouns] = useState<SortNouns>('freq');
  const [sortParticles, setSortParticles] = useState<SortParticles>('freq');
  const [showCount, setShowCount] = useState(200);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'verbs', label: 'Verbs', count: roots.length },
    { key: 'nouns', label: 'Nouns', count: nouns.length },
    { key: 'particles', label: 'Particles', count: particles.length },
  ];

  const filteredRoots = useMemo(() => {
    let list = roots;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.root.includes(search) || r.meaning?.toLowerCase().includes(q));
    }
    if (sortVerbs === 'freq') list = [...list].sort((a, b) => b.totalFreq - a.totalFreq);
    else if (sortVerbs === 'forms') list = [...list].sort((a, b) => b.formCount - a.formCount);
    return list;
  }, [roots, search, sortVerbs]);

  const filteredNouns = useMemo(() => {
    let list = nouns;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((n) => n.lemma?.includes(search) || n.meaning?.toLowerCase().includes(q));
    }
    if (sortNouns === 'freq') list = [...list].sort((a, b) => b.totalFreq - a.totalFreq);
    else if (sortNouns === 'type') list = [...list].sort((a, b) => a.type.localeCompare(b.type));
    return list;
  }, [nouns, search, sortNouns]);

  const filteredParticles = useMemo(() => {
    let list = particles;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.form.includes(search) || p.meaning?.toLowerCase().includes(q));
    }
    if (sortParticles === 'freq') list = [...list].sort((a, b) => b.frequency - a.frequency);
    else if (sortParticles === 'type') list = [...list].sort((a, b) => a.type.localeCompare(b.type));
    return list;
  }, [particles, search, sortParticles]);

  const currentCount =
    tab === 'verbs' ? filteredRoots.length :
    tab === 'nouns' ? filteredNouns.length :
    filteredParticles.length;

  function handleTabChange(next: Tab) {
    setTab(next);
    setSearch('');
    setShowCount(200);
  }

  const visibleNouns = filteredNouns.slice(0, showCount);
  const visibleParticles = filteredParticles.slice(0, showCount);

  return (
    <>
      <PageHeader
        title="Roots"
        subtitle={
          tab === 'verbs' ? `${roots.length} Quranic verb roots` :
          tab === 'nouns' ? `${nouns.length} derived nouns & participles` :
          `${particles.length} Quranic particles`
        }
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={`Search ${tab}...`}
          className="w-48 sm:w-64"
        />
      </PageHeader>

      {/* Tab selector */}
      <div className="flex items-center gap-1.5 mb-5 border-b border-white/[0.05] pb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-gold-dim text-gold'
                : 'text-muted-more hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            {t.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
              tab === t.key ? 'bg-gold/20 text-gold' : 'bg-white/[0.06] text-muted-more'
            }`}>
              {t.count.toLocaleString()}
            </span>
          </button>
        ))}
        {search && (
          <span className="text-xs text-muted ml-auto">{currentCount} results</span>
        )}
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[10px] text-muted-more uppercase tracking-wider">Sort</span>

        {tab === 'verbs' && (
          <>
            {(['freq', 'alpha', 'forms'] as SortVerbs[]).map((key) => (
              <button
                key={key}
                onClick={() => setSortVerbs(key)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                  sortVerbs === key ? 'bg-gold-dim text-gold' : 'bg-white/[0.03] text-muted-more hover:text-white'
                }`}
              >
                {key === 'freq' ? 'Frequency' : key === 'alpha' ? 'Alphabetical' : 'Forms'}
              </button>
            ))}
          </>
        )}

        {tab === 'nouns' && (
          <>
            {(['freq', 'alpha', 'type'] as SortNouns[]).map((key) => (
              <button
                key={key}
                onClick={() => setSortNouns(key)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                  sortNouns === key ? 'bg-gold-dim text-gold' : 'bg-white/[0.03] text-muted-more hover:text-white'
                }`}
              >
                {key === 'freq' ? 'Frequency' : key === 'alpha' ? 'Alphabetical' : 'Type'}
              </button>
            ))}
          </>
        )}

        {tab === 'particles' && (
          <>
            {(['freq', 'alpha', 'type'] as SortParticles[]).map((key) => (
              <button
                key={key}
                onClick={() => setSortParticles(key)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                  sortParticles === key ? 'bg-gold-dim text-gold' : 'bg-white/[0.03] text-muted-more hover:text-white'
                }`}
              >
                {key === 'freq' ? 'Frequency' : key === 'alpha' ? 'Alphabetical' : 'Type'}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Verbs grid */}
      {tab === 'verbs' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredRoots.map((root) => (
            <Link key={root.id} href={`/roots/${encodeURIComponent(root.root)}`} prefetch={false}>
              <Card className="h-full">
                <div className="flex items-start justify-between mb-2">
                  <ArabicText size="2xl" className="text-gold">{root.root}</ArabicText>
                  <div className="flex items-center gap-1.5">
                    {root.formCount > 0 && (
                      <span className="text-[10px] text-muted-more bg-white/[0.04] px-1.5 py-0.5 rounded">
                        {root.formCount} form{root.formCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    <Badge variant="amber">{root.totalFreq}x</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted line-clamp-2">{root.meaning}</p>
              </Card>
            </Link>
          ))}
          {filteredRoots.length === 0 && search && <EmptyState query={search} />}
        </div>
      )}

      {/* Nouns grid */}
      {tab === 'nouns' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleNouns.map((noun) => (
              <Card key={noun.id} hover={false}>
                <div className="flex items-start justify-between mb-1">
                  <ArabicText size="xl" className="text-white">{noun.lemma}</ArabicText>
                  {noun.totalFreq > 0 && <Badge>{noun.totalFreq}x</Badge>}
                </div>
                <p className="text-sm text-muted line-clamp-1 mb-2">{noun.meaning}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="amber">{nounTypeLabels[noun.type] || noun.type}</Badge>
                  {noun.root && (
                    <Link
                      href={`/roots/${encodeURIComponent(noun.root)}`}
                      prefetch={false}
                      className="text-xs text-muted-more font-arabic hover:text-gold transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {noun.root}
                    </Link>
                  )}
                </div>
              </Card>
            ))}
            {filteredNouns.length === 0 && search && <EmptyState query={search} />}
          </div>
          {visibleNouns.length < filteredNouns.length && (
            <div className="text-center mt-6">
              <button
                onClick={() => setShowCount((c) => c + 200)}
                className="text-xs text-gold hover:text-gold-light transition-colors font-medium"
              >
                Show more ({filteredNouns.length - visibleNouns.length} remaining)
              </button>
            </div>
          )}
        </>
      )}

      {/* Particles grid */}
      {tab === 'particles' && (
        <>
          {particles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted text-sm">No particle data in database yet.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {visibleParticles.map((p) => (
                  <Card key={p.id} hover={false}>
                    <div className="flex items-start justify-between mb-1">
                      <ArabicText size="xl" className="text-white">{p.form}</ArabicText>
                      {p.frequency > 0 && <Badge>{p.frequency}x</Badge>}
                    </div>
                    <p className="text-sm text-muted line-clamp-1 mb-2">{p.meaning}</p>
                    <Badge variant="emerald">{p.type}</Badge>
                  </Card>
                ))}
                {filteredParticles.length === 0 && search && <EmptyState query={search} />}
              </div>
              {visibleParticles.length < filteredParticles.length && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => setShowCount((c) => c + 200)}
                    className="text-xs text-gold hover:text-gold-light transition-colors font-medium"
                  >
                    Show more ({filteredParticles.length - visibleParticles.length} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="col-span-full text-center py-20">
      <p className="text-muted text-sm">No results for &ldquo;{query}&rdquo;</p>
    </div>
  );
}
