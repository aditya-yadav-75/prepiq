import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.js';
import { db } from '../data/database.js';
import { UserProfile } from '../types/index.js';

export interface AuthenticatedRequest extends Request {
  user?: UserProfile;
  userId?: string;
  tokenPayload?: TokenPayload;
}

/**
 * Enforce valid signed JWT Bearer authentication on protected endpoints
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Authentication required. Please provide a valid authorization token.' 
    });
  }

  const token = authHeader.substring(7).trim();
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ 
      error: 'Session invalid or expired. Please sign in again.' 
    });
  }

  const user = db.getUser(payload.id);
  if (!user) {
    return res.status(401).json({ 
      error: 'User account not found. Please register or sign in again.' 
    });
  }

  req.user = user;
  req.userId = user.id;
  req.tokenPayload = payload;
  next();
}
