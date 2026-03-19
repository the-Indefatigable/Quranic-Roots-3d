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
      <p className="font-arabic text-2xl text-gold/40 mb-4">
        إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
      </p>
      <p className="text-sm text-muted mb-6">
        Something went wrong loading this page.
      </p>
      <button
        onClick={reset}
        className="bg-gold-dim text-gold text-xs font-medium px-5 py-2.5 rounded-xl hover:bg-gold/20 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
