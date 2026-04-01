'use client';

import { useState, useRef, useCallback } from 'react';
import type { ListenIdentifyContent } from '@/data/qirat-curriculum';

interface Props {
  content: ListenIdentifyContent;
  onAnswer: (isCorrect: boolean, userAnswer: string, correctAnswer: string, explanation?: string) => void;
}

export function ListenIdentifyStep({ content, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(content.audioUrl);
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
    setIsPlaying(true);
    setHasPlayed(true);
  }, [content.audioUrl]);

  const handleSelect = (option: string) => {
    if (selected) return; // already answered
    setSelected(option);
    audioRef.current?.pause();
    const isCorrect = option === content.correctAnswer;
    onAnswer(isCorrect, option, content.correctAnswer, content.explanation);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <p className="text-white/70 text-sm mb-6">{content.prompt}</p>

      {/* Play button */}
      <button
        onClick={playAudio}
        className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl mb-6 transition-all ${
          isPlaying
            ? 'bg-[#D4A246] text-[#0E0D0C] shadow-lg shadow-[#D4A246]/20'
            : 'bg-[#1A1918] text-white/80 hover:bg-[#1A1918]/80'
        }`}
      >
        {isPlaying ? (
          <>
            <div className="flex items-center gap-1">
              {[14, 22, 18, 26, 16].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-white rounded-full animate-pulse"
                  style={{
                    height: `${h}px`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
            <span className="font-medium">Playing...</span>
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
            <span className="font-medium">{hasPlayed ? 'Play Again' : 'Play Audio'}</span>
          </>
        )}
      </button>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {content.options.map((option) => {
          const isSelected = selected === option;
          const isCorrect = option === content.correctAnswer;
          const showResult = selected !== null;
          
          let bgClass = 'bg-[#1A1918] hover:bg-[#1A1918]/80 border-transparent';
          if (showResult && isCorrect) {
            bgClass = 'bg-[#5CB889]/20 border-[#5CB889]';
          } else if (showResult && isSelected && !isCorrect) {
            bgClass = 'bg-[#FF4B4B]/20 border-[#FF4B4B]';
          }

          return (
            <button
              key={option}
              onClick={() => hasPlayed && handleSelect(option)}
              disabled={!hasPlayed || selected !== null}
              className={`py-4 px-4 rounded-2xl text-white font-medium border-2 transition-all ${bgClass} ${
                !hasPlayed ? 'opacity-40 cursor-not-allowed' : selected ? 'cursor-default' : 'cursor-pointer active:scale-95'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {!hasPlayed && (
        <p className="text-center text-white/30 text-xs mt-4">
          Press play to listen before answering
        </p>
      )}
    </div>
  );
}
