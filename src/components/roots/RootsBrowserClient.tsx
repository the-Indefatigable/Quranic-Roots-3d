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

type SortBy = 'alpha' | 'freq' | 'forms';

export function RootsBrowserClient({ roots }: { roots: RootSummary[] }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('freq');

  const filtered = useMemo(() => {
    let list = roots;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) => r.root.includes(search) || r.meaning?.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'freq') {
      list = [...list].sort((a, b) => b.totalFreq - a.totalFreq);
    } else if (sortBy === 'forms') {
      list = [...list].sort((a, b) => b.formCount - a.formCount);
    }
    return list;
  }, [roots, search, sortBy]);

  const sortOptions: { key: SortBy; label: string }[] = [
    { key: 'freq', label: 'Frequency' },
    { key: 'alpha', label: 'Alphabetical' },
    { key: 'forms', label: 'Forms' },
  ];

  return (
    <>
      <PageHeader title="Roots" subtitle={`${roots.length} Quranic verb roots`}>
        <div className="flex items-center gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search roots..."
            className="w-48 sm:w-64"
          />
        </div>
      </PageHeader>

      {/* Sort controls */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[10px] text-muted-more uppercase tracking-wider">Sort by</span>
        {sortOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
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
        {filtered.map((root) => (
          <Link key={root.id} href={`/roots/${encodeURIComponent(root.root)}`} prefetch={false}>
            <Card className="h-full">
              <div className="flex items-start justify-between mb-2">
                <ArabicText size="2xl" className="text-gold">
                  {root.root}
                </ArabicText>
                <div className="flex items-center gap-1.5">
                  {root.formCount > 0 && (
                    <span className="text-[10px] text-muted-more bg-white/[0.04] px-1.5 py-0.5 rounded">
                      {root.formCount} form{root.formCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  <Badge variant="gold">{root.totalFreq}x</Badge>
                </div>
              </div>
              <p className="text-sm text-muted line-clamp-2">{root.meaning}</p>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && search && (
        <div className="text-center py-20">
          <p className="text-muted">No roots found matching &ldquo;{search}&rdquo;</p>
        </div>
      )}
    </>
  );
}
