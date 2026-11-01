import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Upload, 
  BrainCircuit, 
  ShieldCheck, 
  Clock, 
  BarChart3, 
  FileText, 
  ChevronRight,
  BookOpen,
  Award
} from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { GlassCard } from '../components/ui/GlassCard.js';
import { Badge } from '../components/ui/Badge.js';
import { useAuth } from '../context/AuthContext.js';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const handleGenerateClick = () => {
    if (user) {
      onNavigate('generate');
    } else {
      onNavigate('login');
    }
  };

  const handleExploreClick = () => {
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onNavigate(user ? 'workflow' : 'login');
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-24 sm:pt-32 overflow-hidden">
        {/* Ambient liquid glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-cobalt/20 via-electric/15 to-neon-lime/20 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center px-4 space-y-6">
          {/* Eyebrow badge with Liquid Glass theme pill */}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 shadow-xs backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-neon-lime animate-pulse shadow-glow-lime" />
            <span className="text-xs font-bold text-darkText dark:text-slate-200 tracking-wide">Next-Gen Academic Assessment Platform</span>
            <span className="text-cobalt dark:text-neon-lime font-bold text-xs flex items-center gap-0.5">
              PrepIQ 2.0 <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-darkText dark:text-white tracking-tight leading-[1.08]">
            Study smarter.<br />
            <span className="bg-gradient-to-r from-cobalt via-electric to-cobalt dark:from-electric dark:via-neon-lime dark:to-electric bg-clip-text text-transparent">
              Practice sharper.
            </span>
          </h1>

          {/* Supporting Headline & Description */}
          <p className="text-lg sm:text-xl font-bold text-navy-deep dark:text-slate-200 max-w-2xl mx-auto">
            Your study material. Your personal exam generator.
          </p>
          <p className="text-sm sm:text-base text-mutedText dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Turn your notes, PDFs and textbooks into personalised practice exams with AI-generated questions, source-grounded answers, and validated answer keys.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Button
              variant="lime"
              size="lg"
              onClick={handleGenerateClick}
              icon={<Sparkles className="w-5 h-5 text-navy-deep" />}
              className="text-base font-bold shadow-sm"
            >
              Generate Your First Test
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleExploreClick}
              icon={<ArrowRight className="w-4 h-4 text-cobalt dark:text-neon-lime" />}
              className="text-base font-bold"
            >
              Explore Features & Pipeline
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs font-semibold text-mutedText dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Source-Grounded Quality Checks
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Dual-Layer Answer Validation
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Automated Submission Grading
            </span>
          </div>
        </div>

        {/* HERO MOCKUP */}
        <div className="mt-14 max-w-5xl mx-auto px-4 relative">
          {/* Neon lime sticker badge floating freely over top-right corner of mockup without getting clipped by overflow */}
          <div className="absolute -top-6 right-2 sm:-top-8 sm:right-2 z-30 pointer-events-none sm:pointer-events-auto">
            <div className="w-22 h-22 sm:w-26 sm:h-26 rounded-full bg-neon-lime text-navy-deep font-black text-xs flex flex-col items-center justify-center text-center p-2 shadow-glow-lime transform rotate-12 hover:rotate-0 transition-transform select-none border-2 border-white ring-4 ring-navy-deep/20">
              <span className="text-[9px] sm:text-[10px] tracking-wider uppercase font-extrabold">FREE DEMO</span>
              <span className="text-xs sm:text-sm font-black leading-tight">100% READY</span>
              <span className="text-[8px] sm:text-[9px] font-bold tracking-widest text-navy-deep/80">LIVE AI</span>
            </div>
          </div>

          <div className="relative rounded-3xl p-6 sm:p-10 liquid-mesh shadow-2xl overflow-hidden border border-white/20">
            {/* Grid overlay */}
            <div className="absolute inset-0 hero-grid opacity-30 pointer-events-none" />

            {/* Mockup Header */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-white/15 pr-0 sm:pr-24">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neon-lime flex items-center justify-center shadow-glow-lime">
                  <Sparkles className="w-5 h-5 text-navy-deep" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">Virtual Memory & Paging Exam</h3>
                  <p className="text-xs text-white/70">Operating Systems • Generated from uploaded notes • 6 Questions</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30">
                  Version 3 (Grounded)
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-neon-lime text-navy-deep shadow-sm">
                  98% Grounding Score
                </span>
              </div>
            </div>

            {/* Mockup Body: Two Liquid Glass interactive floating cards */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Card 1: Question preview */}
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-glass-heavy rounded-2xl p-6 border border-white/90 dark:border-white/15 shadow-xl text-darkText dark:text-white space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="cobalt" size="sm">Question 1 of 6</Badge>
                  <Badge variant="emerald" size="sm">Medium Difficulty</Badge>
                </div>
                <h4 className="text-base font-bold text-darkText dark:text-white leading-snug">
                  What hardware anomaly occurs when increasing physical frames paradoxically results in more page faults in FIFO replacement?
                </h4>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-cobalt/10 dark:bg-cobalt/30 border-2 border-cobalt dark:border-electric flex items-center justify-between">
                    <span className="text-sm font-bold text-cobalt dark:text-neon-lime">A. Belady's Anomaly</span>
                    <CheckCircle2 className="w-4 h-4 text-cobalt dark:text-neon-lime" />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-600 dark:text-slate-300">
                    B. Thrashing Paradox
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-600 dark:text-slate-300">
                    C. Dijkstra's Inversion
                  </div>
                </div>
              </div>

              {/* Card 2: Validated Answer Key & Source Grounding */}
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-glass-heavy rounded-2xl p-6 border border-white/90 dark:border-white/15 shadow-xl text-darkText dark:text-white space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="lime" size="sm">Validated Answer Key</Badge>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Source Verified
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400">Designated Answer</p>
                  <p className="text-base font-extrabold text-cobalt dark:text-neon-lime mt-0.5">Belady's Anomaly</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 text-xs text-mutedText dark:text-slate-300 leading-relaxed">
                  <span className="font-bold text-darkText dark:text-white">Explanation: </span>
                  FIFO replacement suffers from Belady's Anomaly, where giving more memory frames to a process can counterintuitively cause more page faults. LRU does not suffer because it is a stack algorithm.
                </div>
                <div className="pt-2 border-t border-slate-200/60 dark:border-white/10 flex items-center gap-2 text-xs text-mutedText dark:text-slate-400">
                  <BookOpen className="w-3.5 h-3.5 text-cobalt dark:text-neon-lime" />
                  <span className="font-bold text-darkText dark:text-white">Citation: </span>
                  <span className="italic truncate">Section 5: Page Replacement Algorithms</span>
                </div>
              </div>
            </div>

            {/* Bottom Floating Stats Bar */}
            <div className="relative z-10 mt-8 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-white">
              <div>
                <p className="text-xs text-white/70">Validation Status</p>
                <p className="text-lg font-black text-neon-lime">100% Passed</p>
              </div>
              <div>
                <p className="text-xs text-white/70">MCQ Single-Answer</p>
                <p className="text-lg font-black text-white">Strict Invariant</p>
              </div>
              <div>
                <p className="text-xs text-white/70">Prompt Engineering</p>
                <p className="text-lg font-black text-neon-lime">Version 3 Tested</p>
              </div>
              <div>
                <p className="text-xs text-white/70">Automated Action</p>
                <p className="text-lg font-black text-white">Instant Rubric</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 CORE FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-4 space-y-12 scroll-mt-24">
        <div className="text-center space-y-3">
          <Badge variant="cobalt">Engineered for Academic Excellence</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-darkText dark:text-white tracking-tight">
            Everything you need for comprehensive exam prep
          </h2>
          <p className="text-sm sm:text-base text-mutedText dark:text-slate-400 max-w-xl mx-auto">
            From raw lecture notes to validated examination papers with automated rubric evaluation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <GlassCard hoverEffect className="p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cobalt/10 dark:bg-cobalt/25 flex items-center justify-center text-cobalt dark:text-neon-lime">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-darkText dark:text-white">1. Study Material Upload</h3>
            <p className="text-sm text-mutedText dark:text-slate-400 leading-relaxed">
              Drag and drop PDF, DOCX, or TXT documents. PrepIQ cleans whitespace, extracts key terminology, and rejects empty files.
            </p>
          </GlassCard>

          {/* Feature 2 */}
          <GlassCard hoverEffect className="p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cobalt/10 dark:bg-cobalt/25 flex items-center justify-center text-cobalt dark:text-neon-lime">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-darkText dark:text-white">2. AI Question Generation</h3>
            <p className="text-sm text-mutedText dark:text-slate-400 leading-relaxed">
              Configure difficulty, question count, and formats across MCQs, True/False, Short Answer, Fill-in-blanks, and Descriptive prompts.
            </p>
          </GlassCard>

          {/* Feature 3 */}
          <GlassCard hoverEffect className="p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-neon-lime/30 dark:bg-neon-lime/20 flex items-center justify-center text-navy-deep dark:text-neon-lime">
              <ShieldCheck className="w-6 h-6 text-cobalt dark:text-neon-lime" />
            </div>
            <h3 className="text-xl font-bold text-darkText dark:text-white">3. Validated Answer Keys</h3>
            <p className="text-sm text-mutedText dark:text-slate-400 leading-relaxed">
              Every question is verified against the source text. Duplicate questions are filtered, and source citations are explicitly tagged.
            </p>
          </GlassCard>

          {/* Feature 4 */}
          <GlassCard hoverEffect className="p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cobalt/10 dark:bg-cobalt/25 flex items-center justify-center text-cobalt dark:text-neon-lime">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-darkText dark:text-white">4. Interactive Timed Tests</h3>
            <p className="text-sm text-mutedText dark:text-slate-400 leading-relaxed">
              Practice under real exam conditions with countdown timers, question review flags, answer palettes, and submission confirmations.
            </p>
          </GlassCard>

          {/* Feature 5 */}
          <GlassCard hoverEffect className="p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cobalt/10 dark:bg-cobalt/25 flex items-center justify-center text-cobalt dark:text-neon-lime">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-darkText dark:text-white">5. Performance Analytics</h3>
            <p className="text-sm text-mutedText dark:text-slate-400 leading-relaxed">
              Automated trigger-action workflow grades submissions, pinpoints weak topics, calculates topic accuracy, and updates running stats.
            </p>
          </GlassCard>

          {/* Feature 6 */}
          <GlassCard hoverEffect className="p-7 space-y-4 bg-gradient-to-br from-white to-cobalt/5 dark:from-[#0B1533] dark:to-cobalt/20">
            <div className="w-12 h-12 rounded-2xl bg-cobalt flex items-center justify-center text-neon-lime shadow-md shadow-cobalt/30">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-darkText dark:text-white">Prompt Engineering Lab</h3>
            <p className="text-sm text-mutedText dark:text-slate-400 leading-relaxed">
              Inspect Prompt V1, V2, and V3 side-by-side. Compare latency, relevance, source grounding, and duplicate detection rates live.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-5xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="lime">Four Simple Steps</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-darkText dark:text-white tracking-tight">
            How PrepIQ Works
          </h2>
          <p className="text-sm text-mutedText dark:text-slate-400 max-w-md mx-auto">
            From lecture notes to master-level exam readiness in under 60 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Upload Material',
              desc: 'Upload course PDFs, lecture slides, or paste study notes directly.'
            },
            {
              step: '02',
              title: 'Configure Exam',
              desc: 'Select question types, difficulty levels, target topics, and prompt versions.'
            },
            {
              step: '03',
              title: 'Generate & Validate',
              desc: 'Dual-layer pipeline checks answer support, eliminates duplicates, and cites sources.'
            },
            {
              step: '04',
              title: 'Attempt & Analyze',
              desc: 'Take interactive timed exam with automated grading and weak topic decomposition.'
            }
          ].map((item, idx) => (
            <GlassCard key={idx} className="p-6 relative space-y-3 border border-white/80 dark:border-white/10">
              <span className="text-4xl font-black text-cobalt/20 dark:text-electric/30 select-none">
                {item.step}
              </span>
              <h4 className="text-lg font-bold text-darkText dark:text-white">{item.title}</h4>
              <p className="text-xs text-mutedText dark:text-slate-400 leading-relaxed">{item.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="rounded-3xl p-8 sm:p-12 liquid-mesh text-white text-center space-y-6 relative overflow-hidden shadow-2xl border border-white/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-neon-lime/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white max-w-xl mx-auto">
            Ready to experience AI-powered exam preparation?
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-lg mx-auto">
            Pre-loaded with Computer Systems, Operating Systems, and Machine Learning sample exams for immediate testing.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="lime"
              size="lg"
              onClick={() => onNavigate(user ? 'dashboard' : 'login')}
              icon={<Sparkles className="w-5 h-5 text-navy-deep" />}
              className="font-bold"
            >
              Start Practice Session
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => onNavigate(user ? 'test-suite' : 'login')}
              icon={<ShieldCheck className="w-5 h-5 text-cobalt dark:text-neon-lime" />}
              className="font-bold"
            >
              Run Validation Suite
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto px-4 pt-12 pb-6 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-mutedText dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-darkText dark:text-white">PrepIQ</span>
          <span>• AI Exam Preparation Platform</span>
        </div>
        <div>
          <span className="font-medium">Designed by Aditya Yadav in India.</span>
        </div>
      </footer>
    </div>
  );
};
