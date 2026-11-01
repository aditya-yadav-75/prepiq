import { Router, Response } from 'express';
import { db } from '../data/database.js';
import { UserProfile } from '../types/index.js';
import { hashPassword, verifyPassword } from '../utils/security.js';
import { signToken } from '../utils/jwt.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

export const authRouter = Router();

// POST /api/auth/login - Authenticate with email and password
authRouter.post('/login', (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Both email and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = db.getUserByEmail(normalizedEmail);
  if (!existing) {
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
authRouter.post('/register', (req, res) => {
  const { name, email, password, college, course, year_of_study } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Full name is required.' });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const existing = db.getUserByEmail(normalizedEmail);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
  }

  const colors = ['#1649E8', '#245BFF', '#092B9B', '#4d78ff'];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];

  const newUser: UserProfile = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    college: college || 'Apex Institute of Technology',
    course: course || 'Computer Science & Engineering',
    year_of_study: year_of_study || '3rd Year',
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

// POST /api/auth/forgot-password - Informational / Token-based reset endpoint
authRouter.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = db.getUserByEmail(normalizedEmail);

  if (user) {
    console.log(`[AUTH AUDIT] Password reset requested for registered user: ${user.email} (${user.id})`);
  }

  // Consistent message prevents user enumeration attacks
  res.json({
    success: true,
    message: 'If an account is associated with this email, password reset instructions have been recorded. Self-service email reset requires an institutional SMTP gateway.'
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

  if (name) user.name = name.trim();
  if (college) user.college = college.trim();
  if (course) user.course = course.trim();
  if (year_of_study) user.year_of_study = year_of_study.trim();

  db.saveUser(user);
  res.json({ success: true, user });
});
