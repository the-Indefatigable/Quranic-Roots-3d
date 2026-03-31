'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export type QuizType = 'verb_conjugation' | 'noun_translation' | 'particle_translation' | 'mixed';

interface QuizSelectorProps {
  counts?: {
    verb_conjugation?: number;
    noun_translation?: number;
    particle_translation?: number;
  };
  onSelect: (type: QuizType, limit: number) => void;
  isLoading: boolean;
}

export function QuizSelector({ counts = {}, onSelect, isLoading }: QuizSelectorProps) {
  const [selectedType, setSelectedType] = useState<QuizType>('mixed');
  const [questionCount, setQuestionCount] = useState(10);

  const quizTypes: { id: QuizType; label: string; description: string; icon: string; color: string }[] = [
    {
      id: 'mixed',
      label: 'Mixed Quiz',
      description: 'Verbs, nouns, and particles',
      icon: '🎯',
      color: 'primary',
    },
    {
      id: 'verb_conjugation',
      label: 'Verb Conjugations',
      description: 'Translate and identify tenses',
      icon: '📚',
      color: 'accent',
    },
    {
      id: 'noun_translation',
      label: 'Noun Translation',
      description: 'Translate Arabic nouns',
      icon: '💬',
      color: 'info',
    },
    {
      id: 'particle_translation',
      label: 'Particles',
      description: 'Translate particles and prepositions',
      icon: '✨',
      color: 'correct',
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1
          className="text-3xl md:text-4xl font-heading mb-3"
          style={{ color: '#F0E4CA', textShadow: '0 0 40px rgba(212,162,70,0.15)' }}
        >Adaptive Quiz</h1>
        <motion.p
          className="text-text-secondary text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          Choose a quiz type and test your knowledge
        </motion.p>
      </motion.div>

      {/* Quiz Type Selection */}
      <div className="space-y-3 mb-8">
        {quizTypes.map((type, idx) => (
          <motion.button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.06, duration: 0.35 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full text-left p-5 rounded-2xl border shadow-card transition-all duration-200 ${
              selectedType === type.id
                ? 'bg-primary/8 border-primary/40 shadow-raised'
                : 'bg-surface border-border hover:shadow-raised hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                selectedType === type.id ? 'bg-primary/10' : 'bg-canvas'
              }`}>
                {type.icon}
              </div>
              <div className="flex-1">
                <p className="text-text font-semibold">{type.label}</p>
                <p className="text-sm text-text-secondary mt-0.5">{type.description}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                selectedType === type.id
                  ? 'border-primary bg-primary'
                  : 'border-border'
              }`}>
                {selectedType === type.id && (
                  <motion.div
                    className="w-2 h-2 rounded-full bg-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  />
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Question Count Selector */}
      <motion.div
        className="bg-surface rounded-2xl shadow-card border border-border-light p-6 mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.35 }}
      >
        <label className="block text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
          Questions per session
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="5"
            max="30"
            step="5"
            value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
            className="flex-1 h-2 bg-border-light rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <span className="text-2xl font-bold text-primary min-w-12 text-right">{questionCount}</span>
        </div>
      </motion.div>

      {/* Start Button */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.35 }}
      >
        <button
          onClick={() => onSelect(selectedType, questionCount)}
          disabled={isLoading}
          className="btn-primary w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              Loading quiz...
            </span>
          ) : (
            'Start Quiz'
          )}
        </button>
      </motion.div>

      {/* Footer Info */}
      <motion.div
        className="mt-8 p-4 bg-surface rounded-xl shadow-card border border-border-light"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <p className="text-xs text-text-tertiary text-center">
          Quiz items are based on your learning history. Only items you&apos;ve started learning will appear.
        </p>
      </motion.div>
    </div>
  );
}
