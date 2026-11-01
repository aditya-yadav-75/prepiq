import React, { useState } from 'react';
import { 
  Layers, 
  Upload, 
  FileSearch, 
  BrainCircuit, 
  HelpCircle, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  BarChart3, 
  Zap
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';

interface WorkflowDiagramPageProps {
  onNavigate: (page: string) => void;
}

export const WorkflowDiagramPage: React.FC<WorkflowDiagramPageProps> = ({ onNavigate }) => {
  const [selectedStage, setSelectedStage] = useState<number>(0);

  const stages = [
    {
      stage: 1,
      title: 'STAGE 1 — INPUT',
      short: 'Input Ingestion',
      icon: Upload,
      description: 'Student uploads course study material in PDF, TXT, or DOCX formats, or pastes raw lecture notes directly into the application interface.',
      inputs: 'Raw document bytes (.pdf, .docx, .txt)',
      outputs: 'Validated file object and sanitized metadata',
      rules: 'Enforces 15MB file size limit and mime-type validation. Protects backend from corrupt binaries.'
    },
    {
      stage: 2,
      title: 'STAGE 2 — EXTRACTION',
      short: 'Text Extraction',
      icon: FileSearch,
      description: 'DocumentExtractor leverages pdf-parse for PDFs and Mammoth for DOCX, normalizing whitespace and encoding to UTF-8.',
      inputs: 'Sanitized document streams',
      outputs: 'Raw text buffer, character count, and word count',
      rules: 'Enforces MIN_CHARS >= 100 character threshold. Safely intercepts and halts processing on blank or unreadable documents (Test Case 2).'
    },
    {
      stage: 3,
      title: 'STAGE 3 — ANALYSIS',
      short: 'Concept & Topic Analysis',
      icon: BrainCircuit,
      description: 'Scans document structure to identify headings, numbered sections, core propositions ("X is defined as Y"), and topic taxonomies.',
      inputs: 'Cleaned text stream',
      outputs: 'Structured concept pool, topic tags, document summary',
      rules: 'Extracts section citations to serve as the ground truth reference for all downstream questions.'
    },
    {
      stage: 4,
      title: 'STAGE 4 — QUESTION GENERATION',
      short: 'AI Question Generation',
      icon: HelpCircle,
      description: 'Synthesizes questions using Google Gemini API or semantic fallback engine based on Prompt V1, V2, or V3 specifications.',
      inputs: 'Study material text + exam configuration (count, difficulty, types, prompt version)',
      outputs: 'Structured question drafts adhering to JSON schema',
      rules: 'Bloom cognitive taxonomy distribution. MCQ distractor generation derived from adjacent entities in the source text.'
    },
    {
      stage: 5,
      title: 'STAGE 5 — ANSWER GENERATION',
      short: 'Answer & Explanation Generation',
      icon: CheckCircle2,
      description: 'Formulates ground-truth answers, pedagogical explanations, and exact section citations strictly from the text.',
      inputs: 'Draft questions + source document context',
      outputs: 'Correct answers, explanations, exact citations, descriptive grading rubrics',
      rules: 'Strict prohibition on external knowledge injection or speculation.'
    },
    {
      stage: 6,
      title: 'STAGE 6 — DUAL-LAYER VALIDATION',
      short: 'Answer & Grounding Validation',
      icon: ShieldCheck,
      description: 'AnswerValidator executes automated verification checks: single-answer MCQ invariant, Jaccard duplicate detection, and source term overlap.',
      inputs: 'Complete question and answer pairs + raw source text',
      outputs: 'Validation results, grounding score (0-100%), filtered duplicate count, rejected question log',
      rules: 'Rejects questions lacking support. Rejects duplicate questions (> 80% similarity). Ensures answer key matches one distinct MCQ choice.'
    },
    {
      stage: 7,
      title: 'STAGE 7 — OUTPUT & PERSISTENCE',
      short: 'Practice Test Deployment',
      icon: FileText,
      description: 'Packages validated questions into an interactive practice test and stores the schema, answer key, and metadata in persistent storage.',
      inputs: 'Verified questions and validation summary',
      outputs: 'Active PracticeTest object and persistent record',
      rules: 'Assigns unique test_id, calculates recommended time limit, and isolates data by authenticated user ID.'
    },
    {
      stage: 8,
      title: 'STAGE 8 — AUTOMATED EVALUATION',
      short: 'Automated Test Evaluation',
      icon: BarChart3,
      description: 'On student submission, EvaluationEngine triggers an automated workflow: evaluates answers, computes scores, decomposes weak topics, and updates dashboard metrics.',
      inputs: 'Student responses + validated answer key',
      outputs: 'TestAttempt record, topic performance breakdown, weak area suggestions, telemetry log',
      rules: 'Verifiable execution result with zero manual calculation required by the student.'
    }
  ];

  const current = stages[selectedStage];
  const Icon = current.icon;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-darkText dark:text-white tracking-tight">
            System Workflow & Architecture
          </h2>
          <p className="text-xs sm:text-sm text-mutedText dark:text-slate-400 mt-1">
            Explore the complete processing pipeline from study material ingestion to automated examination evaluation.
          </p>
        </div>

        <Button
          variant="lime"
          size="sm"
          onClick={() => onNavigate('generate')}
          icon={<Zap className="w-3.5 h-3.5 text-navy-deep" />}
        >
          Execute Live Pipeline
        </Button>
      </div>

      {/* HORIZONTAL WORKFLOW STAGE BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {stages.map((stg, idx) => {
          const StgIcon = stg.icon;
          const isSelected = selectedStage === idx;
          return (
            <button
              key={stg.stage}
              onClick={() => setSelectedStage(idx)}
              className={`
                p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-2 select-none
                ${isSelected 
                  ? 'bg-cobalt text-white border-cobalt ring-2 ring-cobalt/20 shadow-md scale-105' 
                  : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-darkText dark:text-white border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'}
              `}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-neon-lime text-navy-deep' : 'bg-slate-100 dark:bg-slate-700 text-cobalt dark:text-electric'}`}>
                <StgIcon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                Step 0{stg.stage}
              </span>
              <span className={`text-[11px] font-extrabold leading-tight ${isSelected ? 'text-white' : 'text-darkText dark:text-white'}`}>
                {stg.short}
              </span>
            </button>
          );
        })}
      </div>

      {/* ACTIVE STAGE DETAIL CARD */}
      <GlassCard className="p-8 sm:p-10 border-2 border-cobalt/30 space-y-6 shadow-glass">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cobalt text-neon-lime flex items-center justify-center shadow-md shadow-cobalt/30">
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-black uppercase text-cobalt dark:text-electric tracking-wider">
                Pipeline Stage 0{current.stage} of 08
              </span>
              <h3 className="text-2xl font-black text-darkText dark:text-white tracking-tight">{current.title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={selectedStage === 0}
              onClick={() => setSelectedStage(prev => Math.max(prev - 1, 0))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-darkText dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 transition-colors"
            >
              Previous Stage
            </button>
            <button
              disabled={selectedStage === stages.length - 1}
              onClick={() => setSelectedStage(prev => Math.min(prev + 1, stages.length - 1))}
              className="px-3 py-1.5 rounded-xl bg-cobalt text-white text-xs font-bold hover:bg-cobalt-hover disabled:opacity-30 transition-colors"
            >
              Next Stage
            </button>
          </div>
        </div>

        <p className="text-base text-darkText dark:text-slate-200 leading-relaxed">
          {current.description}
        </p>

        {/* 3 Detail Boxes: Inputs, Outputs, Invariants */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-mutedText dark:text-slate-400">Stage Input Payload</p>
            <p className="text-xs font-semibold text-darkText dark:text-white leading-relaxed">{current.inputs}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-mutedText dark:text-slate-400">Stage Output Yield</p>
            <p className="text-xs font-semibold text-cobalt dark:text-electric leading-relaxed">{current.outputs}</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">Validation Invariant</p>
            <p className="text-xs font-semibold text-emerald-950 dark:text-emerald-200 leading-relaxed">{current.rules}</p>
          </div>
        </div>
      </GlassCard>

      {/* AUTOMATION TRIGGER-ACTION SPECIFICATION */}
      <GlassCard className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-cobalt dark:text-neon-lime" />
          <h3 className="text-lg font-bold text-darkText dark:text-white">Automated Evaluation Pipeline: Trigger-Action Workflow</h3>
        </div>
        <p className="text-xs sm:text-sm text-mutedText dark:text-slate-400 leading-relaxed">
          PrepIQ implements an automated end-to-end evaluation workflow. Upon test submission, the system triggers a 5-step automated sequence that evaluates submitted answers against objective keys and rubric criteria, recalculates scores, decomposes weak topics, commits results to persistent storage, and refreshes the student's dashboard analytics without any manual intervention.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2 text-center text-xs">
          {[
            '1. Evaluate Responses',
            '2. Calculate Score',
            '3. Identify Weak Topics',
            '4. Persist Attempt',
            '5. Refresh Analytics'
          ].map((step, i) => (
            <div key={i} className="p-3 rounded-xl bg-cobalt/10 dark:bg-cobalt/20 border border-cobalt/20 dark:border-electric/30 font-bold text-cobalt dark:text-electric">
              {step}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
