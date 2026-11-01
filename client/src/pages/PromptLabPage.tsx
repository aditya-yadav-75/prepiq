import React, { useState } from 'react';
import { 
  Code2, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  BarChart3, 
  ShieldCheck, 
  Copy, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api.js';
import { PromptComparisonResult } from '../types/index.js';
import { GlassCard } from '../components/ui/GlassCard.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { ProgressBar } from '../components/ui/ProgressBar.js';
import { LiquidGlassSegmented } from '../components/ui/LiquidGlassSegmented.js';

interface PromptLabPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const PromptLabPage: React.FC<PromptLabPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'comparison' | 'versions' | 'system_prompt'>('comparison');
  const [comparisons, setComparisons] = useState<PromptComparisonResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const handleRunComparison = async () => {
    setIsRunning(true);
    try {
      const data = await api.comparePrompts();
      setComparisons(data.comparisons);
      setHasRun(true);
    } catch (err) {
      console.error('Failed to run prompt comparison:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const systemPromptText = `You are PrepIQ, an academic examination question generator and educational assessment assistant.

Your task is to generate high-quality examination practice questions exclusively from the study material supplied by the user.

Instructions:
1. Carefully analyse the entire supplied study material.
2. Identify important concepts, definitions, processes, facts and relationships.
3. Generate questions that accurately represent the supplied content.
4. Follow the requested question count and question formats.
5. Respect the selected difficulty level.
6. Generate clear and unambiguous questions.
7. For MCQs, provide four plausible answer options.
8. Ensure exactly one correct answer for single-answer MCQs.
9. Generate a correct answer and a meaningful explanation for each question.
10. Provide a source reference such as a page number, heading or section wherever available.
11. Never invent information that is not supported by the supplied study material.
12. Do not create duplicate or substantially similar questions.
13. Avoid questions that cannot be answered from the supplied content.
14. If the source material is insufficient, explicitly report the limitation.
15. Return the result in the required structured JSON format.

Academic integrity and factual accuracy are more important than question quantity.`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="lime" size="sm">Academic Rubric Criteria 2 (5 Marks)</Badge>
            <span className="text-xs text-mutedText dark:text-slate-400">• Three Tested Versions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-darkText dark:text-white tracking-tight">
            Prompt Engineering & Evaluation Lab
          </h2>
          <p className="text-xs sm:text-sm text-mutedText dark:text-slate-400">
            Inspect system prompts, task decomposition architectures, and side-by-side prompt version benchmark comparisons.
          </p>
        </div>

        <Button
          variant="lime"
          size="sm"
          onClick={handleRunComparison}
          isLoading={isRunning}
          icon={<Play className="w-3.5 h-3.5 text-navy-deep" />}
        >
          Run Multi-Version Comparison
        </Button>
      </div>

      {/* Tabs with Liquid Glass Segmented Control */}
      <div className="flex justify-start">
        <LiquidGlassSegmented
          options={[
            { value: 'comparison', label: 'Side-by-Side Comparison' },
            { value: 'versions', label: 'Version Specs (V1, V2, V3)' },
            { value: 'system_prompt', label: 'PrepIQ System Prompt' }
          ]}
          value={activeTab}
          onChange={(val) => setActiveTab(val as any)}
          size="md"
        />
      </div>

      {/* TAB 1: SIDE BY SIDE COMPARISON */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {!hasRun ? (
            <GlassCard className="p-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-neon-lime/20 text-navy-deep mx-auto flex items-center justify-center">
                <Code2 className="w-7 h-7 text-cobalt dark:text-neon-lime" />
              </div>
              <h3 className="text-xl font-bold text-darkText dark:text-white">
                Compare Prompt V1, V2, and V3 Side-by-Side
              </h3>
              <p className="text-xs sm:text-sm text-mutedText dark:text-slate-400 max-w-lg mx-auto">
                Executes the three prompt architectures on identical study notes to evaluate question relevance, answer accuracy, source grounding, duplicate detection, and output consistency.
              </p>
              <Button
                variant="lime"
                size="md"
                onClick={handleRunComparison}
                isLoading={isRunning}
                icon={<Play className="w-4 h-4 text-navy-deep" />}
              >
                Execute Comparison Benchmark
              </Button>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {comparisons.map((comp) => {
                const isV3 = comp.version === 'v3';
                return (
                  <GlassCard
                    key={comp.version}
                    className={`p-6 flex flex-col justify-between space-y-5 border-2 ${
                      isV3 
                        ? 'border-cobalt dark:border-electric bg-white/95 dark:bg-slate-850/95 shadow-xl ring-2 ring-cobalt/10' 
                        : 'border-white/90 dark:border-white/10 bg-white/80 dark:bg-slate-850/70'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant={isV3 ? 'lime' : 'slate'} size="sm">
                          {comp.version.toUpperCase()}
                        </Badge>
                        <span className="text-xs font-mono text-mutedText dark:text-slate-400">
                          Latency: {comp.latency_ms}ms
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-black text-darkText dark:text-white">{comp.name}</h4>
                        <p className="text-xs text-mutedText dark:text-slate-400 mt-1 leading-relaxed">
                          {comp.description}
                        </p>
                      </div>

                      {/* 5 Core Metrics */}
                      <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-white/10">
                        <div>
                          <div className="flex justify-between text-[11px] font-bold text-darkText dark:text-white mb-1">
                            <span>Question Relevance</span>
                            <span className="text-cobalt dark:text-electric">{comp.metrics.relevance_score}%</span>
                          </div>
                          <ProgressBar progress={comp.metrics.relevance_score} size="sm" variant="cobalt" />
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-bold text-darkText dark:text-white mb-1">
                            <span>Answer Accuracy</span>
                            <span className="text-cobalt dark:text-electric">{comp.metrics.accuracy_score}%</span>
                          </div>
                          <ProgressBar progress={comp.metrics.accuracy_score} size="sm" variant="cobalt" />
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-bold text-darkText dark:text-white mb-1">
                            <span>Source Grounding</span>
                            <span className="text-emerald-600 dark:text-emerald-400">{comp.metrics.source_grounding}%</span>
                          </div>
                          <ProgressBar progress={comp.metrics.source_grounding} size="sm" variant={comp.metrics.source_grounding >= 90 ? 'lime' : 'cobalt'} />
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-bold text-darkText dark:text-white mb-1">
                            <span>Duplicate Detection</span>
                            <span className="text-darkText dark:text-white">{comp.metrics.duplicate_detection_rate}%</span>
                          </div>
                          <ProgressBar progress={comp.metrics.duplicate_detection_rate} size="sm" variant="cobalt" />
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-bold text-darkText dark:text-white mb-1">
                            <span>Output Consistency</span>
                            <span className="text-cobalt dark:text-electric">{comp.metrics.consistency_score}%</span>
                          </div>
                          <ProgressBar progress={comp.metrics.consistency_score} size="sm" variant="cobalt" />
                        </div>
                      </div>

                      {/* Generated Sample Question */}
                      {comp.questions && comp.questions.length > 0 && (
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-xs space-y-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-mutedText dark:text-slate-400">Generated Sample Output</p>
                          <p className="font-semibold text-darkText dark:text-white">{comp.questions[0].question_text}</p>
                          <p className="text-[11px] text-cobalt dark:text-electric font-bold">Answer: {comp.questions[0].correct_answer}</p>
                          <p className="text-[10px] text-mutedText dark:text-slate-400 italic">{comp.questions[0].source_reference}</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex justify-end">
                      <Button
                        variant={isV3 ? 'lime' : 'secondary'}
                        size="sm"
                        onClick={() => onNavigate('generate')}
                        className="w-full"
                      >
                        Use {comp.version.toUpperCase()} in Generator
                      </Button>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SPECIFICATIONS */}
      {activeTab === 'versions' && (
        <div className="space-y-6">
          {[
            {
              version: 'Version 1',
              title: 'Basic Question Generation',
              badge: 'Baseline',
              focus: 'Rapid factual recall from direct paragraphs.',
              decomposition: 'Single-stage prompt instructing model on question count and simple JSON formatting.',
              schema: 'Generates question_text, options, correct_answer, explanation.',
              tradeoffs: 'High generation speed; however, lacks explicit duplicate checks or paragraph grounding.'
            },
            {
              version: 'Version 2',
              title: 'Context-Aware Generation with Topic Distribution & Difficulty Control',
              badge: 'Structured',
              focus: 'Bloom\'s cognitive taxonomy progression with even topic coverage.',
              decomposition: 'Deconstructs source notes into topic taxonomies. Allocates questions proportionally across sections. Enforces distractor plausibility constraints for MCQs.',
              schema: 'Adds cognitive difficulty labeling, section topic mapping, and misconception-based MCQ distractors.',
              tradeoffs: 'Significantly higher conceptual diversity and balanced difficulty; moderate token payload.'
            },
            {
              version: 'Version 3',
              title: 'Enhanced Generation with Source Grounding, Duplicate Detection & Answer Validation (Production)',
              badge: 'Production-Grade (Recommended)',
              focus: 'Rigorous zero-hallucination verification, dual-layer validation, and transparent rubric criteria.',
              decomposition: 'Three-layer prompt execution requiring exact heading/paragraph citations, pairwise Jaccard duplicate rejection, single-answer MCQ invariant checks, and descriptive rubric criteria.',
              schema: 'Includes question_id, question_text, question_type, topic, difficulty, options, correct_answer, explanation, source_reference, validation_status, validation_reason, rubric_criteria.',
              tradeoffs: 'Highest academic fidelity and auditability; zero unsupported assertions.'
            }
          ].map((v, i) => (
            <GlassCard key={i} className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-cobalt text-white">{v.version}</span>
                  <h3 className="text-lg font-bold text-darkText dark:text-white">{v.title}</h3>
                </div>
                <Badge variant={i === 2 ? 'lime' : 'slate'} size="sm">{v.badge}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 space-y-1">
                  <p className="font-bold text-darkText dark:text-white uppercase tracking-wider text-[10px]">Architectural Focus</p>
                  <p className="text-mutedText dark:text-slate-400 leading-relaxed">{v.focus}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 space-y-1">
                  <p className="font-bold text-darkText dark:text-white uppercase tracking-wider text-[10px]">Task Decomposition</p>
                  <p className="text-mutedText dark:text-slate-400 leading-relaxed">{v.decomposition}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 space-y-1">
                  <p className="font-bold text-darkText dark:text-white uppercase tracking-wider text-[10px]">JSON Schema Features</p>
                  <p className="text-mutedText dark:text-slate-400 leading-relaxed">{v.schema}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 space-y-1">
                  <p className="font-bold text-darkText dark:text-white uppercase tracking-wider text-[10px]">Evaluation Trade-offs</p>
                  <p className="text-mutedText dark:text-slate-400 leading-relaxed">{v.tradeoffs}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* TAB 3: SYSTEM PROMPT */}
      {activeTab === 'system_prompt' && (
        <GlassCard className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-darkText dark:text-white">Main PrepIQ System Prompt</h3>
              <p className="text-xs text-mutedText dark:text-slate-400">Injected into all Gemini API requests and local semantic parsers</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(systemPromptText);
                alert('System prompt copied to clipboard!');
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-darkText dark:text-white flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Prompt
            </button>
          </div>

          <pre className="p-5 rounded-2xl bg-slate-900 dark:bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-96 border border-slate-800">
            {systemPromptText}
          </pre>
        </GlassCard>
      )}
    </div>
  );
};
