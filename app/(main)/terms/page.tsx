import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Use — QuRoots',
  description:
    'The terms you agree to when using QuRoots: what you can expect from us, what we expect from you, and how purchases and donations work.',
  alternates: { canonical: '/terms' },
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

export default function TermsPage() {
  return (
    <article className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-text mb-2">Terms of Use</h1>
      <p className="text-xs text-text-tertiary mb-10">Last updated {UPDATED}</p>

      <p className="text-sm leading-relaxed text-text-secondary mb-10">
        These are the terms for using QuRoots. By using the site you agree to them.
      </p>

      <Section title="What QuRoots is">
        <p>
          A platform for learning Quranic Arabic — a grammar course, a word-by-word Quran reader, a
          dictionary of Arabic roots, and related study tools. Almost all of it is free. The one
          paid product is the full 30-day &ldquo;Understand your salah&rdquo; path, whose first
          seven days are also free.
        </p>
      </Section>

      <Section title="Your account">
        <p>
          You sign in with Google. You are responsible for what happens under your account. Tell
          us if you think someone else is using it.
        </p>
        <p>
          You can delete your account at any time by emailing us, and your data goes with it.
        </p>
      </Section>

      <Section title="Acceptable use">
        <p>Please do not:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Post anything abusive, hateful, or disrespectful in the community chat.</li>
          <li>
            Manipulate your progress, XP, streak or leaderboard position by any means other than
            actually studying.
          </li>
          <li>
            Scrape the site or hammer the API. If you want the data for research or a project,
            just ask.
          </li>
          <li>Attempt to break, overload, or gain unauthorised access to the service.</li>
        </ul>
        <p>
          We may suspend or remove accounts that do these things, and remove content that
          breaches these terms.
        </p>
      </Section>

      <Section title="Content and copyright">
        <p>
          The Quranic text is the revealed word of Allah. Translations, tafsir, recitation and fonts
          belong to their authors and publishers and are credited on our{' '}
          <Link href="/sources" className="text-primary hover:underline">Sources &amp; Credits</Link>{' '}
          page.
        </p>
        <p>
          Root and morphology data is derived from the Quranic Arabic Corpus and shared under its
          licence, the GNU General Public License v3; the details are on the Sources page.
        </p>
        <p>
          The course material, the salah path, lessons, quizzes, explanations, videos, site design
          and source code were written and built for QuRoots and remain our copyright. You are
          welcome to use the site to learn and to share what you learn. You may not republish our
          course content as your own.
        </p>
        <p>
          Anything you post in the community chat remains yours; you give us permission to display
          it on the site.
        </p>
      </Section>

      <Section title="Purchases">
        <p>
          The full salah path is a one-time purchase that gives the account you bought it with
          lifetime access to all 30 days. Payments are processed by Stripe; we never see your card
          details.
        </p>
        <p>
          If it isn&rsquo;t for you, email us within 14 days of buying and we will refund you in
          full, no questions asked.
        </p>
      </Section>

      <Section title="Donations">
        <p>
          Donations are voluntary and support the running of the site. They are a gift, not a
          purchase — they do not buy features or unlock the salah path. Supporters get a badge,
          which is a thank-you rather than a product.
        </p>
        <p>
          Payments are processed by Stripe. Because donations are gifts rather than purchases,
          they are generally not refundable — but if you donated by mistake, email us and we will
          sort it out.
        </p>
      </Section>

      <Section title="No warranty">
        <p>
          QuRoots is provided as-is. We work hard to get the Arabic right, but we cannot guarantee
          the site is free of errors, and it is not a substitute for a qualified teacher. For
          matters of religious ruling, consult a scholar.
        </p>
        <p>
          We do not guarantee uninterrupted availability, and we may change or discontinue
          features.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          To the extent permitted by law, we are not liable for indirect or consequential loss
          arising from your use of the site. Nothing here limits liability that cannot be limited
          by law.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          We may update these terms. If a change materially affects you, we will say so on the
          site rather than quietly editing this page.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these terms:{' '}
          <a href="mailto:salam@quroots.com" className="text-primary hover:underline">
            salam@quroots.com
          </a>
          .
        </p>
      </Section>

      <div className="mt-12 pt-6 border-t border-white/5 text-sm text-text-secondary">
        See also our{' '}
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>{' '}
        and{' '}
        <Link href="/sources" className="text-primary hover:underline">
          Sources &amp; Credits
        </Link>
        .
      </div>
    </article>
  );
}
