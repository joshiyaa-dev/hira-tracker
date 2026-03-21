import { Router, Request, Response } from 'express';
import axios from 'axios';
import { User } from '../models/User';
import { HealthCheckIn } from '../models/Health';

const router = Router();
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

/** Build the payload expected by the Python AI engine from a MongoDB user document */
function buildUserPayload(user: any, extras: Record<string, any> = {}): Record<string, any> {
  return {
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
    protein_pct: 1.0,
    ...extras,
  };
}

// POST /api/ai/:userId/meal-suggestions
router.post('/:userId/meal-suggestions', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { proteinPct } = req.body;
    const payload = buildUserPayload(user, { protein_pct: proteinPct ?? 1.0 });

    const aiRes = await axios.post(`${AI_ENGINE_URL}/meal-suggestions`, payload, {
      timeout: 10000,
    });
    res.json({ success: true, data: aiRes.data.data });
  } catch (error: any) {
    // Fallback plan on AI failure
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

// POST /api/ai/:userId/adjust-intensity
router.post('/:userId/adjust-intensity', async (req: Request, res: Response) => {
  try {
    const { intensity, energy, sleep, stress, soreness } = req.body;

    // If full check-in data provided, use AI to compute intensity
    if (energy !== undefined && sleep !== undefined) {
      const user = await User.findById(req.params.userId);
      const userPayload = user ? buildUserPayload(user) : buildUserPayload({});
      const checkinPayload = { energy, sleep, stress: stress ?? 5, soreness: soreness ?? 3 };

      const aiRes = await axios.post(
        `${AI_ENGINE_URL}/adjust-intensity`,
        { ...userPayload, ...checkinPayload },  // FastAPI expects flat body for single-model endpoint
        { timeout: 8000 }
      );
      return res.json({ success: true, data: aiRes.data.data });
    }

    // Simple pass-through if only intensity label supplied
    res.json({ success: true, data: { intensity: intensity || 'normal' } });
  } catch (error: any) {
    res.json({ success: true, data: { intensity: 'normal' }, fallback: true });
  }
});

// POST /api/ai/:userId/personalized-plan
router.post('/:userId/personalized-plan', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get today's check-in if available to compute readiness
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = await HealthCheckIn.findOne({
      userId: req.params.userId,
      date: { $gte: today },
    });

    let readinessScore = 75;
    if (checkIn) {
      try {
        const readinessRes = await axios.post(
          `${AI_ENGINE_URL}/readiness-score`,
          {
            energy: checkIn.energy,
            sleep: checkIn.sleep,
            stress: checkIn.stress,
            soreness: checkIn.soreness,
          },
          { timeout: 8000 }
        );
        readinessScore = readinessRes.data?.data?.score ?? 75;
      } catch (_) {
        // keep default
      }
    }

    const payload = buildUserPayload(user, { readiness_score: readinessScore });
    const [workoutRes, mealRes] = await Promise.allSettled([
      axios.post(`${AI_ENGINE_URL}/generate-plan`, payload, { timeout: 10000 }),
      axios.post(`${AI_ENGINE_URL}/meal-suggestions`, payload, { timeout: 10000 }),
    ]);

    const plan = {
      workoutPlan: workoutRes.status === 'fulfilled' ? workoutRes.value.data.data : [],
      mealPlan: mealRes.status === 'fulfilled' ? mealRes.value.data.data : [],
      readinessScore,
    };

    res.json({ success: true, data: plan });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
