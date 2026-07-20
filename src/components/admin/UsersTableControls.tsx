'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

const SORTS = [
  { value: 'new', label: 'Newest' },
  { value: 'active', label: 'Recently active' },
  { value: 'xp', label: 'Most XP' },
  { value: 'name', label: 'Name (A–Z)' },
];

export function UsersTableControls() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Keep the input in sync if the URL changes externally (e.g. back button).
  useEffect(() => {
    setQ(params.get('q') ?? '');
  }, [params]);

  const push = (next: Record<string, string>) => {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    sp.delete('page'); // reset to first page on any filter change
    router.push(`/admin/users?${sp.toString()}`);
  };

  const onSearch = (value: string) => {
    setQ(value);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => push({ q: value }), 300);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      <input
        type="text"
        value={q}
        placeholder="Search by name or email…"
        onChange={(e) => onSearch(e.target.value)}
        className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder-text-tertiary focus:outline-none focus:border-primary/40"
      />
      <select
        value={params.get('sort') ?? 'new'}
        onChange={(e) => push({ sort: e.target.value })}
        className="bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary/40"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </div>
  );
}
