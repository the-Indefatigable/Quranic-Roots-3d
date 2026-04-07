'use client';

import { RefObject } from 'react';
import { G, formatTime } from './playerTokens';

// ── Animated equalizer bars ──────────────────────────────────────────────
export function EqBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-[3px] rounded-full transition-all ${active ? 'animate-equalizer' : ''}`}
          style={{
            background: G.gold,
            height: active ? undefined : '4px',
            animationDelay: active ? `${i * 0.12}s` : undefined,
          }}
        />
      ))}
    </div>
  );
}

// ── Shared seekbar ────────────────────────────────────────────────────────
interface SeekBarProps {
  large?: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  isSeeking: boolean;
  setIsSeeking: (v: boolean) => void;
  handleSeek: (clientX: number) => void;
  seekBarRef: RefObject<HTMLDivElement | null>;
}

export function SeekBar({
  large,
  progress,
  currentTime,
  duration,
  isSeeking,
  setIsSeeking,
  handleSeek,
  seekBarRef,
}: SeekBarProps) {
  return (
    <div className="w-full flex flex-col gap-1.5">
      <div
        ref={seekBarRef}
        className={`relative w-full cursor-pointer group/seek ${large ? 'h-1.5' : 'h-[3px]'} rounded-full`}
        style={{ background: 'rgba(255,255,255,0.1)' }}
        onMouseDown={(e) => {
          setIsSeeking(true);
          handleSeek(e.clientX);
          const onMove = (ev: MouseEvent) => handleSeek(ev.clientX);
          const onUp   = () => { setIsSeeking(false); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        }}
        onTouchStart={(e) => {
          setIsSeeking(true);
          handleSeek(e.touches[0].clientX);
          const onMove = (ev: TouchEvent) => handleSeek(ev.touches[0].clientX);
          const onEnd  = () => { setIsSeeking(false); window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd); };
          window.addEventListener('touchmove', onMove);
          window.addEventListener('touchend', onEnd);
        }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-75"
          style={{
            width: `${progress * 100}%`,
            background: `linear-gradient(to right, ${G.teal}, ${G.gold})`,
            boxShadow: progress > 0.01 ? `0 0 6px rgba(212,162,70,0.35)` : 'none',
          }}
        />
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full transition-[opacity,transform] ${
            large
              ? 'w-3.5 h-3.5 group-hover/seek:scale-125'
              : 'w-2.5 h-2.5 opacity-0 group-hover/seek:opacity-100 group-hover/seek:scale-110'
          } ${isSeeking ? '!opacity-100 scale-125' : ''}`}
          style={{
            left: `${progress * 100}%`,
            background: G.gold,
            boxShadow: `0 0 8px rgba(212,162,70,0.6)`,
          }}
        />
      </div>
      {large && (
        <div className="flex justify-between text-[11px] tabular-nums" style={{ color: G.textTert }}>
          <span>{formatTime(currentTime)}</span>
          <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
        </div>
      )}
    </div>
  );
}

// ── Volume control ────────────────────────────────────────────────────────
interface VolumeControlProps {
  volume: number;
  setVolume: (v: number) => void;
  audioElement: HTMLAudioElement;
  handleVolumeChange: (clientX: number) => void;
  volumeBarRef: RefObject<HTMLDivElement | null>;
}

export function VolumeControl({
  volume,
  setVolume,
  audioElement,
  handleVolumeChange,
  volumeBarRef,
}: VolumeControlProps) {
  return (
    <div className="hidden lg:flex items-center gap-2">
      <button
        onClick={() => { const v = volume > 0 ? 0 : 1; setVolume(v); audioElement.volume = v; }}
        className="w-8 h-8 flex items-center justify-center transition-colors"
        style={{ color: G.textTert }}
      >
        {volume === 0 ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-3.72a.75.75 0 0 1 1.28.53v14.88a.75.75 0 0 1-1.28.53l-4.72-3.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-3.72a.75.75 0 0 1 1.28.53v14.88a.75.75 0 0 1-1.28.53l-4.72-3.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
          </svg>
        )}
      </button>
      <div
        ref={volumeBarRef}
        className="relative w-20 h-[3px] rounded-full cursor-pointer group/vol"
        style={{ background: 'rgba(255,255,255,0.1)' }}
        onMouseDown={(e) => {
          handleVolumeChange(e.clientX);
          const onMove = (ev: MouseEvent) => handleVolumeChange(ev.clientX);
          const onUp   = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${volume * 100}%`, background: G.gold, opacity: 0.7 }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full opacity-0 group-hover/vol:opacity-100 transition-opacity"
          style={{ left: `${volume * 100}%`, background: G.gold }}
        />
      </div>
    </div>
  );
}
