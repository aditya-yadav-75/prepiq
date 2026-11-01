import { Router } from 'express';
import { db } from '../data/database.js';
import { UserProfile } from '../types/index.js';
import { hashPassword, verifyPassword } from '../utils/security.js';

export const authRouter = Router();

// Login
authRouter.post('/login', (req, res) => {
  const { email, password, isDemo } = req.body;

  // 1-Click Demo Student Sign-In
  if (isDemo) {
    const demoUser = db.getUser('demo-student-001');
    if (demoUser) {
      return res.json({ success: true, user: demoUser });
    }
  }

  if (!email || !password) {
    return res.status(400).json({ error: 'Both email and password are required.' });
  }

  const existing = db.getUserByEmail(email.trim().toLowerCase());
  if (!existing) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const storedHash = db.getUserPassword(existing.id);
  if (!storedHash) {
    // If demo account was accessed by email, seed password hash if missing
    if (existing.email === 'student@prepiq.edu') {
      const defaultHash = hashPassword('password123');
      db.setUserPassword(existing.id, defaultHash);
      if (!verifyPassword(password, defaultHash)) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
    } else {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
  } else if (!verifyPassword(password, storedHash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  res.json({ success: true, user: existing });
});

// Register
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

  res.status(201).json({ success: true, user: newUser });
});

// Current user profile
authRouter.get('/me', (req, res) => {
  const userId = (req.headers['x-user-id'] as string) || 'demo-student-001';
  const user = db.getUser(userId) || db.getUser('demo-student-001');
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});

// Update profile
authRouter.put('/profile', (req, res) => {
  const userId = (req.headers['x-user-id'] as string) || 'demo-student-001';
  const user = db.getUser(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { name, college, course, year_of_study } = req.body;
  if (name) user.name = name;
  if (college) user.college = college;
  if (course) user.course = course;
  if (year_of_study) user.year_of_study = year_of_study;

  db.saveUser(user);
  res.json({ success: true, user });
});

// Reset to demo data
authRouter.post('/reset-demo', (req, res) => {
  db.seedDemoData();
  res.json({ success: true, message: 'Database reset to initial demonstration state.' });
});
