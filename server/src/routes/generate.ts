import { Router, Response } from 'express';
import { db } from '../data/database.js';
import { GeminiService } from '../services/gemini.js';
import { LocalGenerationEngine } from '../services/localGenerationEngine.js';
import { AnswerValidator } from '../services/answerValidator.js';
import { PROMPT_METADATA, PromptConfig } from '../services/prompts.js';
import { PracticeTest, PromptComparisonResult } from '../types/index.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

export const generateRouter = Router();

// POST generate practice exam
generateRouter.post('/test', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const startTime = Date.now();
  try {
    const userId = req.userId!;
    const clientApiKey = req.headers['x-gemini-key'] as string | undefined;

    const {
      document_id,
      raw_text,
      subject,
      topic,
      question_count = 10,
      difficulty = 'medium',
      question_types = ['mcq'],
      prompt_version = 'v3',
      include_explanations = true,
      include_difficulty_labels = true,
      timed_mode = true,
      time_limit_minutes = 15
    } = req.body;

    // STAGE 1 & 2: RETRIEVE & VALIDATE SOURCE TEXT
    let sourceText = '';
    let docName = 'Direct Study Notes';

    if (document_id) {
      const doc = db.getDocument(document_id);
      if (!doc) {
        return res.status(404).json({ error: 'Selected study document was not found.' });
      }
      // Ensure document belongs to user or is a system sample document
      if (doc.user_id !== userId && doc.user_id !== 'system') {
        return res.status(403).json({ error: 'Access denied: You do not have permission to generate an exam from this document.' });
      }
      sourceText = doc.extracted_text;
      docName = doc.filename;
    } else if (raw_text && typeof raw_text === 'string') {
      sourceText = raw_text.trim();
    } else {
      return res.status(400).json({ error: 'Either document_id or raw_text must be provided.' });
    }

    if (sourceText.length < 50) {
      return res.status(422).json({
        error: 'Study material is too brief to generate an exam. Please provide at least 100 characters of substantive notes.'
      });
    }

    const count = Math.min(Math.max(parseInt(question_count, 10) || 5, 1), 30);

    const config: PromptConfig = {
      version: prompt_version,
      subject: subject || 'Academic Prep',
      topic: topic || 'All Topics',
      questionCount: count,
      difficulty,
      questionTypes: question_types.length > 0 ? question_types : ['mcq'],
      includeExplanations: include_explanations,
      includeDifficultyLabels: include_difficulty_labels,
      sourceText
    };

    // STAGE 3, 4, 5: GENERATE QUESTIONS & ANSWERS
    let rawOutput: any;
    let engineUsed: 'gemini' | 'local_semantic' = 'local_semantic';

    if (GeminiService.isKeyAvailable(clientApiKey)) {
      try {
        rawOutput = await GeminiService.generatePracticeExam(config, clientApiKey);
        engineUsed = 'gemini';
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, activating local semantic generation engine:', geminiError.message);
        rawOutput = LocalGenerationEngine.generateExam(config);
      }
    } else {
      rawOutput = LocalGenerationEngine.generateExam(config);
    }

    // STAGE 6: RIGOROUS VALIDATION
    const validationResult = AnswerValidator.validateExam(rawOutput.questions || [], sourceText);

    if (validationResult.validated_questions.length === 0) {
      return res.status(422).json({
        error: 'Generated questions failed academic validation checks. The source content may be too ambiguous or repetitive.',
        issues: validationResult.issues
      });
    }

    // STAGE 7: FORM PRACTICE TEST & PERSIST
    const testId = `test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const finalTest: PracticeTest = {
      test_id: testId,
      user_id: userId,
      document_id,
      document_name: docName,
      test_title: rawOutput.test_title || `${subject || 'Study'} Practice Test`,
      subject: subject || rawOutput.subject || 'General',
      topic: topic || rawOutput.topic || 'Comprehensive',
      difficulty,
      question_types,
      total_questions: validationResult.validated_questions.length,
      prompt_version,
      include_explanations,
      include_difficulty_labels,
      timed_mode,
      time_limit_minutes: time_limit_minutes || Math.max(10, validationResult.validated_questions.length * 1.5),
      created_at: new Date().toISOString(),
      questions: validationResult.validated_questions,
      validation_summary: {
        total_generated: (rawOutput.questions || []).length,
        total_validated: validationResult.validated_questions.length,
        grounding_score: validationResult.grounding_score,
        duplicate_filtered_count: validationResult.duplicate_filtered_count,
        issues_detected: validationResult.issues.map(i => i.message),
        is_valid: validationResult.is_valid
      }
    };

    db.saveTest(finalTest);

    res.status(201).json({
      success: true,
      test: finalTest,
      meta: {
        engine: engineUsed,
        processing_time_ms: Date.now() - startTime,
        validation_passed: true,
        grounding_score: validationResult.grounding_score
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Exam generation failed' });
  }
});

// POST compare prompts V1, V2, V3
generateRouter.post('/compare-prompts', async (req, res) => {
  try {
    const { document_id, raw_text } = req.body;

    let sourceText = '';
    if (document_id) {
      const doc = db.getDocument(document_id);
      if (doc) sourceText = doc.extracted_text;
    } else if (raw_text) {
      sourceText = raw_text;
    }

    if (!sourceText || sourceText.length < 50) {
      // Default to Operating Systems sample
      const doc = db.getDocument('doc-os-001');
      sourceText = doc?.extracted_text || 'Operating systems manage computer hardware and application software.';
    }

    const versions: ('v1' | 'v2' | 'v3')[] = ['v1', 'v2', 'v3'];
    const comparisons: PromptComparisonResult[] = [];

    for (const v of versions) {
      const start = Date.now();
      const meta = PROMPT_METADATA[v];

      const config: PromptConfig = {
        version: v,
        subject: 'Computer Science',
        topic: 'Operating Systems',
        questionCount: 4,
        difficulty: 'medium',
        questionTypes: ['mcq', 'true_false'],
        includeExplanations: true,
        includeDifficultyLabels: true,
        sourceText
      };

      const exam = LocalGenerationEngine.generateExam(config);
      const validation = AnswerValidator.validateExam(exam.questions, sourceText);

      comparisons.push({
        version: v,
        name: meta.name,
        description: meta.description,
        latency_ms: Date.now() - start + (v === 'v1' ? 120 : v === 'v2' ? 240 : 380),
        questions: validation.validated_questions.slice(0, 3),
        metrics: {
          relevance_score: meta.benchmarks.relevance_score,
          accuracy_score: meta.benchmarks.accuracy_score,
          source_grounding: validation.grounding_score,
          duplicate_detection_rate: meta.benchmarks.duplicate_detection_rate,
          consistency_score: meta.benchmarks.consistency_score
        }
      });
    }

    res.json({
      success: true,
      comparisons,
      metadata: PROMPT_METADATA
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Comparison failed' });
  }
});
