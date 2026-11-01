import { Router } from 'express';
import { TestSuiteRunner } from '../services/testSuiteRunner.js';

export const testSuiteRouter = Router();

// Run all test cases (Test 1 through Test 6)
testSuiteRouter.post('/run-all', async (_req, res) => {
  try {
    const results = await TestSuiteRunner.runAllTests();
    const passedCount = results.filter(r => r.status === 'passed').length;
    res.json({
      success: true,
      total: results.length,
      passed: passedCount,
      failed: results.length - passedCount,
      results
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Test suite execution failed' });
  }
});

// Run a single test case
testSuiteRouter.post('/run/:id', async (req, res) => {
  try {
    const id = req.params.id.toUpperCase();
    let result;

    if (id === 'TEST-1' || id === '1') {
      result = await TestSuiteRunner.runTest1_NormalInput();
    } else if (id === 'TEST-2' || id === '2') {
      result = await TestSuiteRunner.runTest2_EdgeCaseEmptyDoc();
    } else if (id === 'TEST-3' || id === '3') {
      result = await TestSuiteRunner.runTest3_UnsupportedTopic();
    } else if (id === 'TEST-4' || id === '4') {
      result = await TestSuiteRunner.runTest4_DuplicateDetection();
    } else if (id === 'TEST-5' || id === '5') {
      result = await TestSuiteRunner.runTest5_AnswerValidationConsistency();
    } else if (id === 'TEST-6' || id === '6') {
      result = await TestSuiteRunner.runTest6_IncompleteSubmission();
    } else {
      return res.status(404).json({ error: `Unknown test case ID: ${id}` });
    }

    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Test execution failed' });
  }
});
