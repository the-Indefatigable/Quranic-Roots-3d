import { LessonPageClient } from './LessonPageClient';

interface PageProps {
  params: Promise<{ lessonId: string }>;
}

export default async function LessonPage({ params }: PageProps) {
  const { lessonId } = await params;
  return <LessonPageClient lessonId={lessonId} />;
}
