import { Router, Request, Response } from 'express';
import { FoodLog } from '../models/Health';

const router = Router();

// Get today's nutrition
router.get('/:userId/today', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const logs = await FoodLog.find({
      userId: req.params.userId,
      date: { $gte: today },
    });
    
    // TODO: Calculate nutritional info from food database
    res.json({
      success: true,
      data: {
        date: today,
        totalCalories: 0,
        totalProtein: 0,
        targetProtein: 150,
        logs,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Log food
router.post('/:userId/log-food', async (req: Request, res: Response) => {
  try {
    const foodLog = await FoodLog.create({
      userId: req.params.userId,
      ...req.body,
      date: new Date(),
    });
    res.json({ success: true, data: foodLog });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get food suggestions
router.get('/:userId/suggestions', async (req: Request, res: Response) => {
  try {
    const suggestions = [
      'Boiled eggs for breakfast',
      'Chicken with rice for lunch',
      'Dal with roti for dinner',
    ];
    res.json({ success: true, data: suggestions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
