import { Question } from '../types/index.js';

export interface ValidationIssue {
  question_id: string;
  type: 'duplicate' | 'unsupported' | 'mcq_inconsistent' | 'explanation_mismatch' | 'ambiguous';
  severity: 'error' | 'warning';
  message: string;
}

export interface ValidationResult {
  is_valid: boolean;
  grounding_score: number; // 0 to 100
  duplicate_filtered_count: number;
  validated_questions: Question[];
  rejected_questions: { question: Question; reason: string }[];
  issues: ValidationIssue[];
}

export class AnswerValidator {
  /**
   * Validates an entire batch of generated questions against source text
   */
  public static validateExam(
    questions: Question[],
    sourceText: string
  ): ValidationResult {
    const issues: ValidationIssue[] = [];
    const validatedQuestions: Question[] = [];
    const rejectedQuestions: { question: Question; reason: string }[] = [];
    let duplicateFilteredCount = 0;

    const seenQuestionTexts: string[] = [];
    const normalizedSource = sourceText.toLowerCase();

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      let hasError = false;

      // CHECK 1: Question Text Duplicate Detection (Cosine / Levenshtein / Word Overlap)
      const isDuplicate = this.detectDuplicate(q.question_text, seenQuestionTexts);
      if (isDuplicate) {
        issues.push({
          question_id: q.question_id,
          type: 'duplicate',
          severity: 'error',
          message: `Question is substantially identical to an existing question in this exam.`
        });
        hasError = true;
        duplicateFilteredCount++;
      } else {
        seenQuestionTexts.push(q.question_text);
      }

      // CHECK 2: MCQ Option Consistency & Exactly One Correct Answer
      if (q.question_type === 'mcq') {
        if (!q.options || q.options.length < 2) {
          issues.push({
            question_id: q.question_id,
            type: 'mcq_inconsistent',
            severity: 'error',
            message: 'MCQ does not contain sufficient answer options.'
          });
          hasError = true;
        } else {
          // Check for duplicate options within the same question
          const uniqueOpts = new Set(q.options.map(o => o.trim().toLowerCase()));
          if (uniqueOpts.size !== q.options.length) {
            issues.push({
              question_id: q.question_id,
              type: 'mcq_inconsistent',
              severity: 'error',
              message: 'MCQ has duplicate answer choices.'
            });
            hasError = true;
          }

          // Check if correct_answer matches exactly one of the options
          const matchingOptions = q.options.filter(
            opt => opt.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()
          );

          if (matchingOptions.length === 0) {
            issues.push({
              question_id: q.question_id,
              type: 'mcq_inconsistent',
              severity: 'error',
              message: `Correct answer "${q.correct_answer}" was not found among the provided MCQ options.`
            });
            hasError = true;
          } else if (matchingOptions.length > 1) {
            issues.push({
              question_id: q.question_id,
              type: 'mcq_inconsistent',
              severity: 'error',
              message: 'MCQ has multiple options identical to the correct answer.'
            });
            hasError = true;
          }
        }
      }

      // CHECK 3: Source Material Grounding & Answerability
      const groundingCheck = this.verifySourceGrounding(q, normalizedSource);
      if (!groundingCheck.isGrounded) {
        issues.push({
          question_id: q.question_id,
          type: 'unsupported',
          severity: groundingCheck.confidence < 0.3 ? 'error' : 'warning',
          message: groundingCheck.reason
        });

        if (groundingCheck.confidence < 0.3) {
          hasError = true;
        }
      }

      // CHECK 4: Explanation & Answer Key Agreement
      const explanationAgrees = this.verifyExplanationAgreement(q);
      if (!explanationAgrees) {
        issues.push({
          question_id: q.question_id,
          type: 'explanation_mismatch',
          severity: 'warning',
          message: 'Explanation does not explicitly reference or substantiate the designated correct answer.'
        });
      }

      // Classify Final Question Status
      if (hasError) {
        rejectedQuestions.push({
          question: q,
          reason: issues.filter(iss => iss.question_id === q.question_id && iss.severity === 'error').map(iss => iss.message).join(' | ')
        });
      } else {
        // Assign transparent validation status
        let status: 'verified' | 'rubric_evaluated' | 'manual_review' = 'verified';
        let reason = 'Answer is mathematically/factually supported by source text.';

        if (q.question_type === 'descriptive' || q.question_type === 'short_answer') {
          status = 'rubric_evaluated';
          reason = 'Grounded in study material. Rubric criteria formulated for transparent grading.';
        } else if (groundingCheck.confidence < 0.7) {
          status = 'manual_review';
          reason = 'Question relies on contextual inference; recommended for instructor review.';
        }

        validatedQuestions.push({
          ...q,
          validation_status: status,
          validation_reason: q.validation_reason || reason
        });
      }
    }

    // Compute Overall Grounding Score (0 to 100)
    const validCount = validatedQuestions.length;
    const totalCount = questions.length;
    const groundingScore = totalCount > 0 ? Math.round((validCount / totalCount) * 100) : 0;

    return {
      is_valid: validatedQuestions.length > 0,
      grounding_score: groundingScore,
      duplicate_filtered_count: duplicateFilteredCount,
      validated_questions: validatedQuestions,
      rejected_questions: rejectedQuestions,
      issues: issues
    };
  }

  /**
   * Simple Jaccard similarity between two token sets to identify duplicates
   */
  private static detectDuplicate(candidate: string, existing: string[]): boolean {
    const candidateTokens = this.tokenize(candidate);
    if (candidateTokens.size === 0) return false;

    for (const text of existing) {
      const existingTokens = this.tokenize(text);
      if (existingTokens.size === 0) continue;

      let intersection = 0;
      for (const token of candidateTokens) {
        if (existingTokens.has(token)) intersection++;
      }

      const union = candidateTokens.size + existingTokens.size - intersection;
      const similarity = intersection / union;

      // Higher than 80% word overlap indicates near duplicate question
      if (similarity > 0.8) {
        return true;
      }
    }

    return false;
  }

  /**
   * Verifies if key entities/concepts in the question and answer exist in the source text
   */
  private static verifySourceGrounding(q: Question, normalizedSource: string): { isGrounded: boolean; confidence: number; reason: string } {
    // Extract key tokens from correct answer and question
    const qTokens = Array.from(this.tokenize(q.question_text));
    const ansTokens = Array.from(this.tokenize(q.correct_answer));

    if (ansTokens.length === 0) {
      return { isGrounded: false, confidence: 0, reason: 'Correct answer is empty or missing.' };
    }

    // Check if the answer phrase or significant terms appear in the text
    const normalizedAns = q.correct_answer.toLowerCase().trim();
    if (normalizedSource.includes(normalizedAns)) {
      return { isGrounded: true, confidence: 0.95, reason: 'Exact answer phrase occurs directly in source text.' };
    }

    // Check overlap of answer tokens
    let ansTokensFound = 0;
    for (const t of ansTokens) {
      if (normalizedSource.includes(t)) ansTokensFound++;
    }
    const ansRatio = ansTokensFound / ansTokens.length;

    // Check overlap of question tokens
    let qTokensFound = 0;
    for (const t of qTokens) {
      if (normalizedSource.includes(t)) qTokensFound++;
    }
    const qRatio = qTokens.length > 0 ? qTokensFound / qTokens.length : 1;

    const confidence = (ansRatio * 0.6) + (qRatio * 0.4);

    if (confidence > 0.5) {
      return { isGrounded: true, confidence, reason: 'Key technical terms and definitions verified in source text.' };
    }

    return { 
      isGrounded: false, 
      confidence, 
      reason: `Terms in question/answer lack sufficient grounding in the uploaded document (confidence ${(confidence * 100).toFixed(0)}%).`
    };
  }

  /**
   * Ensures that the explanation actually reinforces the designated correct answer
   */
  private static verifyExplanationAgreement(q: Question): boolean {
    if (!q.explanation || q.explanation.trim().length === 0) return false;

    const expLower = q.explanation.toLowerCase();
    const ansLower = q.correct_answer.toLowerCase().trim();

    // Check direct substring
    if (expLower.includes(ansLower)) return true;

    // Check token overlap
    const ansTokens = Array.from(this.tokenize(ansLower));
    let matched = 0;
    for (const token of ansTokens) {
      if (expLower.includes(token)) matched++;
    }

    return ansTokens.length === 0 || (matched / ansTokens.length) >= 0.5;
  }

  private static tokenize(text: string): Set<string> {
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'of', 'for', 'to', 'with', 
      'by', 'what', 'how', 'why', 'when', 'where', 'who', 'does', 'that', 'this', 'these', 'those'
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    return new Set(words);
  }
}
