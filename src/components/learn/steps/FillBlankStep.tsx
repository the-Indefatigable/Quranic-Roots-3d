'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface FillBlankContent {
  sentence: string; // e.g. "The sound masculine plural of Muslim = Muslim___"
  correct_answer: string;
  options: string[];
  explanation?: string;
}

interface FillBlankStepProps {
  content: Record<string, unknown>;
  onAnswer: (isCorrect: boolean, userAnswer: string, correctAnswer: string, explanation?: string) => void;
}

export function FillBlankStep({ content, onAnswer }: FillBlankStepProps) {
  const data = content as unknown as FillBlankContent;
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (option: string) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);

    const isCorrect = option === data.correct_answer;
    onAnswer(isCorrect, option, data.correct_answer, data.explanation);
  };

  // Replace ___ with the selected answer or a blank
  const displaySentence = data.sentence.replace(
    /___/,
    selected || '______',
  );

  return (
    <div className="flex flex-col gap-6 items-center">
      <h2 className="text-lg font-bold text-white text-center">Fill in the blank</h2>

      <div className="px-5 py-4 rounded-2xl bg-surface border border-border w-full text-center">
        <p className="text-xl text-white leading-relaxed">
          {displaySentence.split(selected || '______').map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span
                  className={`inline-block px-3 py-1 mx-1 rounded-lg font-bold border-b-2 ${
                    !selected
                      ? 'bg-surface border-border text-white/30 min-w-[80px]'
                      : selected === data.correct_answer
                      ? 'bg-[#58CC02]/20 border-[#58CC02] text-[#58CC02]'
                      : 'bg-[#FF4B4B]/20 border-[#FF4B4B] text-[#FF4B4B]'
                  }`}
                >
                  {selected || '\u00A0\u00A0\u00A0\u00A0\u00A0'}
                </span>
              )}
            </span>
          ))}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {data.options.map((option, i) => {
          let style = 'border-border bg-surface text-white hover:bg-surface';
          if (answered && option === selected) {
            style = option === data.correct_answer
              ? 'border-[#58CC02] bg-[#58CC02]/10 text-[#58CC02]'
              : 'border-[#FF4B4B] bg-[#FF4B4B]/10 text-[#FF4B4B]';
          } else if (answered && option === data.correct_answer) {
            style = 'border-[#58CC02]/50 bg-[#58CC02]/5 text-[#58CC02]/70';
          }

          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleSelect(option)}
              disabled={answered}
              className={`px-5 py-3 rounded-xl border-2 font-medium text-base transition-all ${style}`}
            >
              {option}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
