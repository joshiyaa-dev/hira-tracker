import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, AlertCircle, ChevronLeft, RefreshCw } from 'lucide-react';
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
  const [loading, setLoading] = useState(!todayWorkout);
  const [error, setError] = useState<string | null>(null);
  const [showDoneMessage, setShowDoneMessage] = useState(false);

  useEffect(() => {
    if (todayWorkout) {
      setCompletedExercises(todayWorkout.completedExercises || []);
      setLoading(false);
      return;
    }
    // No workout in store — try to fetch or generate one
    if (!user) return;
    const fetchOrGenerate = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try fetching today's existing plan first
        const res = await apiClient.getTodayWorkout(user.id).catch(() => null);
        if (res?.data) {
          const data = (res.data as any).data ?? res.data;
          setTodayWorkout(data);
          setCompletedExercises(data.completedExercises || []);
        } else {
          // Generate a fresh plan
          const genRes = await apiClient.generatePlan(user.id);
          const planData = (genRes.data as any).data;
          const mapped = {
            id: `plan-${Date.now()}`,
            userId: user.id,
            date: new Date().toISOString(),
            exercises: (planData.exercises || []).map((ex: any) => ({
              id: ex.id || ex.name,
              name: ex.name,
              muscleGroup: ex.muscle_group || ex.muscleGroup,
              sets: ex.sets,
              reps: ex.reps,
              equipment: ex.equipment || 'bodyweight',
              safetyTips: ex.safety_tips || ex.safetyTips || [],
              difficulty: 'intermediate' as const,
              restSeconds: 60,
            })),
            totalDuration: planData.total_duration || planData.totalDuration || 45,
            intensity: planData.intensity || 'normal',
            readinessScore: planData.readiness_score ?? 75,
            completed: false,
            completedExercises: [],
            explanation: planData.explanation,
          };
          setTodayWorkout(mapped);
          setCompletedExercises([]);
        }
      } catch (err: any) {
        setError('Could not load workout. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrGenerate();
  }, [user, todayWorkout, setTodayWorkout]);

  const toggleExercise = (exerciseId: string) => {
    setCompletedExercises((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const allDone =
    todayWorkout &&
    todayWorkout.exercises.length > 0 &&
    completedExercises.length === todayWorkout.exercises.length;

  const progress = todayWorkout?.exercises?.length
    ? Math.round((completedExercises.length / todayWorkout.exercises.length) * 100)
    : 0;

  useEffect(() => {
    if (allDone) setShowDoneMessage(true);
  }, [allDone]);

  // --- Loading state ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center gap-4 p-4">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <RefreshCw size={40} className="text-blue-500" />
        </motion.div>
        <p className="text-gray-500 dark:text-gray-400">Loading your workout…</p>
      </div>
    );
  }

  // --- Empty / error state ---
  if (!todayWorkout || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {error || 'No workout plan available.'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            Generate a plan from the Dashboard or try again.
          </p>
          <div className="flex gap-3 justify-center">
            {error && (
              <button
                onClick={() => { setError(null); setLoading(true); }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                Retry
              </button>
            )}
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800">
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
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* Progress */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Progress</span>
            <span className="font-bold text-blue-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-300 dark:bg-slate-700 rounded-full h-3">
            <motion.div
              className="bg-blue-600 h-3 rounded-full"
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
          className="bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg p-4 mb-4 flex gap-3"
        >
          <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
          <div className="text-sm">
            <p className="font-semibold text-blue-900 dark:text-blue-300">
              Intensity: {todayWorkout.intensity.toUpperCase()}
            </p>
            <p className="text-blue-800 dark:text-blue-400">
              {todayWorkout.intensity === 'light' && 'Recovery focused. Lighter weights, higher reps.'}
              {todayWorkout.intensity === 'normal' && 'Standard intensity. Focus on proper form.'}
              {todayWorkout.intensity === 'push' && 'High intensity. Push your limits safely.'}
            </p>
          </div>
        </motion.div>

        {/* AI Explanation */}
        {(todayWorkout as any).explanation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg p-4 mb-6 text-sm text-purple-900 dark:text-purple-300"
          >
            🧠 {(todayWorkout as any).explanation}
          </motion.div>
        )}

        {/* Exercises List */}
        <div className="space-y-3">
          {todayWorkout.exercises.map((exercise, index) => {
            const isCompleted = completedExercises.includes(exercise.id);
            return (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.07 }}
                onClick={() => toggleExercise(exercise.id)}
                className={`card cursor-pointer border-2 transition ${
                  isCompleted
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/40'
                    : 'border-gray-300 dark:border-slate-600 hover:border-blue-400'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition ${
                      isCompleted
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-400 dark:border-slate-500'
                    }`}
                  >
                    {isCompleted && <Check size={14} className="text-white" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">{exercise.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {exercise.sets} sets × {exercise.reps} reps • {exercise.muscleGroup}
                    </p>
                    {exercise.safetyTips?.length > 0 && (
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

        {/* Completion Message */}
        {showDoneMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 bg-green-600 text-white rounded-2xl p-6 text-center shadow-lg"
          >
            <p className="text-3xl mb-2">🎉</p>
            <p className="text-xl font-bold mb-1">Great job!</p>
            <p className="text-sm opacity-90">Workout complete! You crushed it today.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 bg-white text-green-700 font-semibold py-2 px-6 rounded-lg"
            >
              Back to Dashboard
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WorkoutScreen;
