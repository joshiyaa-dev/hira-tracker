import { Router, Request, Response } from 'express';
import { Workout } from '../models/Workout';

const router = Router();

// Generate workout plan
router.post('/:userId/generate', async (req: Request, res: Response) => {
  try {
    // TODO: Call AI engine to generate workout plan
    const workout = new Workout({
      userId: req.params.userId,
      date: new Date(),
      exercises: [],
      totalDuration: 60,
      intensity: 'normal',
      completed: false,
      completedExercises: [],
    });
    
    await workout.save();
    res.json({ success: true, data: workout });
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
