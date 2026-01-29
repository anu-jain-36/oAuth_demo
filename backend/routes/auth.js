import express from 'express';
import passport from 'passport';
import User from '../models/User.js';
import hashEmail from '../config/hashEmail.js';
import { encrypt } from '../config/encryption.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const emailHash = hashEmail(email);

    const existingUser = await User.findOne({ email: emailHash });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      email: emailHash,
      password,
      name
    });

    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging in' });
      }

      res.status(201).json({
        message: 'Signup successful',
        user: {
          id: user._id,
          email: user.email, // ⚠️ this is a hash now
          name: user.name
        }
      });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }
    if (!user) {
      return res.status(401).json({ message: info.message || 'Login failed' });
    }
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging in' });
      }
      res.json({
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      });
    });
  })(req, res, next);
});

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.json({ message: 'Logout successful' });
  });
});

router.get('/user', isAuthenticated, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name
    }
  });
});

export default router;