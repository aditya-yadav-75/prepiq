import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  BarChart3, 
  AlertTriangle, 
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api.js';
import { PerformanceAnalytics } from '../types/index.js';
import { GlassCard } from '../components/ui/GlassCard.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { useTheme } from '../context/ThemeContext.js';

interface AnalyticsPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onNavigate }) => {
  const [analytics, setAnalytics] = useState<PerformanceAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-cobalt border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-mutedText dark:text-slate-400">Aggregating persistent assessment performance...</p>
      </div>
    );
  }

  const hasData = analytics && analytics.total_tests_attempted > 0;

  const tooltipStyle = isDark
    ? {
        backgroundColor: '#0B1533',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        color: '#FFFFFF',
        fontSize: '12px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)'
      }
    : {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        color: '#111827',
        fontSize: '12px',
        boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.08)'
      };

  const gridStroke = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="cobalt" size="sm">Persistent Analytics Engine</Badge>
            <span className="text-xs text-mutedText dark:text-slate-400">• Dynamically Computed</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-darkText dark:text-white tracking-tight">
            Student Performance Analytics
          </h2>
          <p className="text-xs sm:text-sm text-mutedText dark:text-slate-400">
            Continuous diagnostic insights aggregated across all attempted examinations and rubric scores.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadAnalytics}
          icon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Refresh Data
        </Button>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <GlassCard hoverEffect className="p-5 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400">Average Score</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-cobalt dark:text-electric">{analytics?.average_score ?? 0}%</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Overall</span>
          </div>
          <p className="text-[11px] text-mutedText dark:text-slate-400">Across {analytics?.total_tests_attempted ?? 0} exam attempts</p>
        </GlassCard>

        <GlassCard hoverEffect className="p-5 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400">Accuracy Rate</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-darkText dark:text-white">{analytics?.accuracy_rate ?? 0}%</span>
            <span className="text-xs font-semibold text-cobalt dark:text-electric">Correct</span>
          </div>
          <p className="text-[11px] text-mutedText dark:text-slate-400">{analytics?.questions_practiced ?? 0} total questions answered</p>
        </GlassCard>

        <GlassCard hoverEffect className="p-5 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400">Exams Generated</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-darkText dark:text-white">{analytics?.total_tests_generated ?? 0}</span>
            <span className="text-xs font-semibold text-mutedText dark:text-slate-400">Tests</span>
          </div>
          <p className="text-[11px] text-mutedText dark:text-slate-400">Tailored from study materials</p>
        </GlassCard>

        <GlassCard hoverEffect className="p-5 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400">Completion Rate</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {analytics && analytics.total_tests_generated > 0 
                ? Math.round((analytics.total_tests_attempted / analytics.total_tests_generated) * 100) 
                : 0}%
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Rate</span>
          </div>
          <p className="text-[11px] text-mutedText dark:text-slate-400">Ratio of generated to attempted</p>
        </GlassCard>
      </div>

      {!hasData ? (
        <GlassCard className="p-12 text-center space-y-3">
          <BarChart3 className="w-12 h-12 text-cobalt/30 dark:text-electric/30 mx-auto" />
          <h4 className="text-lg font-bold text-darkText dark:text-white">No attempt history available</h4>
          <p className="text-xs text-mutedText dark:text-slate-400 max-w-sm mx-auto">
            Complete at least one practice examination to unlock visual score progression and subject mastery charts.
          </p>
          <Button variant="lime" size="sm" onClick={() => onNavigate('dashboard')}>
            View Available Practice Tests
          </Button>
        </GlassCard>
      ) : (
        <div className="space-y-8">
          {/* CHART 1: SCORE PROGRESSION OVER TIME */}
          <GlassCard className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-darkText dark:text-white">Score Progression Over Time</h3>
                <p className="text-xs text-mutedText dark:text-slate-400">Tracking examination scores across successive attempts</p>
              </div>
              <Badge variant="cobalt" size="sm">Score (%)</Badge>
            </div>

            <div className="h-64 sm:h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.score_history} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#245BFF" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#1649E8" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={tooltipStyle}
                    formatter={(val: any) => [`${val}%`, 'Score']}
                  />
                  <Area type="monotone" dataKey="score" stroke="#245BFF" strokeWidth={3} fillOpacity={1} fill="url(#scoreGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* TWO COLUMN CHARTS: SUBJECT ACCURACY & DIFFICULTY BREAKDOWN */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject-wise Performance */}
            <GlassCard className="p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-darkText dark:text-white">Subject-Wise Average Score</h3>
                <p className="text-xs text-mutedText dark:text-slate-400">Mastery level across course domains</p>
              </div>

              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.subject_performance} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                    <XAxis dataKey="subject" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={tooltipStyle}
                      formatter={(val: any) => [`${val}%`, 'Avg Score']}
                    />
                    <Bar dataKey="avg_score" fill="#1649E8" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Difficulty-wise Accuracy */}
            <GlassCard className="p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-darkText dark:text-white">Difficulty-Wise Accuracy</h3>
                <p className="text-xs text-mutedText dark:text-slate-400">Performance by cognitive complexity</p>
              </div>

              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.difficulty_performance} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                    <XAxis dataKey="difficulty" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={tooltipStyle}
                      formatter={(val: any) => [`${val}%`, 'Accuracy']}
                    />
                    <Bar dataKey="percentage" fill="#245BFF" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

          {/* WEAK TOPICS & TARGETED INTERVENTIONS */}
          {analytics.weak_topics && analytics.weak_topics.length > 0 && (
            <GlassCard className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-darkText dark:text-white">Identified Weak Areas & Recommended Focus</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.weak_topics.map((wt, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-darkText dark:text-amber-100">{wt.topic}</p>
                      <Badge variant="rose" size="sm">{wt.incorrect_count} missed questions</Badge>
                    </div>
                    <p className="text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
                      {wt.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
};
