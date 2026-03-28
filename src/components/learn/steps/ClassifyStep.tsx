'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ClassifyContent {
  instruction: string;
  categories: string[];
  items: Array<{ text: string; category: string }>;
  explanation?: string;
}

interface ClassifyStepProps {
  content: Record<string, unknown>;
  onAnswer: (isCorrect: boolean, userAnswer: string, correctAnswer: string, explanation?: string) => void;
}

export function ClassifyStep({ content, onAnswer }: ClassifyStepProps) {
  const data = content as unknown as ClassifyContent;
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [currentItem, setCurrentItem] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [mistakeCount, setMistakeCount] = useState(0);

  // Shuffle items on mount
  const [shuffledItems] = useState(() => {
    const items = [...data.items];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  });

  const item = shuffledItems[currentItem];

  const handleClassify = (category: string) => {
    if (answered || !item) return;

    const isCorrect = item.category === category;
    if (!isCorrect) setMistakeCount((p) => p + 1);

    setPlacements((prev) => ({ ...prev, [item.text]: category }));

    // Flash feedback briefly, then move to next
    if (currentItem + 1 >= shuffledItems.length) {
      setAnswered(true);
      const totalMistakes = mistakeCount + (isCorrect ? 0 : 1);
      const allCorrect = totalMistakes === 0;
      const userResult = shuffledItems.map((it) => `${it.text}→${placements[it.text] || category}`).join(', ');
      const correctResult = shuffledItems.map((it) => `${it.text}→${it.category}`).join(', ');
      onAnswer(allCorrect, userResult, correctResult, data.explanation);
    } else {
      setTimeout(() => setCurrentItem((p) => p + 1), 400);
    }
  };

  if (!item) return null;

  return (
    <div className="flex flex-col gap-6 items-center">
      <h2 className="text-lg font-bold text-white text-center">{data.instruction}</h2>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {shuffledItems.map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i < currentItem
                ? placements[shuffledItems[i].text] === shuffledItems[i].category
                  ? 'bg-[#58CC02]'
                  : 'bg-[#FF4B4B]'
                : i === currentItem
                ? 'bg-[#1CB0F6]'
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Current item to classify */}
      <motion.div
        key={currentItem}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-center"
      >
        <span className="text-xl font-arabic text-white">{item.text}</span>
      </motion.div>

      {/* Category buttons */}
      <div className="w-full grid gap-3" style={{ gridTemplateColumns: `repeat(${data.categories.length}, 1fr)` }}>
        {data.categories.map((cat) => (
          <motion.button
            key={cat}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleClassify(cat)}
            disabled={answered}
            className="px-4 py-5 rounded-2xl border-2 border-white/10 bg-white/5 text-white font-medium text-sm hover:bg-white/10 hover:border-white/20 shadow-[0_3px_0_rgba(255,255,255,0.06)] active:shadow-none active:translate-y-[3px] transition-all"
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* Already classified */}
      {Object.keys(placements).length > 0 && (
        <div className="w-full space-y-2">
          {data.categories.map((cat) => {
            const items = Object.entries(placements)
              .filter(([, c]) => c === cat)
              .map(([text]) => text);
            if (items.length === 0) return null;
            return (
              <div key={cat} className="flex items-center gap-2 text-xs text-white/40">
                <span className="font-medium">{cat}:</span>
                {items.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded bg-white/5">{t}</span>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
