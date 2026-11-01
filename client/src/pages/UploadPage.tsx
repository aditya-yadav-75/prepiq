import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Sparkles, 
  ArrowRight, 
  FileCode, 
  BookOpen, 
  AlignLeft,
  Copy,
  Layers
} from 'lucide-react';
import { api } from '../services/api.js';
import { StudyDocument } from '../types/index.js';
import { GlassCard } from '../components/ui/GlassCard.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { ProgressBar } from '../components/ui/ProgressBar.js';

interface UploadPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'samples'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSubject, setUploadSubject] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [successDoc, setSuccessDoc] = useState<StudyDocument | null>(null);

  // Paste Tab State
  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteSubject, setPasteSubject] = useState('');
  const [pasteContent, setPasteContent] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setError('');
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'txt', 'md'].includes(ext || '')) {
      setError('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('File size exceeds 15MB limit.');
      return;
    }
    setSelectedFile(file);
    if (!uploadSubject) {
      setUploadSubject(file.name.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' '));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setError('');
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 20, 85));
    }, 200);

    try {
      const doc = await api.uploadFile(selectedFile, uploadSubject);
      clearInterval(interval);
      setUploadProgress(100);
      setSuccessDoc(doc);
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || 'Text extraction failed. Document may be unreadable or empty.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteContent.trim() || pasteContent.trim().length < 50) {
      setError('Pasted text is too brief. Please provide at least 100 characters of study notes.');
      return;
    }
    setIsUploading(true);
    setError('');
    try {
      const doc = await api.saveRawText(
        pasteTitle || 'Pasted Notes',
        pasteSubject || 'General',
        pasteContent
      );
      setSuccessDoc(doc);
    } catch (err: any) {
      setError(err.message || 'Failed to process pasted text.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadSample = (sampleType: 'os' | 'ml') => {
    if (sampleType === 'os') {
      onNavigate('generate', { documentId: 'doc-os-001' });
    } else {
      onNavigate('generate', { documentId: 'doc-ml-002' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-darkText dark:text-white tracking-tight">
          Upload Study Material
        </h2>
        <p className="text-xs sm:text-sm text-mutedText dark:text-slate-400">
          Feed your notes, textbook excerpts or lecture slides into PrepIQ's concept extraction engine.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-white/10">
        <button
          onClick={() => { setActiveTab('upload'); setError(''); setSuccessDoc(null); }}
          className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'upload' 
              ? 'border-cobalt dark:border-neon-lime text-cobalt dark:text-neon-lime' 
              : 'border-transparent text-mutedText dark:text-slate-400 hover:text-darkText dark:hover:text-white'
          }`}
        >
          Upload Document (PDF, DOCX, TXT)
        </button>
        <button
          onClick={() => { setActiveTab('paste'); setError(''); setSuccessDoc(null); }}
          className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'paste' 
              ? 'border-cobalt dark:border-neon-lime text-cobalt dark:text-neon-lime' 
              : 'border-transparent text-mutedText dark:text-slate-400 hover:text-darkText dark:hover:text-white'
          }`}
        >
          Paste Raw Notes
        </button>
        <button
          onClick={() => { setActiveTab('samples'); setError(''); setSuccessDoc(null); }}
          className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'samples' 
              ? 'border-cobalt dark:border-neon-lime text-cobalt dark:text-neon-lime' 
              : 'border-transparent text-mutedText dark:text-slate-400 hover:text-darkText dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cobalt dark:text-neon-lime" />
          Preloaded Demo Samples
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Extraction Warning</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* SUCCESS PREVIEW CARD */}
      {successDoc && (
        <GlassCard className="p-6 sm:p-8 border-2 border-emerald-400 dark:border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-darkText dark:text-white">{successDoc.filename}</h4>
                <p className="text-xs text-mutedText dark:text-slate-400">
                  {successDoc.character_count.toLocaleString()} characters • {successDoc.word_count.toLocaleString()} words extracted
                </p>
              </div>
            </div>
            <Button
              variant="lime"
              size="md"
              onClick={() => onNavigate('generate', { documentId: successDoc.id })}
              icon={<Sparkles className="w-4 h-4 text-navy-deep" />}
            >
              Generate Exam Now
            </Button>
          </div>

          {/* Detected Topics */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400 mb-2">
              Detected Topics & Concepts
            </label>
            <div className="flex flex-wrap gap-2">
              {successDoc.topics.map((t, i) => (
                <Badge key={i} variant="cobalt" size="md">{t}</Badge>
              ))}
            </div>
          </div>

          {/* Extracted Text Preview */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400 mb-2">
              Extracted Text Preview
            </label>
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-darkText dark:text-slate-200 font-mono leading-relaxed max-h-48 overflow-y-auto">
              {successDoc.extracted_text.slice(0, 800)}...
            </div>
          </div>
        </GlassCard>
      )}

      {/* TAB 1: FILE UPLOAD */}
      {activeTab === 'upload' && !successDoc && (
        <div className="space-y-6">
          {/* Drag & Drop Box */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative p-10 sm:p-14 rounded-3xl border-2 border-dashed text-center cursor-pointer transition-all duration-200
              ${isDragging 
                ? 'border-cobalt dark:border-electric bg-cobalt/5 dark:bg-cobalt/20 scale-[0.99]' 
                : 'border-slate-300 dark:border-white/15 hover:border-cobalt/60 dark:hover:border-electric/60 bg-white/70 dark:bg-[#0B1533]/60 hover:bg-white dark:hover:bg-[#0B1533]'}
            `}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.txt,.md"
              className="hidden"
            />
            <div className="w-16 h-16 rounded-3xl bg-cobalt/10 dark:bg-cobalt/25 text-cobalt dark:text-neon-lime mx-auto flex items-center justify-center mb-4">
              <Upload className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-darkText dark:text-white">
              Drag & drop your study material here
            </h4>
            <p className="text-xs text-mutedText dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Supports PDF, DOCX, and TXT files up to 15MB. PrepIQ will extract readable text and detect concept boundaries.
            </p>
            <div className="mt-4">
              <Button variant="secondary" size="sm">
                Browse from Computer
              </Button>
            </div>
          </div>

          {/* Selected File Details */}
          {selectedFile && (
            <GlassCard className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-cobalt dark:text-neon-lime" />
                  <div>
                    <p className="text-sm font-bold text-darkText dark:text-white">{selectedFile.name}</p>
                    <p className="text-xs text-mutedText dark:text-slate-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Text Document'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400 mb-1.5">
                  Subject Name (Optional)
                </label>
                <input
                  type="text"
                  value={uploadSubject}
                  onChange={(e) => setUploadSubject(e.target.value)}
                  placeholder="e.g. Operating Systems, Machine Learning"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-sm font-medium text-darkText dark:text-white focus:ring-2 focus:ring-cobalt focus:outline-none"
                />
              </div>

              {isUploading && (
                <div className="space-y-1.5">
                  <ProgressBar progress={uploadProgress} showLabel size="sm" />
                  <p className="text-[11px] text-mutedText dark:text-slate-400 text-center animate-pulse">
                    Parsing document and identifying concept taxonomy...
                  </p>
                </div>
              )}

              <Button
                variant="primary"
                size="md"
                onClick={handleUpload}
                isLoading={isUploading}
                icon={<Upload className="w-4 h-4" />}
                className="w-full"
              >
                Extract Text & Prepare for Exam Generation
              </Button>
            </GlassCard>
          )}
        </div>
      )}

      {/* TAB 2: PASTE NOTES */}
      {activeTab === 'paste' && !successDoc && (
        <GlassCard className="p-6 sm:p-8 space-y-5">
          <form onSubmit={handlePasteSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400 mb-1.5">
                  Note Title
                </label>
                <input
                  type="text"
                  value={pasteTitle}
                  onChange={(e) => setPasteTitle(e.target.value)}
                  placeholder="e.g. Chapter 4: Database Normalization"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-sm font-medium text-darkText dark:text-white focus:ring-2 focus:ring-cobalt focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  value={pasteSubject}
                  onChange={(e) => setPasteSubject(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-sm font-medium text-darkText dark:text-white focus:ring-2 focus:ring-cobalt focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400">
                  Paste Study Material Content *
                </label>
                <span className="text-xs text-mutedText dark:text-slate-400">{pasteContent.length} characters</span>
              </div>
              <textarea
                rows={10}
                required
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder="Paste your lecture notes, textbook definitions, theorems, and explanations here (minimum 100 characters)..."
                className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs sm:text-sm font-mono text-darkText dark:text-white leading-relaxed focus:ring-2 focus:ring-cobalt focus:outline-none"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isUploading}
              icon={<Sparkles className="w-4 h-4 text-neon-lime" />}
              className="w-full"
            >
              Process Notes & Ready Exam Generator
            </Button>
          </form>
        </GlassCard>
      )}

      {/* TAB 3: PRELOADED DEMO SAMPLES */}
      {activeTab === 'samples' && (
        <div className="space-y-4">
          <p className="text-xs text-mutedText dark:text-slate-400">
            Instant 1-click demonstration materials already verified and ready for testing:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassCard hoverEffect className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="cobalt" size="sm">Computer Science</Badge>
                <span className="text-xs text-mutedText dark:text-slate-400 font-mono">5,820 chars</span>
              </div>
              <h4 className="text-base font-bold text-darkText dark:text-white">
                Operating Systems: Virtual Memory & Paging
              </h4>
              <p className="text-xs text-mutedText dark:text-slate-400 leading-relaxed">
                Covers Address Translation, TLB Caching, Page Fault Handling 6-step workflow, and FIFO, LRU, Optimal page replacement algorithms.
              </p>
              <Button
                variant="lime"
                size="sm"
                onClick={() => handleLoadSample('os')}
                icon={<ArrowRight className="w-3.5 h-3.5 text-navy-deep" />}
                className="w-full"
              >
                Generate Test From OS Notes
              </Button>
            </GlassCard>

            <GlassCard hoverEffect className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="lime" size="sm">Machine Learning</Badge>
                <span className="text-xs text-mutedText dark:text-slate-400 font-mono">5,210 chars</span>
              </div>
              <h4 className="text-base font-bold text-darkText dark:text-white">
                Supervised Learning, Regularization & Metrics
              </h4>
              <p className="text-xs text-mutedText dark:text-slate-400 leading-relaxed">
                Covers Bias-Variance Tradeoff, L1 Lasso sparsity vs L2 Ridge shrinkage, Precision, Recall, F1 harmonic mean, and ROC-AUC curve.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleLoadSample('ml')}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                className="w-full"
              >
                Generate Test From ML Notes
              </Button>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};
