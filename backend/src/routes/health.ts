import { Router, Request, Response } from 'express';
import { HealthCheckIn } from '../models/Health';

const router = Router();

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

// Get readiness score
router.get('/:userId/readiness', async (req: Request, res: Response) => {
  try {
    // TODO: Calculate readiness score based on check-in data and AI
    const readinessScore = {
      score: 75,
      factors: {
        sleep: 0.8,
        stress: 0.7,
        soreness: 0.9,
        energy: 0.8,
      },
      recommendation: 'You are ready for a normal intensity workout. Get adequate rest and stay hydrated.',
    };
    
    res.json({ success: true, data: readinessScore });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
