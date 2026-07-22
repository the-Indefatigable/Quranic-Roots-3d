import Link from 'next/link';

/**
 * A quiet, tasteful "this is free — help keep it that way" nudge that links to
 * /support. Designed to sit at the end of a page without shouting. Drop it in
 * anywhere a learner has just gotten value.
 */
export function SupportPrompt({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/support"
      className={`group flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(212,162,70,0.09), rgba(255,255,255,0.02))',
        border: '1px solid rgba(212,162,70,0.2)',
      }}
    >
      <span
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(212,162,70,0.14)', color: '#D4A246' }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: '#F0E4CA' }}>Enjoying QuRoots?</p>
        <p className="text-xs" style={{ color: '#A8946A' }}>It&apos;s free for everyone — a small gift helps keep it that way.</p>
      </div>
      <span
        className="flex items-center gap-1 text-sm font-semibold shrink-0 transition-all duration-200 group-hover:gap-2"
        style={{ color: '#D4A246' }}
      >
        Support
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </span>
    </Link>
  );
}
