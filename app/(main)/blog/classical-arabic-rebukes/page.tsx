import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Uskut! Thakilatka Ummuka! — The Rebukes & Curse-Idioms of 7th-Century Arabic',
  description:
    'How classical Arabic scolded, rebuked, and cursed — uskut, ikhsaʼ, thakilatka ummuka, taribat yadaka, qataʼa Allahu lisanak and more — with the 3-letter root, the grammar pattern, and the Quranic or hadith source behind each phrase.',
  alternates: { canonical: 'https://quroots.com/blog/classical-arabic-rebukes' },
  openGraph: {
    title: 'The Rebukes & Curse-Idioms of 7th-Century Arabic | QuRoots',
    description: 'Uskut, ikhsaʼ, thakilatka ummuka, taribat yadaka — the harsh words of classical Arabic, decoded root by root.',
    url: 'https://quroots.com/blog/classical-arabic-rebukes',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

type Phrase = {
  arabic: string;
  latin: string;
  literal: string;
  usage: string;
  root: string;
  rootMeaning: string;
  pattern: string;
  source: {
    arabic: string;
    translation: string;
    ref: string;
  };
};

const PHRASES: Phrase[] = [
  {
    arabic: 'اُسْكُتْ',
    latin: 'uskut',
    literal: 'Be silent!',
    usage:
      'The everyday "quiet!" of classical Arabic — a plain Form I imperative, sharp but not vulgar. Still used across the Arab world today, unchanged after fourteen centuries.',
    root: 'س ك ت',
    rootMeaning: 'to fall silent, to subside, to still',
    pattern: 'Form I imperative on the pattern اُفْعُلْ (ufʼul)',
    source: {
      arabic: 'وَلَمَّا سَكَتَ عَن مُّوسَى الْغَضَبُ أَخَذَ الْأَلْوَاحَ',
      translation: 'And when the anger fell silent in Musa, he took up the tablets — the Quran applies the root to anger itself "going quiet."',
      ref: 'Al-Aʿraf 7:154',
    },
  },
  {
    arabic: 'اِخْسَأْ',
    latin: 'ikhsaʼ',
    literal: 'Away with you! Be gone, despised!',
    usage:
      'Far heavier than uskut. This is the word a 7th-century Arab used to drive off a dog — saying it to a human stripped him of dignity. It is the harshest rebuke in the Quran, addressed to the people of the Fire.',
    root: 'خ س أ',
    rootMeaning: 'to be driven away in disgrace, humiliated, repelled',
    pattern: 'Form I imperative, اِفْعَلْ — final hamza carries the bite',
    source: {
      arabic: 'قَالَ اخْسَئُوا فِيهَا وَلَا تُكَلِّمُونِ',
      translation: '"Be despised therein, and do not speak to Me." The same root describes the Sabbath-breakers: "Be apes, despised" (kunu qiradatan khasiʼin, 2:65).',
      ref: 'Al-Muʼminun 23:108',
    },
  },
  {
    arabic: 'ثَكِلَتْكَ أُمُّكَ',
    latin: 'thakilatka ummuka',
    literal: 'May your mother be bereaved of you!',
    usage:
      'Sounds like a death-wish; functioned as italics. By the 7th century this was a fossilized exclamation of astonishment or urgency — "pay attention, man!" The Prophet ﷺ himself said it to Muʿadh ibn Jabal while teaching him, with affection, not malice.',
    root: 'ث ك ل',
    rootMeaning: 'to lose a child; the grief of a bereaved mother (thukl)',
    pattern: 'Past tense as invocation — فَعِلَتْ + object pronoun كَ',
    source: {
      arabic: 'ثَكِلَتْكَ أُمُّكَ يَا مُعَاذُ، وَهَلْ يَكُبُّ النَّاسَ فِي النَّارِ عَلَى وُجُوهِهِمْ إِلَّا حَصَائِدُ أَلْسِنَتِهِمْ',
      translation: '"Thakilatka ummuka, O Muʿadh! Is there anything that throws people face-down into the Fire except the harvest of their tongues?" — the idiom used to jolt, then a lesson about harsh speech itself.',
      ref: 'Jamiʿ at-Tirmidhi 2616',
    },
  },
  {
    arabic: 'تَرِبَتْ يَدَاكَ',
    latin: 'taribat yadaka',
    literal: 'May your hands be covered in dust! (i.e. may you be poor)',
    usage:
      'To "hit the dust" with empty hands was the image of poverty. Yet in usage it became pure emphasis — a verbal exclamation mark. The Prophet ﷺ used it while giving marriage advice, urging, not cursing.',
    root: 'ت ر ب',
    rootMeaning: 'dust, earth — turab; poverty is "clinging to the dust"',
    pattern: 'Past tense as invocation — فَعِلَتْ + dual subject يَدَاكَ',
    source: {
      arabic: 'فَاظْفَرْ بِذَاتِ الدِّينِ تَرِبَتْ يَدَاكَ',
      translation: '"Win the one with religion — taribat yadaka!" The same root gives the Quran’s miskinan dha matrabah, "a poor person in the dust" (90:16).',
      ref: 'Sahih al-Bukhari 5090',
    },
  },
  {
    arabic: 'تَبَّتْ يَدَاكَ',
    latin: 'tabbat yadaka',
    literal: 'May your hands perish!',
    usage:
      'One letter away from taribat yadaka, but this one is no idiom — it is a true curse, and the Quran aims it at Abu Lahab. Where taribat empties the hands, tabba destroys them: total ruin of everything a man’s hands have built.',
    root: 'ت ب ب',
    rootMeaning: 'to perish, be cut off, come to ruin (tabab)',
    pattern: 'Past tense as invocation — the curse stated as already done',
    source: {
      arabic: 'تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ',
      translation: '"Perished are the hands of Abu Lahab — and perished is he." The verse repeats the verb: first as invocation, then as verdict.',
      ref: 'Al-Masad 111:1',
    },
  },
  {
    arabic: 'قَطَعَ اللهُ لِسَانَكَ',
    latin: 'qataʿa Allahu lisanak',
    literal: 'May Allah cut your tongue!',
    usage:
      'The classical curse against slanderers and abusive satirists — in a culture where a poet’s tongue could destroy a tribe’s honour, "cutting the tongue" meant ending that power. The sirah records the Prophet ﷺ flipping the idiom: when the poet ʿAbbas ibn Mirdas complained in verse, he said "cut his tongue off from me" — meaning give him a gift until he is silenced by generosity.',
    root: 'ق ط ع',
    rootMeaning: 'to cut, sever, cut off',
    pattern: 'Past tense as invocation — فَعَلَ اللهُ + object',
    source: {
      arabic: 'وَتُقَطِّعُوا أَرْحَامَكُمْ',
      translation: 'The Quran uses the intensified Form II of the same root for severing family ties — "and cut apart your kinship" — cutting as the gravest social sin.',
      ref: 'Muhammad 47:22',
    },
  },
  {
    arabic: 'قَاتَلَكَ اللهُ',
    latin: 'qatalaka Allah',
    literal: 'May Allah combat you!',
    usage:
      'Form III of "to kill" — not "may Allah kill you" but "may Allah be your adversary." The strangest fate of any Arabic curse: it became praise. Classical critics exclaimed qatalahu Allahu ma ashʿarah — "Allah combat him, what a poet!" — astonishment so strong it borrows the language of war.',
    root: 'ق ت ل',
    rootMeaning: 'to kill; Form III qatala = to fight, engage in combat',
    pattern: 'Form III (فَاعَلَ) past tense as invocation',
    source: {
      arabic: 'قَاتَلَهُمُ اللَّهُ أَنَّىٰ يُؤْفَكُونَ',
      translation: '"May Allah combat them — how they are deluded!" Against the hypocrites the Quran uses it as a real imprecation; the related passive form appears in qutila al-insanu ma akfarah (80:17).',
      ref: 'Al-Munafiqun 63:4',
    },
  },
  {
    arabic: 'وَيْلٌ لَكَ',
    latin: 'waylun laka',
    literal: 'Woe to you!',
    usage:
      'Wayl is not a verb at all but a noun of doom — "ruin, woe" — hurled at someone with the preposition li. The Quran wields it as a refrain of judgement: ten times in Surat al-Mursalat alone. In speech, waylaka was the all-purpose "you wretch!"',
    root: 'و ي ل',
    rootMeaning: 'woe, ruin, calamity',
    pattern: 'Indeclinable noun of woe + لِ — no verb needed',
    source: {
      arabic: 'وَيْلٌ لِّلْمُطَفِّفِينَ',
      translation: '"Woe to those who give short measure!" — an entire surah opened by the word. Compare Musa’s waylakum, "woe to you, do not invent lies against Allah" (20:61).',
      ref: 'Al-Mutaffifin 83:1',
    },
  },
  {
    arabic: 'عَقْرَى حَلْقَى',
    latin: 'ʿaqra halqa',
    literal: 'Wounded! Throat-struck! (roughly: "the wretch!")',
    usage:
      'A rhyming double-barrel exclamation of exasperation on the rare faʿla pattern — two curses fused into one fossilized interjection that no one parsed literally anymore, like English "blast it!" The Prophet ﷺ said it of Safiyyah when her situation threatened to delay the hajj caravan.',
    root: 'ع ق ر · ح ل ق',
    rootMeaning: 'ʿaqara: to wound, hamstring · halq: throat',
    pattern: 'Frozen فَعْلَى exclamation — invocation worn smooth into interjection',
    source: {
      arabic: 'فَعَقَرُوهَا فَدَمْدَمَ عَلَيْهِمْ رَبُّهُم بِذَنبِهِمْ',
      translation: 'The root ʿa-qa-ra is Quranic: "they hamstrung her" — the she-camel of Salih — "so their Lord crushed them for their sin." The idiom itself appears in Sahih al-Bukhari (1772).',
      ref: 'Ash-Shams 91:14',
    },
  },
  {
    arabic: 'لَا أَبَا لَكَ',
    latin: 'la aba laka',
    literal: 'You have no father!',
    usage:
      'To be fatherless in tribal Arabia was to be without protection or lineage — so this should be devastating. Instead it became a spur: "get up and act, you have no father to do it for you!" Poets even used it admiringly, the way a coach barks at a star player. ʿUmar ibn al-Khattab used it freely in debate.',
    root: 'أ ب و',
    rootMeaning: 'father (ab); the weak waw surfaces in aba',
    pattern: 'لَا of absolute negation + accusative — a grammar-book classic',
    source: {
      arabic: 'لَا أَبَا لَكَ',
      translation: 'Grammarians prize this phrase: ab takes the long-alif accusative (aba) as if possessed by laka, yet la negates that very possession — an idiom that breaks its own grammar, proof of how old and worn it is.',
      ref: 'Classical idiom — pre-Islamic poetry onward',
    },
  },
];

export default function ClassicalArabicRebukesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': 'The Rebukes & Curse-Idioms of 7th-Century Arabic — Roots, Patterns, and Meanings',
    'url': 'https://quroots.com/blog/classical-arabic-rebukes',
    'publisher': { '@type': 'Organization', 'name': 'QuRoots' },
    'educationalLevel': 'Intermediate',
    'inLanguage': ['en', 'ar'],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav className="flex items-center gap-2 text-xs text-text-tertiary mb-8" aria-label="Breadcrumb">
          <Link href="/blog" className="hover:text-text-secondary transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-text-secondary">Rebukes &amp; Curse-Idioms</span>
        </nav>

        <p className="text-4xl font-arabic text-primary mb-3" dir="rtl">كَلِمَاتُ الزَّجْرِ</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-text tracking-tight mb-4">
          Uskut! — How 7th-Century Arabic Scolded, Rebuked &amp; Cursed
        </h1>
        <p className="text-text-secondary text-lg leading-relaxed mb-4">
          The Arabs of the 7th century fought wars with swords and won them with words. A poet&apos;s satire (<em>hija&apos;</em>) could shame a tribe for generations — so the language developed an entire arsenal of rebukes, from a curt <em>uskut</em> to elaborate invocations like <em>thakilatka ummuka</em>. Here is the surprise: most of these &quot;curses&quot; were not curses at all. They were <strong className="text-text">fossilized idioms</strong> built on one grammatical pattern — and once you see the pattern, you can decode every one of them by its root.
        </p>
        <p className="text-text-secondary text-base leading-relaxed mb-10">
          Each phrase below is broken down the QuRoots way: the 3-letter root, the morphological pattern, what it says literally, what it actually meant on the street of Makkah — and where the same root shows up in the Quran or hadith.
        </p>

        {/* The pattern */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-text mb-4">The Pattern: Cursing in the Past Tense</h2>
          <div className="rounded-2xl border border-border bg-surface p-6">
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              Classical Arabic has a striking habit: <strong className="text-text">invocations are spoken in the past tense</strong> (<em>al-madi</em>), as if the wish had already come true. The same grammar powers blessings and curses alike:
            </p>
            <ul className="space-y-3 text-sm text-text-secondary leading-relaxed">
              <li className="flex items-baseline gap-3">
                <span className="font-arabic text-lg text-text shrink-0" dir="rtl">رَحِمَهُ اللهُ</span>
                <span><em>rahimahu Allah</em> — literally &quot;Allah <strong className="text-text">had</strong> mercy on him&quot; → may Allah have mercy on him</span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="font-arabic text-lg text-text shrink-0" dir="rtl">ثَكِلَتْكَ أُمُّكَ</span>
                <span><em>thakilatka ummuka</em> — literally &quot;your mother <strong className="text-text">was</strong> bereaved of you&quot; → may she be</span>
              </li>
              <li className="flex items-baseline gap-3">
                <span className="font-arabic text-lg text-text shrink-0" dir="rtl">تَبَّتْ يَدَاكَ</span>
                <span><em>tabbat yadaka</em> — literally &quot;your hands <strong className="text-text">perished</strong>&quot; → may they perish</span>
              </li>
            </ul>
            <p className="text-sm text-text-secondary leading-relaxed mt-4">
              Stating the wish as a completed fact made it rhetorically certain — the verbal equivalent of a done deal. The other two devices you&apos;ll meet below are the bare <strong className="text-text">imperative</strong> (<em>uskut!</em>, <em>ikhsa&apos;!</em>) and the verbless <strong className="text-text">noun of woe</strong> (<em>waylun laka</em>).
            </p>
          </div>
        </section>

        {/* Adab note */}
        <section className="mb-12">
          <div className="rounded-2xl border border-primary/20 bg-primary-light p-6">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Before we begin — a note on adab</h2>
            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              Islam pulled hard against the cursing culture it arrived in. The Prophet ﷺ said:
            </p>
            <p className="font-arabic text-lg text-text text-right leading-loose mb-2" dir="rtl">
              لَيْسَ الْمُؤْمِنُ بِالطَّعَّانِ وَلَا اللَّعَّانِ وَلَا الْفَاحِشِ وَلَا الْبَذِيءِ
            </p>
            <p className="text-xs text-text-tertiary mb-3">
              &quot;The believer is not one who taunts, nor one who curses, nor one who is vulgar, nor one who is foul-mouthed.&quot; — Jami&apos; at-Tirmidhi 1977
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              That is exactly why the phrases that survive in the hadith literature are the <em>idiomatic</em> ones — expressions whose literal sting had long worn off, the way English speakers say &quot;bless your heart&quot; without invoking anything. We study them here as linguists: they are a masterclass in roots, patterns, and how meaning drifts.
            </p>
          </div>
        </section>

        {/* Phrase cards */}
        <h2 className="text-xl font-semibold text-text mb-4">The Phrases, Root by Root</h2>
        <div className="space-y-4 mb-12">
          {PHRASES.map((p) => (
            <div key={p.latin} className="rounded-2xl border border-border bg-surface p-6">
              <div className="flex items-start justify-between gap-4 mb-1">
                <span className="font-arabic text-3xl text-primary leading-snug" dir="rtl">{p.arabic}</span>
                <span className="text-xs text-text-tertiary font-mono shrink-0 mt-2" dir="rtl">{p.root}</span>
              </div>
              <p className="text-sm text-text-tertiary mb-1 italic">{p.latin}</p>
              <p className="text-sm font-semibold text-text mb-3">&quot;{p.literal}&quot;</p>

              <p className="text-sm text-text-secondary leading-relaxed mb-4">{p.usage}</p>

              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-xs">
                <div>
                  <span className="text-text-tertiary uppercase tracking-wider">Root meaning </span>
                  <span className="text-text-secondary">{p.rootMeaning}</span>
                </div>
                <div>
                  <span className="text-text-tertiary uppercase tracking-wider">Pattern </span>
                  <span className="text-text-secondary">{p.pattern}</span>
                </div>
              </div>

              <div className="rounded-xl bg-canvas border border-border p-4">
                <p className="font-arabic text-lg text-text text-right leading-loose mb-2" dir="rtl">{p.source.arabic}</p>
                <p className="text-xs text-text-tertiary leading-relaxed">
                  <span className="text-primary/80">{p.source.ref}</span> — {p.source.translation}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Key takeaways */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-text mb-4">Key Takeaways</h2>
          <ul className="space-y-2 text-sm text-text-secondary leading-relaxed">
            <li className="flex gap-2"><span className="text-primary shrink-0">1.</span> Classical Arabic curses run on one main pattern: the <strong className="text-text-secondary">past tense as invocation</strong> — the wish stated as already done (thakilatka, taribat, tabbat, qata&apos;a, qatala).</li>
            <li className="flex gap-2"><span className="text-primary shrink-0">2.</span> Most famous &quot;curses&quot; in the hadith literature were <strong className="text-text-secondary">fossilized idioms</strong> of emphasis or astonishment — the literal meaning had worn off centuries before.</li>
            <li className="flex gap-2"><span className="text-primary shrink-0">3.</span> One letter can separate an idiom from a real curse: <em>taribat yadaka</em> (dusty hands — emphasis) vs <em>tabbat yadaka</em> (perished hands — Surat al-Masad).</li>
            <li className="flex gap-2"><span className="text-primary shrink-0">4.</span> Every phrase decodes through its 3-letter root — look up <span className="font-arabic">ث ك ل</span>, <span className="font-arabic">ق ط ع</span>, or <span className="font-arabic">خ س أ</span> in the <Link href="/roots" className="text-primary hover:text-primary underline">Roots Browser</Link> to see their full Quranic families.</li>
            <li className="flex gap-2"><span className="text-primary shrink-0">5.</span> And the lesson hiding in the Mu&apos;adh hadith: the chapter&apos;s harshest warning is aimed at <strong className="text-text-secondary">the harvest of the tongue itself</strong>.</li>
          </ul>
        </section>

        <div className="flex items-center justify-between pt-8 border-t border-border-light">
          <Link href="/blog/verb-forms-meaning-change" className="text-sm text-text-tertiary hover:text-text-secondary transition-colors">
            &larr; How Verb Forms Change Meaning
          </Link>
          <Link href="/blog" className="text-sm text-primary hover:text-primary transition-colors">
            All Articles &rarr;
          </Link>
        </div>
      </article>
    </>
  );
}
