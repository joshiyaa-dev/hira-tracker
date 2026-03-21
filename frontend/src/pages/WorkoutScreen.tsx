import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, ChevronLeft, Loader2, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { apiClient } from '@/services/api';

const WorkoutScreen: React.FC = () => {
  const navigate = useNavigate();
  const todayWorkout = useAppStore((state) => state.todayWorkout);
  const setTodayWorkout = useAppStore((state) => state.setTodayWorkout);
  const user = useAppStore((state) => state.user);
  const [completedExercises, setCompletedExercises] = useState<string[]>(
    todayWorkout?.completedExercises || []
  );
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Load workout if not available
  useEffect(() => {
    if (!todayWorkout && user) {
      setLoading(true);
      apiClient
        .getTodayWorkout(user.id)
        .then((res) => setTodayWorkout(res.data))
        .catch(() => {
          // workout will remain null; empty state shown
        })
        .finally(() => setLoading(false));
    }
  }, [user, todayWorkout, setTodayWorkout]);

  const handleGenerate = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const res = await apiClient.generateWorkoutPlan(user.id);
      setTodayWorkout(res.data);
      setCompletedExercises([]);
    } catch (err) {
      console.error('Failed to generate workout', err);
    } finally {
      setGenerating(false);
    }
  };

  const toggleExercise = (exerciseId: string) => {
    setCompletedExercises((prev) => {
      const updated = prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId];

      // Log to backend
      if (todayWorkout && !prev.includes(exerciseId)) {
        apiClient
          .logWorkoutProgress(todayWorkout.id, exerciseId)
          .catch(() => {/* non-critical */});
      }

      return updated;
    });
  };

  // Detect workout completion
  useEffect(() => {
    if (
      todayWorkout &&
      todayWorkout.exercises.length > 0 &&
      completedExercises.length === todayWorkout.exercises.length
    ) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4000);
    }
  }, [completedExercises, todayWorkout]);

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-3" size={40} />
          <p className="text-gray-600 dark:text-gray-400">
            {generating ? 'Creating your AI workout plan…' : 'Loading workout…'}
          </p>
        </div>
      </div>
    );
  }

  if (!todayWorkout || todayWorkout.exercises.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-md mx-auto pt-12 text-center">
          <p className="text-6xl mb-4">🏋️</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No workout plan yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Let HIRA AI create a personalised workout for you
          </p>
          <button
            onClick={handleGenerate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} />
            Generate AI Workout
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-gray-600 dark:text-gray-400 underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const progress = Math.round(
    (completedExercises.length / todayWorkout.exercises.length) * 100
  );
  const allDone = completedExercises.length === todayWorkout.exercises.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800">
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            key="celebration"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center shadow-2xl mx-4"
            >
              <p className="text-6xl mb-4">🎉</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Amazing work!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Workout complete! You crushed it today 💪
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-20 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Workout</h1>
          <button
            onClick={handleGenerate}
            title="Regenerate plan"
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Progress</span>
            <span className="font-bold text-blue-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-300 dark:bg-slate-700 rounded-full h-3">
            <motion.div
              className={`h-3 rounded-full ${allDone ? 'bg-green-500' : 'bg-blue-600'}`}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {completedExercises.length} / {todayWorkout.exercises.length} completed
          </p>
        </motion.div>

        {/* Intensity Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg p-4 mb-6 flex gap-3"
        >
          <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
          <div className="text-sm">
            <p className="font-semibold text-blue-900 dark:text-blue-300">
              Intensity: {todayWorkout.intensity.toUpperCase()}
              {' '}· {todayWorkout.totalDuration} mins
            </p>
            <p className="text-blue-800 dark:text-blue-400">
              {todayWorkout.intensity === 'light' &&
                'Recovery focused. Lighter weights, higher reps.'}
              {todayWorkout.intensity === 'normal' &&
                'Standard intensity. Focus on proper form.'}
              {todayWorkout.intensity === 'push' &&
                'High intensity. Push your limits safely.'}
            </p>
            {(todayWorkout as any).explanation && (
              <p className="mt-1 text-blue-700 dark:text-blue-300 italic text-xs">
                💡 {(todayWorkout as any).explanation}
              </p>
            )}
          </div>
        </motion.div>

        {/* Exercises List */}
        <div className="space-y-3">
          {todayWorkout.exercises.map((exercise, index) => {
            const isCompleted = completedExercises.includes(exercise.id);
            return (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                onClick={() => toggleExercise(exercise.id)}
                className={`card cursor-pointer border-2 transition ${
                  isCompleted
                    ? 'border-green-500 bg-green-50 dark:bg-green-900'
                    : 'border-gray-300 dark:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                      isCompleted
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-400 dark:border-slate-500'
                    }`}
                  >
                    {isCompleted && <Check size={16} className="text-white" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {exercise.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {exercise.sets}×{exercise.reps} · {exercise.muscleGroup}
                      {exercise.equipment && ` · ${exercise.equipment}`}
                    </p>
                    {exercise.safetyTips.length > 0 && (
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        ⚠️ {exercise.safetyTips[0]}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Complete Button */}
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Check size={20} />
              Workout Complete! 🎉 Back to Dashboard
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WorkoutScreen;
