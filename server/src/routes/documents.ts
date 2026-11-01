import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../data/database.js';
import { DocumentExtractor } from '../services/documentExtractor.js';
import { StudyDocument } from '../types/index.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

export const documentsRouter = Router();

const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Sanitize filename to prevent directory traversal or arbitrary characters
    const cleanName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${cleanName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.pdf', '.docx', '.txt', '.md'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, and TXT files are supported.'));
    }
  }
});

// GET all documents for the authenticated user
documentsRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const docs = db.getDocuments(userId);
  res.json({ documents: docs });
});

// GET single document with ownership check
documentsRouter.get('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const docId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const doc = db.getDocument(docId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  // Allow viewing if owned by user or if it is a system sample document
  if (doc.user_id !== req.userId && doc.user_id !== 'system') {
    return res.status(403).json({ error: 'Access denied: You do not have permission to view this document.' });
  }
  res.json({ document: doc });
});

// POST upload file
documentsRouter.post('/upload', requireAuth, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const file = req.file;
    const subject = (req.body.subject as string) || 'General';

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const extraction = await DocumentExtractor.extractFromFile(file.path, file.originalname);

    if (!extraction.is_valid) {
      // Clean up uploaded file
      try { fs.unlinkSync(file.path); } catch (_) {}
      return res.status(422).json({
        error: extraction.error || 'Document processing failed.',
        details: 'The uploaded file could not yield sufficient readable text.'
      });
    }

    const ext = path.extname(file.originalname).toLowerCase().replace('.', '') as 'pdf' | 'docx' | 'txt';

    const newDoc: StudyDocument = {
      id: `doc-${Date.now()}`,
      user_id: userId,
      filename: file.originalname,
      filesize: file.size,
      filetype: ext === 'docx' ? 'docx' : ext === 'pdf' ? 'pdf' : 'txt',
      subject: subject || (extraction.detected_topics[0] || 'General Studies'),
      topics: extraction.detected_topics,
      summary: extraction.summary,
      character_count: extraction.character_count,
      word_count: extraction.word_count,
      extracted_text: extraction.text,
      uploaded_at: new Date().toISOString(),
      status: 'ready',
      test_count: 0
    };

    db.saveDocument(newDoc);

    res.status(201).json({
      success: true,
      document: newDoc,
      message: `Extracted ${newDoc.character_count} characters across ${newDoc.word_count} words.`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'File upload error' });
  }
});

// POST paste text directly
documentsRouter.post('/raw', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { title, subject, content } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Text content is required' });
    }

    const extraction = DocumentExtractor.processExtractedText(content);

    if (!extraction.is_valid) {
      return res.status(422).json({
        error: extraction.error || 'Text is insufficient for exam generation.'
      });
    }

    const newDoc: StudyDocument = {
      id: `doc-${Date.now()}`,
      user_id: userId,
      filename: `${title || 'Pasted_Study_Notes'}.txt`,
      filesize: Buffer.byteLength(content, 'utf-8'),
      filetype: 'txt',
      subject: subject || (extraction.detected_topics[0] || 'General Studies'),
      topics: extraction.detected_topics,
      summary: extraction.summary,
      character_count: extraction.character_count,
      word_count: extraction.word_count,
      extracted_text: extraction.text,
      uploaded_at: new Date().toISOString(),
      status: 'ready',
      test_count: 0
    };

    db.saveDocument(newDoc);

    res.status(201).json({
      success: true,
      document: newDoc,
      message: `Extracted ${newDoc.character_count} characters across ${newDoc.word_count} words.`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error processing raw text' });
  }
});

// DELETE document
documentsRouter.delete('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const docId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const doc = db.getDocument(docId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  if (doc.user_id === 'system') {
    return res.status(403).json({ error: 'System sample materials cannot be deleted.' });
  }
  if (doc.user_id !== req.userId) {
    return res.status(403).json({ error: 'Access denied: You do not have permission to delete this document.' });
  }

  const deleted = db.deleteDocument(docId, req.userId!);
  if (!deleted) {
    return res.status(404).json({ error: 'Document not found or unauthorized' });
  }
  res.json({ success: true, message: 'Document deleted successfully' });
});
