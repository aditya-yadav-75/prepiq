import { Router } from 'express';
import { db } from '../data/database.js';
import { UserProfile } from '../types/index.js';

export const authRouter = Router();

// Login
authRouter.post('/login', (req, res) => {
  const { email, password, isDemo } = req.body;

  if (isDemo) {
    const demoUser = db.getUser('demo-student-001');
    if (demoUser) {
      return res.json({ success: true, user: demoUser });
    }
  }

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.json({ success: true, user: existing });
  }

  // If user doesn't exist, create automatically for demo convenience or validate
  const newUser: UserProfile = {
    id: `user-${Date.now()}`,
    name: email.split('@')[0],
    email,
    college: 'Apex Institute of Technology',
    course: 'Computer Science',
    year_of_study: '3rd Year',
    created_at: new Date().toISOString(),
    avatar_color: '#1649E8'
  };
  db.saveUser(newUser);

  res.json({ success: true, user: newUser });
});

// Register
authRouter.post('/register', (req, res) => {
  const { name, email, password, college, course, year_of_study } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const colors = ['#1649E8', '#245BFF', '#092B9B', '#4d78ff'];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];

  const newUser: UserProfile = {
    id: `user-${Date.now()}`,
    name,
    email,
    college: college || 'Apex Institute of Technology',
    course: course || 'Computer Science & Engineering',
    year_of_study: year_of_study || '3rd Year',
    created_at: new Date().toISOString(),
    avatar_color: avatarColor
  };

  db.saveUser(newUser);
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
