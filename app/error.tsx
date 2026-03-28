'use client';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-32 text-center px-6">
      <p className="font-arabic text-2xl text-primary/40 mb-4">
        إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
      </p>
      <p className="text-sm text-text-secondary mb-2">Something went wrong.</p>
      <p className="text-xs text-text-tertiary mb-8">Please check your connection and try again.</p>
      <button
        onClick={reset}
        className="bg-primary/10 text-primary text-xs font-medium px-5 py-2.5 rounded-xl hover:bg-primary/20 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
