'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MatchContent {
  instruction: string;
  pairs: Array<{ left: string; right: string }>;
}

interface MatchStepProps {
  content: Record<string, unknown>;
  onAnswer: (isCorrect: boolean, userAnswer: string, correctAnswer: string, explanation?: string) => void;
}

export function MatchStep({ content, onAnswer }: MatchStepProps) {
  const data = content as unknown as MatchContent;
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrongPair, setWrongPair] = useState<{ left: number; right: number } | null>(null);
  const [mistakeCount, setMistakeCount] = useState(0);

  // Shuffle right column (but keep track of original indices)
  const [shuffledRight] = useState(() => {
    const indices = data.pairs.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  });

  // Check if a pair was just selected
  useEffect(() => {
    if (selectedLeft !== null && selectedRight !== null) {
      const rightOrigIdx = shuffledRight[selectedRight];
      const isMatch = selectedLeft === rightOrigIdx;

      if (isMatch) {
        setMatched((prev) => new Set([...prev, selectedLeft]));
      } else {
        setWrongPair({ left: selectedLeft, right: selectedRight });
        setMistakeCount((p) => p + 1);
        setTimeout(() => setWrongPair(null), 600);
      }

      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 300);
    }
  }, [selectedLeft, selectedRight, shuffledRight]);

  // Check completion
  useEffect(() => {
    if (matched.size === data.pairs.length && data.pairs.length > 0) {
      const allPairsStr = data.pairs.map((p) => `${p.left}↔${p.right}`).join(', ');
      setTimeout(() => {
        onAnswer(
          mistakeCount === 0,
          allPairsStr,
          allPairsStr,
          mistakeCount === 0 ? 'Perfect matching!' : `You had ${mistakeCount} wrong attempt${mistakeCount > 1 ? 's' : ''}.`,
        );
      }, 500);
    }
  }, [matched.size, data.pairs.length, mistakeCount, onAnswer, data.pairs]);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-bold text-white text-center">{data.instruction}</h2>

      <div className="flex gap-4">
        {/* Left column */}
        <div className="flex-1 space-y-2">
          {data.pairs.map((pair, i) => {
            const isMatched = matched.has(i);
            const isSelected = selectedLeft === i;
            const isWrong = wrongPair?.left === i;

            return (
              <motion.button
                key={`l-${i}`}
                animate={isWrong ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.3 }}
                onClick={() => !isMatched && setSelectedLeft(i)}
                disabled={isMatched}
                className={`w-full px-3 py-3 rounded-xl border-2 text-sm font-medium text-center transition-all ${
                  isMatched
                    ? 'border-[#58CC02]/50 bg-[#58CC02]/10 text-[#58CC02] opacity-60'
                    : isSelected
                    ? 'border-[#1CB0F6] bg-[#1CB0F6]/10 text-[#1CB0F6]'
                    : isWrong
                    ? 'border-[#FF4B4B] bg-[#FF4B4B]/10 text-[#FF4B4B]'
                    : 'border-white/10 bg-white/5 text-white hover:border-white/20'
                }`}
              >
                {pair.left}
              </motion.button>
            );
          })}
        </div>

        {/* Right column (shuffled) */}
        <div className="flex-1 space-y-2">
          {shuffledRight.map((origIdx, displayIdx) => {
            const pair = data.pairs[origIdx];
            const isMatched = matched.has(origIdx);
            const isSelected = selectedRight === displayIdx;
            const isWrong = wrongPair?.right === displayIdx;

            return (
              <motion.button
                key={`r-${displayIdx}`}
                animate={isWrong ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.3 }}
                onClick={() => !isMatched && setSelectedRight(displayIdx)}
                disabled={isMatched}
                className={`w-full px-3 py-3 rounded-xl border-2 text-sm font-medium text-center transition-all ${
                  isMatched
                    ? 'border-[#58CC02]/50 bg-[#58CC02]/10 text-[#58CC02] opacity-60'
                    : isSelected
                    ? 'border-[#1CB0F6] bg-[#1CB0F6]/10 text-[#1CB0F6]'
                    : isWrong
                    ? 'border-[#FF4B4B] bg-[#FF4B4B]/10 text-[#FF4B4B]'
                    : 'border-white/10 bg-white/5 text-white hover:border-white/20'
                }`}
              >
                {pair.right}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
