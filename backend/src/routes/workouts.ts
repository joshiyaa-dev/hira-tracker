import { Router, Request, Response } from 'express';
import axios from 'axios';
import { Workout } from '../models/Workout';
import { User } from '../models/User';

const router = Router();
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

// Generate workout plan — calls Python AI engine
router.post('/:userId/generate', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const { readiness_score = 75 } = req.body;

    // Call AI engine
    const aiPayload = {
      user_id: req.params.userId,
      age: user.age,
      weight: user.weight,
      height: user.height,
      gender: user.gender,
      body_type: user.bodyType || 'mesomorph',
      lifestyle: user.lifestyle || 'moderate',
      gym_experience: user.gymExperience || 'intermediate',
      fitness_goal: user.fitnessGoal || 'general-fitness',
      diet_type: user.dietType || 'non-veg',
      readiness_score,
    };

    let exercises: any[] = [];
    let intensity: 'light' | 'normal' | 'push' = 'normal';
    let totalDuration = 45;
    let explanation = '';

    try {
      const aiRes = await axios.post(`${AI_ENGINE_URL}/generate-plan`, aiPayload, { timeout: 10000 });
      const planData = aiRes.data.data;

      exercises = (planData.exercises || []).map((ex: any) => ({
        id: ex.id || ex.name,
        name: ex.name,
        muscleGroup: ex.muscle_group,
        sets: ex.sets,
        reps: ex.reps,
        equipment: ex.equipment || 'bodyweight',
        safetyTips: ex.safety_tips || [],
        difficulty: user.gymExperience || 'intermediate',
        restSeconds: 60,
      }));
      intensity = planData.intensity || 'normal';
      totalDuration = planData.total_duration || 45;
      explanation = planData.explanation || '';
    } catch (aiErr: any) {
      console.error('[Workouts] AI engine unavailable, using fallback:', aiErr.message);
      exercises = [
        { id: 'fb_1', name: 'Push-ups', muscleGroup: 'chest', sets: 3, reps: 15, equipment: 'bodyweight', safetyTips: ['Keep your body straight'], difficulty: 'beginner', restSeconds: 60 },
        { id: 'fb_2', name: 'Lat Pulldowns', muscleGroup: 'back', sets: 3, reps: 12, equipment: 'cable machine', safetyTips: ['Pull elbows down and back'], difficulty: 'beginner', restSeconds: 60 },
        { id: 'fb_3', name: 'Bodyweight Squats', muscleGroup: 'legs', sets: 3, reps: 20, equipment: 'bodyweight', safetyTips: ['Keep chest up'], difficulty: 'beginner', restSeconds: 60 },
      ];
    }

    const workout = new Workout({
      userId: req.params.userId,
      date: new Date(),
      exercises,
      totalDuration,
      intensity,
      readinessScore: readiness_score,
      completed: false,
      completedExercises: [],
    });

    await workout.save();
    res.json({ success: true, data: workout, explanation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get today's workout
router.get('/:userId/today', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const workout = await Workout.findOne({
      userId: req.params.userId,
      date: { $gte: today },
    });
    
    if (!workout) {
      return res.status(404).json({ success: false, error: 'No workout found for today' });
    }
    
    res.json({ success: true, data: workout });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Log workout progress
router.post('/:workoutId/log', async (req: Request, res: Response) => {
  try {
    const { exerciseId } = req.body;
    const workout = await Workout.findByIdAndUpdate(
      req.params.workoutId,
      { $addToSet: { completedExercises: exerciseId } },
      { new: true }
    );
    res.json({ success: true, data: workout });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get workout history
router.get('/:userId/history', async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));
    
    const workouts = await Workout.find({
      userId: req.params.userId,
      date: { $gte: startDate },
    }).sort({ date: -1 });
    
    res.json({ success: true, data: workouts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
