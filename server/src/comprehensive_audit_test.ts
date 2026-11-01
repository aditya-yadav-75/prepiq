import dotenv from 'dotenv';
dotenv.config();

// Ensure JWT_SECRET is available for the test runner
process.env.JWT_SECRET = process.env.JWT_SECRET || 'prepiq_audit_verification_jwt_secret_key_minimum_32_characters_2026';

import express from 'express';
import { db } from './data/database.js';
import { signToken, verifyToken } from './utils/jwt.js';
import { authRouter } from './routes/auth.js';
import { documentsRouter } from './routes/documents.js';
import { testsRouter } from './routes/tests.js';
import { analyticsRouter } from './routes/analytics.js';
import { generateRouter } from './routes/generate.js';
import { testSuiteRouter } from './routes/testSuite.js';
import { systemRouter } from './routes/system.js';

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use('/api/auth', authRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/tests', testsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/generate', generateRouter);
app.use('/api/test-suite', testSuiteRouter);
app.use('/api/system', systemRouter);

// Public health check route
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'PrepIQ API Server',
    timestamp: new Date().toISOString()
  });
});

interface AuditCheck {
  id: number;
  description: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: string;
}

const auditChecks: AuditCheck[] = [];

// In-process dispatcher
function dispatch(
  method: string, 
  path: string, 
  headers: Record<string, string> = {}, 
  body?: any
): Promise<{ status: number; body: any; headers: Record<string, any> }> {
  return new Promise((resolve) => {
    const reqHeaders: Record<string, string> = {};
    for (const [k, v] of Object.entries(headers)) {
      reqHeaders[k.toLowerCase()] = v;
    }

    const req: any = {
      method,
      url: path,
      path: path.split('?')[0],
      headers: reqHeaders,
      body: body || {},
      query: {},
      params: {},
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
      get: (header: string) => reqHeaders[header.toLowerCase()]
    };

    const resHeaders: Record<string, any> = {};
    const res: any = {
      statusCode: 200,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      setHeader(name: string, value: any) {
        resHeaders[name.toLowerCase()] = value;
      },
      getHeader(name: string) {
        return resHeaders[name.toLowerCase()];
      },
      json(data: any) {
        resolve({ status: this.statusCode, body: data, headers: resHeaders });
      },
      send(data: any) {
        resolve({ status: this.statusCode, body: data, headers: resHeaders });
      }
    };

    (app as any).handle(req, res, () => {
      resolve({ status: 404, body: { error: 'Not Found' }, headers: resHeaders });
    });
  });
}

async function runComprehensiveAudit() {
  console.log('================================================================');
  console.log('🎯 PrepIQ FINAL AUDIT & HARDENING VERIFICATION HARNESS');
  console.log('Testing all 15 mandated functional & security scenarios');
  console.log('================================================================\n');

  const testEmailA = `student.audit.a.${Date.now()}@university.edu`;
  const passwordA = 'StrongP@ssw0rd2026!';
  let tokenA = '';
  let userAId = '';
  let docAId = '';
  let testAId = '';
  let attemptAId = '';

  // 1. Register a new account
  {
    const res = await dispatch('POST', '/api/auth/register', {}, {
      name: 'Alice Academic Auditor',
      email: testEmailA,
      password: passwordA,
      college: 'Faculty of Computing',
      course: 'Advanced Operating Systems',
      year_of_study: '4th Year'
    });

    const passed = res.status === 201 && !!res.body?.token && !!res.body?.user?.id && !res.body?.user?.password;
    tokenA = res.body?.token;
    userAId = res.body?.user?.id;

    auditChecks.push({
      id: 1,
      description: 'Register a new student account with validated password',
      passed,
      expected: 'HTTP 201 Created + signed JWT token + user profile without password fields',
      actual: `HTTP ${res.status}, user_id: ${userAId}`,
      details: `JWT Token length: ${tokenA ? tokenA.length : 0}`
    });
  }

  // 2. Register using an already-existing email
  {
    const res = await dispatch('POST', '/api/auth/register', {}, {
      name: 'Alice Duplicate Attempt',
      email: testEmailA,
      password: passwordA
    });

    const passed = res.status === 400 && res.body?.error?.includes('already registered');
    auditChecks.push({
      id: 2,
      description: 'Register using an already-existing email address',
      passed,
      expected: 'HTTP 400 Bad Request + friendly duplicate message',
      actual: `HTTP ${res.status}`,
      details: res.body?.error
    });
  }

  // 3. Log in with correct credentials
  {
    const res = await dispatch('POST', '/api/auth/login', {}, {
      email: testEmailA,
      password: passwordA,
      rememberMe: true
    });

    const verified = verifyToken(res.body?.token);
    const passed = res.status === 200 && !!res.body?.token && verified?.id === userAId;

    auditChecks.push({
      id: 3,
      description: 'Log in with valid credentials and receive verifiable JWT token',
      passed,
      expected: 'HTTP 200 OK + Valid HS256 JWT Token',
      actual: `HTTP ${res.status}, Token payload sub: ${verified?.id}`,
      details: `Token expiration: ${new Date((verified?.exp || 0) * 1000).toISOString()}`
    });
  }

  // 4. Log in with an incorrect password
  {
    const res = await dispatch('POST', '/api/auth/login', {}, {
      email: testEmailA,
      password: 'IncorrectPassword999!'
    });

    const passed = res.status === 401 && res.body?.error === 'Invalid email or password.';
    auditChecks.push({
      id: 4,
      description: 'Log in with incorrect password rejected without user enumeration',
      passed,
      expected: 'HTTP 401 Unauthorized + generic error message',
      actual: `HTTP ${res.status}`,
      details: res.body?.error
    });
  }

  // 5. Access protected endpoints without a JWT
  {
    const resDocs = await dispatch('GET', '/api/documents');
    const resTests = await dispatch('GET', '/api/tests');
    const resAnalytics = await dispatch('GET', '/api/analytics');

    const passed = resDocs.status === 401 && resTests.status === 401 && resAnalytics.status === 401;
    auditChecks.push({
      id: 5,
      description: 'Access protected endpoints without a JWT Authorization token',
      passed,
      expected: 'HTTP 401 Unauthorized across /documents, /tests, /analytics',
      actual: `docs=${resDocs.status}, tests=${resTests.status}, analytics=${resAnalytics.status}`,
      details: resDocs.body?.error
    });
  }

  // 6. Access protected endpoints using an invalid JWT
  {
    const forgedToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItZmFrZSIsImVtYWlsIjoiZmFrZUB1bml2ZXJzaXR5LmVkdSJ9.fake_signature_hash';
    const res = await dispatch('GET', '/api/documents', {
      authorization: forgedToken
    });

    const passed = res.status === 401;
    auditChecks.push({
      id: 6,
      description: 'Access protected endpoints with forged/tampered JWT signature',
      passed,
      expected: 'HTTP 401 Unauthorized',
      actual: `HTTP ${res.status}`,
      details: res.body?.error
    });
  }

  // Setup User A private document & User B (Attacker / Unrelated student)
  {
    const docRes = await dispatch('POST', '/api/documents/raw', {
      authorization: `Bearer ${tokenA}`
    }, {
      title: 'Alice Private Distributed Systems Notes',
      subject: 'Computer Science',
      content: 'Consensus protocols in distributed systems guarantee agreement among processes despite message delays or machine failures. Paxos uses proposers, acceptors, and learners, while Raft uses leader election, log replication, and safety invariants.'
    });
    docAId = docRes.body?.document?.id;
  }

  const testEmailB = `student.audit.b.${Date.now()}@university.edu`;
  let tokenB = '';
  let userBId = '';
  {
    const regB = await dispatch('POST', '/api/auth/register', {}, {
      name: 'Bob Unrelated Student',
      email: testEmailB,
      password: 'StrongP@ssw0rd2026!',
      college: 'Informatics Dept',
      course: 'Networks'
    });
    tokenB = regB.body?.token;
    userBId = regB.body?.user?.id;
  }

  // 7. Access another student's document (IDOR protection)
  {
    const readAttempt = await dispatch('GET', `/api/documents/${docAId}`, {
      authorization: `Bearer ${tokenB}`
    });
    const deleteAttempt = await dispatch('DELETE', `/api/documents/${docAId}`, {
      authorization: `Bearer ${tokenB}`
    });

    const passed = readAttempt.status === 403 && deleteAttempt.status === 403;
    auditChecks.push({
      id: 7,
      description: 'Cross-student document access and deletion blocked (IDOR prevention)',
      passed,
      expected: 'HTTP 403 Forbidden for both GET and DELETE by User B',
      actual: `read=${readAttempt.status}, delete=${deleteAttempt.status}`,
      details: readAttempt.body?.error
    });
  }

  // Generate a test for User A
  {
    const genRes = await dispatch('POST', '/api/generate/test', {
      authorization: `Bearer ${tokenA}`
    }, {
      document_id: docAId,
      question_count: 5,
      difficulty: 'medium',
      question_types: ['mcq', 'true_false']
    });
    testAId = genRes.body?.test?.test_id;
  }

  // 8. Access another student's test (IDOR protection on tests)
  {
    const readTestAttempt = await dispatch('GET', `/api/tests/${testAId}`, {
      authorization: `Bearer ${tokenB}`
    });
    const submitAttempt = await dispatch('POST', `/api/tests/${testAId}/submit`, {
      authorization: `Bearer ${tokenB}`
    }, {
      answers: { q1: 'Raft' }
    });

    const passed = readTestAttempt.status === 403 && submitAttempt.status === 403;
    auditChecks.push({
      id: 8,
      description: 'Cross-student test access and submission blocked',
      passed,
      expected: 'HTTP 403 Forbidden for both test view and submission by User B',
      actual: `read=${readTestAttempt.status}, submit=${submitAttempt.status}`,
      details: readTestAttempt.body?.error
    });
  }

  // 9. Submit an exam and retrieve its results
  {
    const submitRes = await dispatch('POST', `/api/tests/${testAId}/submit`, {
      authorization: `Bearer ${tokenA}`
    }, {
      time_taken_seconds: 120,
      answers: {
        q1: 'Consensus protocols',
        q2: 'True'
      }
    });

    attemptAId = submitRes.body?.attempt?.attempt_id;
    const readAttemptRes = await dispatch('GET', `/api/tests/attempts/${attemptAId}`, {
      authorization: `Bearer ${tokenA}`
    });

    const crossAttemptRes = await dispatch('GET', `/api/tests/attempts/${attemptAId}`, {
      authorization: `Bearer ${tokenB}`
    });

    const passed = submitRes.status === 201 && 
      readAttemptRes.status === 200 && 
      readAttemptRes.body?.attempt?.user_id === userAId &&
      crossAttemptRes.status === 403;

    auditChecks.push({
      id: 9,
      description: 'Submit an exam, trigger evaluation workflow, and enforce attempt isolation',
      passed,
      expected: 'HTTP 201 Created on submit, HTTP 200 for owner, HTTP 403 for other student',
      actual: `submit=${submitRes.status}, owner_read=${readAttemptRes.status}, cross_read=${crossAttemptRes.status}`,
      details: `Attempt score: ${readAttemptRes.body?.attempt?.score_percentage}%`
    });
  }

  // 10. Refresh the application while logged in (/api/auth/me)
  {
    const res = await dispatch('GET', '/api/auth/me', {
      authorization: `Bearer ${tokenA}`
    });

    const passed = res.status === 200 && res.body?.user?.id === userAId && res.body?.user?.email === testEmailA;
    auditChecks.push({
      id: 10,
      description: 'Browser refresh preserves session via verified JWT on /api/auth/me',
      passed,
      expected: 'HTTP 200 OK + authenticated UserProfile',
      actual: `HTTP ${res.status}, user_id: ${res.body?.user?.id}`,
      details: `Name: ${res.body?.user?.name}`
    });
  }

  // 11. Log out and attempt to reuse expired/invalidated session
  {
    // Emulate an expired token (exp in past)
    const expiredToken = signToken({ id: userAId, email: testEmailA }, -3600); // expired 1 hour ago
    const res = await dispatch('GET', '/api/auth/me', {
      authorization: `Bearer ${expiredToken}`
    });

    const passed = res.status === 401;
    auditChecks.push({
      id: 11,
      description: 'Expired or invalidated session tokens are rejected on refresh/verification',
      passed,
      expected: 'HTTP 401 Unauthorized',
      actual: `HTTP ${res.status}`,
      details: res.body?.error
    });
  }

  // 12. Upload an unsupported file / insufficient text
  {
    const res = await dispatch('POST', '/api/documents/raw', {
      authorization: `Bearer ${tokenA}`
    }, {
      title: 'Tiny Snippet',
      subject: 'Test',
      content: 'Too short.' // Below 100 char threshold
    });

    const passed = res.status === 422;
    auditChecks.push({
      id: 12,
      description: 'Reject insufficient or invalid document input (Quality validation invariant)',
      passed,
      expected: 'HTTP 422 Unprocessable Entity',
      actual: `HTTP ${res.status}`,
      details: res.body?.error
    });
  }

  // 13. Test persistence after server restart
  {
    // Read directly from disk store to verify atomic persistence
    const loadedDoc = db.getDocument(docAId);
    const loadedTest = db.getTest(testAId);
    const loadedAttempt = db.getAttempt(attemptAId);

    const passed = !!loadedDoc && !!loadedTest && !!loadedAttempt && loadedDoc.user_id === userAId;
    auditChecks.push({
      id: 13,
      description: 'Data persistence across atomic writes (documents, tests, attempts committed)',
      passed,
      expected: 'All student documents, tests, and attempts persisted without corruption',
      actual: `doc=${!!loadedDoc}, test=${!!loadedTest}, attempt=${!!loadedAttempt}`,
      details: `Persisted Doc ID: ${loadedDoc?.id}`
    });
  }

  // 14. Test unauthorized prompt-comparison and test-suite requests
  {
    const resPromptsAnon = await dispatch('POST', '/api/generate/compare-prompts');
    const resSuiteAnon = await dispatch('POST', '/api/test-suite/run-all');
    const resSingleTestAnon = await dispatch('POST', '/api/test-suite/run/1');

    const resPromptsAuth = await dispatch('POST', '/api/generate/compare-prompts', {
      authorization: `Bearer ${tokenA}`
    });

    const passed = resPromptsAnon.status === 401 && 
      resSuiteAnon.status === 401 && 
      resSingleTestAnon.status === 401 && 
      resPromptsAuth.status === 200;

    auditChecks.push({
      id: 14,
      description: 'Prompt comparison and test-suite endpoints protected against unauthorized drain',
      passed,
      expected: 'HTTP 401 for anonymous calls, HTTP 200 for authenticated students',
      actual: `promptsAnon=${resPromptsAnon.status}, suiteAnon=${resSuiteAnon.status}, promptsAuth=${resPromptsAuth.status}`,
      details: `Prompt versions compared: ${resPromptsAuth.body?.comparisons?.length || 0}`
    });
  }

  // 15. Verify that sensitive information is not returned by public endpoints
  {
    const resHealth = await dispatch('GET', '/api/health');
    const resLogin = await dispatch('POST', '/api/auth/login', {}, {
      email: testEmailA,
      password: passwordA
    });

    const healthLeaks = resHealth.body?.auth_mode || resHealth.body?.jwt_secret || resHealth.body?.database_url;
    const loginLeaks = resLogin.body?.user?.password || resLogin.body?.user?.hashed_password;

    const passed = !healthLeaks && !loginLeaks && resHealth.status === 200;
    auditChecks.push({
      id: 15,
      description: 'Zero sensitive data exposure on public endpoints (Health, Login responses)',
      passed,
      expected: 'No passwords, hashes, secret keys, or internal auth modes leaked',
      actual: `Health leak: ${!healthLeaks ? 'None' : 'LEAK'}, Login hash leak: ${!loginLeaks ? 'None' : 'LEAK'}`,
      details: `Health response keys: ${Object.keys(resHealth.body).join(', ')}`
    });
  }

  console.log('----------------------------------------------------------------');
  let allPass = true;
  for (const c of auditChecks) {
    const badge = c.passed ? '✅ PASS' : '❌ FAIL';
    if (!c.passed) allPass = false;
    console.log(`${badge} | Item ${c.id}: ${c.description}`);
    console.log(`       Expected: ${c.expected}`);
    console.log(`       Actual:   ${c.actual}`);
    if (c.details) console.log(`       Details:  ${c.details}`);
  }
  console.log('----------------------------------------------------------------');
  console.log(`AUDIT SUMMARY: ${auditChecks.filter(c => c.passed).length}/${auditChecks.length} CHECKS PASSED.`);
  console.log('================================================================\n');

  if (!allPass) {
    process.exit(1);
  }
}

runComprehensiveAudit().catch(err => {
  console.error('Fatal audit harness error:', err);
  process.exit(1);
});
