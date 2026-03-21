import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, AlertCircle, ChevronLeft } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const WorkoutScreen: React.FC = () => {
  const navigate = useNavigate();
  const todayWorkout = useAppStore((state) => state.todayWorkout);
  const [completedExercises, setCompletedExercises] = useState<string[]>(
    todayWorkout?.completedExercises || []
  );

  if (!todayWorkout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No workout plan available</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const toggleExercise = (exerciseId: string) => {
    setCompletedExercises((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const progress = Math.round(
    (completedExercises.length / todayWorkout.exercises.length) * 100
  );

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
          <div className="w-10"></div>
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
          className="bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg p-4 mb-6 flex gap-3"
        >
          <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
          <div className="text-sm">
            <p className="font-semibold text-blue-900 dark:text-blue-300">
              Intensity: {todayWorkout.intensity.toUpperCase()}
            </p>
            <p className="text-blue-800 dark:text-blue-400">
              {todayWorkout.intensity === 'light' &&
                'Recovery focused. Lighter weights, higher reps.'}
              {todayWorkout.intensity === 'normal' &&
                'Standard intensity. Focus on proper form.'}
              {todayWorkout.intensity === 'push' &&
                'High intensity. Push your limits safely.'}
            </p>
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
                transition={{ delay: index * 0.1 }}
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
                      {exercise.sets}x{exercise.reps} • {exercise.muscleGroup}
                    </p>
                    {exercise.safetyTips.length > 0 && (
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
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
        {completedExercises.length === todayWorkout.exercises.length && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <button className="w-full btn-primary flex items-center justify-center gap-2">
              <Check size={20} />
              Workout Complete! 🎉
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WorkoutScreen;
