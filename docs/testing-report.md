# PrepIQ — Output Validation & Academic Testing Report

## 1. Overview & Verification Objective

In compliance with the **Academic Evaluation Rubric (Criteria 3: Output Validation & Testing, 5 Marks)**, PrepIQ incorporates an internal automated test harness and verification pipeline.

The testing suite validates:
1. Handling of normal academic study documents.
2. Interception of empty or inadequate inputs (**Edge Case**).
3. Rejection of ungrounded or foreign topics (**Hallucination Filter**).
4. Pruning of redundant or near-identical questions (**Duplicate Detection**).
5. Mathematical consistency of multiple-choice answer keys (**MCQ Invariant Check**).
6. Partial grading of incomplete submissions.

---

## 2. Test Execution Summary

The internal test runner executed all six scenarios with **100% pass rate**:

| Test ID | Test Scenario | Category | Expected Behavior | Status | Exec Time |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **TEST-1** | Normal Input (10-MCQ Generation) | Baseline Functionality | Generate 10 valid MCQs, 4 choices each, >= 90% grounding | **PASSED** | 18 ms |
| **TEST-2** | Empty / Nearly Empty Document | Edge Case | Intercept input < 100 chars; halt AI processing with clear error | **PASSED** | 2 ms |
| **TEST-3** | Unsupported Information / Hallucination | Academic Integrity | Flag concepts absent from source; set grounding to 0% | **PASSED** | 4 ms |
| **TEST-4** | Duplicate Question Detection | Redundancy Filter | Detect questions with > 80% Jaccard token overlap and prune | **PASSED** | 3 ms |
| **TEST-5** | MCQ Option & Key Consistency | Output Verification | Enforce that `correct_answer` matches exactly one option | **PASSED** | 2 ms |
| **TEST-6** | Incomplete Student Submission | Grading Robustness | Handle skipped questions; grade partial responses safely | **PASSED** | 1 ms |

---

## 3. Detailed Case-by-Case Audit

### TEST 1 — Normal Input: 10-Question MCQ Practice Exam
- **Input**: `Operating_Systems_Virtual_Memory_and_Paging.txt` (3,951 characters, 672 words).
- **Assertions Verified**:
  - `[PASS]` Text extracted with >= 100 characters (Extracted 3,951 chars).
  - `[PASS]` Generated exactly 10 questions as requested.
  - `[PASS]` Every question is formatted as an MCQ with exactly 4 options.
  - `[PASS]` Grounding validation score >= 90% (Achieved 100% verified grounding).
- **Audit Conclusion**: Successfully decomposed source notes into 10 unambiguous practice questions with verified citations.

---

### TEST 2 — Edge Case: Empty or Insufficient Document Handling
- **Input**: String with 12 characters: `"   \n\n  Hello there.  \n "`.
- **Assertions Verified**:
  - `[PASS]` Extraction engine flags insufficient content (`is_valid = false`).
  - `[PASS]` Character constraint enforced (`12 chars < MIN_CHARS 100`).
  - `[PASS]` Generation pipeline halted before reaching AI model (0 questions formulated).
- **Diagnostic Output**:
  ```json
  {
    "error_surfaced": "Document contains insufficient readable content (12 characters, 2 words). Minimum required is 100 characters of meaningful text.",
    "character_count": 12
  }
  ```
- **Audit Conclusion**: Safeguards prevent corrupted or blank submissions from triggering hallucinated AI examinations.

---

### TEST 3 — Unsupported Information & Hallucination Prevention
- **Input**: Question on Quantum Superconductivity Transmon Qubits submitted against Operating Systems notes.
- **Assertions Verified**:
  - `[PASS]` Validator identifies lack of source grounding (`type: unsupported`).
  - `[PASS]` Grounding score computed as 0%.
  - `[PASS]` Question rejected from verified status and tagged for manual review rather than falsely certified.
- **Diagnostic Output**:
  ```json
  {
    "issues": [
      "Terms in question/answer lack sufficient grounding in the uploaded document (confidence 0%)."
    ],
    "grounding_score": 0
  }
  ```
- **Audit Conclusion**: Strict prohibition against inventing ungrounded facts not present in user study notes.

---

### TEST 4 — Duplicate Detection & Redundancy Filtering
- **Input**: Small 2-sentence note submitted with two near-identical question stems (90% word overlap) and one unique question.
- **Assertions Verified**:
  - `[PASS]` Validator identifies duplicate question stem using Jaccard token overlap.
  - `[PASS]` Duplicate filtered count >= 1.
  - `[PASS]` Exactly 2 unique questions preserved in final output.
- **Audit Conclusion**: Prevents exam redundancy when working with concise notes.

---

### TEST 5 — Answer Key & MCQ Option Consistency Audit
- **Input**: Injected MCQ with choices `["Ridge", "Dropout", "Batch Norm", "Early Stopping"]` but designated answer `"L1 Regularization (Lasso)"`.
- **Assertions Verified**:
  - `[PASS]` Validator detects that `correct_answer` is absent from choices array.
  - `[PASS]` Faulty question rejected from exam deployment.
  - `[PASS]` Diagnostic log generated: `Correct answer "L1 Regularization (Lasso)" was not found among the provided MCQ options.`
- **Audit Conclusion**: Enforces single-answer invariant to ensure 100% fair student scoring.

---

### TEST 6 — Incomplete Student Submission
- **Input**: 3-question exam with 1 answered correctly and 2 omitted questions.
- **Assertions Verified**:
  - `[PASS]` System correctly identifies 2 unattempted questions without crashing.
  - `[PASS]` Calculates partial score: 33.3% (1/3).
  - `[PASS]` Generates informative feedback for skipped questions.
- **Audit Conclusion**: Robust grading handles partial exam submissions cleanly.

---

## 4. Live Test Suite UI

Evaluators can re-run all test cases directly from the **Validation Test Suite** tab in the web application to inspect live execution timestamps, assertion passes, and JSON payloads in real time.
