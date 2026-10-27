import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sources & Credits — QuRoots',
  description: 'Where the Quran text, roots, morphology, translations, recitation and fonts on QuRoots come from, and how we use them.',
  alternates: { canonical: '/sources' },
};

const UPDATED = '27 October 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-text mb-3">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-text-secondary">{children}</div>
    </section>
  );
}

const A = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>
);

export default function SourcesPage() {
  return (
    <article className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-text mb-2">Sources &amp; Credits</h1>
      <p className="text-xs text-text-tertiary mb-10">Last updated {UPDATED}</p>

      <p className="text-sm leading-relaxed text-text-secondary mb-10">
        QuRoots stands on the work of scholars, researchers and open projects. This page says where
        each part of the site comes from, so you can check it for yourself. If you spot an error or
        believe something here is used wrongly, email{' '}
        <a href="mailto:salam@quroots.com" className="text-primary hover:underline">salam@quroots.com</a> and we will fix it.
      </p>

      <Section title="The Quran text">
        <p>
          The Arabic text and its division into words come from the{' '}
          <A href="https://quran.foundation">Quran Foundation</A> (Quran.com) API. The Quran is the
          revealed word of Allah; we reproduce it without alteration.
        </p>
      </Section>

      <Section title="Roots, word forms and grammar">
        <p>
          Root and morphology data (the root of each word, its lemma, form and grammatical tags) is
          derived from the <A href="https://corpus.quran.com">Quranic Arabic Corpus</A>, version 0.4,
          © Kais Dukes 2009–2017, maintained by the Quran.com team, and used under the{' '}
          <A href="https://www.gnu.org/licenses/gpl-3.0.html">GNU General Public License v3</A>.
        </p>
        <p>
          What we changed: we converted the corpus from Buckwalter transliteration to Arabic script,
          grouped words by root, counted occurrences, and generated conjugation tables and derived
          forms from it. Root counts on QuRoots follow the corpus. Our changes to this
          data are covered by the same licence.
        </p>
      </Section>

      <Section title="Meanings and word-by-word glosses">
        <p>
          Word-by-word glosses started from the Quran Foundation&rsquo;s word translations. The
          dictionary-style meanings of roots and nouns were then rewritten for learners with the help
          of AI (Anthropic&rsquo;s Claude) and checked against the corpus. Treat them as study aids,
          not rulings, and tell us when one is wrong.
        </p>
      </Section>

      <Section title="Translation">
        <p>
          The English translation in the reader is <em>Kanzul Iman</em> by Imam Ahmad Raza Khan,
          rendered into English by Prof. Shah Farid-ul-Haque, as published through{' '}
          <A href="https://alquran.cloud">AlQuran Cloud</A> (Islamic Network).
        </p>
      </Section>

      <Section title="Tafsir">
        <p>
          Tafsir shown alongside the reader is <em>Tafsir Ibn Kathir (Abridged)</em>, published in
          English by Darussalam, as provided through the Quran Foundation.
        </p>
      </Section>

      <Section title="Recitation">
        <p>
          Recitation is by Sheikh Mishary Rashid Alafasy, served through{' '}
          <A href="https://everyayah.com">EveryAyah</A> and the Quran Foundation. Copyright in each
          recitation rests with the reciter. Our videos never place music or sound effects over a
          recitation.
        </p>
      </Section>

      <Section title="Fonts">
        <p>
          Arabic is set in <em>KFGQPC Uthmanic Script Hafs</em> by the King Fahd Glorious Quran
          Printing Complex, used under its free-use terms, and in <em>Scheherazade New</em> by SIL
          International, used under the <A href="https://openfontlicense.org">SIL Open Font License</A>.
        </p>
      </Section>

      <Section title="What is ours">
        <p>
          The 30-day salah path, the course and lessons, quizzes, explanations, the reels, the site
          design and the code are written and built by QuRoots. Using QuRoots to learn and sharing
          what you learn is always welcome.
        </p>
      </Section>

      <div className="mt-12 pt-6 border-t border-white/5 text-sm text-text-secondary">
        See also our <Link href="/terms" className="text-primary hover:underline">Terms of Use</Link> and{' '}
        <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
      </div>
    </article>
  );
}
