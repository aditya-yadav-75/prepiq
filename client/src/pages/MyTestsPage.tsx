import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Play, 
  Award, 
  Trash2, 
  Search, 
  Clock, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api.js';
import { PracticeTest } from '../types/index.js';
import { GlassCard } from '../components/ui/GlassCard.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { LiquidGlassSegmented } from '../components/ui/LiquidGlassSegmented.js';

interface MyTestsPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const MyTestsPage: React.FC<MyTestsPageProps> = ({ onNavigate }) => {
  const [tests, setTests] = useState<PracticeTest[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'not_started'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTests();
      setTests(data);
    } catch (err) {
      console.error('Failed to load tests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (testId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this test?')) return;
    try {
      await api.deleteTest(testId);
      setTests(prev => prev.filter(t => t.test_id !== testId));
    } catch (err) {
      alert('Failed to delete test');
    }
  };

  const filtered = tests.filter(t => {
    const matchesSearch = t.test_title.toLowerCase().includes(search.toLowerCase()) ||
                          t.subject.toLowerCase().includes(search.toLowerCase()) ||
                          t.topic.toLowerCase().includes(search.toLowerCase());
    if (statusFilter === 'completed') return matchesSearch && t.status === 'completed';
    if (statusFilter === 'not_started') return matchesSearch && t.status !== 'completed';
    return matchesSearch;
  });

  const completedCount = tests.filter(t => t.status === 'completed').length;
  const unattemptedCount = tests.filter(t => t.status !== 'completed').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-darkText dark:text-white tracking-tight">
            My Practice Tests
          </h2>
          <p className="text-xs sm:text-sm text-mutedText dark:text-slate-400">
            Reopen completed examinations, review validated answer keys, or retake tests.
          </p>
        </div>

        <Button
          variant="lime"
          size="sm"
          onClick={() => onNavigate('generate')}
          icon={<Sparkles className="w-4 h-4 text-navy-deep" />}
        >
          Generate New Test
        </Button>
      </div>

      {/* Filter & Search Bar with Liquid Glass Segmented Control */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-mutedText dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, subject or topic..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 text-xs sm:text-sm font-medium text-darkText dark:text-white placeholder:text-mutedText dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cobalt"
          />
        </div>

        <LiquidGlassSegmented
          options={[
            { value: 'all', label: `All (${tests.length})` },
            { value: 'completed', label: `Completed (${completedCount})` },
            { value: 'not_started', label: `Unattempted (${unattemptedCount})` }
          ]}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val as any)}
          size="sm"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-mutedText dark:text-slate-400">Loading tests...</div>
      ) : filtered.length === 0 ? (
        <GlassCard className="p-12 text-center space-y-3">
          <FileText className="w-10 h-10 text-cobalt/40 mx-auto" />
          <h4 className="text-base font-bold text-darkText dark:text-white">No matching tests found</h4>
          <p className="text-xs text-mutedText dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search filters or generate a new practice test from your study materials.
          </p>
          <Button variant="lime" size="sm" onClick={() => onNavigate('generate')}>
            Generate Test
          </Button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((test) => {
            const isCompleted = test.status === 'completed';
            return (
              <GlassCard
                key={test.test_id}
                hoverEffect
                className="p-6 flex flex-col justify-between space-y-4 border border-white/90 dark:border-white/10"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="cobalt" size="sm">{test.subject}</Badge>
                      <Badge variant="slate" size="sm" className="capitalize">{test.difficulty}</Badge>
                    </div>
                    {isCompleted ? (
                      <Badge variant="emerald" size="sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Score: {test.latest_score}%
                      </Badge>
                    ) : (
                      <Badge variant="outline" size="sm">Unattempted</Badge>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-darkText dark:text-white leading-snug">
                    {test.test_title}
                  </h3>

                  <p className="text-xs text-mutedText dark:text-slate-400 line-clamp-1">
                    Topic: {test.topic} • Source: {test.document_name || 'Study Notes'}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-mutedText dark:text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {test.total_questions} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {test.time_limit_minutes} mins
                    </span>
                    <span>Prompt {test.prompt_version?.toUpperCase()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/10">
                  <span className="text-[11px] text-mutedText dark:text-slate-400">
                    {new Date(test.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(test.test_id, e)}
                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete test"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {isCompleted ? (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onNavigate('results', { attemptId: test.latest_attempt_id })}
                          icon={<Award className="w-3.5 h-3.5 text-cobalt" />}
                        >
                          Review Key
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onNavigate('test', { testId: test.test_id })}
                          icon={<RotateCcw className="w-3.5 h-3.5" />}
                        >
                          Retake
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="lime"
                        size="sm"
                        onClick={() => onNavigate('test', { testId: test.test_id })}
                        icon={<Play className="w-3.5 h-3.5 text-navy-deep" />}
                      >
                        Start Test
                      </Button>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
