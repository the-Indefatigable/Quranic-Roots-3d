'use client';

import React, { useState } from 'react';

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

  const quizTypes: { id: QuizType; label: string; description: string; icon: string }[] = [
    {
      id: 'mixed',
      label: 'Mixed Quiz',
      description: 'Verbs, nouns, and particles',
      icon: '🎯',
    },
    {
      id: 'verb_conjugation',
      label: 'Verb Conjugations',
      description: 'Translate and identify tenses',
      icon: '📚',
    },
    {
      id: 'noun_translation',
      label: 'Noun Translation',
      description: 'Translate Arabic nouns',
      icon: '💬',
    },
    {
      id: 'particle_translation',
      label: 'Particles',
      description: 'Translate particles and prepositions',
      icon: '✨',
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Adaptive Quiz</h1>
        <p className="text-white/60 text-lg">Choose a quiz type and test your knowledge</p>
      </div>

      {/* Quiz Type Selection */}
      <div className="space-y-3 mb-8">
        {quizTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`w-full text-left p-4 rounded-xl border transition-all ${
              selectedType === type.id
                ? 'bg-gold/10 border-gold/40'
                : 'bg-card border-white/[0.08] hover:border-white/[0.15]'
            }`}
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl">{type.icon}</span>
              <div className="flex-1">
                <p className="text-white font-semibold">{type.label}</p>
                <p className="text-sm text-white/60">{type.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Question Count Selector */}
      <div className="bg-card border border-white/[0.08] rounded-xl p-6 mb-8">
        <label className="block text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">
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
            className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-white font-semibold min-w-12 text-right">{questionCount}</span>
        </div>
      </div>

      {/* Start Button */}
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

      {/* Footer Info */}
      <div className="mt-8 p-4 bg-white/[0.02] border border-white/[0.08] rounded-lg">
        <p className="text-xs text-white/40 text-center">
          💡 Quiz items are based on your learning history. Only items you've started learning will appear.
        </p>
      </div>
    </div>
  );
}
