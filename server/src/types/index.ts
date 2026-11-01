export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'mixed';

export type QuestionType = 
  | 'mcq' 
  | 'true_false' 
  | 'short_answer' 
  | 'fill_blank' 
  | 'descriptive';

export type PromptVersion = 'v1' | 'v2' | 'v3';

export interface Question {
  question_id: string;
  question_text: string;
  question_type: QuestionType;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options?: string[]; // 4 choices for MCQ, ['True', 'False'] for true_false
  correct_answer: string;
  explanation: string;
  source_reference: string;
  validation_status: 'verified' | 'rubric_evaluated' | 'flagged' | 'manual_review';
  validation_reason?: string;
  rubric_criteria?: string[]; // for descriptive/short answer
}

export interface PracticeTest {
  test_id: string;
  user_id: string;
  document_id?: string;
  document_name?: string;
  test_title: string;
  subject: string;
  topic: string;
  difficulty: DifficultyLevel;
  question_types: QuestionType[];
  total_questions: number;
  prompt_version: PromptVersion;
  include_explanations: boolean;
  include_difficulty_labels: boolean;
  timed_mode: boolean;
  time_limit_minutes: number;
  created_at: string;
  questions: Question[];
  validation_summary: {
    total_generated: number;
    total_validated: number;
    grounding_score: number; // 0-100%
    duplicate_filtered_count: number;
    issues_detected: string[];
    is_valid: boolean;
  };
}

export interface StudentAnswer {
  question_id: string;
  student_response: string;
  is_correct?: boolean;
  score_awarded?: number; // 0.0 to 1.0 or full marks
  feedback?: string;
  rubric_scores?: { criterion: string; passed: boolean; note?: string }[];
}

export interface TestAttempt {
  attempt_id: string;
  test_id: string;
  user_id: string;
  started_at: string;
  submitted_at: string;
  time_taken_seconds: number;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  unattempted_questions: number;
  score_percentage: number;
  answers: Record<string, StudentAnswer>;
  topic_breakdown: {
    topic: string;
    total: number;
    correct: number;
    percentage: number;
  }[];
  weak_topics: string[];
  suggestions: string[];
  automation_result: {
    triggered_at: string;
    execution_time_ms: number;
    status: 'completed' | 'failed';
    steps: { step: string; status: 'ok' | 'warn'; detail: string }[];
  };
}

export interface StudyDocument {
  id: string;
  user_id: string;
  filename: string;
  filesize: number;
  filetype: 'pdf' | 'docx' | 'txt';
  subject: string;
  topics: string[];
  summary: string;
  character_count: number;
  word_count: number;
  extracted_text: string;
  uploaded_at: string;
  status: 'ready' | 'processing' | 'error';
  error_message?: string;
  test_count: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  college?: string;
  course?: string;
  year_of_study?: string;
  created_at: string;
  avatar_color: string;
}

export interface PerformanceAnalytics {
  total_tests_generated: number;
  total_tests_attempted: number;
  average_score: number;
  questions_practiced: number;
  accuracy_rate: number;
  score_history: { date: string; score: number; test_title: string }[];
  subject_performance: { subject: string; tests_taken: number; avg_score: number }[];
  difficulty_performance: { difficulty: string; correct: number; total: number; percentage: number }[];
  weak_topics: { topic: string; incorrect_count: number; recommendation: string }[];
  recent_activity: { title: string; date: string; score: number; test_id: string }[];
}

export interface PromptComparisonResult {
  version: PromptVersion;
  name: string;
  description: string;
  latency_ms: number;
  questions: Question[];
  metrics: {
    relevance_score: number; // 0-100
    accuracy_score: number;  // 0-100
    source_grounding: number; // 0-100
    duplicate_detection_rate: number; // 0-100
    consistency_score: number; // 0-100
  };
}

export interface TestCaseResult {
  test_case_id: string;
  title: string;
  description: string;
  input_summary: string;
  status: 'passed' | 'failed';
  execution_time_ms: number;
  details: string;
  assertions: { rule: string; passed: boolean; message: string }[];
  output_sample?: any;
}
