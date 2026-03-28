'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LessonPlayer, type LessonStep } from '@/components/learn/LessonPlayer';

interface LessonData {
  id: string;
  title: string;
  unitTitle: string;
  unitColor: string;
  content: { steps: LessonStep[] };
  xpReward: number;
  lessonType: string;
}

export function LessonPageClient({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [hearts, setHearts] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/learn/lesson?id=${lessonId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setLesson(data.lesson);
          setHearts(data.hearts ?? 5);
        }
      })
      .catch((err) => setError(`Failed to load lesson: ${err.message}`))
      .finally(() => setLoading(false));
  }, [lessonId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#131F24] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#58CC02] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="fixed inset-0 bg-[#131F24] flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-red-400 mb-4">{error || 'Lesson not found'}</p>
          <button
            onClick={() => router.push('/learn/path')}
            className="px-6 py-3 rounded-2xl bg-[#1CB0F6] text-white font-bold"
          >
            Back to Path
          </button>
        </div>
      </div>
    );
  }

  return (
    <LessonPlayer
      lessonId={lesson.id}
      title={lesson.title}
      unitTitle={lesson.unitTitle}
      unitColor={lesson.unitColor}
      steps={lesson.content.steps}
      xpReward={lesson.xpReward}
      initialHearts={hearts}
      onExit={() => router.push('/learn/path')}
    />
  );
}
