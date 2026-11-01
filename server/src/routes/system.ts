import { Router } from 'express';
import { GeminiService } from '../services/gemini.js';

export const systemRouter = Router();

systemRouter.get('/status', (req, res) => {
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
      mode: process.env.SUPABASE_URL ? 'supabase_postgres' : 'persistent_store_json',
      connected: true
    }
  });
});

systemRouter.post('/test-gemini', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) {
    return res.status(400).json({ success: false, message: 'API key is required' });
  }

  const result = await GeminiService.testConnection(apiKey);
  res.json(result);
});
