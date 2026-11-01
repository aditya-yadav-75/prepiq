import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  Cpu
} from 'lucide-react';
import { api } from '../services/api.js';
import { StudyDocument, QuestionType, DifficultyLevel, PromptVersion } from '../types/index.js';
import { GlassCard } from '../components/ui/GlassCard.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Modal } from '../components/ui/Modal.js';
import { ProgressBar } from '../components/ui/ProgressBar.js';
import { LiquidGlassToggle } from '../components/ui/LiquidGlassToggle.js';

interface GeneratorPageProps {
  initialDocumentId?: string;
  onNavigate: (page: string, params?: any) => void;
}

export const GeneratorPage: React.FC<GeneratorPageProps> = ({ initialDocumentId, onNavigate }) => {
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocumentId || '');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(6);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(['mcq', 'true_false', 'short_answer']);
  const [promptVersion, setPromptVersion] = useState<PromptVersion>('v3');
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [includeDifficultyLabels, setIncludeDifficultyLabels] = useState(true);
  const [timedMode, setTimedMode] = useState(true);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);

  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState(0);
  const [error, setError] = useState('');

  const stages = [
    { label: 'Analysing study material', detail: 'Parsing textual taxonomy and headings' },
    { label: 'Extracting key concepts', detail: 'Identifying core propositions and definitions' },
    { label: 'Generating questions', detail: 'Formulating rigorous question stems across selected types' },
    { label: 'Creating answer key', detail: 'Synthesizing ground-truth answers and pedagogical explanations' },
    { label: 'Validating answers', detail: 'Enforcing single-answer MCQ invariant, checking source support & filtering duplicates' },
    { label: 'Preparing your practice test', detail: 'Structuring interactive exam schema and persistence' }
  ];

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    setIsLoadingDocs(true);
    try {
      const docs = await api.getDocuments();
      setDocuments(docs);
      if (docs.length > 0) {
        const targetDoc = initialDocumentId 
          ? docs.find(d => d.id === initialDocumentId) || docs[0]
          : docs[0];
        setSelectedDocId(targetDoc.id);
        setSubject(targetDoc.subject);
        setTopic(targetDoc.topics[0] || 'Comprehensive Syllabus');
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleDocChange = (docId: string) => {
    setSelectedDocId(docId);
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      setSubject(doc.subject);
      setTopic(doc.topics[0] || 'Core Syllabus');
    }
  };

  const toggleQuestionType = (type: QuestionType) => {
    if (questionTypes.includes(type)) {
      if (questionTypes.length > 1) {
        setQuestionTypes(questionTypes.filter(t => t !== type));
      }
    } else {
      setQuestionTypes([...questionTypes, type]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocId) {
      setError('Please select a study document first.');
      return;
    }

    setError('');
    setIsGenerating(true);
    setGenerationStage(0);

    const timer1 = setTimeout(() => setGenerationStage(1), 600);
    const timer2 = setTimeout(() => setGenerationStage(2), 1400);
    const timer3 = setTimeout(() => setGenerationStage(3), 2200);
    const timer4 = setTimeout(() => setGenerationStage(4), 3100);
    const timer5 = setTimeout(() => setGenerationStage(5), 4000);

    try {
      const result = await api.generateTest({
        document_id: selectedDocId,
        subject,
        topic,
        question_count: questionCount,
        difficulty,
        question_types: questionTypes,
        prompt_version: promptVersion,
        include_explanations: includeExplanations,
        include_difficulty_labels: includeDifficultyLabels,
        timed_mode: timedMode,
        time_limit_minutes: timeLimitMinutes
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);

      setGenerationStage(5);
      setTimeout(() => {
        setIsGenerating(false);
        onNavigate('test', { testId: result.test.test_id });
      }, 700);
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      setIsGenerating(false);
      setError(err.message || 'Exam generation failed. Check your study document or parameters.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="lime" size="sm">Core Functional Engine</Badge>
          <span className="text-xs text-mutedText dark:text-slate-400">• Dual-Layer Validated</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-darkText dark:text-white tracking-tight">
          AI Practice Test Generator
        </h2>
        <p className="text-xs sm:text-sm text-mutedText dark:text-slate-400">
          Configure an examination synthesized exclusively from your uploaded study materials.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Generation Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-6">
        {/* SECTION 1: STUDY MATERIAL SELECTION */}
        <GlassCard className="p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-mutedText dark:text-slate-400 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cobalt dark:text-neon-lime" />
            1. Source Study Material
          </h3>

          {isLoadingDocs ? (
            <p className="text-xs text-mutedText dark:text-slate-400">Loading study materials...</p>
          ) : documents.length === 0 ? (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
              <span>No study materials found. Please upload a document first.</span>
              <Button variant="primary" size="sm" onClick={() => onNavigate('upload')}>
                Upload Notes
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documents.map((doc) => {
                const isSelected = selectedDocId === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => handleDocChange(doc.id)}
                    className={`
                      p-4 rounded-2xl border cursor-pointer select-none transition-all
                      ${isSelected 
                        ? 'bg-cobalt/10 dark:bg-cobalt/25 border-cobalt dark:border-electric ring-2 ring-cobalt/20 dark:ring-electric/30 shadow-sm' 
                        : 'bg-white/80 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border-slate-200/80 dark:border-white/10'}
                    `}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-bold truncate ${isSelected ? 'text-cobalt dark:text-neon-lime' : 'text-darkText dark:text-slate-200'}`}>
                          {doc.filename}
                        </p>
                        <p className="text-[11px] text-mutedText dark:text-slate-400 truncate mt-0.5">
                          {doc.subject} • {doc.character_count.toLocaleString()} chars
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-cobalt dark:text-neon-lime shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* SECTION 2: SUBJECT & TOPIC CONFIGURATION */}
        <GlassCard className="p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-mutedText dark:text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cobalt dark:text-neon-lime" />
            2. Scope & Topic Targeting
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400 mb-1.5">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Operating Systems"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-sm font-medium text-darkText dark:text-white focus:ring-2 focus:ring-cobalt focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400 mb-1.5">
                Primary Topic / Syllabus Unit
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Virtual Memory & Paging"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-sm font-medium text-darkText dark:text-white focus:ring-2 focus:ring-cobalt focus:outline-none"
              />
            </div>
          </div>
        </GlassCard>

        {/* SECTION 3: QUESTION COUNT & DIFFICULTY */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-mutedText dark:text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cobalt dark:text-neon-lime" />
            3. Exam Structure & Difficulty
          </h3>

          {/* Question Count Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400 mb-2">
              Number of Questions
            </label>
            <div className="flex flex-wrap gap-2">
              {[5, 6, 10, 15, 20].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setQuestionCount(num)}
                  className={`
                    px-4 py-2 rounded-xl text-xs font-extrabold border transition-all
                    ${questionCount === num 
                      ? 'bg-cobalt dark:bg-electric text-white border-cobalt dark:border-electric shadow-xs' 
                      : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-darkText dark:text-slate-200 border-slate-200 dark:border-white/10'}
                  `}
                >
                  {num} Questions
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400 mb-2">
              Difficulty Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'easy', label: 'Easy', desc: 'Direct recall & terms' },
                { id: 'medium', label: 'Medium', desc: 'Application & mechanisms' },
                { id: 'hard', label: 'Hard', desc: 'Tradeoffs & deep analysis' },
                { id: 'mixed', label: 'Mixed', desc: 'Balanced distribution' }
              ].map((diff) => (
                <button
                  type="button"
                  key={diff.id}
                  onClick={() => setDifficulty(diff.id as DifficultyLevel)}
                  className={`
                    p-3 rounded-2xl text-left border transition-all
                    ${difficulty === diff.id 
                      ? 'bg-cobalt/10 dark:bg-cobalt/25 border-cobalt dark:border-electric ring-2 ring-cobalt/20 shadow-xs' 
                      : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border-slate-200 dark:border-white/10'}
                  `}
                >
                  <p className={`text-xs font-black ${difficulty === diff.id ? 'text-cobalt dark:text-neon-lime' : 'text-darkText dark:text-slate-200'}`}>
                    {diff.label}
                  </p>
                  <p className="text-[10px] text-mutedText dark:text-slate-400 mt-0.5">{diff.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Allowed Formats */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400 mb-2">
              Question Formats (Select Multiple)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'mcq', label: 'Multiple Choice (MCQ)' },
                { id: 'true_false', label: 'True or False' },
                { id: 'short_answer', label: 'Short Answer' },
                { id: 'fill_blank', label: 'Fill in the Blank' },
                { id: 'descriptive', label: 'Descriptive' }
              ].map((fmt) => {
                const isSelected = questionTypes.includes(fmt.id as QuestionType);
                return (
                  <button
                    type="button"
                    key={fmt.id}
                    onClick={() => toggleQuestionType(fmt.id as QuestionType)}
                    className={`
                      p-3 rounded-xl text-left border text-xs font-bold transition-all flex items-center justify-between
                      ${isSelected 
                        ? 'bg-cobalt dark:bg-electric text-white border-cobalt dark:border-electric shadow-xs' 
                        : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-darkText dark:text-slate-200 border-slate-200 dark:border-white/10'}
                    `}
                  >
                    <span>{fmt.label}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </GlassCard>

        {/* SECTION 4: PROMPT VERSIONING & LIQUID GLASS TOGGLERS */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-mutedText dark:text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cobalt dark:text-neon-lime" />
              4. Prompt Engineering & Verification Controls
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('prompts')}
              className="text-xs font-bold text-cobalt dark:text-neon-lime hover:underline"
            >
              Compare Versions in Lab
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'v1',
                title: 'Version 1: Basic',
                badge: 'Baseline',
                desc: 'Straightforward prompt instructions and basic schema adherence.'
              },
              {
                id: 'v2',
                title: 'Version 2: Context-Aware',
                badge: 'Structured',
                desc: 'Topic distribution across text, Bloom cognitive taxonomy.'
              },
              {
                id: 'v3',
                title: 'Version 3: Grounded (Recommended)',
                badge: 'Production-Grade',
                desc: 'Strict source paragraph citations, duplicate filter, and transparent rubric checkpoints.'
              }
            ].map((ver) => (
              <div
                key={ver.id}
                onClick={() => setPromptVersion(ver.id as PromptVersion)}
                className={`
                  p-4 rounded-2xl border cursor-pointer select-none transition-all space-y-1.5
                  ${promptVersion === ver.id 
                    ? 'bg-neon-lime/20 dark:bg-neon-lime/15 border-neon-lime/80 dark:border-neon-lime ring-2 ring-neon-lime/40 shadow-xs' 
                    : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border-slate-200 dark:border-white/10'}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-navy-deep dark:text-white">{ver.title}</span>
                  <Badge variant={ver.id === 'v3' ? 'lime' : 'slate'} size="sm">
                    {ver.badge}
                  </Badge>
                </div>
                <p className="text-[11px] text-mutedText dark:text-slate-400 leading-relaxed">{ver.desc}</p>
              </div>
            ))}
          </div>

          {/* LIQUID GLASS TOGGLERS SECTION */}
          <div className="pt-4 border-t border-slate-100 dark:border-white/10 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400 mb-2">
              Liquid Glass Examination Options
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10">
                <LiquidGlassToggle
                  checked={includeExplanations}
                  onChange={setIncludeExplanations}
                  label="Include Explanations"
                  description="Adds reasoning to answer key"
                  size="md"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10">
                <LiquidGlassToggle
                  checked={includeDifficultyLabels}
                  onChange={setIncludeDifficultyLabels}
                  label="Difficulty Badges"
                  description="Shows Easy / Med / Hard badges"
                  size="md"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10">
                <LiquidGlassToggle
                  checked={timedMode}
                  onChange={setTimedMode}
                  label="Timed Exam Mode"
                  description={`${timeLimitMinutes} min countdown timer`}
                  size="md"
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* PRIMARY SUBMIT BUTTON */}
        <Button
          type="submit"
          variant="lime"
          size="lg"
          icon={<Sparkles className="w-5 h-5 text-navy-deep" />}
          className="w-full text-base shadow-lg shadow-neon-lime/20"
        >
          Generate Practice Test
        </Button>
      </form>

      {/* MULTI-STAGE PROCESSING MODAL */}
      <Modal
        isOpen={isGenerating}
        onClose={() => {}}
        title="Processing Examination Pipeline"
        maxWidth="md"
      >
        <div className="space-y-6 py-2">
          <ProgressBar progress={((generationStage + 1) / stages.length) * 100} size="md" />

          <div className="space-y-3">
            {stages.map((stg, idx) => {
              const isPast = idx < generationStage;
              const isCurrent = idx === generationStage;
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                    isCurrent 
                      ? 'bg-cobalt/10 dark:bg-cobalt/25 border-cobalt dark:border-electric ring-2 ring-cobalt/20' 
                      : isPast 
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800' 
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 opacity-40'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full border-2 border-cobalt dark:border-neon-lime border-t-transparent animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
                    )}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${isCurrent ? 'text-cobalt dark:text-neon-lime' : isPast ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-500'}`}>
                      {stg.label}
                    </p>
                    <p className="text-[10px] text-mutedText dark:text-slate-400">{stg.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-center text-mutedText dark:text-slate-400 italic">
            Adhering to academic integrity instructions: zero hallucination, source-grounded citations.
          </p>
        </div>
      </Modal>
    </div>
  );
};
