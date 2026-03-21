import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const router = Router();

// Request OTP
router.post('/request-otp', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    // TODO: Call OTP service to send OTP
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify OTP and Login
router.post('/login-otp', async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;
    
    // TODO: Verify OTP with service
    
    let user = await User.findOne({ phone });
    
    if (!user) {
      user = await User.create({
        phone,
        name: `User ${phone.slice(-4)}`,
        age: 25,
        gender: 'male',
        height: 180,
        weight: 75,
        language: 'en',
        onboardingComplete: false,
      });
    }
    
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          phone: user.phone,
          name: user.name,
          email: user.email,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Google Login
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    // TODO: Verify Google token
    res.json({ success: true, message: 'Google login coming soon' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Current User
router.get('/me', (req: Request, res: Response) => {
  try {
    // TODO: Implement middleware to get user from token
    res.json({ success: true, data: null });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
