import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

import { authRouter } from './routes/auth.js';
import { documentsRouter } from './routes/documents.js';
import { generateRouter } from './routes/generate.js';
import { testsRouter } from './routes/tests.js';
import { analyticsRouter } from './routes/analytics.js';
import { testSuiteRouter } from './routes/testSuite.js';
import { systemRouter } from './routes/system.js';

const app = express();
const PORT = Number(process.env.PORT) || 5001;
const HOST = '0.0.0.0';

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-gemini-key']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'PrepIQ API Server',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/generate', generateRouter);
app.use('/api/tests', testsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/test-suite', testSuiteRouter);
app.use('/api/system', systemRouter);

// Serve static frontend assets in production / single-service mode
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Start Server
app.listen(PORT, HOST, () => {
  console.log(`🚀 PrepIQ Server listening on ${HOST}:${PORT}`);
  console.log(`📡 Ready for AI Exam Practice Generation & Validation`);
});
