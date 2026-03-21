import { Router, Request, Response } from 'express';
import axios from 'axios';
import { User } from '../models/User';
import { HealthCheckIn } from '../models/Health';

const router = Router();
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

/** Build the UserData payload required by the Python AI engine. */
async function buildUserPayload(userId: string, extra: Record<string, unknown> = {}) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  return {
    user_id: userId,
    age: user.age,
    weight: user.weight,
    height: user.height,
    gender: user.gender,
    body_type: user.bodyType || 'mesomorph',
    lifestyle: user.lifestyle || 'moderate',
    gym_experience: user.gymExperience || 'intermediate',
    fitness_goal: user.fitnessGoal || 'general-fitness',
    diet_type: user.dietType || 'non-veg',
    ...extra,
  };
}

/** POST /api/ai/:userId/generate-plan — generate a full daily plan */
router.post('/:userId/generate-plan', async (req: Request, res: Response) => {
  try {
    const { readiness_score = 75 } = req.body;
    const payload = await buildUserPayload(req.params.userId, { readiness_score });
    const aiRes = await axios.post(`${AI_ENGINE_URL}/generate-plan`, payload, { timeout: 10000 });
    res.json({ success: true, data: aiRes.data.data });
  } catch (error: any) {
    console.error('[AI] generate-plan error:', error.message);
    // Fallback plan so the frontend never gets a hard error
    res.json({
      success: true,
      data: {
        exercises: [
          { id: 'fb_1', name: 'Push-ups', muscle_group: 'chest', sets: 3, reps: 15, equipment: 'bodyweight', safety_tips: ['Keep your body straight'] },
          { id: 'fb_2', name: 'Lat Pulldowns', muscle_group: 'back', sets: 3, reps: 12, equipment: 'cable machine', safety_tips: ['Pull elbows down and back'] },
          { id: 'fb_3', name: 'Bodyweight Squats', muscle_group: 'legs', sets: 3, reps: 20, equipment: 'bodyweight', safety_tips: ['Keep chest up'] },
        ],
        total_duration: 40,
        intensity: 'normal',
        readiness_score: 75,
        tips: ['Stay hydrated', 'Focus on form'],
        explanation: 'Fallback plan — AI engine unavailable.',
      },
      fallback: true,
    });
  }
});

/** POST /api/ai/:userId/meal-suggestion — get AI meal suggestions */
router.post('/:userId/meal-suggestion', async (req: Request, res: Response) => {
  try {
    const { current_protein = 0 } = req.body;
    const payload = await buildUserPayload(req.params.userId, { current_protein });
    const aiRes = await axios.post(`${AI_ENGINE_URL}/meal-suggestions`, payload, { timeout: 10000 });
    res.json({ success: true, data: aiRes.data.data });
  } catch (error: any) {
    console.error('[AI] meal-suggestion error:', error.message);
    res.json({
      success: true,
      data: {
        breakfast: [{ name: '2 Boiled Eggs + Milk', calories: 220, protein: 18, serving: '2 eggs + 200ml' }],
        lunch: [{ name: 'Chicken Breast + Brown Rice', calories: 420, protein: 38, serving: '150g + 100g' }],
        dinner: [{ name: 'Dal + Roti + Salad', calories: 380, protein: 16, serving: '1 bowl + 2 rotis' }],
        snacks: [{ name: 'Greek Yogurt + Almonds', calories: 180, protein: 14, serving: '100g + 20g' }],
        daily_targets: { calories: 2500, protein_grams: 150 },
        protein_alert: null,
      },
      fallback: true,
    });
  }
});

/** POST /api/ai/:userId/adjust-plan — adjust intensity from check-in data */
router.post('/:userId/adjust-plan', async (req: Request, res: Response) => {
  try {
    const { sleep, stress, soreness, energy } = req.body;
    // First calculate readiness score
    const readinessRes = await axios.post(
      `${AI_ENGINE_URL}/readiness-score`,
      { energy, sleep, stress, soreness },
      { timeout: 10000 }
    );
    const readiness = readinessRes.data.data;

    // Then generate adjusted workout plan
    const payload = await buildUserPayload(req.params.userId, {
      readiness_score: readiness.score,
    });
    const planRes = await axios.post(`${AI_ENGINE_URL}/generate-plan`, payload, { timeout: 10000 });

    res.json({
      success: true,
      data: {
        readiness,
        plan: planRes.data.data,
      },
    });
  } catch (error: any) {
    console.error('[AI] adjust-plan error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---- Legacy routes (kept for backward compatibility) ---- //

/** POST /api/ai/:userId/meal-suggestions (legacy) */
router.post('/:userId/meal-suggestions', async (req: Request, res: Response) => {
  // Delegate to new route handler
  req.url = `/${req.params.userId}/meal-suggestion`;
  router.handle(req, res, () => {});
});

/** POST /api/ai/:userId/adjust-intensity (legacy) */
router.post('/:userId/adjust-intensity', async (req: Request, res: Response) => {
  try {
    const { intensity } = req.body;
    res.json({ success: true, data: { intensity: intensity || 'normal' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/** POST /api/ai/:userId/personalized-plan (legacy) */
router.post('/:userId/personalized-plan', async (req: Request, res: Response) => {
  try {
    const payload = await buildUserPayload(req.params.userId);
    const aiRes = await axios.post(`${AI_ENGINE_URL}/generate-plan`, payload, { timeout: 10000 });
    res.json({ success: true, data: aiRes.data.data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
