export interface FaqItem {
  q: string;
  a: string;
}

/**
 * A visible FAQ block. Pair it with a matching FAQPage JSON-LD (see the page
 * that renders it) so answer engines (AEO) and search engines can lift the Q&A.
 * Visible + structured together is the correct, durable pattern.
 */
export function FaqSection({ items, heading = 'Frequently asked' }: { items: FaqItem[]; heading?: string }) {
  return (
    <section className="max-w-3xl mx-auto mt-14 mb-4">
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] mb-4" style={{ color: 'var(--color-primary)' }}>{heading}</h2>
      <div className="space-y-3">
        {items.map((it) => (
          <details key={it.q} className="rounded-2xl px-5 py-4 group" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)' }}>
            <summary className="cursor-pointer list-none flex items-center justify-between gap-3 text-sm font-medium" style={{ color: 'var(--color-ivory)' }}>
              {it.q}
              <svg className="w-4 h-4 shrink-0 transition-transform group-open:rotate-45" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </summary>
            <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--color-text-secondary)' }}>{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/** Build a schema.org FAQPage object from the same items (render as JSON-LD). */
export function faqJsonLd(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}
