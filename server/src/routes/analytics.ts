import { Router, Response } from 'express';
import { db } from '../data/database.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

export const analyticsRouter = Router();

// GET performance analytics for authenticated student
analyticsRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const analytics = db.getAnalytics(userId);
  res.json({ analytics });
});
