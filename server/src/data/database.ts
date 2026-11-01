import fs from 'fs';
import path from 'path';
import { 
  UserProfile, 
  StudyDocument, 
  PracticeTest, 
  TestAttempt, 
  PerformanceAnalytics 
} from '../types/index.js';
import { SAMPLE_MATERIALS } from './sampleMaterials.js';
import { hashPassword } from '../utils/security.js';

interface DatabaseSchema {
  users: Record<string, UserProfile>;
  passwords?: Record<string, string>;
  documents: Record<string, StudyDocument>;
  tests: Record<string, PracticeTest>;
  attempts: Record<string, TestAttempt>;
}

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.resolve(DATA_DIR, 'store.json');

class Database {
  private data: DatabaseSchema = {
    users: {},
    documents: {},
    tests: {},
    attempts: {}
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.passwords) {
          this.data.passwords = {};
        }
        if (!this.data.passwords['demo-student-001']) {
          this.data.passwords['demo-student-001'] = hashPassword('password123');
        }
      } else {
        this.seedDemoData();
      }
    } catch (err) {
      console.warn('Could not read existing store.json, seeding fresh demo data:', err);
      this.seedDemoData();
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public seedDemoData() {
    const demoUser: UserProfile = {
      id: 'demo-student-001',
      name: 'Aditya Yadav',
      email: 'student@prepiq.edu',
      college: 'Apex Institute of Technology',
      course: 'Computer Science & AI',
      year_of_study: '3rd Year',
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      avatar_color: '#1649E8'
    };

    this.data.users = {
      [demoUser.id]: demoUser
    };
    this.data.passwords = {
      [demoUser.id]: hashPassword('password123')
    };

    // Pre-populate sample materials
    this.data.documents = {};
    for (const sample of SAMPLE_MATERIALS) {
      this.data.documents[sample.id] = {
        id: sample.id,
        user_id: demoUser.id,
        filename: sample.filename,
        filesize: sample.character_count * 2,
        filetype: 'txt',
        subject: sample.subject,
        topics: sample.topics,
        summary: sample.summary,
        character_count: sample.character_count,
        word_count: sample.word_count,
        extracted_text: sample.extracted_text,
        uploaded_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        status: 'ready',
        test_count: sample.id === 'doc-os-001' ? 1 : 0
      };
    }

    // Pre-populate an initial demonstration test generated from OS notes
    const demoTestId = 'test-demo-os-01';
    const demoTest: PracticeTest = {
      test_id: demoTestId,
      user_id: demoUser.id,
      document_id: 'doc-os-001',
      document_name: 'Operating_Systems_Virtual_Memory_and_Paging.txt',
      test_title: 'Virtual Memory & Paging Mastery Test',
      subject: 'Computer Science',
      topic: 'Virtual Memory & Paging Systems',
      difficulty: 'medium',
      question_types: ['mcq', 'true_false', 'short_answer'],
      total_questions: 6,
      prompt_version: 'v3',
      include_explanations: true,
      include_difficulty_labels: true,
      timed_mode: true,
      time_limit_minutes: 15,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      validation_summary: {
        total_generated: 6,
        total_validated: 6,
        grounding_score: 98,
        duplicate_filtered_count: 1,
        issues_detected: [],
        is_valid: true
      },
      questions: [
        {
          question_id: 'q1',
          question_text: 'What hardware anomaly occurs when increasing physical frames paradoxically results in more page faults in FIFO replacement?',
          question_type: 'mcq',
          topic: 'Page Replacement Algorithms',
          difficulty: 'medium',
          options: [
            "Belady's Anomaly",
            "Thrashing Paradox",
            "Dijkstra's Inversion",
            "Amortized Degradation"
          ],
          correct_answer: "Belady's Anomaly",
          explanation: "FIFO replacement suffers from Belady's Anomaly, where giving more memory frames to a process can counterintuitively cause more page faults. LRU does not suffer from this because it is a stack algorithm.",
          source_reference: "Section 5: Page Replacement Algorithms (FIFO)",
          validation_status: 'verified',
          validation_reason: 'Directly supported by Section 5 text; single unambiguous correct option.'
        },
        {
          question_id: 'q2',
          question_text: 'In paging, physical memory is partitioned into fixed-sized blocks called pages, while logical memory is partitioned into frames.',
          question_type: 'true_false',
          topic: 'Paging Architecture',
          difficulty: 'easy',
          options: ['True', 'False'],
          correct_answer: 'False',
          explanation: 'It is the opposite: Physical memory is broken into fixed-sized blocks called frames, while logical address space is divided into blocks called pages.',
          source_reference: 'Section 2: Paging Architecture and Address Translation',
          validation_status: 'verified',
          validation_reason: 'Contradiction verified from Section 2 definitions.'
        },
        {
          question_id: 'q3',
          question_text: 'What primary advantage does a Translation Lookaside Buffer (TLB) provide in a virtual memory architecture?',
          question_type: 'mcq',
          topic: 'TLB',
          difficulty: 'medium',
          options: [
            'Reduces effective memory access time by caching recent page-to-frame translations',
            'Compacts physical swap space on disk storage',
            'Prevents page faults from ever occurring during runtime',
            'Encrypts virtual page numbers before sending to CPU cache'
          ],
          correct_answer: 'Reduces effective memory access time by caching recent page-to-frame translations',
          explanation: 'Standard page tables require two memory accesses per reference. The TLB caches page-to-frame translations in ultra-fast hardware, greatly reducing Effective Access Time (EAT).',
          source_reference: 'Section 3: Translation Lookaside Buffer (TLB)',
          validation_status: 'verified',
          validation_reason: 'Accurately grounded in Section 3.'
        },
        {
          question_id: 'q4',
          question_text: 'Which step immediately follows the OS verifying an internal table and confirming that a page fault memory address is legal?',
          question_type: 'mcq',
          topic: 'Page Fault Handling Workflow',
          difficulty: 'hard',
          options: [
            'The OS locates a free physical frame in memory',
            'The CPU immediately restarts the faulty instruction',
            'The page table marks the page as invalid',
            'The memory bus clears all TLB registers'
          ],
          correct_answer: 'The OS locates a free physical frame in memory',
          explanation: 'According to the 6-step workflow, Step 2 verifies the reference in the internal PCB table. Step 3 immediately locates a free physical frame before scheduling disk I/O in Step 4.',
          source_reference: 'Section 4: Page Fault Handling Workflow (Steps 2-3)',
          validation_status: 'verified',
          validation_reason: 'Sequential step order validated against source material.'
        },
        {
          question_id: 'q5',
          question_text: 'Briefly explain why LRU (Least Recently Used) page replacement does NOT suffer from Belady\'s Anomaly.',
          question_type: 'short_answer',
          topic: 'Page Replacement Algorithms',
          difficulty: 'hard',
          correct_answer: 'LRU belongs to the class of stack algorithms, where the set of pages in memory for n frames is always a subset of the pages in memory for n+1 frames.',
          explanation: 'Stack algorithms guarantee that adding physical frames never drops a page that would have been kept with fewer frames.',
          source_reference: 'Section 5: Page Replacement Algorithms (LRU)',
          validation_status: 'rubric_evaluated',
          validation_reason: 'Conceptual rubric established from Section 5.',
          rubric_criteria: [
            'Mentions that LRU is a stack algorithm or subset property',
            'Notes that pages in n frames are a subset of n+1 frames'
          ]
        },
        {
          question_id: 'q6',
          question_text: 'The Optimal (OPT/MIN) page replacement algorithm can be readily implemented in production operating systems without any hardware assist.',
          question_type: 'true_false',
          topic: 'Page Replacement Algorithms',
          difficulty: 'easy',
          options: ['True', 'False'],
          correct_answer: 'False',
          explanation: 'The Optimal algorithm serves as an impossible theoretical benchmark because it requires impossible future knowledge of memory references.',
          source_reference: 'Section 5: Page Replacement Algorithms (Optimal)',
          validation_status: 'verified',
          validation_reason: 'Source explicitly states OPT requires future knowledge.'
        }
      ]
    };

    this.data.tests = {
      [demoTestId]: demoTest
    };

    // Pre-populate a completed attempt to give instant analytics for the demo
    const demoAttemptId = 'att-demo-001';
    const demoAttempt: TestAttempt = {
      attempt_id: demoAttemptId,
      test_id: demoTestId,
      user_id: demoUser.id,
      started_at: new Date(Date.now() - 86400000).toISOString(),
      submitted_at: new Date(Date.now() - 86400000 + 420000).toISOString(),
      time_taken_seconds: 420,
      total_questions: 6,
      correct_answers: 5,
      incorrect_answers: 1,
      unattempted_questions: 0,
      score_percentage: 83.3,
      answers: {
        'q1': {
          question_id: 'q1',
          student_response: "Belady's Anomaly",
          is_correct: true,
          score_awarded: 1,
          feedback: 'Correct! FIFO displays Belady\'s Anomaly.'
        },
        'q2': {
          question_id: 'q2',
          student_response: 'False',
          is_correct: true,
          score_awarded: 1,
          feedback: 'Correct! Physical blocks are frames; logical blocks are pages.'
        },
        'q3': {
          question_id: 'q3',
          student_response: 'Reduces effective memory access time by caching recent page-to-frame translations',
          is_correct: true,
          score_awarded: 1,
          feedback: 'Correct!'
        },
        'q4': {
          question_id: 'q4',
          student_response: 'The OS locates a free physical frame in memory',
          is_correct: true,
          score_awarded: 1,
          feedback: 'Correct sequence identified.'
        },
        'q5': {
          question_id: 'q5',
          student_response: 'LRU tracks time since last reference using a stack algorithm, so the page set for n frames is a subset of n+1 frames.',
          is_correct: true,
          score_awarded: 1,
          feedback: 'Excellent explanation satisfying both rubric criteria.',
          rubric_scores: [
            { criterion: 'Mentions that LRU is a stack algorithm or subset property', passed: true },
            { criterion: 'Notes that pages in n frames are a subset of n+1 frames', passed: true }
          ]
        },
        'q6': {
          question_id: 'q6',
          student_response: 'True',
          is_correct: false,
          score_awarded: 0,
          feedback: 'Incorrect. OPT requires future knowledge of memory references, making it practically unimplementable in real production OS.'
        }
      },
      topic_breakdown: [
        { topic: 'Page Replacement Algorithms', total: 3, correct: 2, percentage: 66.7 },
        { topic: 'Paging Architecture', total: 1, correct: 1, percentage: 100 },
        { topic: 'TLB', total: 1, correct: 1, percentage: 100 },
        { topic: 'Page Fault Handling Workflow', total: 1, correct: 1, percentage: 100 }
      ],
      weak_topics: ['Page Replacement Algorithms'],
      suggestions: [
        'Review the practical feasibility constraints of the Optimal (OPT/MIN) page replacement algorithm.',
        'Contrast stack-based algorithms against FIFO queues to master anomaly detection.'
      ],
      automation_result: {
        triggered_at: new Date(Date.now() - 86400000 + 420000).toISOString(),
        execution_time_ms: 142,
        status: 'completed',
        steps: [
          { step: 'Rubric & Objective Answer Evaluation', status: 'ok', detail: 'Evaluated 6 questions (5 correct, 1 incorrect)' },
          { step: 'Score Calculation', status: 'ok', detail: 'Final percentage: 83.3%' },
          { step: 'Topic & Weak Area Decomposition', status: 'ok', detail: 'Identified weak topic: Page Replacement Algorithms' },
          { step: 'Persistent Storage Sync', status: 'ok', detail: 'Stored attempt att-demo-001 in database' },
          { step: 'Student Dashboard Metric Aggregation', status: 'ok', detail: 'Updated average score and questions practiced metrics' }
        ]
      }
    };

    this.data.attempts = {
      [demoAttemptId]: demoAttempt
    };

    this.persist();
  }

  // User operations
  public getUser(id: string): UserProfile | undefined {
    return this.data.users[id];
  }

  public getUserByEmail(email: string): UserProfile | undefined {
    return Object.values(this.data.users).find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public saveUser(user: UserProfile): void {
    this.data.users[user.id] = user;
    this.persist();
  }

  public setUserPassword(userId: string, hash: string): void {
    if (!this.data.passwords) {
      this.data.passwords = {};
    }
    this.data.passwords[userId] = hash;
    this.persist();
  }

  public getUserPassword(userId: string): string | undefined {
    return this.data.passwords ? this.data.passwords[userId] : undefined;
  }

  // Document operations
  public getDocuments(userId: string): StudyDocument[] {
    return Object.values(this.data.documents)
      .filter(d => d.user_id === userId)
      .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
  }

  public getDocument(docId: string): StudyDocument | undefined {
    return this.data.documents[docId];
  }

  public saveDocument(doc: StudyDocument): void {
    this.data.documents[doc.id] = doc;
    this.persist();
  }

  public deleteDocument(docId: string, userId: string): boolean {
    const doc = this.data.documents[docId];
    if (doc && doc.user_id === userId) {
      delete this.data.documents[docId];
      this.persist();
      return true;
    }
    return false;
  }

  // Test operations
  public getTests(userId: string): PracticeTest[] {
    return Object.values(this.data.tests)
      .filter(t => t.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getTest(testId: string): PracticeTest | undefined {
    return this.data.tests[testId];
  }

  public saveTest(test: PracticeTest): void {
    this.data.tests[test.test_id] = test;
    if (test.document_id && this.data.documents[test.document_id]) {
      this.data.documents[test.document_id].test_count = (this.data.documents[test.document_id].test_count || 0) + 1;
    }
    this.persist();
  }

  public deleteTest(testId: string, userId: string): boolean {
    const test = this.data.tests[testId];
    if (test && test.user_id === userId) {
      delete this.data.tests[testId];
      // Also clean up attempts for this test
      for (const [attId, att] of Object.entries(this.data.attempts)) {
        if (att.test_id === testId) {
          delete this.data.attempts[attId];
        }
      }
      this.persist();
      return true;
    }
    return false;
  }

  // Attempt operations
  public getAttempts(userId: string): TestAttempt[] {
    return Object.values(this.data.attempts)
      .filter(a => a.user_id === userId)
      .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  }

  public getAttempt(attemptId: string): TestAttempt | undefined {
    return this.data.attempts[attemptId];
  }

  public getAttemptsForTest(testId: string): TestAttempt[] {
    return Object.values(this.data.attempts)
      .filter(a => a.test_id === testId)
      .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  }

  public saveAttempt(attempt: TestAttempt): void {
    this.data.attempts[attempt.attempt_id] = attempt;
    this.persist();
  }

  // Analytics calculator
  public getAnalytics(userId: string): PerformanceAnalytics {
    const tests = this.getTests(userId);
    const attempts = this.getAttempts(userId);

    const totalTestsGenerated = tests.length;
    const totalTestsAttempted = attempts.length;

    let totalScore = 0;
    let totalQuestionsPracticed = 0;
    let totalCorrect = 0;
    const scoreHistory: { date: string; score: number; test_title: string }[] = [];
    const subjectMap: Record<string, { tests_taken: number; total_score: number }> = {};
    const difficultyMap: Record<string, { correct: number; total: number }> = {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 }
    };
    const weakTopicMap: Record<string, number> = {};

    for (const att of attempts) {
      totalScore += att.score_percentage;
      totalQuestionsPracticed += att.total_questions;
      totalCorrect += att.correct_answers;

      const test = this.data.tests[att.test_id];
      const title = test ? test.test_title : 'Practice Exam';
      const subject = test ? test.subject : 'General';

      scoreHistory.push({
        date: new Date(att.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: Math.round(att.score_percentage),
        test_title: title
      });

      if (!subjectMap[subject]) {
        subjectMap[subject] = { tests_taken: 0, total_score: 0 };
      }
      subjectMap[subject].tests_taken += 1;
      subjectMap[subject].total_score += att.score_percentage;

      // Question-level stats
      if (test) {
        for (const q of test.questions) {
          const ans = att.answers[q.question_id];
          const diff = q.difficulty || 'medium';
          if (!difficultyMap[diff]) difficultyMap[diff] = { correct: 0, total: 0 };
          difficultyMap[diff].total += 1;
          if (ans?.is_correct) {
            difficultyMap[diff].correct += 1;
          } else {
            weakTopicMap[q.topic] = (weakTopicMap[q.topic] || 0) + 1;
          }
        }
      }
    }

    const averageScore = totalTestsAttempted > 0 ? Math.round(totalScore / totalTestsAttempted) : 0;
    const accuracyRate = totalQuestionsPracticed > 0 ? Math.round((totalCorrect / totalQuestionsPracticed) * 100) : 0;

    const subjectPerformance = Object.entries(subjectMap).map(([subject, data]) => ({
      subject,
      tests_taken: data.tests_taken,
      avg_score: Math.round(data.total_score / data.tests_taken)
    }));

    const difficultyPerformance = Object.entries(difficultyMap).map(([diff, data]) => ({
      difficulty: diff.charAt(0).toUpperCase() + diff.slice(1),
      correct: data.correct,
      total: data.total,
      percentage: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
    }));

    const weakTopics = Object.entries(weakTopicMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([topic, count]) => ({
        topic,
        incorrect_count: count,
        recommendation: `Dedicate 20 minutes to review key definitions and worked problems in ${topic}.`
      }));

    const recentActivity = attempts.slice(0, 5).map(att => {
      const test = this.data.tests[att.test_id];
      return {
        title: test ? test.test_title : 'Practice Exam',
        date: new Date(att.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        score: Math.round(att.score_percentage),
        test_id: att.test_id
      };
    });

    return {
      total_tests_generated: totalTestsGenerated,
      total_tests_attempted: totalTestsAttempted,
      average_score: averageScore,
      questions_practiced: totalQuestionsPracticed,
      accuracy_rate: accuracyRate,
      score_history: scoreHistory.reverse(),
      subject_performance: subjectPerformance,
      difficulty_performance: difficultyPerformance,
      weak_topics: weakTopics,
      recent_activity: recentActivity
    };
  }
}

export const db = new Database();
