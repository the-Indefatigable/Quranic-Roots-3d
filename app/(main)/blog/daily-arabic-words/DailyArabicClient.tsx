'use client';

import { useState } from 'react';

type Word = {
  ar: string;            // vowelled Arabic
  tr: string;            // transliteration
  en: string;            // English
  type: 'noun' | 'verb' | 'adj' | 'particle' | 'phrase';
  example?: { ar: string; en: string };
};

type Sentence = {
  ar: string;
  tr: string;
  en: string;
  context: string;       // when to use
};

const WORDS: Word[] = [
  { ar: 'السَّلَامُ',     tr: "as-salām",     en: 'peace',          type: 'noun', example: { ar: 'السَّلَامُ عَلَيْكُم', en: 'Peace be upon you' } },
  { ar: 'كِتَابٌ',         tr: 'kitāb',        en: 'book',           type: 'noun', example: { ar: 'هَٰذَا كِتَابٌ مُفِيدٌ', en: 'This is a useful book' } },
  { ar: 'بَيْتٌ',          tr: 'bayt',         en: 'house',          type: 'noun', example: { ar: 'بَيْتِي قَرِيبٌ', en: 'My house is near' } },
  { ar: 'مَاءٌ',           tr: "māʾ",          en: 'water',          type: 'noun', example: { ar: 'أُرِيدُ مَاءً', en: 'I want water' } },
  { ar: 'خُبْزٌ',          tr: 'khubz',        en: 'bread',          type: 'noun' },
  { ar: 'وَقْتٌ',          tr: 'waqt',         en: 'time',           type: 'noun', example: { ar: 'مَا الوَقْتُ؟', en: 'What time is it?' } },
  { ar: 'يَوْمٌ',          tr: 'yawm',         en: 'day',            type: 'noun' },
  { ar: 'لَيْلٌ',          tr: 'layl',         en: 'night',          type: 'noun' },
  { ar: 'صَبَاحٌ',         tr: 'ṣabāḥ',        en: 'morning',        type: 'noun', example: { ar: 'صَبَاحُ الخَيْرِ', en: 'Good morning' } },
  { ar: 'مَسَاءٌ',         tr: 'masāʾ',        en: 'evening',        type: 'noun', example: { ar: 'مَسَاءُ النُّورِ', en: 'Good evening (reply)' } },
  { ar: 'طَرِيقٌ',         tr: 'ṭarīq',        en: 'road, way',      type: 'noun' },
  { ar: 'مَدْرَسَةٌ',       tr: 'madrasa',      en: 'school',         type: 'noun' },
  { ar: 'جَامِعَةٌ',        tr: 'jāmiʿa',       en: 'university',     type: 'noun' },
  { ar: 'صَدِيقٌ',         tr: 'ṣadīq',        en: 'friend',         type: 'noun' },
  { ar: 'أَهْلٌ',          tr: 'ahl',          en: 'family, people', type: 'noun' },
  { ar: 'قَلْبٌ',          tr: 'qalb',         en: 'heart',          type: 'noun' },
  { ar: 'يَدٌ',            tr: 'yad',          en: 'hand',           type: 'noun' },
  { ar: 'عَيْنٌ',          tr: 'ʿayn',         en: 'eye, spring',    type: 'noun' },
  { ar: 'كَلِمَةٌ',         tr: 'kalima',       en: 'word',           type: 'noun' },
  { ar: 'سُؤَالٌ',         tr: "suʾāl",        en: 'question',       type: 'noun' },
  { ar: 'ذَهَبَ',           tr: 'dhahaba',      en: 'he went',        type: 'verb', example: { ar: 'ذَهَبَ إِلَى السُّوقِ', en: 'He went to the market' } },
  { ar: 'قَالَ',           tr: 'qāla',         en: 'he said',        type: 'verb' },
  { ar: 'كَتَبَ',           tr: 'kataba',       en: 'he wrote',       type: 'verb' },
  { ar: 'قَرَأَ',           tr: 'qaraʾa',       en: 'he read',        type: 'verb' },
  { ar: 'فَهِمَ',           tr: 'fahima',       en: 'he understood',  type: 'verb' },
  { ar: 'كَبِيرٌ',          tr: 'kabīr',        en: 'big, great',     type: 'adj' },
  { ar: 'صَغِيرٌ',          tr: 'ṣaghīr',       en: 'small',          type: 'adj' },
  { ar: 'جَمِيلٌ',          tr: 'jamīl',        en: 'beautiful',      type: 'adj' },
  { ar: 'جَدِيدٌ',          tr: 'jadīd',        en: 'new',            type: 'adj' },
  { ar: 'الحَمْدُ لِلَّهِ',   tr: 'al-ḥamdu lillāh', en: 'praise be to God', type: 'phrase' },
];

const SENTENCES: Sentence[] = [
  { ar: 'كَيْفَ حَالُكَ؟',                tr: 'kayfa ḥāluk?',           en: 'How are you? (m.)',         context: 'greeting a man' },
  { ar: 'كَيْفَ حَالُكِ؟',                tr: 'kayfa ḥāluki?',          en: 'How are you? (f.)',         context: 'greeting a woman' },
  { ar: 'أَنَا بِخَيْرٍ، الحَمْدُ لِلَّهِ.',  tr: 'anā bi-khayr, al-ḥamdu lillāh.', en: 'I am well, praise be to God.', context: 'reply to "how are you"' },
  { ar: 'مَا اسْمُكَ؟',                  tr: 'mā ismuk?',              en: 'What is your name? (m.)',   context: 'meeting someone new' },
  { ar: 'اِسْمِي مُحَمَّدٌ.',              tr: 'ismī Muḥammad.',         en: 'My name is Muhammad.',      context: 'introducing yourself' },
  { ar: 'مِنْ أَيْنَ أَنْتَ؟',             tr: 'min ayna anta?',         en: 'Where are you from? (m.)',  context: 'small talk' },
  { ar: 'أَنَا مِنَ الهِنْدِ.',             tr: 'anā mina l-hind.',       en: 'I am from India.',          context: 'replying about origin' },
  { ar: 'أَيْنَ المَسْجِدُ؟',              tr: 'ayna l-masjid?',         en: 'Where is the mosque?',      context: 'asking for directions' },
  { ar: 'كَمِ السَّاعَةُ؟',               tr: 'kami s-sāʿa?',           en: 'What time is it?',          context: 'asking the time' },
  { ar: 'أُحِبُّ القُرْآنَ الكَرِيمَ.',     tr: 'uḥibbu l-qurʾāna l-karīm.', en: 'I love the noble Quran.', context: 'expressing love' },
  { ar: 'أَتَكَلَّمُ العَرَبِيَّةَ قَلِيلًا.',  tr: 'atakallamu l-ʿarabiyyata qalīlā.', en: 'I speak a little Arabic.', context: 'humble disclaimer' },
  { ar: 'جَزَاكَ اللَّهُ خَيْرًا.',          tr: 'jazāka llāhu khayran.',  en: 'May Allah reward you with good.', context: 'thanking someone' },
];

const TYPE_COLOR: Record<Word['type'], string> = {
  noun:     '#34D399',
  verb:     '#D4A246',
  adj:      '#A78BFA',
  particle: '#60A5FA',
  phrase:   '#F472B6',
};

function FlipCard({ word }: { word: Word }) {
  const [flipped, setFlipped] = useState(false);
  const color = TYPE_COLOR[word.type];

  return (
    <button
      onClick={() => setFlipped((f) => !f)}
      className="relative w-full h-32 group focus:outline-none"
      style={{ perspective: '900px' }}
      aria-label={`Show meaning of ${word.tr}`}
    >
      <div
        className="absolute inset-0 rounded-2xl transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front — Arabic */}
        <div
          className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center px-3"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            background: `linear-gradient(160deg, ${color}10 0%, rgba(255,255,255,0.03) 80%)`,
            border: `1px solid ${color}30`,
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          }}
        >
          <span
            className="font-arabic text-3xl leading-none mb-1"
            style={{ color: '#F0E8D8', textShadow: `0 0 22px ${color}55` }}
          >
            {word.ar}
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color }}>
            {word.type}
          </span>
          <span className="absolute bottom-2 right-3 text-[9px]" style={{ color: '#3D3C3A' }}>
            tap ↻
          </span>
        </div>

        {/* Back — English */}
        <div
          className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center px-3 text-center"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: `linear-gradient(160deg, ${color}18 0%, rgba(0,0,0,0.4) 90%)`,
            border: `1px solid ${color}40`,
          }}
        >
          <span className="text-[11px] italic mb-1" style={{ color: '#A09F9B' }}>{word.tr}</span>
          <span className="text-base font-semibold mb-1" style={{ color: '#F0E8D8' }}>{word.en}</span>
          {word.example && (
            <span className="font-arabic text-sm leading-snug mt-1" style={{ color: color }}>
              {word.example.ar}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function DailyArabicClient() {
  return (
    <div>
      {/* Section: words */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: '#34D399' }}>
            Part 1 · 30 Words
          </span>
          <span className="h-px flex-1" style={{ background: 'rgba(16,185,129,0.18)' }} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {WORDS.map((w) => (
            <FlipCard key={w.tr} word={w} />
          ))}
        </div>
      </section>

      {/* Section: sentences */}
      <section className="mb-4">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: '#D4A246' }}>
            Part 2 · 12 Sentences
          </span>
          <span className="h-px flex-1" style={{ background: 'rgba(212,162,70,0.18)' }} />
        </div>

        <div className="space-y-3">
          {SENTENCES.map((s, i) => (
            <details
              key={i}
              className="group rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <summary
                className="cursor-pointer list-none flex items-start gap-4 p-5 transition-colors hover:bg-white/[0.04]"
              >
                <span
                  className="shrink-0 text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(212,162,70,0.12)', color: '#D4A246' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0 text-right" dir="rtl">
                  <p className="font-arabic text-xl leading-relaxed" style={{ color: '#F0E8D8' }}>
                    {s.ar}
                  </p>
                </div>
                <svg
                  className="w-4 h-4 shrink-0 mt-1 transition-transform group-open:rotate-180"
                  style={{ color: '#57534E' }}
                  fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div
                className="px-5 pb-5 pt-1 ml-10 space-y-1"
                style={{ borderTop: '1px dashed rgba(255,255,255,0.05)' }}
              >
                <p className="text-xs italic mt-3" style={{ color: '#A09F9B' }}>{s.tr}</p>
                <p className="text-sm font-medium" style={{ color: '#EDEDEC' }}>{s.en}</p>
                <p className="text-[11px]" style={{ color: '#57534E' }}>
                  <span className="uppercase tracking-wider">When:</span> {s.context}
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
