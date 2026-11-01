import { Router, Response } from 'express';
import { db } from '../data/database.js';
import { EvaluationEngine } from '../services/evaluationEngine.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

export const testsRouter = Router();

// GET all tests for authenticated user
testsRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const tests = db.getTests(userId);
  const attempts = db.getAttempts(userId);

  // Attach latest attempt score and attempt count to test summary
  const enhanced = tests.map(t => {
    const testAttempts = attempts.filter(a => a.test_id === t.test_id);
    const latestAttempt = testAttempts[0];
    return {
      ...t,
      attempts_count: testAttempts.length,
      latest_score: latestAttempt ? latestAttempt.score_percentage : null,
      latest_attempt_id: latestAttempt ? latestAttempt.attempt_id : null,
      status: testAttempts.length > 0 ? 'completed' : 'not_started'
    };
  });

  res.json({ tests: enhanced });
});

// GET single test with ownership check
testsRouter.get('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const testId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const test = db.getTest(testId);
  if (!test) {
    return res.status(404).json({ error: 'Practice test not found' });
  }
  // Allow viewing if owned by user or system sample test
  if (test.user_id !== req.userId && test.user_id !== 'system') {
    return res.status(403).json({ error: 'Access denied: You do not have permission to view this test.' });
  }
  res.json({ test });
});

// POST submit test (Triggers automated workflow: Evaluation -> Score -> Topics -> Save -> Analytics)
testsRouter.post('/:id/submit', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const testId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const test = db.getTest(testId);
    if (!test) {
      return res.status(404).json({ error: 'Practice test not found' });
    }
    if (test.user_id !== userId && test.user_id !== 'system') {
      return res.status(403).json({ error: 'Access denied: You do not have permission to submit this test.' });
    }

    const { answers, started_at, time_taken_seconds } = req.body;

    const attempt = await EvaluationEngine.evaluateAndRecord({
      test_id: testId,
      user_id: userId,
      started_at: started_at || new Date(Date.now() - (time_taken_seconds || 300) * 1000).toISOString(),
      time_taken_seconds: time_taken_seconds || 180,
      answers: answers || {}
    });

    res.status(201).json({
      success: true,
      attempt,
      message: 'Automated evaluation workflow completed successfully.'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Submission evaluation failed' });
  }
});

// GET specific attempt with ownership check
testsRouter.get('/attempts/:attemptId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const attemptId = Array.isArray(req.params.attemptId) ? req.params.attemptId[0] : req.params.attemptId;
  const attempt = db.getAttempt(attemptId);
  if (!attempt) {
    return res.status(404).json({ error: 'Attempt result not found' });
  }
  if (attempt.user_id !== req.userId) {
    return res.status(403).json({ error: 'Access denied: You do not have permission to view this attempt result.' });
  }
  const test = db.getTest(attempt.test_id);
  res.json({ attempt, test });
});

// DELETE test with ownership check
testsRouter.delete('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const testId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const test = db.getTest(testId);
  if (!test) {
    return res.status(404).json({ error: 'Test not found' });
  }
  if (test.user_id === 'system') {
    return res.status(403).json({ error: 'System sample tests cannot be deleted.' });
  }
  if (test.user_id !== req.userId) {
    return res.status(403).json({ error: 'Access denied: You do not have permission to delete this test.' });
  }

  const deleted = db.deleteTest(testId, req.userId!);
  if (!deleted) {
    return res.status(404).json({ error: 'Test not found or unauthorized' });
  }
  res.json({ success: true, message: 'Test deleted successfully' });
});
