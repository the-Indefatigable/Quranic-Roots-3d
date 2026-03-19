'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArabicText } from '@/components/ui/ArabicText';

interface NounSummary {
  id: string;
  lemma: string;
  type: string;
  meaning: string;
  totalFreq: number;
  root: string;
}

const typeLabels: Record<string, string> = {
  noun: 'Noun',
  active_participle: 'Active Participle',
  passive_participle: 'Passive Participle',
  adjective: 'Adjective',
  masdar: 'Masdar',
  proper_noun: 'Proper Noun',
};

type SortBy = 'alpha' | 'freq' | 'type';

export function NounsBrowserClient({ nouns }: { nouns: NounSummary[] }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('freq');
  const [showCount, setShowCount] = useState(200);

  const filtered = useMemo(() => {
    let list = nouns;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (n) => n.lemma?.includes(search) || n.meaning?.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'freq') {
      list = [...list].sort((a, b) => b.totalFreq - a.totalFreq);
    } else if (sortBy === 'type') {
      list = [...list].sort((a, b) => a.type.localeCompare(b.type));
    }
    return list;
  }, [nouns, search, sortBy]);

  const visible = filtered.slice(0, showCount);
  const hasMore = showCount < filtered.length;

  const sortOptions: { key: SortBy; label: string }[] = [
    { key: 'freq', label: 'Frequency' },
    { key: 'alpha', label: 'Alphabetical' },
    { key: 'type', label: 'Type' },
  ];

  return (
    <>
      <PageHeader title="Nouns" subtitle={`${nouns.length} derived nouns and participles`}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search nouns..."
          className="w-48 sm:w-64"
        />
      </PageHeader>

      {/* Sort controls */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[10px] text-muted-more uppercase tracking-wider">Sort by</span>
        {sortOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className={`text-xs px-3 py-1.5 sm:px-2.5 sm:py-1 rounded-lg transition-colors ${
              sortBy === opt.key
                ? 'bg-gold-dim text-gold'
                : 'bg-white/[0.03] text-muted-more hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
        {search && (
          <span className="text-xs text-muted ml-auto">{filtered.length} results</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visible.map((noun) => (
          <Card key={noun.id}>
            <div className="flex items-start justify-between mb-1">
              <ArabicText size="xl" className="text-white">
                {noun.lemma}
              </ArabicText>
              <Badge>{noun.totalFreq}x</Badge>
            </div>
            <p className="text-sm text-muted line-clamp-1">{noun.meaning}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="gold">{typeLabels[noun.type] || noun.type}</Badge>
              {noun.root && (
                <Link
                  href={`/roots/${encodeURIComponent(noun.root)}`}
                  prefetch={false}
                  className="text-xs text-muted-more font-arabic hover:text-gold transition-colors"
                >
                  {noun.root}
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Show more */}
      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowCount((c) => c + 200)}
            className="text-xs text-gold hover:text-gold-light transition-colors font-medium"
          >
            Show more ({filtered.length - showCount} remaining)
          </button>
        </div>
      )}
    </>
  );
}
