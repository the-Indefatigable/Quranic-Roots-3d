import { LessonPageClient } from './LessonPageClient';

export default function LessonPage({ params }: { params: { lessonId: string } }) {
  return <LessonPageClient lessonId={params.lessonId} />;
}
