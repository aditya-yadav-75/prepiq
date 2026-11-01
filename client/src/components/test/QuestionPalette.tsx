import React from 'react';
import { Flag } from 'lucide-react';

interface QuestionPaletteProps {
  totalQuestions: number;
  currentIndex: number;
  answers: Record<string, string>;
  flags: Record<string, boolean>;
  questionIds: string[];
  onSelectQuestion: (index: number) => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  totalQuestions,
  currentIndex,
  answers,
  flags,
  questionIds,
  onSelectQuestion
}) => {
  return (
    <div className="glass-card rounded-3xl p-5 border border-white/90 dark:border-white/10 shadow-glass">
      <h4 className="text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400 mb-3">
        Question Palette
      </h4>

      {/* Grid of numbers */}
      <div className="grid grid-cols-5 gap-2">
        {questionIds.map((qId, idx) => {
          const isAnswered = Boolean(answers[qId] && answers[qId].trim().length > 0);
          const isFlagged = Boolean(flags[qId]);
          const isCurrent = currentIndex === idx;

          let btnStyles = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-white/10';
          if (isAnswered) {
            btnStyles = 'bg-cobalt dark:bg-electric text-white border-cobalt dark:border-electric shadow-xs';
          }
          if (isFlagged) {
            btnStyles = 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-bold';
          }
          if (isCurrent) {
            btnStyles += ' ring-2 ring-neon-lime ring-offset-2 dark:ring-offset-slate-900 scale-105';
          }

          return (
            <button
              key={qId}
              onClick={() => onSelectQuestion(idx)}
              className={`
                relative h-10 rounded-xl font-bold text-xs flex items-center justify-center border transition-all duration-150 select-none
                ${btnStyles}
              `}
            >
              <span>{idx + 1}</span>
              {isFlagged && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-1 ring-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 space-y-1.5 text-[11px] font-medium text-mutedText dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-cobalt dark:bg-electric" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-amber-200 dark:bg-amber-700 border border-amber-300 dark:border-amber-600" />
          <span>Marked for review</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
          <span>Unattempted</span>
        </div>
      </div>
    </div>
  );
};
