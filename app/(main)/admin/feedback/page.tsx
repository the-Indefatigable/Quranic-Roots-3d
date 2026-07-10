'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuthStore } from '@/store/useAuthStore';

interface FeedbackItem {
  id: string;
  category: string;
  body: string;
  page: string | null;
  status: 'new' | 'seen' | 'done';
  createdAt: string;
  userName: string | null;
  userEmail: string;
}

const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
  suggestion: { label: 'Suggestion', emoji: '💡' },
  content: { label: 'Content', emoji: '📖' },
  bug: { label: 'Bug', emoji: '🐛' },
  other: { label: 'Other', emoji: '💬' },
};

const FILTERS = ['all', 'new', 'seen', 'done'] as const;

export default function AdminFeedbackPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') router.replace('/');
  }, [isLoading, user, router]);

  const load = useCallback(async (f: string) => {
    const url = f === 'all' ? '/api/feedback' : `/api/feedback?status=${f}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setItems(data.feedback ?? []);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') load(filter);
  }, [user, filter, load]);

  const setStatus = async (id: string, status: 'new' | 'seen' | 'done') => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    await fetch(`/api/feedback/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  };

  if (isLoading || user?.role !== 'admin') return null;

  const newCount = items.filter((i) => i.status === 'new').length;

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="User Feedback"
        subtitle={
          loaded
            ? `${items.length} item${items.length === 1 ? '' : 's'}${filter === 'all' && newCount ? ` — ${newCount} new` : ''}`
            : 'Loading…'
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors"
            style={
              filter === f
                ? { background: 'rgba(212,162,70,0.16)', color: 'var(--color-primary)', border: '1px solid rgba(212,162,70,0.4)' }
                : { background: 'var(--color-surface)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-light)' }
            }
          >
            {f}
          </button>
        ))}
      </div>

      {loaded && items.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center text-sm text-text-tertiary"
          style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}
        >
          No feedback {filter !== 'all' ? `with status "${filter}"` : 'yet'}. It will appear here as users send it.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const meta = CATEGORY_META[item.category] ?? CATEGORY_META.other;
            return (
              <div
                key={item.id}
                className="rounded-2xl p-4 sm:p-5"
                style={{
                  background: 'var(--color-surface)',
                  boxShadow: 'var(--shadow-card)',
                  opacity: item.status === 'done' ? 0.6 : 1,
                }}
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(212,162,70,0.14)', color: 'var(--color-primary)' }}
                  >
                    {meta.emoji} {meta.label}
                  </span>
                  {item.status === 'new' && (
                    <span
                      className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(95,181,122,0.15)', color: '#5FB57A' }}
                    >
                      New
                    </span>
                  )}
                  <span className="text-xs text-text-tertiary ml-auto">
                    {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3" style={{ color: 'var(--color-text)' }}>
                  {item.body}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
                  <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {item.userName || item.userEmail}
                  </span>
                  {item.page && <span>· on {item.page}</span>}
                  <div className="ml-auto flex gap-1.5">
                    {item.status !== 'seen' && item.status !== 'done' && (
                      <button
                        onClick={() => setStatus(item.id, 'seen')}
                        className="px-2.5 py-1 rounded-md font-semibold transition-colors"
                        style={{ background: 'var(--color-canvas)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-light)' }}
                      >
                        Mark seen
                      </button>
                    )}
                    {item.status !== 'done' && (
                      <button
                        onClick={() => setStatus(item.id, 'done')}
                        className="px-2.5 py-1 rounded-md font-semibold transition-colors"
                        style={{ background: 'rgba(95,181,122,0.12)', color: '#5FB57A', border: '1px solid rgba(95,181,122,0.3)' }}
                      >
                        Done ✓
                      </button>
                    )}
                    {item.status === 'done' && (
                      <button
                        onClick={() => setStatus(item.id, 'new')}
                        className="px-2.5 py-1 rounded-md font-semibold"
                        style={{ background: 'var(--color-canvas)', color: 'var(--color-text-tertiary)', border: '1px solid var(--color-border-light)' }}
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
