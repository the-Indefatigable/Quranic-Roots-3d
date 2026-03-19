'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArabicText } from '@/components/ui/ArabicText';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

interface NounSummary {
  id: string;
  lemma: string;
  type: string;
  typeAr: string;
  meaning: string;
  totalFreq: number;
  root?: string;
}

const typeLabels: Record<string, string> = {
  noun: 'Noun',
  active_participle: 'Active Participle',
  passive_participle: 'Passive Participle',
  adjective: 'Adjective',
  masdar: 'Masdar',
  proper_noun: 'Proper Noun',
};

export default function NounsPage() {
  const [nouns, setNouns] = useState<NounSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/nouns')
      .then((r) => r.json())
      .then((res) => {
        const data = res.nouns || res;
        setNouns(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = search
    ? nouns.filter(
        (n) =>
          n.lemma?.includes(search) ||
          n.meaning?.toLowerCase().includes(search.toLowerCase())
      )
    : nouns;

  if (loading) {
    return <LoadingScreen message="Loading nouns..." />;
  }

  return (
    <>
      <PageHeader title="Nouns" subtitle={`${nouns.length} derived nouns and participles`}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search nouns..."
          className="w-64"
        />
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.slice(0, 200).map((noun) => (
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
                  <span className="text-xs text-muted-more font-arabic">{noun.root}</span>
                )}
              </div>
            </Card>
          ))}
      </div>

      {filtered.length > 200 && (
        <p className="text-center text-muted-more text-sm mt-6">
          Showing 200 of {filtered.length} nouns. Refine your search to see more.
        </p>
      )}
    </>
  );
}
