import { Router, Request, Response } from 'express';
import axios from 'axios';
import { FoodLog } from '../models/Health';
import { User } from '../models/User';

const router = Router();
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

// Get today's nutrition
router.get('/:userId/today', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const logs = await FoodLog.find({
      userId: req.params.userId,
      date: { $gte: today },
    });
    
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

// Get AI-powered food suggestions
router.get('/:userId/suggestions', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const proteinPct = parseFloat(req.query.proteinPct as string) || 1.0;

    const aiPayload = {
      user_id: String(user._id),
      age: user.age || 25,
      weight: user.weight || 75,
      height: user.height || 175,
      gender: user.gender || 'male',
      body_type: user.bodyType || 'mesomorph',
      lifestyle: user.lifestyle || 'moderate',
      gym_experience: user.gymExperience || 'intermediate',
      fitness_goal: user.fitnessGoal || 'general-fitness',
      diet_type: user.dietType || 'non-veg',
      readiness_score: 75,
      protein_pct: proteinPct,
    };

    const aiRes = await axios.post(`${AI_ENGINE_URL}/meal-suggestions`, aiPayload, {
      timeout: 10000,
    });

    res.json({ success: true, data: aiRes.data.data });
  } catch (error: any) {
    // Fallback suggestions
    const fallback = {
      breakfast: [{ name: 'Oatmeal with milk', calories: 300, protein: 12, serving: '1 bowl' }],
      lunch: [{ name: 'Rice + Dal + Salad', calories: 450, protein: 15, serving: '1 plate' }],
      dinner: [{ name: 'Roti + Sabji', calories: 400, protein: 10, serving: '2 rotis' }],
      snacks: [{ name: 'Curd + Peanuts', calories: 200, protein: 10, serving: '1 bowl' }],
      daily_targets: { calories: 2200, protein_grams: 120 },
    };
    res.json({ success: true, data: fallback, fallback: true });
  }
});

export default router;
