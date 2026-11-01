import React, { useEffect, useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCcw, 
  FileText, 
  ShieldCheck, 
  BookOpen, 
  ArrowLeft, 
  AlertTriangle, 
  Sparkles,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '../services/api.js';
import { TestAttempt, PracticeTest, Question } from '../types/index.js';
import { GlassCard } from '../components/ui/GlassCard.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { ProgressBar } from '../components/ui/ProgressBar.js';
import { RubricFeedback } from '../components/test/RubricFeedback.js';

interface ResultsPageProps {
  attemptId: string;
  onNavigate: (page: string, params?: any) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ attemptId, onNavigate }) => {
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [test, setTest] = useState<PracticeTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [showAutomationLog, setShowAutomationLog] = useState(true);

  useEffect(() => {
    loadAttempt();
  }, [attemptId]);

  const loadAttempt = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAttempt(attemptId);
      setAttempt(data.attempt);
      setTest(data.test);
    } catch (err) {
      console.error('Failed to load attempt result:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-cobalt border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-mutedText dark:text-slate-400">Evaluating responses and compiling results...</p>
      </div>
    );
  }

  if (!attempt || !test) {
    return (
      <div className="p-8 text-center space-y-4">
        <h3 className="text-lg font-bold text-darkText dark:text-white">Attempt Not Found</h3>
        <Button variant="secondary" onClick={() => onNavigate('dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const filteredQuestions = test.questions.filter((q) => {
    const ans = attempt.answers[q.question_id];
    if (filterType === 'correct') return ans?.is_correct === true;
    if (filterType === 'incorrect') return ans?.is_correct !== true;
    return true;
  });

  const isPassing = attempt.score_percentage >= 70;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-xs font-bold text-mutedText dark:text-slate-400 hover:text-darkText dark:hover:text-white flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <h2 className="text-2xl sm:text-3xl font-black text-darkText dark:text-white tracking-tight">
            Examination Results & Validated Answer Key
          </h2>
          <p className="text-xs sm:text-sm text-mutedText dark:text-slate-400">
            {test.test_title} • Attempt submitted on {new Date(attempt.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate('test', { testId: test.test_id })}
            icon={<RotateCcw className="w-3.5 h-3.5 text-cobalt dark:text-neon-lime" />}
          >
            Retake Test
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('generate')}
            icon={<Sparkles className="w-3.5 h-3.5 text-neon-lime" />}
          >
            Generate Another Test
          </Button>
        </div>
      </div>

      {/* SCORE SUMMARY BANNER */}
      <div className="rounded-3xl p-6 sm:p-8 liquid-mesh text-white relative overflow-hidden shadow-2xl border border-white/20">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Visual Score Ring */}
            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border-4 border-neon-lime flex flex-col items-center justify-center shrink-0 shadow-glow-lime">
              <span className="text-2xl sm:text-3xl font-black text-white">{attempt.score_percentage}%</span>
              <span className="text-[10px] font-bold text-neon-lime uppercase tracking-wider">
                {isPassing ? 'Proficient' : 'Needs Review'}
              </span>
            </div>

            <div className="space-y-1">
              <Badge variant="lime" size="sm">Automated Evaluation Complete</Badge>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {isPassing ? 'Great performance!' : 'Keep practicing!'}
              </h3>
              <p className="text-xs text-white/80">
                You correctly answered {attempt.correct_answers} out of {attempt.total_questions} questions in {formatTime(attempt.time_taken_seconds)}.
              </p>
            </div>
          </div>

          {/* Stat Pills */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto text-center">
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <p className="text-xl font-black text-neon-lime">{attempt.correct_answers}</p>
              <p className="text-[10px] uppercase font-bold text-white/80">Correct</p>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <p className="text-xl font-black text-rose-300">{attempt.incorrect_answers}</p>
              <p className="text-[10px] uppercase font-bold text-white/80">Incorrect</p>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <p className="text-xl font-black text-white/70">{attempt.unattempted_questions}</p>
              <p className="text-[10px] uppercase font-bold text-white/80">Skipped</p>
            </div>
          </div>
        </div>
      </div>

      {/* AUTOMATED WORKFLOW EXECUTION CARD (Section 8 Requirement) */}
      <GlassCard className="p-6 border border-white/90 dark:border-white/10 shadow-glass space-y-4">
        <div 
          onClick={() => setShowAutomationLog(!showAutomationLog)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neon-lime text-navy-deep flex items-center justify-center shadow-xs">
              <Zap className="w-4 h-4 text-cobalt" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-darkText dark:text-white">Automated Trigger-Action Workflow Result</h4>
                <Badge variant="emerald" size="sm">Execution: {attempt.automation_result.execution_time_ms}ms</Badge>
              </div>
              <p className="text-[11px] text-mutedText dark:text-slate-400">Executed automatically upon test submission (no manual steps required)</p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-darkText dark:hover:text-white">
            {showAutomationLog ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showAutomationLog && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/10">
            {attempt.automation_result.steps.map((st, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-darkText dark:text-slate-200">{st.step}: </span>
                  <span className="text-mutedText dark:text-slate-400">{st.detail}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* TOPIC BREAKDOWN & RECOMMENDATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Topic Breakdown */}
        <GlassCard className="p-6 space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-mutedText dark:text-slate-400">
            Topic Performance Breakdown
          </h4>
          <div className="space-y-3">
            {attempt.topic_breakdown.map((tb, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-darkText dark:text-white">{tb.topic}</span>
                  <span className="font-semibold text-mutedText dark:text-slate-400">{tb.correct}/{tb.total} ({tb.percentage}%)</span>
                </div>
                <ProgressBar progress={tb.percentage} size="sm" variant={tb.percentage >= 70 ? 'cobalt' : 'gradient'} />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Weak Topics & Suggestions */}
        <GlassCard className="p-6 space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-mutedText dark:text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Improvement Recommendations
          </h4>
          <div className="space-y-2.5">
            {attempt.suggestions.map((sug, i) => (
              <div key={i} className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
                {sug}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* VALIDATED ANSWER KEY (Section 5.F Deliverable) */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="lime" size="sm">Mandatory Project Deliverable</Badge>
              <span className="text-xs text-mutedText dark:text-slate-400">• Source Grounded</span>
            </div>
            <h3 className="text-xl font-extrabold text-darkText dark:text-white tracking-tight">
              Validated Answer Key & Source Verifications
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filterType === 'all' ? 'bg-white dark:bg-slate-700 text-darkText dark:text-white shadow-xs' : 'text-mutedText dark:text-slate-400 hover:text-darkText dark:hover:text-white'}`}
            >
              All ({test.questions.length})
            </button>
            <button
              onClick={() => setFilterType('correct')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filterType === 'correct' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs' : 'text-mutedText dark:text-slate-400 hover:text-darkText dark:hover:text-white'}`}
            >
              Correct ({attempt.correct_answers})
            </button>
            <button
              onClick={() => setFilterType('incorrect')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filterType === 'incorrect' ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-400 shadow-xs' : 'text-mutedText dark:text-slate-400 hover:text-darkText dark:hover:text-white'}`}
            >
              Incorrect ({attempt.incorrect_answers + attempt.unattempted_questions})
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((q, qIndex) => {
            const studentAns = attempt.answers[q.question_id];
            const isCorrect = studentAns?.is_correct === true;
            const isUnattempted = !studentAns || !studentAns.student_response;

            return (
              <GlassCard
                key={q.question_id}
                className={`p-6 sm:p-7 border-2 space-y-4 ${
                  isCorrect 
                    ? 'border-emerald-300 dark:border-emerald-700/80 bg-white/90 dark:bg-[#0B1533]/90' 
                    : 'border-rose-200 dark:border-rose-900/60 bg-white/90 dark:bg-[#0B1533]/90'
                }`}
              >
                {/* Header: Question Number, Topic, Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-cobalt dark:bg-electric text-white font-black text-xs flex items-center justify-center">
                      {qIndex + 1}
                    </span>
                    <Badge variant="cobalt" size="sm">{q.topic}</Badge>
                    <Badge variant="slate" size="sm" className="capitalize">{q.difficulty}</Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="slate" size="sm">
                      <ShieldCheck className="w-3.5 h-3.5 text-cobalt dark:text-neon-lime" />
                      {q.validation_status === 'rubric_evaluated' ? 'Rubric Evaluated' : 'Source Verified'}
                    </Badge>

                    {isCorrect ? (
                      <Badge variant="emerald" size="sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Correct
                      </Badge>
                    ) : isUnattempted ? (
                      <Badge variant="slate" size="sm">Unattempted</Badge>
                    ) : (
                      <Badge variant="rose" size="sm">
                        <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> Incorrect
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Question Prompt */}
                <h4 className="text-base font-bold text-darkText dark:text-white leading-relaxed">
                  {q.question_text}
                </h4>

                {/* Answer Options if MCQ */}
                {q.question_type === 'mcq' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, optI) => {
                      const isDesignatedCorrect = opt.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
                      const isStudentChoice = studentAns?.student_response?.trim().toLowerCase() === opt.trim().toLowerCase();

                      let optStyles = 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300';
                      if (isDesignatedCorrect) {
                        optStyles = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-300 font-bold';
                      } else if (isStudentChoice && !isCorrect) {
                        optStyles = 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-300 font-medium';
                      }

                      return (
                        <div key={optI} className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optStyles}`}>
                          <span>{String.fromCharCode(65 + optI)}. {opt}</span>
                          {isDesignatedCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                          {isStudentChoice && !isCorrect && <XCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Submitted Response vs Designated Answer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-mutedText dark:text-slate-400">Your Submitted Response</p>
                    <p className={`text-sm font-semibold mt-0.5 ${isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                      {studentAns?.student_response || <span className="italic text-slate-400">No response provided</span>}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">Designated Correct Answer</p>
                    <p className="text-sm font-bold text-emerald-950 dark:text-emerald-200 mt-0.5">
                      {q.correct_answer}
                    </p>
                  </div>
                </div>

                {/* Explanation */}
                <div className="p-4 rounded-2xl bg-cobalt/5 dark:bg-cobalt/15 border border-cobalt/15 dark:border-cobalt/30 text-xs text-darkText dark:text-slate-200 leading-relaxed space-y-1">
                  <p className="font-bold text-cobalt dark:text-neon-lime flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Conceptual Explanation
                  </p>
                  <p>{q.explanation}</p>
                </div>

                {/* Rubric Feedback for Short Answer / Descriptive */}
                {(q.question_type === 'short_answer' || q.question_type === 'descriptive') && (
                  <RubricFeedback
                    scoreAwarded={studentAns?.score_awarded}
                    criteria={q.rubric_criteria}
                    rubricScores={studentAns?.rubric_scores}
                    sourceReference={q.source_reference}
                  />
                )}

                {/* Source Citation for Objective */}
                {q.question_type !== 'short_answer' && q.question_type !== 'descriptive' && (
                  <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs text-mutedText dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-cobalt dark:text-neon-lime" />
                      <span className="font-semibold text-darkText dark:text-white">Source Citation:</span>
                      <span className="italic">{q.source_reference}</span>
                    </div>
                    {q.validation_reason && (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
                        {q.validation_reason}
                      </span>
                    )}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};
