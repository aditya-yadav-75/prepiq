import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Upload, 
  Trash2, 
  Eye, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api.js';
import { StudyDocument } from '../types/index.js';
import { GlassCard } from '../components/ui/GlassCard.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { Modal } from '../components/ui/Modal.js';

interface StudyMaterialsPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const StudyMaterialsPage: React.FC<StudyMaterialsPageProps> = ({ onNavigate }) => {
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<StudyDocument | null>(null);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDocuments();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.deleteDocument(docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (err) {
      alert('Failed to delete document');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-darkText dark:text-white tracking-tight">
            Study Materials Library
          </h2>
          <p className="text-xs sm:text-sm text-mutedText dark:text-slate-400">
            All extracted notes, lecture PDFs, and reference materials available for exam generation.
          </p>
        </div>

        <Button
          variant="lime"
          size="sm"
          onClick={() => onNavigate('upload')}
          icon={<Upload className="w-4 h-4 text-navy-deep" />}
        >
          Upload New Material
        </Button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-mutedText dark:text-slate-400">Loading study documents...</div>
      ) : documents.length === 0 ? (
        <GlassCard className="p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-cobalt/40 mx-auto" />
          <h4 className="text-base font-bold text-darkText dark:text-white">No study materials stored yet</h4>
          <p className="text-xs text-mutedText dark:text-slate-400 max-w-sm mx-auto">
            Upload course notes, textbook chapters, or lecture slides to enable AI practice test creation.
          </p>
          <Button variant="primary" size="sm" onClick={() => onNavigate('upload')}>
            Upload First Document
          </Button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <GlassCard
              key={doc.id}
              hoverEffect
              className="p-6 flex flex-col justify-between space-y-4 border border-white/90 dark:border-white/10"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="cobalt" size="sm" className="uppercase font-mono">
                    {doc.filetype}
                  </Badge>
                  <Badge variant="emerald" size="sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Ready
                  </Badge>
                </div>

                <div>
                  <h3 className="text-base font-bold text-darkText dark:text-white truncate" title={doc.filename}>
                    {doc.filename}
                  </h3>
                  <p className="text-xs font-semibold text-cobalt dark:text-electric mt-0.5">
                    {doc.subject}
                  </p>
                </div>

                <div className="space-y-1 text-xs text-mutedText dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Characters:</span>
                    <span className="font-semibold text-darkText dark:text-white">{doc.character_count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Words:</span>
                    <span className="font-semibold text-darkText dark:text-white">{doc.word_count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Generated Tests:</span>
                    <span className="font-semibold text-darkText dark:text-white">{doc.test_count || 0}</span>
                  </div>
                </div>

                {doc.topics && doc.topics.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-mutedText dark:text-slate-400 mb-1.5">
                      Extracted Concepts
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {doc.topics.slice(0, 3).map((t, i) => (
                        <span key={i} className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                          {t}
                        </span>
                      ))}
                      {doc.topics.length > 3 && (
                        <span className="text-[10px] text-mutedText dark:text-slate-400">+{doc.topics.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="p-2 text-slate-400 dark:text-slate-400 hover:text-cobalt dark:hover:text-electric hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                    title="Preview extracted text"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-slate-400 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Button
                  variant="lime"
                  size="sm"
                  onClick={() => onNavigate('generate', { documentId: doc.id })}
                  icon={<Sparkles className="w-3.5 h-3.5 text-navy-deep" />}
                >
                  Generate Test
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      <Modal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.filename || 'Document Content Preview'}
        maxWidth="xl"
      >
        {previewDoc && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-xs text-darkText dark:text-slate-200">
              <span><strong>Subject:</strong> {previewDoc.subject}</span>
              <span><strong>Length:</strong> {previewDoc.character_count.toLocaleString()} chars</span>
              <span><strong>Uploaded:</strong> {new Date(previewDoc.uploaded_at).toLocaleDateString()}</span>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400 mb-1.5">Summary</p>
              <p className="text-xs text-darkText dark:text-slate-200 leading-relaxed bg-white/70 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-white/10">
                {previewDoc.summary || 'Summary generated during concept analysis.'}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400 mb-1.5">Extracted Text Content</p>
              <div className="p-4 rounded-xl bg-slate-900 dark:bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap border border-slate-800">
                {previewDoc.extracted_text}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="lime"
                size="md"
                onClick={() => {
                  const id = previewDoc.id;
                  setPreviewDoc(null);
                  onNavigate('generate', { documentId: id });
                }}
                icon={<Sparkles className="w-4 h-4 text-navy-deep" />}
              >
                Generate Exam From This Document
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
