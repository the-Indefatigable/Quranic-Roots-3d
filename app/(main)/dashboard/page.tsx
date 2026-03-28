import type { Metadata } from 'next';
import { Dashboard } from '@/components/learn/Dashboard';

export const metadata: Metadata = {
  title: 'Dashboard — QuRoots',
  description: 'Track your Quranic Arabic learning progress, streaks, and daily goals.',
};

export default function DashboardPage() {
  return <Dashboard />;
}
