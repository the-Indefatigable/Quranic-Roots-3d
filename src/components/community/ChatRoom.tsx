'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

const POLL_MS = 4000;

interface ChatUser { id: string; name: string | null; image: string | null; role: string }
interface ChatMessage { id: string; body: string; createdAt: string; user: ChatUser }

/**
 * A live chat thread. The Learners' Lounge is room "general"; every salah-path day has
 * "salah-day-N", so people talk about a lesson right where they learn it.
 */
export function ChatRoom({ room = 'general', height = 'min(64vh, 600px)', empty, placeholder = 'Write a message…' }: {
  room?: string;
  height?: string;
  empty: { title: string; body: string };
  placeholder?: string;
}) {
  const { user, isLoading, login } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cursorRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.role === 'admin' || user?.role === 'teacher';
  const q = `room=${encodeURIComponent(room)}`;

  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  const mergeMessages = useCallback((incoming: ChatMessage[]) => {
    if (incoming.length === 0) return;
    setMessages((prev) => {
      const seen = new Set(prev.map((m) => m.id));
      const next = [...prev, ...incoming.filter((m) => !seen.has(m.id))].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      cursorRef.current = next.length ? next[next.length - 1].createdAt : cursorRef.current;
      return next;
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/chat/messages?${q}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (active) mergeMessages(data.messages ?? []);
      } catch {
        if (active) setError('Could not load the conversation. Try refreshing.');
      } finally {
        if (active) { setLoaded(true); requestAnimationFrame(() => scrollToBottom(false)); }
      }
    })();
    return () => { active = false; };
  }, [user, q, mergeMessages, scrollToBottom]);

  useEffect(() => {
    if (!user || !loaded) return;
    const tick = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(cursorRef.current ? `/api/chat/messages?${q}&after=${encodeURIComponent(cursorRef.current)}` : `/api/chat/messages?${q}`);
        if (!res.ok) return;
        const incoming: ChatMessage[] = (await res.json()).messages ?? [];
        if (incoming.length) {
          const el = scrollRef.current;
          const nearBottom = !el || el.scrollHeight - el.scrollTop - el.clientHeight < 120;
          mergeMessages(incoming);
          if (nearBottom) requestAnimationFrame(() => scrollToBottom(true));
        }
      } catch { /* transient — next tick retries */ }
    };
    const id = setInterval(tick, POLL_MS);
    return () => clearInterval(id);
  }, [user, loaded, q, mergeMessages, scrollToBottom]);

  const send = useCallback(async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/chat/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body, room }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Could not send.'); return; }
      setDraft('');
      mergeMessages([data.message]);
      requestAnimationFrame(() => scrollToBottom(true));
    } catch {
      setError('Could not send. Check your connection.');
    } finally {
      setSending(false);
    }
  }, [draft, sending, room, mergeMessages, scrollToBottom]);

  const remove = useCallback(async (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    try { await fetch(`/api/chat/messages/${id}`, { method: 'DELETE' }); } catch { /* reappears on reload */ }
  }, []);

  const shell = { background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: 'var(--shadow-card)' };

  if (!isLoading && !user) {
    return (
      <div className="rounded-3xl p-8 sm:p-10 text-center" style={shell}>
        <p className="font-heading text-[24px] mb-2" style={{ color: 'var(--color-ivory)' }}>{empty.title}</p>
        <p className="text-[15px] text-text-secondary mb-6 max-w-md mx-auto">{empty.body}</p>
        <button onClick={() => login('Sign in to join the conversation')} className="h-11 px-6 rounded-full text-[15px] font-semibold" style={{ background: 'var(--color-primary)', color: '#1a1206' }}>
          Sign in to join
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-3xl overflow-hidden" style={{ ...shell, height }}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
        {!loaded ? (
          <div className="h-full grid place-items-center text-[15px] text-text-tertiary">Loading…</div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <p className="font-heading text-[22px] mb-1.5" style={{ color: 'var(--color-ivory)' }}>{empty.title}</p>
            <p className="text-[15px] text-text-tertiary max-w-sm">{empty.body}</p>
          </div>
        ) : (
          // Short threads sit at the bottom, next to the composer, like any messaging app.
          <div className="min-h-full flex flex-col justify-end gap-0.5">
            {messages.map((m, i) => {
              const mine = m.user.id === user?.id;
              const grouped = messages[i - 1]?.user.id === m.user.id;
              return <MessageRow key={m.id} message={m} mine={mine} grouped={grouped} canDelete={isAdmin || mine} onDelete={() => remove(m.id)} />;
            })}
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {error && <p className="text-[13px] mb-2 px-1" style={{ color: 'var(--color-wrong)' }}>{error}</p>}
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1}
            maxLength={1000}
            placeholder={placeholder}
            aria-label="Message"
            className="flex-1 resize-none rounded-2xl px-4 py-3 text-[15px] outline-none max-h-32 text-text placeholder:text-text-tertiary"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
          <button onClick={send} disabled={sending || !draft.trim()} className="shrink-0 h-12 px-5 rounded-full text-[15px] font-semibold disabled:opacity-40" style={{ background: 'var(--color-primary)', color: '#1a1206' }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageRow({ message, mine, grouped, canDelete, onDelete }: { message: ChatMessage; mine: boolean; grouped: boolean; canDelete: boolean; onDelete: () => void }) {
  const { user } = message;
  const isStaff = user.role === 'admin' || user.role === 'teacher';
  const name = user.name || 'Learner';
  return (
    <div className={`group flex gap-3 ${mine ? 'flex-row-reverse' : ''} ${grouped ? 'mt-1' : 'mt-4'}`}>
      <div className="w-9 shrink-0">
        {!grouped && (
          <div className="w-9 h-9 rounded-full grid place-items-center text-[14px] font-semibold uppercase overflow-hidden" style={{ background: 'rgba(212,162,70,0.14)', color: 'var(--color-primary)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {user.image ? <img src={user.image} alt="" className="w-full h-full object-cover" /> : name[0]}
          </div>
        )}
      </div>
      <div className={`flex flex-col max-w-[80%] ${mine ? 'items-end' : 'items-start'}`}>
        {!grouped && (
          <div className={`flex items-center gap-2 mb-1 px-1 ${mine ? 'flex-row-reverse' : ''}`}>
            <span className="text-[14px] font-semibold text-text">{mine ? 'You' : name}</span>
            {isStaff && <span className="text-[11px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(212,162,70,0.18)', color: 'var(--color-primary)' }}>{user.role === 'admin' ? 'Founder' : 'Teacher'}</span>}
            <span className="text-[12px] text-text-tertiary">{new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
          </div>
        )}
        <div className={`flex items-center gap-1.5 ${mine ? 'flex-row-reverse' : ''}`}>
          <div
            className="px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap break-words"
            style={mine ? { background: 'var(--color-primary)', color: '#1a1206' } : { background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)' }}
          >
            {message.body}
          </div>
          {canDelete && (
            <button onClick={onDelete} aria-label="Delete message" className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 rounded-md text-text-tertiary">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
