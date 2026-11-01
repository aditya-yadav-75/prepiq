import { Router } from 'express';
import { db } from '../data/database.js';
import { EvaluationEngine } from '../services/evaluationEngine.js';

export const testsRouter = Router();

// GET all tests for user
testsRouter.get('/', (req, res) => {
  const userId = (req.headers['x-user-id'] as string) || 'demo-student-001';
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

// GET single test
testsRouter.get('/:id', (req, res) => {
  const test = db.getTest(req.params.id);
  if (!test) {
    return res.status(404).json({ error: 'Practice test not found' });
  }
  res.json({ test });
});

// POST submit test (Triggers automated workflow: Evaluation -> Score -> Topics -> Save -> Analytics)
testsRouter.post('/:id/submit', async (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || 'demo-student-001';
    const testId = req.params.id;
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

// GET specific attempt
testsRouter.get('/attempts/:attemptId', (req, res) => {
  const attempt = db.getAttempt(req.params.attemptId);
  if (!attempt) {
    return res.status(404).json({ error: 'Attempt result not found' });
  }
  const test = db.getTest(attempt.test_id);
  res.json({ attempt, test });
});

// DELETE test
testsRouter.delete('/:id', (req, res) => {
  const userId = (req.headers['x-user-id'] as string) || 'demo-student-001';
  const deleted = db.deleteTest(req.params.id, userId);
  if (!deleted) {
    return res.status(404).json({ error: 'Test not found or unauthorized' });
  }
  res.json({ success: true, message: 'Test deleted successfully' });
});
