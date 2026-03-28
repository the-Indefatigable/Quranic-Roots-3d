'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-32">
      <p className="font-arabic text-2xl text-primary/40 mb-4">
        إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
      </p>
      <p className="text-sm text-text-secondary mb-6">
        Something went wrong loading this page.
      </p>
      <button
        onClick={reset}
        className="bg-primary/10 text-primary text-xs font-medium px-5 py-2.5 rounded-xl hover:bg-primary/20 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
