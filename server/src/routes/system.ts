import { Router, Response } from 'express';
import { GeminiService } from '../services/gemini.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

export const systemRouter = Router();

// GET /api/system/status - Protected operational status endpoint
systemRouter.get('/status', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const clientKey = req.headers['x-gemini-key'] as string | undefined;
  const isKeyConfigured = GeminiService.isKeyAvailable(clientKey);

  res.json({
    status: 'online',
    version: '1.0.0',
    app: 'PrepIQ — AI Exam Practice Generator',
    ai_engine: {
      provider: 'Google Gemini',
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      is_key_active: isKeyConfigured,
      fallback_available: true
    },
    storage: {
      mode: 'persistent_atomic_json',
      connected: true
    }
  });
});

// POST /api/system/test-gemini - Validate personal API key connection safely
systemRouter.post('/test-gemini', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ success: false, message: 'Valid API key is required' });
  }

  // Sanitize key before passing to test connection
  const trimmed = apiKey.trim();
  const result = await GeminiService.testConnection(trimmed);
  res.json({
    success: result.success,
    model: result.model,
    message: result.message
  });
});
