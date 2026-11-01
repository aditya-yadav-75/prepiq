import React from 'react';
import { CheckCircle2, XCircle, FileText, Sparkles, Award } from 'lucide-react';

interface RubricScore {
  criterion: string;
  passed: boolean;
  note?: string;
}

interface RubricFeedbackProps {
  scoreAwarded?: number;
  criteria?: string[];
  rubricScores?: RubricScore[];
  sourceReference: string;
}

export const RubricFeedback: React.FC<RubricFeedbackProps> = ({
  scoreAwarded,
  criteria,
  rubricScores,
  sourceReference
}) => {
  return (
    <div className="mt-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-navy-deep dark:text-neon-lime">
          <Award className="w-4 h-4 text-cobalt dark:text-neon-lime" />
          <span>Transparent Rubric Evaluation</span>
        </div>
        {typeof scoreAwarded === 'number' && (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-cobalt/10 dark:bg-cobalt/30 text-cobalt dark:text-electric">
            Score: {(scoreAwarded * 100).toFixed(0)}%
          </span>
        )}
      </div>

      {/* Criteria Breakdown */}
      {rubricScores && rubricScores.length > 0 ? (
        <div className="space-y-2">
          {rubricScores.map((item, idx) => (
            <div 
              key={idx}
              className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs ${
                item.passed 
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300' 
                  : 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-800/60 text-rose-900 dark:text-rose-300'
              }`}
            >
              {item.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{item.criterion}</p>
                {item.note && <p className="text-[11px] opacity-80 mt-0.5">{item.note}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : criteria && criteria.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-mutedText dark:text-slate-400">Evaluation Checkpoints:</p>
          <ul className="space-y-1 text-xs text-darkText dark:text-slate-200 list-disc list-inside">
            {criteria.map((c, i) => (
              <li key={i} className="leading-snug">{c}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Grounding Source Reference */}
      <div className="pt-2 border-t border-slate-200/60 dark:border-white/10 flex items-center gap-2 text-xs text-mutedText dark:text-slate-400">
        <FileText className="w-3.5 h-3.5 text-cobalt dark:text-neon-lime shrink-0" />
        <span className="font-semibold text-darkText dark:text-white">Source Citation:</span>
        <span className="italic truncate">{sourceReference}</span>
      </div>
    </div>
  );
};
