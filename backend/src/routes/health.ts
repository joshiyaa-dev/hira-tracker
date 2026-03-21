import { Router, Request, Response } from 'express';
import axios from 'axios';
import { HealthCheckIn } from '../models/Health';

const router = Router();
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

// Submit daily check-in and calculate readiness via AI engine
router.post('/:userId/check-in', async (req: Request, res: Response) => {
  try {
    const checkIn = await HealthCheckIn.create({
      userId: req.params.userId,
      ...req.body,
      date: new Date(),
    });

    // Calculate readiness score from AI engine
    let readiness = null;
    try {
      const aiRes = await axios.post(
        `${AI_ENGINE_URL}/readiness-score`,
        {
          energy: req.body.energy,
          sleep: req.body.sleep,
          stress: req.body.stress,
          soreness: req.body.soreness,
        },
        { timeout: 8000 }
      );
      readiness = aiRes.data.data;
    } catch (aiErr: any) {
      console.error('[Health] AI engine readiness error:', aiErr.message);
    }

    res.json({ success: true, data: checkIn, readiness });
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

// Get readiness score — computed from today's check-in via AI engine
router.get('/:userId/readiness', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkIn = await HealthCheckIn.findOne({
      userId: req.params.userId,
      date: { $gte: today },
    });

    if (checkIn) {
      // Have today's check-in — ask AI engine for score
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
      } catch (aiErr: any) {
        console.error('[Health] AI readiness error:', aiErr.message);
        // Fall through to default below
      }
    }

    // Default readiness (no check-in yet or AI down)
    res.json({
      success: true,
      data: {
        score: 75,
        factors: { sleep: 0.8, stress: 0.7, soreness: 0.9, energy: 0.8 },
        recommendation: 'Complete your daily check-in to get a personalised readiness score.',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
