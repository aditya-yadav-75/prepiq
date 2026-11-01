import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  Plus, 
  Play, 
  Award,
  Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { PracticeTest, StudyDocument, PerformanceAnalytics } from '../types/index.js';
import { GlassCard } from '../components/ui/GlassCard.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { ProgressBar } from '../components/ui/ProgressBar.js';

interface DashboardPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<PerformanceAnalytics | null>(null);
  const [tests, setTests] = useState<PracticeTest[]>([]);
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [analyticsData, testsData, docsData] = await Promise.all([
        api.getAnalytics(),
        api.getTests(),
        api.getDocuments()
      ]);
      setAnalytics(analyticsData);
      setTests(testsData);
      setDocuments(docsData);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* QUICK GENERATE BANNER */}
      <div className="rounded-3xl p-6 sm:p-8 liquid-mesh text-white relative overflow-hidden shadow-xl border border-white/20">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-lime/20 border border-neon-lime/40 text-neon-lime text-xs font-black tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI PRACTICE ENGINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ready to generate your next practice examination?
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Upload course lecture notes or select from your uploaded study materials. Customize difficulty, question count, and question formats in seconds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="lime"
              size="md"
              onClick={() => onNavigate('generate')}
              icon={<Sparkles className="w-4 h-4 text-navy-deep" />}
            >
              Generate Practice Test
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => onNavigate('upload')}
              icon={<Upload className="w-4 h-4 text-cobalt dark:text-neon-lime" />}
            >
              Upload Materials
            </Button>
          </div>
        </div>
      </div>

      {/* 4 OVERVIEW METRIC WIDGETS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Widget 1 */}
        <GlassCard hoverEffect className="p-5 sm:p-6 space-y-2">
          <div className="flex items-center justify-between text-mutedText dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Tests Generated</span>
            <div className="w-8 h-8 rounded-xl bg-cobalt/10 dark:bg-cobalt/25 text-cobalt dark:text-neon-lime flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-darkText dark:text-white">
              {analytics?.total_tests_generated ?? 0}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
          </div>
          <p className="text-[11px] text-mutedText dark:text-slate-400">From your study notes</p>
        </GlassCard>

        {/* Widget 2 */}
        <GlassCard hoverEffect className="p-5 sm:p-6 space-y-2">
          <div className="flex items-center justify-between text-mutedText dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Tests Attempted</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-darkText dark:text-white">
              {analytics?.total_tests_attempted ?? 0}
            </span>
            <span className="text-xs font-semibold text-cobalt dark:text-neon-lime">Completed</span>
          </div>
          <p className="text-[11px] text-mutedText dark:text-slate-400">Full assessments submitted</p>
        </GlassCard>

        {/* Widget 3 */}
        <GlassCard hoverEffect className="p-5 sm:p-6 space-y-2">
          <div className="flex items-center justify-between text-mutedText dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Average Score</span>
            <div className="w-8 h-8 rounded-xl bg-neon-lime/20 text-navy-deep flex items-center justify-center">
              <Award className="w-4 h-4 text-cobalt dark:text-neon-lime" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-cobalt dark:text-neon-lime">
              {analytics?.average_score ? `${analytics.average_score}%` : '—'}
            </span>
            {analytics?.average_score ? (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> High
              </span>
            ) : null}
          </div>
          <p className="text-[11px] text-mutedText dark:text-slate-400">Across attempted examinations</p>
        </GlassCard>

        {/* Widget 4 */}
        <GlassCard hoverEffect className="p-5 sm:p-6 space-y-2">
          <div className="flex items-center justify-between text-mutedText dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Questions Practiced</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-darkText dark:text-white">
              {analytics?.questions_practiced ?? 0}
            </span>
            <span className="text-xs font-semibold text-mutedText dark:text-slate-400">Questions</span>
          </div>
          <p className="text-[11px] text-mutedText dark:text-slate-400">
            Accuracy rate: {analytics?.accuracy_rate ?? 0}%
          </p>
        </GlassCard>
      </div>

      {/* MAIN TWO COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 spans): Recent Practice Tests */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-darkText dark:text-white tracking-tight">Recent Practice Tests</h3>
              <p className="text-xs text-mutedText dark:text-slate-400">Ready to attempt or review verified answers</p>
            </div>
            <button
              onClick={() => onNavigate('tests')}
              className="text-xs font-bold text-cobalt dark:text-neon-lime hover:underline flex items-center gap-1"
            >
              View all ({tests.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {tests.length === 0 ? (
            <GlassCard className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cobalt/10 dark:bg-cobalt/25 text-cobalt dark:text-neon-lime mx-auto flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-darkText dark:text-white">No practice tests generated yet</h4>
              <p className="text-xs text-mutedText dark:text-slate-400 max-w-sm mx-auto">
                Generate your first custom test from uploaded course notes to start practicing.
              </p>
              <Button
                variant="lime"
                size="sm"
                onClick={() => onNavigate('generate')}
                icon={<Sparkles className="w-4 h-4 text-navy-deep" />}
              >
                Generate First Test
              </Button>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {tests.slice(0, 4).map((test) => {
                const isCompleted = test.status === 'completed';
                return (
                  <GlassCard
                    key={test.test_id}
                    hoverEffect
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/90 dark:border-white/10"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="cobalt" size="sm">{test.subject}</Badge>
                        <Badge variant="slate" size="sm">{test.difficulty}</Badge>
                        <span className="text-[11px] text-mutedText dark:text-slate-400">
                          Prompt {test.prompt_version?.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-darkText dark:text-white truncate">
                        {test.test_title}
                      </h4>
                      <p className="text-xs text-mutedText dark:text-slate-400 truncate">
                        {test.total_questions} questions • {test.time_limit_minutes} mins • Derived from {test.document_name || 'Study Material'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isCompleted ? (
                        <div className="text-right mr-2 hidden sm:block">
                          <p className="text-xs text-mutedText dark:text-slate-400">Score</p>
                          <p className="text-base font-black text-cobalt dark:text-neon-lime">{test.latest_score}%</p>
                        </div>
                      ) : null}

                      {isCompleted ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onNavigate('results', { attemptId: test.latest_attempt_id })}
                            icon={<Award className="w-3.5 h-3.5 text-cobalt dark:text-neon-lime" />}
                          >
                            Answer Key
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onNavigate('test', { testId: test.test_id })}
                            icon={<Play className="w-3.5 h-3.5" />}
                          >
                            Retake
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="lime"
                          size="sm"
                          onClick={() => onNavigate('test', { testId: test.test_id })}
                          icon={<Play className="w-3.5 h-3.5 text-navy-deep" />}
                        >
                          Take Test
                        </Button>
                      )}
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Uploaded Documents & Subject Accuracy */}
        <div className="space-y-6">
          {/* Study Documents */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-darkText dark:text-white tracking-tight">Study Materials</h3>
              <p className="text-xs text-mutedText dark:text-slate-400">Extracted source notes</p>
            </div>
            <button
              onClick={() => onNavigate('materials')}
              className="text-xs font-bold text-cobalt dark:text-neon-lime hover:underline"
            >
              Manage
            </button>
          </div>

          <GlassCard className="p-5 space-y-4">
            {documents.length === 0 ? (
              <p className="text-xs text-mutedText dark:text-slate-400 text-center py-4">No documents uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {documents.slice(0, 3).map((doc) => (
                  <div 
                    key={doc.id}
                    className="p-3 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/70 dark:border-white/10 space-y-2 hover:border-cobalt/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-darkText dark:text-white truncate">{doc.filename}</p>
                        <p className="text-[10px] text-mutedText dark:text-slate-400 truncate">{doc.subject} • {doc.character_count} chars</p>
                      </div>
                      <Badge variant="emerald" size="sm">Ready</Badge>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => onNavigate('generate', { documentId: doc.id })}
                        className="text-[11px] font-bold text-cobalt dark:text-neon-lime hover:underline flex items-center gap-1"
                      >
                        Generate Exam <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('upload')}
              icon={<Plus className="w-4 h-4" />}
              className="w-full"
            >
              Upload New Document
            </Button>
          </GlassCard>

          {/* Weak Topics Card */}
          {analytics?.weak_topics && analytics.weak_topics.length > 0 && (
            <GlassCard className="p-5 space-y-3 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/40">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Identified Improvement Areas</span>
              </div>
              <div className="space-y-2">
                {analytics.weak_topics.slice(0, 2).map((wt, i) => (
                  <div key={i} className="text-xs space-y-0.5">
                    <p className="font-bold text-darkText dark:text-slate-200">{wt.topic}</p>
                    <p className="text-[11px] text-mutedText dark:text-slate-400 leading-relaxed">{wt.recommendation}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};
