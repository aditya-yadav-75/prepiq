import { 
  UserProfile, 
  StudyDocument, 
  PracticeTest, 
  TestAttempt, 
  PerformanceAnalytics, 
  PromptComparisonResult, 
  TestCaseResult 
} from '../types/index.js';

const API_BASE = '/api';

function getHeaders(isFormData = false): Record<string, string> {
  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  // Cryptographically signed JWT token stored in localStorage (persistent) or sessionStorage (transient)
  const token = localStorage.getItem('prepiq_token') || sessionStorage.getItem('prepiq_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const geminiKey = localStorage.getItem('prepiq_gemini_key');
  if (geminiKey) {
    headers['x-gemini-key'] = geminiKey;
  }

  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
    }
    return data;
  }
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Unexpected response format from server (${res.status})`);
  }
}

export const api = {
  // Auth
  async login(email: string, password?: string, rememberMe = true): Promise<{ success: boolean; user: UserProfile; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password, rememberMe })
    });
    return handleResponse<{ success: boolean; user: UserProfile; token: string }>(res);
  },

  async register(data: { name: string; email: string; password?: string; college?: string; course?: string; year_of_study?: string }): Promise<{ success: boolean; user: UserProfile; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<{ success: boolean; user: UserProfile; token: string }>(res);
  },

  async getCurrentUser(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    const data = await handleResponse<{ success: boolean; user: UserProfile }>(res);
    return data.user;
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const json = await handleResponse<{ success: boolean; user: UserProfile }>(res);
    return json.user;
  },

  async resetDemoData(): Promise<void> {
    await fetch(`${API_BASE}/auth/reset-demo`, {
      method: 'POST',
      headers: getHeaders()
    });
  },

  // Documents
  async getDocuments(): Promise<StudyDocument[]> {
    const res = await fetch(`${API_BASE}/documents`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch documents');
    const data = await res.json();
    return data.documents;
  },

  async getDocument(id: string): Promise<StudyDocument> {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Document not found');
    const data = await res.json();
    return data.document;
  },

  async uploadFile(file: File, subject?: string): Promise<StudyDocument> {
    const formData = new FormData();
    formData.append('file', file);
    if (subject) formData.append('subject', subject);

    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Upload failed');
    }
    const data = await res.json();
    return data.document;
  },

  async saveRawText(title: string, subject: string, content: string): Promise<StudyDocument> {
    const res = await fetch(`${API_BASE}/documents/raw`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, subject, content })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save text');
    }
    const data = await res.json();
    return data.document;
  },

  async deleteDocument(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete document');
  },

  // Test Generation
  async generateTest(config: {
    document_id?: string;
    raw_text?: string;
    subject?: string;
    topic?: string;
    question_count: number;
    difficulty: string;
    question_types: string[];
    prompt_version: string;
    include_explanations: boolean;
    include_difficulty_labels: boolean;
    timed_mode: boolean;
    time_limit_minutes: number;
  }): Promise<{ test: PracticeTest; meta: any }> {
    const res = await fetch(`${API_BASE}/generate/test`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(config)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Generation failed');
    }
    return res.json();
  },

  async comparePrompts(document_id?: string, raw_text?: string): Promise<{ comparisons: PromptComparisonResult[]; metadata: any }> {
    const res = await fetch(`${API_BASE}/generate/compare-prompts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ document_id, raw_text })
    });
    if (!res.ok) throw new Error('Comparison failed');
    return res.json();
  },

  // Tests & Submissions
  async getTests(): Promise<PracticeTest[]> {
    const res = await fetch(`${API_BASE}/tests`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch tests');
    const data = await res.json();
    return data.tests;
  },

  async getTest(id: string): Promise<PracticeTest> {
    const res = await fetch(`${API_BASE}/tests/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Test not found');
    const data = await res.json();
    return data.test;
  },

  async submitTest(testId: string, payload: {
    started_at: string;
    time_taken_seconds: number;
    answers: Record<string, string>;
  }): Promise<{ attempt: TestAttempt }> {
    const res = await fetch(`${API_BASE}/tests/${testId}/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Submission failed');
    }
    return res.json();
  },

  async getAttempt(attemptId: string): Promise<{ attempt: TestAttempt; test: PracticeTest }> {
    const res = await fetch(`${API_BASE}/tests/attempts/${attemptId}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Attempt not found');
    return res.json();
  },

  async deleteTest(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/tests/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete test');
  },

  // Analytics
  async getAnalytics(): Promise<PerformanceAnalytics> {
    const res = await fetch(`${API_BASE}/analytics`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    const data = await res.json();
    return data.analytics;
  },

  // Test Suite
  async runAllTestSuite(): Promise<{ total: number; passed: number; failed: number; results: TestCaseResult[] }> {
    const res = await fetch(`${API_BASE}/test-suite/run-all`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to run test suite');
    return res.json();
  },

  async runSingleTestCase(id: string): Promise<TestCaseResult> {
    const res = await fetch(`${API_BASE}/test-suite/run/${id}`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`Failed to run test case ${id}`);
    const data = await res.json();
    return data.result;
  },

  // System
  async getSystemStatus(): Promise<any> {
    const res = await fetch(`${API_BASE}/system/status`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to get status');
    return res.json();
  },

  async testGeminiKey(apiKey: string): Promise<{ success: boolean; model: string; message: string }> {
    const res = await fetch(`${API_BASE}/system/test-gemini`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ apiKey })
    });
    return res.json();
  }
};
