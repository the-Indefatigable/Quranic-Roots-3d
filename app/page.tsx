import dynamic from 'next/dynamic';

const HomepageClient = dynamic(
  () => import('@/components/home/HomepageClient').then((m) => ({ default: m.HomepageClient })),
  { loading: () => <div className="min-h-screen bg-background" /> }
);

export default function HomePage() {
  return <HomepageClient />;
}
