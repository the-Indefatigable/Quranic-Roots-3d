'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface MCQContent {
  question: string;
  options: Array<{ text: string; correct: boolean }>;
  explanation?: string;
}

interface MCQStepProps {
  content: Record<string, unknown>;
  onAnswer: (isCorrect: boolean, userAnswer: string, correctAnswer: string, explanation?: string) => void;
}

export function MCQStep({ content, onAnswer }: MCQStepProps) {
  const data = content as unknown as MCQContent;
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const correctOption = data.options.find((o) => o.correct);
  const correctText = correctOption?.text || '';

  const handleSelect = (index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);

    const isCorrect = data.options[index].correct;
    onAnswer(isCorrect, data.options[index].text, correctText, data.explanation);
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-white text-center">{data.question}</h2>

      <div className="space-y-3">
        {data.options.map((option, i) => {
          let borderColor = 'border-white/10';
          let bgColor = 'bg-white/5';

          if (answered && selected === i) {
            borderColor = option.correct ? 'border-[#58CC02]' : 'border-[#FF4B4B]';
            bgColor = option.correct ? 'bg-[#58CC02]/10' : 'bg-[#FF4B4B]/10';
          } else if (answered && option.correct) {
            borderColor = 'border-[#58CC02]/50';
            bgColor = 'bg-[#58CC02]/5';
          }

          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => handleSelect(i)}
              disabled={answered}
              className={`w-full text-left px-5 py-4 rounded-2xl border-2 ${borderColor} ${bgColor} transition-all ${
                !answered ? 'hover:bg-white/10 hover:border-white/20 active:scale-[0.98]' : ''
              }`}
            >
              <span className="text-base text-white">{option.text}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
