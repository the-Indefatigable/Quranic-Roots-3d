'use client';

import { useAppStore } from '@/store/useAppStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArabicText } from '@/components/ui/ArabicText';

export default function BookmarksPage() {
  const { bookmarks, removeBookmark } = useAppStore();

  return (
    <>
      <PageHeader title="Bookmarks" subtitle={`${bookmarks.length} saved items`} />

      {bookmarks.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-12 h-12 text-muted-more mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
          </svg>
          <p className="text-muted">No bookmarks yet</p>
          <p className="text-muted-more text-sm mt-1">
            Save roots, nouns, and ayahs to access them quickly
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {bookmarks.map((bookmark) => (
            <Card key={bookmark.id}>
              <div className="flex items-start justify-between">
                <div>
                  {bookmark.arabicLabel && (
                    <ArabicText size="xl" className="text-gold block mb-1">
                      {bookmark.arabicLabel}
                    </ArabicText>
                  )}
                  <p className="text-sm text-white">{bookmark.label}</p>
                  <Badge variant="amber" className="mt-2">{bookmark.type}</Badge>
                </div>
                <button
                  onClick={() => removeBookmark(bookmark.id)}
                  className="text-muted-more hover:text-white transition-colors p-1"
                  aria-label="Remove bookmark"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
