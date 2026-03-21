import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Droplet,
  Zap,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  AlertTriangle,
  Loader2,
  X,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { apiClient } from '@/services/api';
import { ReadinessScore } from '@/types';

// Fallback plan shown when the API is unavailable
const FALLBACK_WORKOUT = {
  id: 'fallback',
  userId: '',
  date: new Date().toISOString(),
  exercises: [
    { id: 'fb_1', name: 'Push-ups', sets: 3, reps: 15, muscleGroup: 'Chest', equipment: 'Bodyweight', safetyTips: ['Keep your body straight'], difficulty: 'beginner' as const, restSeconds: 60 },
    { id: 'fb_2', name: 'Bodyweight Squats', sets: 3, reps: 15, muscleGroup: 'Legs', equipment: 'Bodyweight', safetyTips: ['Keep knees over toes'], difficulty: 'beginner' as const, restSeconds: 60 },
    { id: 'fb_3', name: 'Plank', sets: 3, reps: 30, muscleGroup: 'Core', equipment: 'Bodyweight', safetyTips: ['Do not let hips drop'], difficulty: 'beginner' as const, restSeconds: 60 },
  ],
  totalDuration: 30,
  intensity: 'normal' as const,
  readinessScore: 75,
  completed: false,
  completedExercises: [],
};

const FALLBACK_READINESS: ReadinessScore = {
  score: 75,
  factors: { sleep: 0.8, stress: 0.7, soreness: 0.9, energy: 0.8 },
  recommendation: 'Complete today\'s check-in for a personalised readiness score.',
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);
  const todayWorkout = useAppStore((state) => state.todayWorkout);
  const todayNutrition = useAppStore((state) => state.todayNutrition);
  const setTodayWorkout = useAppStore((state) => state.setTodayWorkout);

  const [readiness, setReadiness] = useState<ReadinessScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInData, setCheckInData] = useState({ energy: 7, sleep: 7, stress: 3, soreness: 3 });
  const [nudge, setNudge] = useState<string | null>(null);

  // Protein progress percentage
  const proteinPct = todayNutrition
    ? Math.round(((todayNutrition.totalProtein || 0) / (todayNutrition.targetProtein || 150)) * 100)
    : 0;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        const [workoutRes, readinessRes] = await Promise.allSettled([
          apiClient.getTodayWorkout(user.id),
          apiClient.getReadinessScore(user.id),
        ]);

        if (workoutRes.status === 'fulfilled') {
          setTodayWorkout(workoutRes.value.data);
        }
        // If no workout for today, offer to generate one
        if (workoutRes.status === 'rejected') {
          setTodayWorkout(FALLBACK_WORKOUT as any);
        }

        if (readinessRes.status === 'fulfilled') {
          setReadiness(readinessRes.value.data);
        } else {
          setReadiness(FALLBACK_READINESS);
        }

        // Smart nudges
        if (readinessRes.status === 'fulfilled') {
          const score = readinessRes.value.data.score;
          if (score < 50) {
            setNudge('😴 Your readiness is low today. Consider a lighter session.');
          }
        }
        if (proteinPct < 50 && proteinPct > 0) {
          setNudge('⚡ Protein is low today! Check food suggestions for high-protein meals.');
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setReadiness(FALLBACK_READINESS);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, navigate, setTodayWorkout]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGeneratePlan = async () => {
    if (!user) return;
    setGeneratingPlan(true);
    try {
      const res = await apiClient.generateWorkoutPlan(user.id);
      setTodayWorkout(res.data);
    } catch (err) {
      setTodayWorkout(FALLBACK_WORKOUT as any);
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleCheckInSubmit = async () => {
    if (!user) return;
    try {
      await apiClient.submitCheckIn(user.id, {
        id: '',
        userId: user.id,
        date: new Date().toISOString(),
        ...checkInData,
      });
      const readinessRes = await apiClient.getReadinessScore(user.id);
      setReadiness(readinessRes.data);
      setShowCheckIn(false);
    } catch (err) {
      setShowCheckIn(false);
    }
  };

  const handleLogout = () => {
    logout();
    apiClient.clearToken();
    navigate('/login');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  // Goal-based greeting message
  const goalMessages: Record<string, string> = {
    'muscle-gain': '💪 Time to build muscle!',
    'fat-loss': '🔥 Keep burning those calories!',
    'strength': '🏋️ Get stronger today!',
    'general-fitness': '🌟 Stay active, stay healthy!',
  };
  const goalMsg = goalMessages[(user as any)?.fitnessGoal ?? ''] || '🚀 Let\'s crush today!';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back 👋</p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{firstName}</h1>
            <p className="text-xs text-blue-600 dark:text-blue-400">{goalMsg}</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
            >
              <Menu size={24} />
            </button>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg z-30"
              >
                <button
                  onClick={() => navigate('/settings')}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <Settings size={18} /> Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900 text-red-600 dark:text-red-400 flex items-center gap-2 border-t border-gray-200 dark:border-slate-700"
                >
                  <LogOut size={18} /> Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="animate-spin text-blue-600 mx-auto mb-2" size={40} />
            <p className="text-gray-600 dark:text-gray-400">Loading your plan…</p>
          </div>
        </div>
      ) : (
        <motion.div
          className="max-w-md mx-auto px-4 py-6 pb-24"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Smart Nudge */}
          <AnimatePresence>
            {nudge && (
              <motion.div
                key="nudge"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-xl p-3 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-yellow-600 flex-shrink-0" size={18} />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">{nudge}</p>
                </div>
                <button onClick={() => setNudge(null)}>
                  <X size={16} className="text-yellow-600" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Readiness Score Card */}
          {readiness && (
            <motion.div variants={itemVariants} className="mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
                <p className="text-sm opacity-90 mb-2">Today's Readiness Score</p>
                <div className="flex items-end gap-4 mb-3">
                  <div className="text-5xl font-bold">{Math.round(readiness.score)}</div>
                  <div className="text-sm opacity-80 mb-1">/100</div>
                </div>
                {/* Score bar */}
                <div className="w-full bg-blue-500 rounded-full h-2 mb-3">
                  <motion.div
                    className="bg-white h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${readiness.score}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <p className="text-blue-100 text-sm">{readiness.recommendation}</p>
                <button
                  onClick={() => setShowCheckIn(true)}
                  className="mt-3 text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full transition"
                >
                  📝 Update Check-in
                </button>
              </div>
            </motion.div>
          )}

          {/* Quick Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mb-6">
            <div className="card flex flex-col items-center p-5">
              <Flame className="text-orange-500 mb-2" size={28} />
              <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
              <p className="text-xl font-bold">{todayNutrition?.totalCalories || 0}/2500</p>
            </div>

            <div className="card flex flex-col items-center p-5">
              <Droplet className="text-blue-500 mb-2" size={28} />
              <p className="text-sm text-gray-600 dark:text-gray-400">Protein</p>
              <p className="text-xl font-bold">
                {todayNutrition?.totalProtein || 0}g/{todayNutrition?.targetProtein || 150}g
              </p>
              {/* Protein progress bar */}
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 mt-2">
                <motion.div
                  className={`h-1.5 rounded-full ${proteinPct < 50 ? 'bg-red-500' : 'bg-blue-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, proteinPct)}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              {proteinPct < 50 && (
                <p className="text-xs text-red-500 mt-1">Low protein!</p>
              )}
            </div>

            <div className="card flex flex-col items-center p-5">
              <Zap className="text-yellow-500 mb-2" size={28} />
              <p className="text-sm text-gray-600 dark:text-gray-400">Workouts</p>
              <p className="text-xl font-bold">
                {todayWorkout?.completedExercises.length || 0}/
                {todayWorkout?.exercises.length || 0}
              </p>
            </div>

            <div className="card flex flex-col items-center p-5">
              <TrendingUp className="text-green-500 mb-2" size={28} />
              <p className="text-sm text-gray-600 dark:text-gray-400">Streak</p>
              <p className="text-xl font-bold">🔥 12</p>
              <p className="text-xs text-gray-500">days</p>
            </div>
          </motion.div>

          {/* Today's Workout */}
          {todayWorkout && todayWorkout.exercises.length > 0 ? (
            <motion.div variants={itemVariants} className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Today's Workout
              </h2>
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold">{todayWorkout.exercises.length} Exercises</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {todayWorkout.totalDuration} mins • {todayWorkout.intensity}
                    </p>
                  </div>
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                    {todayWorkout.exercises.length > 0
                      ? Math.round(
                          (todayWorkout.completedExercises.length / todayWorkout.exercises.length) * 100
                        )
                      : 0}%
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mb-4">
                  <motion.div
                    className="bg-blue-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        todayWorkout.exercises.length > 0
                          ? (todayWorkout.completedExercises.length / todayWorkout.exercises.length) * 100
                          : 0
                      }%`,
                    }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <button
                  onClick={() => navigate('/workout')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  {todayWorkout.completedExercises.length === todayWorkout.exercises.length &&
                  todayWorkout.exercises.length > 0
                    ? '✅ View Completed Workout'
                    : 'Start Workout →'}
                </button>
              </div>
            </motion.div>
          ) : (
            /* Empty state */
            <motion.div variants={itemVariants} className="mb-6">
              <div className="card text-center py-8">
                <p className="text-4xl mb-3">🏋️</p>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  No workout planned yet
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Let HIRA AI create a personalised plan for you
                </p>
                <button
                  onClick={handleGeneratePlan}
                  disabled={generatingPlan}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition flex items-center gap-2 mx-auto disabled:opacity-60"
                >
                  {generatingPlan ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Generating…
                    </>
                  ) : (
                    '✨ Generate AI Plan'
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/food')}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 rounded-xl transition shadow-md"
            >
              🍽️ Log Food
            </button>
            <button
              onClick={() => navigate('/progress')}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl transition shadow-md"
            >
              📈 Progress
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Daily Check-in Modal */}
      <AnimatePresence>
        {showCheckIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
            onClick={(e) => e.target === e.currentTarget && setShowCheckIn(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white dark:bg-slate-800 rounded-t-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Daily Check-in</h2>
                <button onClick={() => setShowCheckIn(false)}>
                  <X size={20} />
                </button>
              </div>

              {[
                { key: 'energy', label: '⚡ Energy Level', min: 1, max: 10 },
                { key: 'sleep', label: '😴 Sleep (hours)', min: 1, max: 12 },
                { key: 'stress', label: '😤 Stress Level', min: 1, max: 10 },
                { key: 'soreness', label: '💪 Soreness', min: 1, max: 10 },
              ].map(({ key, label, min, max }) => (
                <div key={key} className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium">{label}</label>
                    <span className="text-blue-600 font-bold">
                      {checkInData[key as keyof typeof checkInData]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={checkInData[key as keyof typeof checkInData]}
                    onChange={(e) =>
                      setCheckInData((prev) => ({
                        ...prev,
                        [key]: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{min}</span>
                    <span>{max}</span>
                  </div>
                </div>
              ))}

              <button
                onClick={handleCheckInSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition mt-2"
              >
                Submit Check-in ✓
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button className="flex-1 py-4 text-center border-b-2 border-blue-600 text-blue-600">
            🏠 Home
          </button>
          <button
            onClick={() => navigate('/food')}
            className="flex-1 py-4 text-center text-gray-600 dark:text-gray-400"
          >
            🍽️ Food
          </button>
          <button
            onClick={() => navigate('/progress')}
            className="flex-1 py-4 text-center text-gray-600 dark:text-gray-400"
          >
            📊 Progress
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="flex-1 py-4 text-center text-gray-600 dark:text-gray-400"
          >
            ⚙️ Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
