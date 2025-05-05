import express from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';

const router = express.Router();

// Register new user
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('role').isIn(['landlord', 'tenant'])
  ],
  async (req, res) => {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Create new user
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        role
      });

      // Generate verification token
      const verificationToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      user.verificationToken = verificationToken;

      await user.save();

      // Send verification email
      await sendVerificationEmail(user.email, verificationToken);

      // Generate auth token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: user.getPublicProfile()
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Login user
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
  ],
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: user.getPublicProfile()
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Verify email
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findOne({
      _id: decoded.userId,
      verificationToken: token
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid verification token' });
  }
});

// Request password reset
router.post('/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      // Send reset email
      await sendPasswordResetEmail(user.email, resetToken);

      res.json({ message: 'Password reset email sent' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Reset password
router.post('/reset-password/:token',
  [body('password').isLength({ min: 6 })],
  async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user.getPublicProfile() });
});

// Update user profile
router.patch('/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['firstName', 'lastName', 'phone', 'preferences'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();
    res.json({ user: req.user.getPublicProfile() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router; 