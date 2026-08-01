import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — QuRoots',
  description:
    'What QuRoots collects, why, who it is shared with, and how to delete it. Plain language, no boilerplate.',
  alternates: { canonical: '/privacy' },
};

const UPDATED = '27 July 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-text mb-3">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-text-secondary">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <article className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-text mb-2">Privacy Policy</h1>
      <p className="text-xs text-text-tertiary mb-10">Last updated {UPDATED}</p>

      <p className="text-sm leading-relaxed text-text-secondary mb-10">
        QuRoots is a free platform for learning Quranic Arabic. This page describes exactly what
        we collect, why we collect it, and how to get rid of it. If anything here is unclear,
        ask us and we will fix the wording.
      </p>

      <Section title="What we collect">
        <p>
          <strong className="text-text">If you never sign in:</strong> we collect analytics about
          how the site is used — pages viewed, approximate location derived from your IP address,
          browser and device type. This goes to Google Analytics.
        </p>
        <p>
          <strong className="text-text">If you sign in with Google:</strong> we receive your name,
          email address and profile picture from Google, and store them so your account exists.
          We never receive your Google password.
        </p>
        <p>
          <strong className="text-text">As you learn:</strong> we store your progress — lessons
          completed, quiz answers, vocabulary review schedule, XP, streak, gems, achievements,
          bookmarks and leaderboard position. This is the product; without it nothing would be
          saved between visits.
        </p>
        <p>
          <strong className="text-text">If you post or write in:</strong> messages you send in the
          community chat and any feedback you submit, along with the account that sent them.
        </p>
        <p>
          <strong className="text-text">If you subscribe to the weekly digest:</strong> your email
          address and the fact that you opted in.
        </p>
        <p>
          <strong className="text-text">If you donate:</strong> Stripe handles the payment. We
          never see or store your card details. We receive confirmation that a payment succeeded,
          its amount, and an order reference, which we use to mark you as a supporter.
        </p>
      </Section>

      <Section title="Why we collect it">
        <p>
          To run your account and save your progress, to show leaderboards and the community chat,
          to send the digest if you asked for it, to record donations, and to understand which
          parts of the site are used so we know what to improve.
        </p>
        <p>
          We do not sell your data. We do not use it for advertising. We do not build profiles for
          anyone else.
        </p>
      </Section>

      <Section title="Who else sees it">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong className="text-text">Google</strong> — sign-in, and Google Analytics for
            usage statistics.
          </li>
          <li>
            <strong className="text-text">Vercel</strong> — hosting. Standard server logs,
            including IP addresses.
          </li>
          <li>
            <strong className="text-text">Stripe</strong> — payment processing for donations.
          </li>
          <li>
            <strong className="text-text">Resend</strong> — sending the weekly digest email, if
            you subscribed.
          </li>
          <li>
            <strong className="text-text">Other learners</strong> — your display name and XP
            appear on public leaderboards, and anything you post in the community chat is visible
            to other signed-in users.
          </li>
        </ul>
      </Section>

      <Section title="Cookies & analytics">
        <p>
          A session cookie keeps you signed in. It is required — without it the site cannot tell
          who you are.
        </p>
        <p>
          Google Analytics also sets cookies, and it currently loads for everyone rather than
          asking first. We say so plainly rather than implying a choice you do not have. It is
          configured with IP anonymisation, we use it only to see which parts of the site are
          used, and we do not use it for advertising or share it with anyone.
        </p>
        <p>
          If you would rather not be counted, your browser&rsquo;s &ldquo;do not track&rdquo; or
          cookie-blocking settings, or any standard content blocker, will stop it — and nothing on
          QuRoots will work any differently. You can also email us and we will delete anything
          associated with you.
        </p>
      </Section>

      <Section title="How long we keep it">
        <p>
          Account and progress data is kept while your account exists. Delete your account and it
          is deleted with it. Analytics data follows Google&rsquo;s retention settings. Donation
          records are kept as long as required for financial records.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          You can ask for a copy of your data, ask us to correct it, or ask us to delete it
          entirely, and we will do so. If you are in the UK, EU, or another region with data
          protection law, those rights apply to you by law — but we will honour these requests
          from anyone, wherever you are.
        </p>
        <p>
          To exercise any of these, email{' '}
          <a href="mailto:salam@quroots.com" className="text-primary hover:underline">
            salam@quroots.com
          </a>
          .
        </p>
      </Section>

      <Section title="Children">
        <p>
          QuRoots is suitable for all ages, but signing in requires a Google account, and Google
          sets its own minimum age. If you are a parent and believe a child has created an account
          you would like removed, email us and we will remove it.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          If this policy changes in a way that materially affects you, we will say so on the site
          rather than quietly editing this page.
        </p>
      </Section>

      <div className="mt-12 pt-6 border-t border-white/5 text-sm text-text-secondary">
        See also our{' '}
        <Link href="/terms" className="text-primary hover:underline">
          Terms of Use
        </Link>
        .
      </div>
    </article>
  );
}
