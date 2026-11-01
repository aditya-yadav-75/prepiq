import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api.js';
import { PracticeTest } from '../types/index.js';
import { QuestionCard } from '../components/test/QuestionCard.js';
import { QuestionPalette } from '../components/test/QuestionPalette.js';
import { Timer } from '../components/test/Timer.js';
import { Button } from '../components/ui/Button.js';
import { Modal } from '../components/ui/Modal.js';
import { ProgressBar } from '../components/ui/ProgressBar.js';

interface PracticeTestPageProps {
  testId: string;
  onNavigate: (page: string, params?: any) => void;
}

export const PracticeTestPage: React.FC<PracticeTestPageProps> = ({ testId, onNavigate }) => {
  const [test, setTest] = useState<PracticeTest | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [startedAt, setStartedAt] = useState<string>('');
  const [timeTakenSeconds, setTimeTakenSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTest();
  }, [testId]);

  const loadTest = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTest(testId);
      setTest(data);
      setStartedAt(new Date().toISOString());
    } catch (err: any) {
      setError(err.message || 'Failed to load test.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (val: string) => {
    if (!test) return;
    const currentQ = test.questions[currentIndex];
    setAnswers(prev => ({
      ...prev,
      [currentQ.question_id]: val
    }));
  };

  const handleToggleFlag = () => {
    if (!test) return;
    const currentQ = test.questions[currentIndex];
    setFlags(prev => ({
      ...prev,
      [currentQ.question_id]: !prev[currentQ.question_id]
    }));
  };

  const handleClearAnswer = () => {
    if (!test) return;
    const currentQ = test.questions[currentIndex];
    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQ.question_id];
      return copy;
    });
  };

  const handleFinishExam = async () => {
    if (!test) return;
    setShowConfirmModal(false);
    setIsSubmitting(true);
    try {
      const res = await api.submitTest(test.test_id, {
        started_at: startedAt,
        time_taken_seconds: timeTakenSeconds || 120,
        answers
      });
      onNavigate('results', { attemptId: res.attempt.attempt_id });
    } catch (err: any) {
      setError(err.message || 'Submission error');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-cobalt border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-mutedText dark:text-slate-400">Loading practice examination...</p>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-darkText dark:text-white">Test Not Found</h3>
        <p className="text-xs text-mutedText dark:text-slate-400">{error || 'Could not retrieve test.'}</p>
        <Button variant="secondary" onClick={() => onNavigate('dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const currentQ = test.questions[currentIndex];
  const questionIds = test.questions.map(q => q.question_id);
  const answeredCount = Object.keys(answers).filter(k => answers[k]?.trim().length > 0).length;
  const flaggedCount = Object.values(flags).filter(Boolean).length;
  const unattemptedCount = test.questions.length - answeredCount;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Top Test Header */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border border-white/90 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cobalt dark:text-neon-lime uppercase tracking-wider">{test.subject}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-xs text-mutedText dark:text-slate-400 font-medium">{test.topic}</span>
          </div>
          <h2 className="text-lg font-black text-darkText dark:text-white truncate max-w-md sm:max-w-lg">
            {test.test_title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {test.timed_mode && (
            <Timer
              totalSeconds={test.time_limit_minutes * 60}
              onTimeUp={() => handleFinishExam()}
              onTick={(left) => setTimeTakenSeconds((test.time_limit_minutes * 60) - left)}
            />
          )}
          <Button
            variant="lime"
            size="sm"
            onClick={() => setShowConfirmModal(true)}
            isLoading={isSubmitting}
            icon={<Send className="w-3.5 h-3.5 text-navy-deep" />}
          >
            Submit Test
          </Button>
        </div>
      </div>

      {/* Progress Line */}
      <ProgressBar
        progress={(answeredCount / test.questions.length) * 100}
        showLabel
        size="sm"
      />

      {/* Main Two Columns: Question Card & Question Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Question Card (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <QuestionCard
            question={currentQ}
            currentIndex={currentIndex}
            totalQuestions={test.questions.length}
            currentResponse={answers[currentQ.question_id] || ''}
            isFlagged={Boolean(flags[currentQ.question_id])}
            onAnswerChange={handleAnswerChange}
            onToggleFlag={handleToggleFlag}
            onClearAnswer={handleClearAnswer}
            showDifficulty={test.include_difficulty_labels}
          />

          {/* Bottom Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="secondary"
              size="md"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            {currentIndex < test.questions.length - 1 ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => setCurrentIndex(prev => Math.min(prev + 1, test.questions.length - 1))}
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="lime"
                size="md"
                onClick={() => setShowConfirmModal(true)}
                icon={<Send className="w-4 h-4 text-navy-deep" />}
              >
                Finish & Submit
              </Button>
            )}
          </div>
        </div>

        {/* Right: Question Palette (1 col) */}
        <div className="space-y-4">
          <QuestionPalette
            totalQuestions={test.questions.length}
            currentIndex={currentIndex}
            answers={answers}
            flags={flags}
            questionIds={questionIds}
            onSelectQuestion={(idx) => setCurrentIndex(idx)}
          />

          {/* Quick Summary Pill */}
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/70 dark:border-white/10 text-xs space-y-1.5 text-mutedText dark:text-slate-400">
            <div className="flex justify-between">
              <span>Answered:</span>
              <span className="font-bold text-cobalt dark:text-neon-lime">{answeredCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Flagged for review:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{flaggedCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Remaining:</span>
              <span className="font-bold text-darkText dark:text-white">{unattemptedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRMATION DIALOG BEFORE FINAL SUBMISSION */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Exam Submission"
        maxWidth="md"
      >
        <div className="space-y-5 py-2">
          <p className="text-xs sm:text-sm text-darkText dark:text-slate-200 leading-relaxed">
            Are you sure you want to finish your practice exam? Your responses will be graded instantly against the source notes using our automated evaluation workflow.
          </p>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-cobalt/10 dark:bg-cobalt/25 border border-cobalt/20 dark:border-cobalt/40">
              <p className="text-xl font-black text-cobalt dark:text-neon-lime">{answeredCount}</p>
              <p className="text-[11px] font-semibold text-mutedText dark:text-slate-400">Answered</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <p className="text-xl font-black text-amber-700 dark:text-amber-400">{flaggedCount}</p>
              <p className="text-[11px] font-semibold text-mutedText dark:text-slate-400">Flagged</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10">
              <p className="text-xl font-black text-slate-700 dark:text-slate-300">{unattemptedCount}</p>
              <p className="text-[11px] font-semibold text-mutedText dark:text-slate-400">Unanswered</p>
            </div>
          </div>

          {unattemptedCount > 0 && (
            <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
              Note: You have {unattemptedCount} unattempted questions. They will be marked incorrect in the evaluation.
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" size="md" onClick={() => setShowConfirmModal(false)}>
              Resume Exam
            </Button>
            <Button
              variant="lime"
              size="md"
              onClick={handleFinishExam}
              isLoading={isSubmitting}
              icon={<Send className="w-4 h-4 text-navy-deep" />}
            >
              Yes, Submit Exam
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
