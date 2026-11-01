import { 
  PracticeTest, 
  TestAttempt, 
  StudentAnswer 
} from '../types/index.js';
import { db } from '../data/database.js';

export interface SubmissionPayload {
  test_id: string;
  user_id: string;
  started_at: string;
  time_taken_seconds: number;
  answers: Record<string, string>; // question_id -> response string
}

export class EvaluationEngine {
  /**
   * Executes the automated trigger-action workflow on exam submission
   */
  public static async evaluateAndRecord(payload: SubmissionPayload): Promise<TestAttempt> {
    const startTime = Date.now();
    const steps: { step: string; status: 'ok' | 'warn'; detail: string }[] = [];

    const test = db.getTest(payload.test_id);
    if (!test) {
      throw new Error(`Practice test ${payload.test_id} not found.`);
    }

    // STEP 1: Automatically evaluate submitted answers (Objective & Rubric)
    const evaluatedAnswers: Record<string, StudentAnswer> = {};
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    const topicPerformance: Record<string, { total: number; correct: number }> = {};

    for (const q of test.questions) {
      const studentResponse = payload.answers[q.question_id]?.trim() || '';
      const topic = q.topic || 'General';

      if (!topicPerformance[topic]) {
        topicPerformance[topic] = { total: 0, correct: 0 };
      }
      topicPerformance[topic].total += 1;

      if (!studentResponse) {
        unattemptedCount += 1;
        evaluatedAnswers[q.question_id] = {
          question_id: q.question_id,
          student_response: '',
          is_correct: false,
          score_awarded: 0,
          feedback: `Unattempted. The correct answer is: ${q.correct_answer}`
        };
        continue;
      }

      // Evaluation based on Question Type
      if (q.question_type === 'mcq' || q.question_type === 'true_false') {
        const isCorrect = studentResponse.toLowerCase() === q.correct_answer.toLowerCase();
        if (isCorrect) {
          correctCount += 1;
          topicPerformance[topic].correct += 1;
          evaluatedAnswers[q.question_id] = {
            question_id: q.question_id,
            student_response: studentResponse,
            is_correct: true,
            score_awarded: 1,
            feedback: `Correct! ${q.explanation}`
          };
        } else {
          incorrectCount += 1;
          evaluatedAnswers[q.question_id] = {
            question_id: q.question_id,
            student_response: studentResponse,
            is_correct: false,
            score_awarded: 0,
            feedback: `Incorrect. Designated correct answer: "${q.correct_answer}". ${q.explanation}`
          };
        }
      } else if (q.question_type === 'fill_blank') {
        // Tolerant match
        const normStudent = studentResponse.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normCorrect = q.correct_answer.toLowerCase().replace(/[^a-z0-9]/g, '');
        const isMatch = normStudent === normCorrect || normCorrect.includes(normStudent);

        if (isMatch) {
          correctCount += 1;
          topicPerformance[topic].correct += 1;
          evaluatedAnswers[q.question_id] = {
            question_id: q.question_id,
            student_response: studentResponse,
            is_correct: true,
            score_awarded: 1,
            feedback: `Correct! ${q.explanation}`
          };
        } else {
          incorrectCount += 1;
          evaluatedAnswers[q.question_id] = {
            question_id: q.question_id,
            student_response: studentResponse,
            is_correct: false,
            score_awarded: 0,
            feedback: `Expected "${q.correct_answer}". ${q.explanation}`
          };
        }
      } else {
        // Short Answer / Descriptive: Transparent Rubric Evaluation
        const criteria = q.rubric_criteria || [
          `Accurately explains the core principle of ${q.topic}`,
          `Provides factual context consistent with the study material`
        ];

        const rubricScores = criteria.map(crit => {
          const critTokens = crit.toLowerCase().split(/\s+/).filter(w => w.length > 3);
          const responseTokens = studentResponse.toLowerCase().split(/\s+/);
          let matchCount = 0;
          for (const token of critTokens) {
            if (responseTokens.includes(token)) matchCount++;
          }
          const passed = (matchCount / (critTokens.length || 1)) >= 0.3 || studentResponse.length > 50;
          return {
            criterion: crit,
            passed,
            note: passed ? 'Criterion satisfied in student response.' : 'Missing key terminology specified in rubric.'
          };
        });

        const passedCount = rubricScores.filter(r => r.passed).length;
        const scoreFraction = criteria.length > 0 ? passedCount / criteria.length : 1;
        const isPassed = scoreFraction >= 0.5;

        if (isPassed) {
          correctCount += 1;
          topicPerformance[topic].correct += 1;
        } else {
          incorrectCount += 1;
        }

        evaluatedAnswers[q.question_id] = {
          question_id: q.question_id,
          student_response: studentResponse,
          is_correct: isPassed,
          score_awarded: parseFloat(scoreFraction.toFixed(2)),
          feedback: isPassed 
            ? `Satisfied ${passedCount}/${criteria.length} rubric criteria. Good conceptual clarity.`
            : `Needs deeper elaboration. Met ${passedCount}/${criteria.length} rubric checkpoints.`,
          rubric_scores: rubricScores
        };
      }
    }

    steps.push({
      step: 'Step 1: Automated Response Evaluation',
      status: 'ok',
      detail: `Processed ${test.questions.length} questions: ${correctCount} correct, ${incorrectCount} incorrect, ${unattemptedCount} unattempted.`
    });

    // STEP 2: Score Calculation
    const totalQuestions = test.questions.length;
    const finalPercentage = totalQuestions > 0 ? parseFloat(((correctCount / totalQuestions) * 100).toFixed(1)) : 0;

    steps.push({
      step: 'Step 2: Score Aggregation',
      status: 'ok',
      detail: `Calculated aggregate score: ${finalPercentage}% (${correctCount}/${totalQuestions})`
    });

    // STEP 3: Topic Breakdown & Weak Topic Identification
    const topicBreakdown = Object.entries(topicPerformance).map(([topic, data]) => ({
      topic,
      total: data.total,
      correct: data.correct,
      percentage: data.total > 0 ? parseFloat(((data.correct / data.total) * 100).toFixed(1)) : 0
    }));

    const weakTopics = topicBreakdown
      .filter(t => t.percentage < 70)
      .map(t => t.topic);

    const suggestions: string[] = [];
    if (weakTopics.length > 0) {
      for (const wt of weakTopics) {
        suggestions.push(`Review key mechanisms and textbook references in "${wt}" where accuracy dropped below 70%.`);
      }
    } else {
      suggestions.push('Outstanding performance across all topics! Try increasing the difficulty level to Hard on your next exam.');
    }

    steps.push({
      step: 'Step 3: Weak Topic Decomposition',
      status: 'ok',
      detail: weakTopics.length > 0 
        ? `Identified ${weakTopics.length} weak areas: ${weakTopics.join(', ')}`
        : 'All topics achieved >= 70% proficiency.'
    });

    // STEP 4: Persist Results to Storage
    const attemptId = `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const submittedAt = new Date().toISOString();

    const attempt: TestAttempt = {
      attempt_id: attemptId,
      test_id: payload.test_id,
      user_id: payload.user_id,
      started_at: payload.started_at,
      submitted_at: submittedAt,
      time_taken_seconds: payload.time_taken_seconds,
      total_questions: totalQuestions,
      correct_answers: correctCount,
      incorrect_answers: incorrectCount,
      unattempted_questions: unattemptedCount,
      score_percentage: finalPercentage,
      answers: evaluatedAnswers,
      topic_breakdown: topicBreakdown,
      weak_topics: weakTopics,
      suggestions: suggestions,
      automation_result: {
        triggered_at: submittedAt,
        execution_time_ms: Date.now() - startTime,
        status: 'completed',
        steps: steps
      }
    };

    db.saveAttempt(attempt);

    steps.push({
      step: 'Step 4: Persistent Database Sync',
      status: 'ok',
      detail: `Committed attempt ${attemptId} to persistent store.`
    });

    // STEP 5: Update Student Dashboard Analytics
    const updatedAnalytics = db.getAnalytics(payload.user_id);

    steps.push({
      step: 'Step 5: Dashboard Metric Recalculation',
      status: 'ok',
      detail: `Updated student running average score (${updatedAnalytics.average_score}%) and questions practiced (${updatedAnalytics.questions_practiced}).`
    });

    // Record execution time
    attempt.automation_result.execution_time_ms = Date.now() - startTime;

    return attempt;
  }
}
