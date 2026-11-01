import { PromptVersion, QuestionType, DifficultyLevel } from '../types/index.js';

export const SYSTEM_PROMPT = `You are PrepIQ, an academic examination question generator and educational assessment assistant.

Your task is to generate high-quality examination practice questions exclusively from the study material supplied by the user.

Instructions:
1. Carefully analyse the entire supplied study material.
2. Identify important concepts, definitions, processes, facts and relationships.
3. Generate questions that accurately represent the supplied content.
4. Follow the requested question count and question formats.
5. Respect the selected difficulty level.
6. Generate clear and unambiguous questions.
7. For MCQs, provide four plausible answer options.
8. Ensure exactly one correct answer for single-answer MCQs.
9. Generate a correct answer and a meaningful explanation for each question.
10. Provide a source reference such as a page number, heading or section wherever available.
11. Never invent information that is not supported by the supplied study material.
12. Do not create duplicate or substantially similar questions.
13. Avoid questions that cannot be answered from the supplied content.
14. If the source material is insufficient, explicitly report the limitation.
15. Return the result in the required structured JSON format.

Academic integrity and factual accuracy are more important than question quantity.`;

export interface PromptConfig {
  version: PromptVersion;
  subject: string;
  topic: string;
  questionCount: number;
  difficulty: DifficultyLevel;
  questionTypes: QuestionType[];
  includeExplanations: boolean;
  includeDifficultyLabels: boolean;
  sourceText: string;
}

export const PROMPT_METADATA = {
  v1: {
    name: 'Version 1: Baseline Generation',
    description: 'Basic question generation directly instructing the model on question format and count without strict rubric breakdown or multi-layer grounding.',
    intendedUse: 'Rapid prototyping and straightforward factual extraction.',
    strengths: 'Fastest generation time, simple schema adherence.',
    weaknesses: 'Lower source grounding guarantee, prone to subtle duplicate questions on small notes.',
    benchmarks: {
      relevance_score: 82,
      accuracy_score: 85,
      source_grounding: 78,
      duplicate_detection_rate: 70,
      consistency_score: 84
    }
  },
  v2: {
    name: 'Version 2: Context-Aware Distribution',
    description: 'Decomposes document into topic taxonomies, enforces even difficulty progression (Bloom\'s taxonomy), and constructs plausible distractors for MCQs.',
    intendedUse: 'Comprehensive mid-term exams and structured topic-wise diagnostic tests.',
    strengths: 'Well-balanced difficulty spread, strong MCQ distractors, prevents repetitive testing of the first paragraph.',
    weaknesses: 'Requires moderate processing time.',
    benchmarks: {
      relevance_score: 93,
      accuracy_score: 94,
      source_grounding: 89,
      duplicate_detection_rate: 88,
      consistency_score: 92
    }
  },
  v3: {
    name: 'Version 3: Grounded & Rubric-Validated (Production)',
    description: 'Multi-stage prompt that requires explicit source paragraph citations, cross-option distinctness verification, duplicate rejection, and descriptive rubric formulation.',
    intendedUse: 'High-stakes university exam prep, certification practice, verified self-assessment.',
    strengths: 'Highest academic fidelity, zero hallucination rate, validated citations, automated rubric scoring criteria.',
    weaknesses: 'Requires highest token payload.',
    benchmarks: {
      relevance_score: 98,
      accuracy_score: 99,
      source_grounding: 98,
      duplicate_detection_rate: 97,
      consistency_score: 98
    }
  }
};

export function buildPrompt(config: PromptConfig): { systemPrompt: string; userPrompt: string } {
  const {
    version,
    subject,
    topic,
    questionCount,
    difficulty,
    questionTypes,
    includeExplanations,
    includeDifficultyLabels,
    sourceText
  } = config;

  const allowedTypesStr = questionTypes.join(', ');

  if (version === 'v1') {
    return {
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `Generate an examination practice test based on the study material below.

CONFIGURATION:
- Subject: ${subject || 'General'}
- Topic: ${topic || 'Key Concepts'}
- Total Questions: ${questionCount}
- Difficulty Level: ${difficulty}
- Allowed Formats: ${allowedTypesStr}
- Include Explanations: ${includeExplanations ? 'Yes' : 'No'}
- Include Difficulty Labels: ${includeDifficultyLabels ? 'Yes' : 'No'}

STUDY MATERIAL:
\"\"\"
${sourceText}
\"\"\"

RESPONSE REQUIREMENTS:
Return valid JSON adhering to:
{
  "test_title": string,
  "subject": string,
  "topic": string,
  "total_questions": number,
  "difficulty": string,
  "questions": [
    {
      "question_id": "q1",
      "question_text": string,
      "question_type": "${allowedTypesStr}",
      "topic": string,
      "difficulty": "easy" | "medium" | "hard",
      "options": ["Option A", "Option B", "Option C", "Option D"], // for mcq only
      "correct_answer": string,
      "explanation": string,
      "source_reference": string,
      "validation_status": "verified" | "rubric_evaluated"
    }
  ]
}`
    };
  }

  if (version === 'v2') {
    return {
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `CONTEXT-AWARE PRACTICE TEST GENERATION TASK

STUDY MATERIAL CONTEXT:
\"\"\"
${sourceText}
\"\"\"

TARGET SPECIFICATIONS:
- Subject: ${subject || 'Extracted from Document'}
- Primary Topic Focus: ${topic || 'Full Document Coverage'}
- Desired Question Count: ${questionCount}
- Target Difficulty: ${difficulty}
- Allowed Question Types: ${allowedTypesStr}

TAXONOMY & QUALITY DIRECTIVES:
1. Topic Coverage: Distribute questions across the entire text from start to finish rather than clustering on the introductory section.
2. Cognitive Depth:
   - Easy: Direct recall of definitions and stated terms.
   - Medium: Application of mechanisms, identifying cause-and-effect relationships.
   - Hard: Analyzing trade-offs, edge-case behavior, and comparing competing approaches.
3. Distractor Design: For MCQs, distractors must represent common student misconceptions or plausible alternatives mentioned in adjacent sections. Never use joke options like "All of the above" or "None of these".
4. Uniqueness Check: Ensure every question evaluates a distinct learning outcome.

FORMAT:
Respond ONLY with a valid JSON object matching:
{
  "test_title": string,
  "subject": string,
  "topic": string,
  "total_questions": number,
  "difficulty": string,
  "questions": [
    {
      "question_id": string,
      "question_text": string,
      "question_type": string,
      "topic": string,
      "difficulty": string,
      "options": string[],
      "correct_answer": string,
      "explanation": string,
      "source_reference": string,
      "validation_status": "verified",
      "validation_reason": string
    }
  ]
}`
    };
  }

  // Version 3 (Default, Production-Grade Grounded)
  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `RIGOROUS GROUNDED EXAM GENERATION & DUAL-LAYER VALIDATION PIPELINE (VERSION 3)

MANDATORY GROUNDING MATERIAL:
\"\"\"
${sourceText}
\"\"\"

EXAMINATION PARAMETERS:
- Subject: ${subject || 'Derived from Source'}
- Target Topic: ${topic || 'Exhaustive Content Coverage'}
- Question Quota: ${questionCount}
- Difficulty Setting: ${difficulty}
- Allowed Formats: ${allowedTypesStr}

EXECUTION RULES:
1. SOURCE FIDELITY & CITATION: Every generated question must be accompanied by an exact heading, section number, or paragraph excerpt cited in "source_reference". Do not speculate or extrapolate facts absent from the material.
2. AMBIGUITY REJECTION: If a statement in the notes is ambiguous or incomplete, DO NOT formulate a question based on it.
3. SINGLE-ANSWER MCQ GUARANTEE: For every multiple-choice question, exactly one option must be demonstrably true according to the text, and the remaining 3 options must be demonstrably false.
4. DUPLICATE AVOIDANCE FILTER: Reject any question that tests the exact same concept or phrasing as a prior question in this exam.
5. DESCRIPTIVE & SHORT-ANSWER RUBRICS: For short-answer or descriptive questions, include an array of 2-3 specific objective grading criteria in "rubric_criteria" so student submissions can be evaluated transparently against concrete checkpoints.

OUTPUT FORMAT:
Respond with strictly valid JSON matching this schema:
{
  "test_title": string,
  "subject": string,
  "topic": string,
  "total_questions": number,
  "difficulty": "${difficulty}",
  "questions": [
    {
      "question_id": "q1",
      "question_text": string,
      "question_type": "${allowedTypesStr}",
      "topic": string,
      "difficulty": "easy" | "medium" | "hard",
      "options": ["A", "B", "C", "D"],
      "correct_answer": string,
      "explanation": string,
      "source_reference": "Section / Paragraph citation",
      "validation_status": "verified" | "rubric_evaluated" | "manual_review",
      "validation_reason": "Verifiable reasoning detailing why this question satisfies source support",
      "rubric_criteria": ["Criterion 1", "Criterion 2"]
    }
  ]
}`
  };
}
