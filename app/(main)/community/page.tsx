'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuthStore } from '@/store/useAuthStore';

const POLL_MS = 4000;

interface ChatUser {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
}

interface ChatMessage {
  id: string;
  body: string;
  createdAt: string;
  user: ChatUser;
}

export default function CommunityPage() {
  const { user, isLoading, setShowLoginModal } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cursorRef = useRef<string | null>(null); // ISO of newest message we have
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.role === 'admin' || user?.role === 'teacher';

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  // Merge helper — dedupe by id, keep chronological
  const mergeMessages = useCallback((incoming: ChatMessage[]) => {
    if (incoming.length === 0) return;
    setMessages((prev) => {
      const seen = new Set(prev.map((m) => m.id));
      const next = [...prev];
      for (const m of incoming) {
        if (!seen.has(m.id)) next.push(m);
      }
      next.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      cursorRef.current = next.length ? next[next.length - 1].createdAt : cursorRef.current;
      return next;
    });
  }, []);

  // Initial load
  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/chat/messages');
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!active) return;
        mergeMessages(data.messages ?? []);
      } catch {
        if (active) setError('Could not load the chat. Try refreshing.');
      } finally {
        if (active) {
          setLoaded(true);
          requestAnimationFrame(() => scrollToBottom(false));
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [user, mergeMessages, scrollToBottom]);

  // Poll for new messages
  useEffect(() => {
    if (!user || !loaded) return;
    const tick = async () => {
      if (document.hidden) return;
      try {
        const url = cursorRef.current
          ? `/api/chat/messages?after=${encodeURIComponent(cursorRef.current)}`
          : '/api/chat/messages';
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        const incoming: ChatMessage[] = data.messages ?? [];
        if (incoming.length) {
          const nearBottom = isNearBottom(scrollRef.current);
          mergeMessages(incoming);
          if (nearBottom) requestAnimationFrame(() => scrollToBottom(true));
        }
      } catch {
        /* transient — next tick retries */
      }
    };
    const id = setInterval(tick, POLL_MS);
    return () => clearInterval(id);
  }, [user, loaded, mergeMessages, scrollToBottom]);

  const send = useCallback(async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not send.');
        return;
      }
      setDraft('');
      mergeMessages([data.message]);
      requestAnimationFrame(() => scrollToBottom(true));
    } catch {
      setError('Could not send. Check your connection.');
    } finally {
      setSending(false);
    }
  }, [draft, sending, mergeMessages, scrollToBottom]);

  const remove = useCallback(async (id: string) => {
    // Optimistic removal
    setMessages((prev) => prev.filter((m) => m.id !== id));
    try {
      await fetch(`/api/chat/messages/${id}`, { method: 'DELETE' });
    } catch {
      /* if it fails it'll reappear on next full reload */
    }
  }, []);

  // ── Signed-out state ──────────────────────────────────────
  if (!isLoading && !user) {
    return (
      <div>
        <PageHeader
          eyebrow="Community"
          title="Learners' Lounge"
          subtitle="Meet others learning the language of the Qur'an. Ask questions, share progress, and study together."
        />
        <div
          className="rounded-2xl p-10 text-center"
          style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-card)' }}
        >
          <p className="text-text-secondary mb-5">Sign in to join the conversation.</p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: 'var(--color-primary)', color: '#1a1206' }}
          >
            Sign in to chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Community"
        title="Learners' Lounge"
        subtitle="Say salaam, ask questions, and study together. Be kind — this is a shared space."
      />

      <div
        className="flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: 'var(--color-surface)',
          boxShadow: 'var(--shadow-card)',
          height: 'min(68vh, 620px)',
        }}
      >
        {/* Message list */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-5 py-5 space-y-3">
          {!loaded ? (
            <div className="h-full flex items-center justify-center text-text-tertiary text-sm">
              Loading chat…
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-2">
              <p className="text-text-secondary font-medium">No messages yet.</p>
              <p className="text-text-tertiary text-sm">Be the first to say salaam 👋</p>
            </div>
          ) : (
            messages.map((m, i) => {
              const mine = m.user.id === user?.id;
              const prev = messages[i - 1];
              const grouped = prev && prev.user.id === m.user.id;
              return (
                <MessageRow
                  key={m.id}
                  message={m}
                  mine={mine}
                  grouped={!!grouped}
                  canModerate={isAdmin || mine}
                  onDelete={() => remove(m.id)}
                />
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <div
          className="p-3 sm:p-4"
          style={{ borderTop: '1px solid var(--color-border-light)' }}
        >
          {error && <p className="text-xs mb-2 px-1" style={{ color: 'var(--color-wrong)' }}>{error}</p>}
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              maxLength={1000}
              placeholder="Write a message…  (Enter to send, Shift+Enter for a new line)"
              className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm outline-none max-h-32"
              style={{
                background: 'var(--color-canvas)',
                border: '1px solid var(--color-border-light)',
                color: 'var(--color-text)',
              }}
            />
            <button
              onClick={send}
              disabled={sending || !draft.trim()}
              className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'var(--color-primary)', color: '#1a1206' }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageRow({
  message,
  mine,
  grouped,
  canModerate,
  onDelete,
}: {
  message: ChatMessage;
  mine: boolean;
  grouped: boolean;
  canModerate: boolean;
  onDelete: () => void;
}) {
  const { user } = message;
  const isStaff = user.role === 'admin' || user.role === 'teacher';
  const displayName = user.name || 'Learner';

  return (
    <div className={`group flex gap-2.5 ${mine ? 'flex-row-reverse' : 'flex-row'} ${grouped ? 'mt-1' : 'mt-3'}`}>
      {/* Avatar (hidden when grouped with the previous message) */}
      <div className="w-8 shrink-0">
        {!grouped && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase overflow-hidden"
            style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
          >
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="w-full h-full object-cover" />
            ) : (
              displayName[0]
            )}
          </div>
        )}
      </div>

      <div className={`flex flex-col max-w-[78%] ${mine ? 'items-end' : 'items-start'}`}>
        {!grouped && (
          <div className={`flex items-center gap-1.5 mb-1 px-1 ${mine ? 'flex-row-reverse' : ''}`}>
            <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              {mine ? 'You' : displayName}
            </span>
            {isStaff && (
              <span
                className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(212,162,70,0.18)', color: 'var(--color-primary)' }}
              >
                {user.role === 'admin' ? 'Admin' : 'Teacher'}
              </span>
            )}
            <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
              {formatTime(message.createdAt)}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {canModerate && mine && (
            <DeleteButton onClick={onDelete} />
          )}
          <div
            className="px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words"
            style={
              mine
                ? { background: 'var(--color-primary)', color: '#1a1206', borderTopRightRadius: grouped ? 16 : 4 }
                : {
                    background: 'var(--color-canvas)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border-light)',
                    borderTopLeftRadius: grouped ? 16 : 4,
                  }
            }
          >
            {message.body}
          </div>
          {canModerate && !mine && (
            <DeleteButton onClick={onDelete} />
          )}
        </div>
      </div>
    </div>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Delete message"
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md shrink-0"
      style={{ color: 'var(--color-text-tertiary)' }}
      title="Delete message"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

function isNearBottom(el: HTMLElement | null) {
  if (!el) return true;
  return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
