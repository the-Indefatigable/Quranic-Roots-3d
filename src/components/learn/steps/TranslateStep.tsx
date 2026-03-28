'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface TranslateContent {
  instruction?: string;
  sentence: string; // English sentence to translate
  tiles: string[]; // Arabic word tiles
  correct_order: string[];
  explanation?: string;
}

interface TranslateStepProps {
  content: Record<string, unknown>;
  onAnswer: (isCorrect: boolean, userAnswer: string, correctAnswer: string, explanation?: string) => void;
}

export function TranslateStep({ content, onAnswer }: TranslateStepProps) {
  const data = content as unknown as TranslateContent;
  const [placed, setPlaced] = useState<string[]>([]);
  const [remaining, setRemaining] = useState<string[]>(() => {
    const shuffled = [...data.tiles];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
  const [answered, setAnswered] = useState(false);

  const handleTap = (tile: string, fromPlaced: boolean) => {
    if (answered) return;

    if (fromPlaced) {
      const idx = placed.indexOf(tile);
      if (idx >= 0) {
        setPlaced((p) => p.filter((_, i) => i !== idx));
        setRemaining((r) => [...r, tile]);
      }
    } else {
      const idx = remaining.indexOf(tile);
      if (idx >= 0) {
        setRemaining((r) => r.filter((_, i) => i !== idx));
        const newPlaced = [...placed, tile];
        setPlaced(newPlaced);

        if (newPlaced.length === data.tiles.length) {
          setAnswered(true);
          const isCorrect = JSON.stringify(newPlaced) === JSON.stringify(data.correct_order);
          onAnswer(
            isCorrect,
            newPlaced.join(' '),
            data.correct_order.join(' '),
            data.explanation,
          );
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 items-center">
      <h2 className="text-lg font-bold text-white text-center">
        {data.instruction || 'Translate this sentence'}
      </h2>

      <div className="px-5 py-3 rounded-xl bg-surface border border-border">
        <p className="text-base text-white">{data.sentence}</p>
      </div>

      {/* Drop zone */}
      <div className="w-full min-h-[60px] px-4 py-3 rounded-2xl border-2 border-dashed border-border bg-surface flex flex-wrap gap-2 justify-center items-center" dir="rtl">
        {placed.length === 0 ? (
          <span className="text-white/20 text-sm" dir="ltr">Tap tiles to build the Arabic sentence</span>
        ) : (
          placed.map((tile, i) => (
            <motion.button
              key={`p-${i}`}
              layout
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              onClick={() => handleTap(tile, true)}
              disabled={answered}
              className={`px-4 py-3 rounded-xl font-arabic text-lg font-medium border-2 transition-all ${
                answered
                  ? JSON.stringify(placed) === JSON.stringify(data.correct_order)
                    ? 'border-[#58CC02] bg-[#58CC02]/10 text-[#58CC02]'
                    : 'border-[#FF4B4B] bg-[#FF4B4B]/10 text-[#FF4B4B]'
                  : 'border-[#1CB0F6] bg-[#1CB0F6]/10 text-[#1CB0F6]'
              }`}
            >
              {tile}
            </motion.button>
          ))
        )}
      </div>

      {/* Available tiles */}
      <div className="flex flex-wrap gap-2 justify-center">
        {remaining.map((tile, i) => (
          <motion.button
            key={`r-${i}`}
            layout
            onClick={() => handleTap(tile, false)}
            className="px-4 py-3 rounded-xl font-arabic text-lg font-medium border-2 border-border bg-surface text-white shadow-[0_3px_0_rgba(255,255,255,0.1)] hover:bg-surface active:shadow-none active:translate-y-[3px] transition-all"
          >
            {tile}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
