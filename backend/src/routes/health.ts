import { Router, Request, Response } from 'express';
import axios from 'axios';
import { HealthCheckIn } from '../models/Health';

const router = Router();
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

// Submit daily check-in
router.post('/:userId/check-in', async (req: Request, res: Response) => {
  try {
    const checkIn = await HealthCheckIn.create({
      userId: req.params.userId,
      ...req.body,
      date: new Date(),
    });
    res.json({ success: true, data: checkIn });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get today's check-in
router.get('/:userId/today-check-in', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkIn = await HealthCheckIn.findOne({
      userId: req.params.userId,
      date: { $gte: today },
    });
    
    res.json({ success: true, data: checkIn || null });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get readiness score (calls AI engine if check-in data exists)
router.get('/:userId/readiness', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkIn = await HealthCheckIn.findOne({
      userId: req.params.userId,
      date: { $gte: today },
    });

    if (checkIn) {
      // Ask the AI engine to compute the readiness score from today's check-in
      try {
        const aiRes = await axios.post(
          `${AI_ENGINE_URL}/readiness-score`,
          {
            energy: checkIn.energy,
            sleep: checkIn.sleep,
            stress: checkIn.stress,
            soreness: checkIn.soreness,
          },
          { timeout: 8000 }
        );
        return res.json({ success: true, data: aiRes.data.data });
      } catch (_) {
        // fall through to rule-based fallback
      }

      // Rule-based fallback when AI is unavailable
      const energyScore = checkIn.energy * 10;
      const sleepScore = Math.min((checkIn.sleep / 8) * 100, 100);
      const stressScore = (10 - checkIn.stress) * 10;
      const soreness_score = (10 - checkIn.soreness) * 10;
      const score = Math.round(
        energyScore * 0.25 + sleepScore * 0.35 + stressScore * 0.25 + soreness_score * 0.15
      );

      let recommendation = 'Normal intensity workout is recommended';
      if (score < 35) recommendation = 'Rest day recommended — light stretching only';
      else if (score < 50) recommendation = 'Take a lighter workout or active recovery session';
      else if (score < 65) recommendation = 'Light to normal intensity is fine today';
      else if (score >= 80) recommendation = 'You are ready for a challenging workout!';

      return res.json({
        success: true,
        data: {
          score,
          factors: {
            sleep: Math.round(sleepScore) / 100,
            energy: energyScore / 100,
            stress: stressScore / 100,
            soreness: soreness_score / 100,
          },
          recommendation,
        },
      });
    }

    // No check-in yet today — return default
    res.json({
      success: true,
      data: {
        score: 75,
        factors: { sleep: 0.8, stress: 0.7, soreness: 0.9, energy: 0.8 },
        recommendation: 'Complete today\'s check-in for a personalised readiness score.',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
