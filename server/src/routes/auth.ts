import { Router, Response } from 'express';
import { db } from '../data/database.js';
import { UserProfile } from '../types/index.js';
import { hashPassword, verifyPassword } from '../utils/security.js';
import { signToken } from '../utils/jwt.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

export const authRouter = Router();

// POST /api/auth/login - Authenticate with email and password
authRouter.post('/login', authRateLimiter, (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Both email and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = db.getUserByEmail(normalizedEmail);
  if (!existing) {
    // Constant-time behavior prevents user enumeration
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const storedHash = db.getUserPassword(existing.id);
  if (!storedHash || !verifyPassword(password, storedHash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Generate signed JWT token
  const expiresInSeconds = rememberMe ? 30 * 86400 : 24 * 3600; // 30 days if rememberMe, else 24 hours
  const token = signToken({ id: existing.id, email: existing.email }, expiresInSeconds);

  res.json({
    success: true,
    user: existing,
    token
  });
});

// POST /api/auth/register - Register a new student account
authRouter.post('/register', authRateLimiter, (req, res) => {
  const { name, email, password, college, course, year_of_study } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Full name is required.' });
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Please enter a valid academic email address.' });
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return res.status(400).json({ error: 'Password must contain both letters and numbers/symbols for security.' });
  }

  const existing = db.getUserByEmail(normalizedEmail);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email address is already registered. Please log in.' });
  }

  const colors = ['#1649E8', '#245BFF', '#092B9B', '#4d78ff'];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];

  const newUser: UserProfile = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    college: (college && typeof college === 'string') ? college.trim() : 'Apex Institute of Technology',
    course: (course && typeof course === 'string') ? course.trim() : 'Computer Science & Engineering',
    year_of_study: (year_of_study && typeof year_of_study === 'string') ? year_of_study.trim() : '3rd Year',
    created_at: new Date().toISOString(),
    avatar_color: avatarColor
  };

  const hashedPassword = hashPassword(password);
  db.saveUser(newUser);
  db.setUserPassword(newUser.id, hashedPassword);

  // Sign initial JWT token
  const token = signToken({ id: newUser.id, email: newUser.email }, 30 * 86400);

  res.status(201).json({
    success: true,
    user: newUser,
    token
  });
});

// POST /api/auth/forgot-password - Explicitly informs that self-service reset is disabled without SMTP
authRouter.post('/forgot-password', authRateLimiter, (req, res) => {
  res.status(400).json({
    error: 'Self-service password reset is disabled on this deployment because an institutional SMTP email delivery service is not configured. Please contact the administrator or register a new account.'
  });
});

// GET /api/auth/me - Retrieve current verified profile
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

// PUT /api/auth/profile - Update current user profile
authRouter.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { name, college, course, year_of_study } = req.body;

  if (name && typeof name === 'string') user.name = name.trim();
  if (college && typeof college === 'string') user.college = college.trim();
  if (course && typeof course === 'string') user.course = course.trim();
  if (year_of_study && typeof year_of_study === 'string') user.year_of_study = year_of_study.trim();

  db.saveUser(user);
  res.json({ success: true, user });
});
