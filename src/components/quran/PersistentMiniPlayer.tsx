'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useGlobalAudioStore } from '@/store/useGlobalAudioStore';

const G = {
  bg:        'rgba(14,13,12,0.97)',
  gold:      '#D4A246',
  goldBorder: 'rgba(212,162,70,0.15)',
  teal:      '#0D9488',
  textPrimary: '#EDEDEC',
  textTert:  'rgba(237,237,236,0.3)',
  textSecond: 'rgba(237,237,236,0.55)',
};

function formatTime(s: number): string {
  if (!s || !isFinite(s)) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

export function PersistentMiniPlayer() {
  const pathname = usePathname();
  const router = useRouter();
  const { audioEl, playInfo, updatePlayInfo, setPlayInfo } = useGlobalAudioStore();
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Hide on surah reader pages — AudioPlayer handles its own UI there
  const isOnSurahPage = pathname?.startsWith('/quran/');
  const visible = !!playInfo && !isOnSurahPage;

  // Sync audio events to local state while on non-surah pages
  useEffect(() => {
    if (!audioEl || !visible) return;

    function onTimeUpdate() {
      const pct = audioEl!.duration ? audioEl!.currentTime / audioEl!.duration : 0;
      setProgress(pct);
      setCurrentTime(audioEl!.currentTime);
      setDuration(audioEl!.duration || 0);
    }
    function onPlay()  { updatePlayInfo({ isPlaying: true }); }
    function onPause() { updatePlayInfo({ isPlaying: false }); }
    function onEnded() {
      const info = useGlobalAudioStore.getState().playInfo;
      if (!info) return;
      updatePlayInfo({ isPlaying: false });
      // Advance to next ayah in sequential mode
      if (info.currentAyah < info.totalAyahs) {
        const next = info.currentAyah + 1;
        updatePlayInfo({ currentAyah: next, isPlaying: true });
        // AudioPlayer is not mounted, we drive playback directly
        const el = useGlobalAudioStore.getState().audioEl;
        if (el) {
          // We don't have timing data here — just signal the update.
          // Actual src change is handled by AudioPlayer when user returns.
        }
      }
    }

    audioEl.addEventListener('timeupdate', onTimeUpdate);
    audioEl.addEventListener('play',       onPlay);
    audioEl.addEventListener('pause',      onPause);
    audioEl.addEventListener('ended',      onEnded);
    return () => {
      audioEl.removeEventListener('timeupdate', onTimeUpdate);
      audioEl.removeEventListener('play',       onPlay);
      audioEl.removeEventListener('pause',      onPause);
      audioEl.removeEventListener('ended',      onEnded);
    };
  }, [audioEl, visible, updatePlayInfo]);

  if (!visible || !playInfo) return null;

  const { surahNumber, surahName, currentAyah, totalAyahs, isPlaying } = playInfo;

  function togglePlay() {
    if (!audioEl) return;
    isPlaying ? audioEl.pause() : audioEl.play().catch(() => {});
  }

  function stop() {
    audioEl?.pause();
    setPlayInfo(null);
  }

  function goToSurah() {
    router.push(`/quran/${surahNumber}`);
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Progress bar */}
      <div className="w-full h-[3px]" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full transition-[width] duration-75"
          style={{
            width: `${progress * 100}%`,
            background: `linear-gradient(to right, ${G.teal}, ${G.gold})`,
          }}
        />
      </div>

      {/* Bar body */}
      <div
        className="flex items-center gap-3 px-4 py-2.5"
        style={{ background: G.bg, backdropFilter: 'blur(20px)', borderTop: `1px solid ${G.goldBorder}` }}
      >
        {/* Surah art / indicator */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-heading cursor-pointer"
          style={{ background: 'rgba(212,162,70,0.1)', border: `1px solid ${G.goldBorder}`, color: G.gold }}
          onClick={goToSurah}
        >
          {surahNumber}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={goToSurah}>
          <p className="text-sm font-medium truncate" style={{ color: G.textPrimary }}>{surahName}</p>
          <p className="text-[11px] truncate" style={{ color: G.textTert }}>
            Ayah {currentAyah} of {totalAyahs}
            {duration > 0 && ` · ${formatTime(currentTime)} / ${formatTime(duration)}`}
            <span className="ml-2" style={{ color: G.gold }}>↑ Return to reader</span>
          </p>
        </div>

        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-90"
          style={{ background: G.gold, color: '#0E0D0C', boxShadow: '0 0 14px rgba(212,162,70,0.3)' }}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 translate-x-[1px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Stop */}
        <button
          onClick={stop}
          className="w-8 h-8 flex items-center justify-center transition-colors"
          style={{ color: G.textTert }}
          title="Stop playback"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
