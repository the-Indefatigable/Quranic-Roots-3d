import { SalahLesson } from '@/components/salah/SalahLesson';

export default function SalahDayPage({ params }: { params: { day: string } }) {
  return <SalahLesson day={Number(params.day)} />;
}
