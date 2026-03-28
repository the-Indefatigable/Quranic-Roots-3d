import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-canvas">
      <p className="font-arabic text-3xl text-primary/30 mb-4">٤٠٤</p>
      <p className="text-sm text-text-secondary mb-6">This page could not be found.</p>
      <Link
        href="/"
        className="bg-primary/10 text-primary text-xs font-medium px-5 py-2.5 rounded-xl hover:bg-primary/20 transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}
