import { Router } from 'express';
import { db } from '../data/database.js';

export const analyticsRouter = Router();

analyticsRouter.get('/', (req, res) => {
  const userId = (req.headers['x-user-id'] as string) || 'demo-student-001';
  const analytics = db.getAnalytics(userId);
  res.json({ analytics });
});
