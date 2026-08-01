import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Qasida Burda — Decoded Root by Root, Word by Word',
  description:
    "Al-Busiri's Qasidat al-Burda broken down line by line: every word traced to its three-letter root, every harf explained, with the Quranic verses that share the same roots. Includes the opening verses, Muhammadun sayyidu'l-kawnayn, and the khalq/khuluq contrast.",
  openGraph: {
    title: 'Qasida Burda — Decoded Root by Root | QuRoots',
    description:
      "The Burda's most famous verses, word by word: roots, hurūf, and the Quranic vocabulary hiding inside the poem.",
    url: 'https://quroots.com/blog/qasida-burda',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qasida Burda — Decoded Root by Root | QuRoots',
    description: "Every word of the Burda's famous verses traced to its root.",
    images: ['/og-image.png'],
  },
  alternates: { canonical: '/blog/qasida-burda' },
};

/** One parsed word: the Arabic, its root or particle type, and what it means. */
type Word = {
  ar: string;
  translit: string;
  root?: string;
  harf?: string;
  gloss: string;
  note?: string;
};

function WordTable({ words }: { words: Word[] }) {
  return (
    <div className="rounded-xl border border-border-light bg-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light">
              {['Word', 'Root / Ḥarf', 'Meaning'].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {words.map((w, i) => (
              <tr key={i} className="border-b border-border-light/50 last:border-0 align-top">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-arabic text-lg text-white/80" dir="rtl" lang="ar">
                    {w.ar}
                  </span>
                  <span className="block text-[11px] text-white/25 italic">{w.translit}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {w.root ? (
                    <span className="font-arabic text-primary/80" dir="rtl" lang="ar">
                      {w.root}
                    </span>
                  ) : (
                    <span className="text-[11px] text-white/35">{w.harf}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-white/45 leading-relaxed">
                  {w.gloss}
                  {w.note && <span className="block text-[11px] text-white/25 mt-0.5">{w.note}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Verse({
  arabic,
  translit,
  translation,
  words,
  insight,
}: {
  arabic: string[];
  translit: string;
  translation: string;
  words: Word[];
  insight: React.ReactNode;
}) {
  return (
    <section className="mb-14">
      <div className="rounded-xl border border-primary/15 bg-primary/[0.03] px-5 py-6 mb-5 text-center">
        {arabic.map((line, i) => (
          <p key={i} className="font-arabic text-xl sm:text-2xl text-white/85 leading-loose" dir="rtl" lang="ar">
            {line}
          </p>
        ))}
        <p className="text-[11px] text-white/25 italic mt-3">{translit}</p>
        <p className="text-sm text-white/50 mt-2 leading-relaxed">{translation}</p>
      </div>
      <WordTable words={words} />
      <div className="mt-4 rounded-lg border-l-2 border-primary/40 bg-white/[0.02] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/60 mb-1.5">
          What to notice
        </p>
        <p className="text-sm text-white/45 leading-relaxed">{insight}</p>
      </div>
    </section>
  );
}

export default function QasidaBurdaPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Qasida Burda — Decoded Root by Root, Word by Word',
    url: 'https://quroots.com/blog/qasida-burda',
    publisher: { '@type': 'Organization', name: 'QuRoots' },
    educationalLevel: 'Intermediate',
    inLanguage: ['en', 'ar'],
    about: ['Qasidat al-Burda', 'Arabic morphology', 'Arabic roots', 'Classical Arabic poetry'],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav className="flex items-center gap-2 text-xs text-white/30 mb-8">
          <Link href="/blog" className="hover:text-white/60 transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-white/50">Qasida Burda</span>
        </nav>

        <p className="text-4xl font-arabic text-primary/70 mb-3" dir="rtl" lang="ar">قَصِيدَةُ الْبُرْدَة</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
          Qasida Burda, Root by Root
        </h1>
        <p className="text-white/50 text-lg leading-relaxed mb-6">
          The Burda is probably the most recited Arabic poem in history — sung in mosques from Fez to
          Jakarta for seven hundred years. Most people who love it have never been shown what the
          words actually say. This is a word-by-word reading of its most famous verses: every word
          traced to its three-letter root, every <em>ḥarf</em> named.
        </p>
        <p className="text-white/40 text-sm leading-relaxed mb-10">
          You will recognise more of it than you expect. The Burda is built almost entirely from
          roots you already meet in the Quran — <span className="font-arabic" dir="rtl" lang="ar">ذ ك ر</span>,{' '}
          <span className="font-arabic" dir="rtl" lang="ar">س ل م</span>,{' '}
          <span className="font-arabic" dir="rtl" lang="ar">ح م د</span>,{' '}
          <span className="font-arabic" dir="rtl" lang="ar">ع ل م</span>. That is the whole argument
          for learning roots instead of words.
        </p>

        {/* Background */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Where the poem comes from</h2>
          <div className="space-y-3 text-white/45 leading-relaxed text-sm">
            <p>
              Its author, Muhammad ibn Sa&apos;id al-Busiri, was an Egyptian poet of the 13th century
              (d. circa 1294 CE). He suffered a stroke that left him paralysed down one side. The
              story he tells is that he composed this poem in praise of the Prophet ﷺ, fell asleep,
              and saw him in a dream — and that the Prophet ﷺ passed a hand over his face and placed
              his mantle over him. Al-Busiri woke healed.
            </p>
            <p>
              That mantle is the <span className="font-arabic text-white/70" dir="rtl" lang="ar">بُرْدَة</span>{' '}
              <em>(burda)</em>, and it gives the poem its popular name. Its formal title is{' '}
              <span className="font-arabic text-white/70" dir="rtl" lang="ar">الْكَوَاكِبُ الدُّرِّيَّة فِي مَدْحِ خَيْرِ الْبَرِيَّة</span>{' '}
              — &ldquo;The Pearly Stars, in Praise of the Best of Creation.&rdquo;
            </p>
            <p>
              It runs to roughly 160 verses across ten chapters, every line rhyming in{' '}
              <span className="font-arabic text-white/70" dir="rtl" lang="ar">م</span> — which is why
              it is also called <em>al-Mīmiyya</em>.
            </p>
            <p className="text-white/30 text-[13px] border-l-2 border-white/10 pl-3">
              A note in fairness: the Burda is beloved across much of the Muslim world and recited
              devotionally, while some scholars have objected to particular verses as going too far
              in praise. This article takes no position in that discussion — it is a language
              lesson, and the verses below are chosen because of what they teach about Arabic.
            </p>
          </div>
        </section>

        <h2 className="text-xl font-semibold text-white mb-6">The opening</h2>

        <Verse
          arabic={[
            'أَمِنْ تَذَكُّرِ جِيرَانٍ بِذِي سَلَمِ',
            'مَزَجْتَ دَمْعًا جَرَى مِنْ مُقْلَةٍ بِدَمِ',
          ]}
          translit="a-min tadhakkuri jīrānin bi-Dhī Salami / mazajta damʿan jarā min muqlatin bi-dami"
          translation="Is it from remembering the neighbours at Dhī Salam that you mixed tears, flowing from an eye, with blood?"
          words={[
            { ar: 'أَ', translit: 'a-', harf: 'ḥarf istifhām', gloss: 'Question particle — turns the whole line into a question.', note: 'The same hamza that opens أَلَمْ نَشْرَحْ' },
            { ar: 'مِنْ', translit: 'min', harf: 'ḥarf jarr', gloss: 'From, out of — here meaning "because of".' },
            { ar: 'تَذَكُّرِ', translit: 'tadhakkur', root: 'ذ ك ر', gloss: 'The act of recalling, calling to mind.', note: 'Form V verbal noun (تَفَعُّل). Same root as ذِكْر.' },
            { ar: 'جِيرَانٍ', translit: 'jīrān', root: 'ج و ر', gloss: 'Neighbours — broken plural of جَار.' },
            { ar: 'بِ', translit: 'bi-', harf: 'ḥarf jarr', gloss: 'At, in, by.' },
            { ar: 'ذِي', translit: 'dhī', root: '—', gloss: 'Possessor of. One of the five nouns (al-asmāʼ al-khamsa), which take letters rather than vowels as case endings.' },
            { ar: 'سَلَمِ', translit: 'Salam', root: 'س ل م', gloss: 'A place near Madinah. The root means soundness, safety, peace.' },
            { ar: 'مَزَجْتَ', translit: 'mazajta', root: 'م ز ج', gloss: 'You mixed, you blended.', note: 'Form I past tense, 2nd person masculine singular.' },
            { ar: 'دَمْعًا', translit: 'damʿan', root: 'د م ع', gloss: 'Tears — the object of the verb, hence the naṣb ending.' },
            { ar: 'جَرَى', translit: 'jarā', root: 'ج ر ي', gloss: 'It flowed, it ran.' },
            { ar: 'مُقْلَةٍ', translit: 'muqla', root: 'م ق ل', gloss: 'The eyeball; the eye.' },
            { ar: 'دَمِ', translit: 'dam', root: 'د م و', gloss: 'Blood.' },
          ]}
          insight={
            <>
              Four of these roots are Quranic vocabulary you already carry.{' '}
              <span className="font-arabic" dir="rtl" lang="ar">ذ ك ر</span> is the root of{' '}
              <em>dhikr</em> — al-Busiri does not say &ldquo;memory&rdquo;, he says the same word the
              Quran uses for remembrance of God.{' '}
              <span className="font-arabic" dir="rtl" lang="ar">س ل م</span> is the root behind{' '}
              <em>Islām</em>, <em>salām</em> and <em>Muslim</em>. And{' '}
              <span className="font-arabic" dir="rtl" lang="ar">ج ر ي</span> is the flowing of{' '}
              <span className="font-arabic" dir="rtl" lang="ar">تَجْرِي مِنْ تَحْتِهَا الْأَنْهَار</span>{' '}
              — rivers flowing beneath the gardens. Here it is tears that flow.
            </>
          }
        />

        <h2 className="text-xl font-semibold text-white mb-6">The verse everyone knows</h2>

        <Verse
          arabic={[
            'مُحَمَّدٌ سَيِّدُ الْكَوْنَيْنِ وَالثَّقَلَيْـ',
            'ـنِ وَالْفَرِيقَيْنِ مِنْ عُرْبٍ وَمِنْ عَجَمِ',
          ]}
          translit="Muḥammadun sayyidu&apos;l-kawnayni wa&apos;th-thaqalayn / wa&apos;l-farīqayni min ʿurbin wa-min ʿajami"
          translation="Muhammad, master of the two worlds and the two weighty ones, and of the two groups — Arabs and non-Arabs."
          words={[
            { ar: 'مُحَمَّدٌ', translit: 'Muḥammad', root: 'ح م د', gloss: 'The one praised much and repeatedly.', note: 'Form II passive participle (مُفَعَّل). Same root as الْحَمْد.' },
            { ar: 'سَيِّدُ', translit: 'sayyid', root: 'س و د', gloss: 'Master, chief, lord.' },
            { ar: 'الْكَوْنَيْنِ', translit: 'al-kawnayn', root: 'ك و ن', gloss: 'The two worlds — this life and the next.', note: 'Dual. Same root as كَانَ, "to be".' },
            { ar: 'وَ', translit: 'wa-', harf: 'ḥarf ʿaṭf', gloss: 'And — a conjunction joining what follows to what came before.' },
            { ar: 'الثَّقَلَيْنِ', translit: 'ath-thaqalayn', root: 'ث ق ل', gloss: 'The two weighty ones: jinn and mankind.', note: 'Dual. Quran 55:31 — يَا أَيُّهَ الثَّقَلَانِ' },
            { ar: 'الْفَرِيقَيْنِ', translit: 'al-farīqayn', root: 'ف ر ق', gloss: 'The two groups, the two parties.', note: 'Dual. Same root as فُرْقَان.' },
            { ar: 'عُرْبٍ', translit: 'ʿurb', root: 'ع ر ب', gloss: 'Arabs.' },
            { ar: 'عَجَمِ', translit: 'ʿajam', root: 'ع ج م', gloss: 'Non-Arabs; those whose speech is unclear to an Arab ear.' },
          ]}
          insight={
            <>
              Three duals in a single line —{' '}
              <span className="font-arabic" dir="rtl" lang="ar">الْكَوْنَيْنِ</span>,{' '}
              <span className="font-arabic" dir="rtl" lang="ar">الثَّقَلَيْنِ</span>,{' '}
              <span className="font-arabic" dir="rtl" lang="ar">الْفَرِيقَيْنِ</span> — all carrying the{' '}
              <span className="font-arabic" dir="rtl" lang="ar">ـَيْنِ</span> ending because each
              follows a preposition or is joined to something that does. If you want to feel how the
              dual works, this line is the best drill in classical Arabic. See{' '}
              <Link href="/blog/mufrad-muthanna-jam" className="text-primary/70 hover:text-primary">
                singular, dual and plural
              </Link>
              . And note the name itself: <em>Muḥammad</em> is not a label, it is a participle —{' '}
              <em>the one who is much praised</em>, from the same root as the first word of the
              Fātiḥa.
            </>
          }
        />

        <h2 className="text-xl font-semibold text-white mb-6">One root, two vowellings</h2>

        <Verse
          arabic={[
            'فَاقَ النَّبِيِّينَ فِي خَلْقٍ وَفِي خُلُقٍ',
            'وَلَمْ يُدَانُوهُ فِي عِلْمٍ وَلَا كَرَمِ',
          ]}
          translit="fāqa&apos;n-nabiyyīna fī khalqin wa-fī khuluqin / wa-lam yudānūhu fī ʿilmin wa-lā karami"
          translation="He surpassed the prophets in form and in character; they did not draw near him in knowledge or in generosity."
          words={[
            { ar: 'فَاقَ', translit: 'fāqa', root: 'ف و ق', gloss: 'He surpassed, he was above.', note: 'Same root as فَوْق, "above".' },
            { ar: 'النَّبِيِّينَ', translit: 'an-nabiyyīn', root: 'ن ب أ', gloss: 'The prophets — sound masculine plural, in naṣb.' },
            { ar: 'فِي', translit: 'fī', harf: 'ḥarf jarr', gloss: 'In, with respect to.' },
            { ar: 'خَلْقٍ', translit: 'khalq', root: 'خ ل ق', gloss: 'Physical creation; outward form.' },
            { ar: 'خُلُقٍ', translit: 'khuluq', root: 'خ ل ق', gloss: 'Character; inward disposition.', note: 'Quran 68:4 — وَإِنَّكَ لَعَلَىٰ خُلُقٍ عَظِيمٍ' },
            { ar: 'لَمْ', translit: 'lam', harf: 'ḥarf jazm', gloss: 'Did not — negates a present-tense verb and pushes it into the past, putting it in jazm.' },
            { ar: 'يُدَانُوهُ', translit: 'yudānūhu', root: 'د ن و', gloss: 'They drew near to him.', note: 'Form III. Same root as دُنْيَا — "the nearer life".' },
            { ar: 'عِلْمٍ', translit: 'ʿilm', root: 'ع ل م', gloss: 'Knowledge.' },
            { ar: 'وَلَا', translit: 'wa-lā', harf: 'ḥarf nafy', gloss: 'And not — continuing the negation.' },
            { ar: 'كَرَمِ', translit: 'karam', root: 'ك ر م', gloss: 'Generosity, nobility.' },
          ]}
          insight={
            <>
              This is the line to memorise if you want to understand why Arabic works the way it
              does. <span className="font-arabic" dir="rtl" lang="ar">خَلْق</span> and{' '}
              <span className="font-arabic" dir="rtl" lang="ar">خُلُق</span> are the same three
              letters — <span className="font-arabic" dir="rtl" lang="ar">خ ل ق</span> — separated
              only by their vowels. One means the body you were made with; the other means the
              character you were made with. Al-Busiri puts them side by side deliberately: the
              Prophet ﷺ surpassed others outwardly <em>and</em> inwardly, and the language lets him
              say it with one root and two vowellings. English needs two unrelated words.
            </>
          }
        />

        <h2 className="text-xl font-semibold text-white mb-6">A line built on a conditional</h2>

        <Verse
          arabic={[
            'وَكَيْفَ تَدْعُو إِلَى الدُّنْيَا ضَرُورَةُ مَنْ',
            'لَوْلَاهُ لَمْ تَخْرُجِ الدُّنْيَا مِنَ الْعَدَمِ',
          ]}
          translit="wa-kayfa tadʿū ila&apos;d-dunyā ḍarūratu man / lawlāhu lam takhruji&apos;d-dunyā mina&apos;l-ʿadami"
          translation="How could worldly need call to this world the one but for whom the world would never have come out of nothingness?"
          words={[
            { ar: 'كَيْفَ', translit: 'kayfa', harf: 'ism istifhām', gloss: 'How — a question word.' },
            { ar: 'تَدْعُو', translit: 'tadʿū', root: 'د ع و', gloss: 'It calls, it summons.', note: 'Same root as دُعَاء.' },
            { ar: 'إِلَى', translit: 'ilā', harf: 'ḥarf jarr', gloss: 'To, towards.' },
            { ar: 'الدُّنْيَا', translit: 'ad-dunyā', root: 'د ن و', gloss: 'The world; literally "the nearer one".' },
            { ar: 'ضَرُورَةُ', translit: 'ḍarūra', root: 'ض ر ر', gloss: 'Necessity, pressing need.' },
            { ar: 'مَنْ', translit: 'man', harf: 'ism mawṣūl', gloss: 'The one who — a relative pronoun for people.' },
            { ar: 'لَوْلَا', translit: 'lawlā', harf: 'ḥarf sharṭ', gloss: 'Were it not for — introduces an unreal condition.' },
            { ar: 'تَخْرُجِ', translit: 'takhruji', root: 'خ ر ج', gloss: 'It comes out, it emerges.' },
            { ar: 'الْعَدَمِ', translit: 'al-ʿadam', root: 'ع د م', gloss: 'Non-existence, nothingness.' },
          ]}
          insight={
            <>
              Notice how much of this line is <em>ḥurūf</em> and pronouns rather than content
              words: <span className="font-arabic" dir="rtl" lang="ar">كَيْفَ</span>,{' '}
              <span className="font-arabic" dir="rtl" lang="ar">إِلَى</span>,{' '}
              <span className="font-arabic" dir="rtl" lang="ar">مَنْ</span>,{' '}
              <span className="font-arabic" dir="rtl" lang="ar">لَوْلَا</span>,{' '}
              <span className="font-arabic" dir="rtl" lang="ar">لَمْ</span>. Particles are what
              carry the logic of a sentence, and there are only a few dozen of them in common use.
              Learn the particles and long sentences stop being intimidating — you can see the
              skeleton even when the vocabulary is new.
            </>
          }
        />

        <h2 className="text-xl font-semibold text-white mb-6">The closing prayer</h2>

        <Verse
          arabic={[
            'وَاللهُ يَحْرُسُهُ مِنْ كُلِّ حَادِثَةٍ',
            'وَالنَّاسُ فِي حَرَمٍ مِنْهُ وَفِي حَرَمِ',
          ]}
          translit="wa&apos;llāhu yaḥrusuhu min kulli ḥādithatin / wa&apos;n-nāsu fī ḥaramin minhu wa-fī ḥarami"
          translation="And God guards him from every calamity; and the people are in a sanctuary because of him, and in a sanctuary."
          words={[
            { ar: 'يَحْرُسُ', translit: 'yaḥrusu', root: 'ح ر س', gloss: 'He guards, he watches over.' },
            { ar: 'كُلِّ', translit: 'kulli', root: 'ك ل ل', gloss: 'Every, all.' },
            { ar: 'حَادِثَةٍ', translit: 'ḥāditha', root: 'ح د ث', gloss: 'An event; a calamity.', note: 'Active participle, feminine. Same root as حَدِيث.' },
            { ar: 'النَّاسُ', translit: 'an-nās', root: 'ن و س', gloss: 'The people, mankind.' },
            { ar: 'حَرَمٍ', translit: 'ḥaram', root: 'ح ر م', gloss: 'A sanctuary; an inviolable place.', note: 'Same root as حَرَام and إِحْرَام.' },
            { ar: 'مِنْهُ', translit: 'minhu', harf: 'jarr + ḍamīr', gloss: 'From him — the preposition مِنْ with the attached pronoun ـهُ.' },
          ]}
          insight={
            <>
              <span className="font-arabic" dir="rtl" lang="ar">ح ر م</span> is one of the most
              productive roots in the Quran. The same three letters give you{' '}
              <em>ḥarām</em> (forbidden), <em>iḥrām</em> (the pilgrim&apos;s state),{' '}
              <em>maḥram</em> (an unmarriageable relative) and <em>ḥaram</em> (sanctuary). They all
              share one idea: something set apart and made inviolable. Learn the root once and four
              words arrive together — which is exactly why we teach this way.
            </>
          }
        />

        {/* Roots recap */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Roots from this poem you already knew</h2>
          <p className="text-white/45 leading-relaxed text-sm mb-5">
            Every one of these appears in the Quran, most of them many times over. If you have
            prayed in Arabic, you have been saying them for years.
          </p>
          <div className="rounded-xl border border-border-light bg-surface p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { root: 'ح م د', quran: 'الْحَمْدُ لِلَّهِ', burda: 'مُحَمَّد' },
                { root: 'ذ ك ر', quran: 'الذِّكْر', burda: 'تَذَكُّر' },
                { root: 'س ل م', quran: 'الإِسْلَام', burda: 'ذِي سَلَم' },
                { root: 'ع ل م', quran: 'الْعَلِيم', burda: 'عِلْم' },
                { root: 'خ ل ق', quran: 'خَلَقَ', burda: 'خَلْق · خُلُق' },
                { root: 'ح ر م', quran: 'الْحَرَام', burda: 'حَرَم' },
                { root: 'د ن و', quran: 'الدُّنْيَا', burda: 'يُدَانُوه' },
                { root: 'ك و ن', quran: 'كُنْ فَيَكُون', burda: 'الْكَوْنَيْن' },
                { root: 'ج ر ي', quran: 'تَجْرِي', burda: 'جَرَى' },
              ].map((r) => (
                <div key={r.root} className="text-center">
                  <p className="font-arabic text-lg text-primary/80 mb-1.5" dir="rtl" lang="ar">{r.root}</p>
                  <p className="font-arabic text-sm text-white/55" dir="rtl" lang="ar">{r.quran}</p>
                  <p className="text-[10px] text-white/20 my-0.5">Quran · Burda</p>
                  <p className="font-arabic text-sm text-white/40" dir="rtl" lang="ar">{r.burda}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Takeaways */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Key Takeaways</h2>
          <ul className="space-y-2 text-sm text-white/45 leading-relaxed">
            <li className="flex gap-2"><span className="text-primary/60 shrink-0">1.</span> The Burda is built from Quranic roots. Learning the Quran&apos;s vocabulary unlocks classical poetry for free.</li>
            <li className="flex gap-2"><span className="text-primary/60 shrink-0">2.</span> <span className="font-arabic" dir="rtl" lang="ar">خَلْق</span> vs <span className="font-arabic" dir="rtl" lang="ar">خُلُق</span> — same root, different vowels, different meaning. Vowelling is not decoration.</li>
            <li className="flex gap-2"><span className="text-primary/60 shrink-0">3.</span> Three duals in one line make <span className="font-arabic" dir="rtl" lang="ar">مُحَمَّدٌ سَيِّدُ الْكَوْنَيْن</span> the best dual drill you will find.</li>
            <li className="flex gap-2"><span className="text-primary/60 shrink-0">4.</span> The particles carry the logic. A few dozen ḥurūf unlock the structure of any long sentence.</li>
            <li className="flex gap-2"><span className="text-primary/60 shrink-0">5.</span> <em>Muḥammad</em> is a participle before it is a name: the one much praised, from the same root as <span className="font-arabic" dir="rtl" lang="ar">الْحَمْد</span>.</li>
          </ul>
        </section>

        <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-5 mb-12 text-center">
          <p className="text-white/60 text-sm mb-3">
            Every root in this article has its own page — all ten verb forms, conjugations, and every
            place it appears in the Quran.
          </p>
          <Link
            href="/roots"
            className="inline-block px-5 py-2.5 rounded-xl bg-primary text-black text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Explore the roots
          </Link>
        </div>

        <div className="flex items-center justify-between pt-8 border-t border-border-light">
          <Link href="/blog/quranic-duas" className="text-sm text-white/30 hover:text-white/60 transition-colors">
            &larr; Duas of the Quran
          </Link>
          <Link href="/blog/mufrad-muthanna-jam" className="text-sm text-primary/70 hover:text-primary transition-colors">
            Next: Singular, Dual &amp; Plural &rarr;
          </Link>
        </div>
      </article>
    </>
  );
}
