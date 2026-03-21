import { Router, Request, Response } from 'express';
import axios from 'axios';
import { Workout } from '../models/Workout';
import { User } from '../models/User';
import { HealthCheckIn } from '../models/Health';

const router = Router();
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

/** Map AI engine exercise fields to the Workout model's camelCase fields */
function mapExercise(ex: any) {
  return {
    id: ex.id || ex._id || String(Math.random()),
    name: ex.name,
    sets: ex.sets || 3,
    reps: ex.reps || 10,
    muscleGroup: ex.muscle_group || ex.muscleGroup || '',
    equipment: ex.equipment || 'bodyweight',
    safetyTips: ex.safety_tips || ex.safetyTips || [],
  };
}

// Generate workout plan
router.post('/:userId/generate', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Fetch today's check-in if available
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
      readiness_score: readinessScore,
    };

    const aiRes = await axios.post(`${AI_ENGINE_URL}/generate-plan`, aiPayload, {
      timeout: 10000,
    });

    const aiData = aiRes.data.data;
    const exercises = (aiData.exercises || []).map(mapExercise);

    const workout = await Workout.create({
      userId: req.params.userId,
      date: new Date(),
      exercises,
      totalDuration: aiData.total_duration || 45,
      intensity: aiData.intensity || 'normal',
      readinessScore,
      completed: false,
      completedExercises: [],
    });

    res.json({ success: true, data: workout });
  } catch (error: any) {
    // Fallback: save a basic workout without AI
    try {
      const fallbackWorkout = await Workout.create({
        userId: req.params.userId,
        date: new Date(),
        exercises: [
          { id: 'fb_1', name: 'Push-ups', sets: 3, reps: 15, muscleGroup: 'chest', equipment: 'bodyweight', safetyTips: ['Keep your body straight'] },
          { id: 'fb_2', name: 'Bodyweight Squats', sets: 3, reps: 15, muscleGroup: 'legs', equipment: 'bodyweight', safetyTips: ['Keep knees over toes'] },
          { id: 'fb_3', name: 'Plank', sets: 3, reps: 30, muscleGroup: 'core', equipment: 'bodyweight', safetyTips: ['Hold position — do not let hips drop'] },
        ],
        totalDuration: 30,
        intensity: 'normal',
        readinessScore: 75,
        completed: false,
        completedExercises: [],
      });
      res.json({ success: true, data: fallbackWorkout, fallback: true });
    } catch (dbError: any) {
      res.status(500).json({ success: false, error: error.message });
    }
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
