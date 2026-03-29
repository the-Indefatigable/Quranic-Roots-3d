import type { Metadata } from 'next';
import Link from 'next/link';
import { QIRAT_UNITS } from '@/data/qirat-curriculum';

export const metadata: Metadata = {
  title: 'Learn Qirat & Maqam — Quranic Recitation Course',
  description:
    'Master Quranic recitation (Qirat) with interactive lessons on maqam theory, ear training, and pitch matching. Learn Bayati, Rast, Hijaz, and more.',
};

export default function QiratPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
        Interactive Course
      </p>
      <h1 className="text-3xl sm:text-4xl font-bold text-text tracking-tight mb-3">
        Learn Qirat &amp; Maqam
      </h1>
      <p className="text-text-secondary text-base sm:text-lg leading-relaxed mb-12 max-w-2xl">
        A structured course to understand the melodic modes of Quranic recitation.
        Start with the theory, train your ear, then practice reciting like the masters.
      </p>

      <div className="space-y-4">
        {QIRAT_UNITS.map((unit, idx) => (
          <div
            key={unit.id}
            className="rounded-2xl bg-surface shadow-card p-6"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <span className="text-2xl font-arabic text-primary leading-none">{unit.arabic}</span>
              </div>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0"
                style={{ backgroundColor: `${unit.color}20`, color: unit.color }}
              >
                Unit {idx + 1}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-text mb-1.5">
              {unit.title}
            </h2>
            <p className="text-sm text-text-tertiary leading-relaxed mb-4">
              {unit.description}
            </p>

            {/* Lessons list */}
            <div className="space-y-2">
              {unit.lessons.map((lesson, lessonIdx) => (
                <Link
                  key={lesson.id}
                  href={`/lesson/${lesson.id}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-canvas/50 border border-border-light hover:border-primary/30 hover:bg-canvas transition-all group"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ backgroundColor: `${unit.color}20`, color: unit.color }}
                  >
                    {lessonIdx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text group-hover:text-primary transition-colors truncate">
                      {lesson.title}
                    </p>
                    <p className="text-[10px] text-text-tertiary">
                      {lesson.steps.length} steps · {lesson.xpReward} XP
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-text-tertiary group-hover:text-primary transition-colors shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
