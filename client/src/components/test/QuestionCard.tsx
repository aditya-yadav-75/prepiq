import React from 'react';
import { Flag, Trash2, CheckCircle2 } from 'lucide-react';
import { Question } from '../../types/index.js';
import { Badge } from '../ui/Badge.js';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  currentResponse: string;
  isFlagged: boolean;
  onAnswerChange: (answer: string) => void;
  onToggleFlag: () => void;
  onClearAnswer: () => void;
  showDifficulty?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  currentResponse,
  isFlagged,
  onAnswerChange,
  onToggleFlag,
  onClearAnswer,
  showDifficulty = true
}) => {
  const diffVariant = {
    easy: 'emerald' as const,
    medium: 'cobalt' as const,
    hard: 'rose' as const
  }[question.difficulty || 'medium'];

  const typeLabels = {
    mcq: 'Multiple Choice',
    true_false: 'True or False',
    fill_blank: 'Fill in the Blank',
    short_answer: 'Short Answer',
    descriptive: 'Descriptive'
  }[question.question_type] || 'Question';

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/90 dark:border-white/10 shadow-glass">
      {/* Top Header: Number, Topic, Badges, Flag */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-cobalt dark:bg-electric text-white font-black text-sm flex items-center justify-center shadow-xs">
            {currentIndex + 1}
          </span>
          <span className="text-xs font-semibold text-mutedText dark:text-slate-400">of {totalQuestions}</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="text-xs font-bold text-darkText dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs">
            {question.topic}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="slate" size="sm">{typeLabels}</Badge>
          {showDifficulty && (
            <Badge variant={diffVariant} size="sm" className="capitalize">
              {question.difficulty}
            </Badge>
          )}
          <button
            onClick={onToggleFlag}
            className={`p-2 rounded-xl border transition-all ${
              isFlagged 
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 shadow-xs' 
                : 'bg-white/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 hover:text-darkText dark:hover:text-slate-200 border-slate-200 dark:border-white/10 hover:bg-white'
            }`}
            title={isFlagged ? 'Remove review flag' : 'Mark for review'}
          >
            <Flag className="w-4 h-4" fill={isFlagged ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Question Prompt */}
      <div className="py-6">
        <h3 className="text-lg sm:text-xl font-bold text-darkText dark:text-white leading-relaxed tracking-tight">
          {question.question_text}
        </h3>
      </div>

      {/* Answer Input Area */}
      <div className="space-y-3 pt-2">
        {/* MCQ & True/False */}
        {(question.question_type === 'mcq' || question.question_type === 'true_false') && question.options && (
          <div className="grid grid-cols-1 gap-3">
            {question.options.map((option, optIdx) => {
              const optionLetter = String.fromCharCode(65 + optIdx);
              const isSelected = currentResponse === option;

              return (
                <label
                  key={optIdx}
                  onClick={() => onAnswerChange(option)}
                  className={`
                    flex items-center gap-4 p-4 rounded-2xl border cursor-pointer select-none transition-all duration-200
                    ${isSelected 
                      ? 'bg-cobalt/10 dark:bg-cobalt/25 border-cobalt dark:border-electric ring-2 ring-cobalt/20 dark:ring-electric/30 shadow-sm' 
                      : 'bg-white/80 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border-slate-200/80 dark:border-white/10 hover:border-slate-300'}
                  `}
                >
                  <div className={`
                    w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors
                    ${isSelected ? 'bg-cobalt dark:bg-electric text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}
                  `}>
                    {question.question_type === 'mcq' ? optionLetter : (optIdx === 0 ? 'T' : 'F')}
                  </div>
                  <span className={`text-sm sm:text-base font-medium flex-1 ${isSelected ? 'text-cobalt dark:text-neon-lime font-bold' : 'text-darkText dark:text-slate-200'}`}>
                    {option}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-cobalt dark:text-neon-lime shrink-0" />
                  )}
                </label>
              );
            })}
          </div>
        )}

        {/* Fill in the Blanks */}
        {question.question_type === 'fill_blank' && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400 mb-2">
              Your Answer
            </label>
            <input
              type="text"
              value={currentResponse}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Type the exact word or phrase..."
              className="w-full px-4 py-3 rounded-2xl bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-cobalt text-darkText dark:text-white font-medium text-base shadow-xs"
            />
          </div>
        )}

        {/* Short Answer / Descriptive */}
        {(question.question_type === 'short_answer' || question.question_type === 'descriptive') && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400">
                Your Answer / Explanation
              </label>
              <span className="text-xs text-mutedText dark:text-slate-400">{currentResponse.length} characters</span>
            </div>
            <textarea
              rows={question.question_type === 'descriptive' ? 6 : 4}
              value={currentResponse}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Explain clearly using technical concepts from the study material..."
              className="w-full px-4 py-3.5 rounded-2xl bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-cobalt text-darkText dark:text-white font-normal text-sm leading-relaxed shadow-xs"
            />
          </div>
        )}
      </div>

      {/* Footer Clear Action */}
      {currentResponse && (
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex justify-end">
          <button
            onClick={onClearAnswer}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear response
          </button>
        </div>
      )}
    </div>
  );
};
