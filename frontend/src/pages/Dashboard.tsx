import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Flame,
  Droplet,
  Zap,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { apiClient } from '@/services/api';
import { ReadinessScore } from '@/types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);
  const todayWorkout = useAppStore((state) => state.todayWorkout);
  const todayNutrition = useAppStore((state) => state.todayNutrition);
  const setTodayWorkout = useAppStore((state) => state.setTodayWorkout);

  const [readiness, setReadiness] = useState<ReadinessScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [planLoading, setPlanLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [workoutRes, readinessRes] = await Promise.all([
        apiClient.getTodayWorkout(user.id).catch(() => null),
        apiClient.getReadinessScore(user.id).catch(() => null),
      ]);

      if (workoutRes?.data) setTodayWorkout((workoutRes.data as any).data ?? workoutRes.data);
      if (readinessRes?.data) setReadiness((readinessRes.data as any).data ?? readinessRes.data);
    } catch (err) {
      setError('Could not load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, setTodayWorkout]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate, loadData]);

  const handleGeneratePlan = async () => {
    if (!user) return;
    setPlanLoading(true);
    setError(null);
    try {
      const res = await apiClient.generatePlan(user.id, readiness?.score);
      const planData = (res.data as any).data;
      setIsFallback(!!(res.data as any).fallback);
      // Map AI engine exercise format to frontend WorkoutPlan format
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
        readinessScore: planData.readiness_score ?? readiness?.score ?? 75,
        completed: false,
        completedExercises: [],
        explanation: planData.explanation,
      };
      setTodayWorkout(mapped);
    } catch (err: any) {
      setError('Could not generate a workout plan. Please try again.');
    } finally {
      setPlanLoading(false);
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

  const readinessColor =
    !readiness ? 'from-blue-600 to-blue-700'
    : readiness.score >= 75 ? 'from-green-600 to-green-700'
    : readiness.score >= 50 ? 'from-blue-600 to-blue-700'
    : 'from-orange-500 to-orange-600';

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back 👋</p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{firstName}</h1>
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
                  <Settings size={18} />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900 text-red-600 dark:text-red-400 flex items-center gap-2 border-t border-gray-200 dark:border-slate-700"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          >
            <RefreshCw size={40} className="text-blue-500" />
          </motion.div>
          <p className="text-gray-500 dark:text-gray-400">Loading your dashboard…</p>
        </div>
      ) : (
        <motion.div
          className="max-w-md mx-auto px-4 py-6 pb-24"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Error banner */}
          {error && (
            <motion.div
              variants={itemVariants}
              className="mb-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3 flex items-center justify-between"
            >
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              <button
                onClick={loadData}
                className="ml-2 text-red-600 dark:text-red-400 hover:underline text-sm font-medium"
              >
                Retry
              </button>
            </motion.div>
          )}

          {/* Readiness Score Card */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className={`bg-gradient-to-br ${readinessColor} rounded-2xl p-6 text-white shadow-lg`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm opacity-90">Today's Readiness Score</p>
                <Activity size={18} className="opacity-75" />
              </div>
              <div className="flex items-end gap-4 mb-3">
                <div className="text-5xl font-bold">{readiness ? Math.round(readiness.score) : '—'}</div>
                <div className="text-sm opacity-80 mb-1">/100</div>
              </div>
              {/* Readiness progress bar */}
              {readiness && (
                <div className="w-full bg-white/30 rounded-full h-2 mb-3">
                  <motion.div
                    className="bg-white h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${readiness.score}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              )}
              <p className="text-sm opacity-90">
                {readiness?.recommendation ?? 'Complete your check-in to get a personalised score.'}
              </p>
            </div>
          </motion.div>

          {/* Quick Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mb-6">
            <div className="card flex flex-col items-center p-6">
              <Flame className="text-orange-500 mb-2" size={28} />
              <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
              <p className="text-2xl font-bold">
                {todayNutrition?.totalCalories || '0'}/2500
              </p>
              {/* Progress bar */}
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 mt-2">
                <div
                  className="bg-orange-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((todayNutrition?.totalCalories || 0) / 2500) * 100)}%` }}
                />
              </div>
            </div>

            <div className="card flex flex-col items-center p-6">
              <Droplet className="text-blue-500 mb-2" size={28} />
              <p className="text-sm text-gray-600 dark:text-gray-400">Protein</p>
              <p className="text-2xl font-bold">
                {todayNutrition?.totalProtein || '0'}g
              </p>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 mt-2">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((todayNutrition?.totalProtein || 0) / (todayNutrition?.targetProtein || 150)) * 100)}%` }}
                />
              </div>
            </div>

            <div className="card flex flex-col items-center p-6">
              <Zap className="text-yellow-500 mb-2" size={28} />
              <p className="text-sm text-gray-600 dark:text-gray-400">Exercises</p>
              <p className="text-2xl font-bold">
                {todayWorkout?.completedExercises?.length || '0'}/
                {todayWorkout?.exercises?.length || '0'}
              </p>
            </div>

            <div className="card flex flex-col items-center p-6">
              <TrendingUp className="text-green-500 mb-2" size={28} />
              <p className="text-sm text-gray-600 dark:text-gray-400">Streak</p>
              <p className="text-2xl font-bold">12 Days</p>
            </div>
          </motion.div>

          {/* Today's Workout */}
          {todayWorkout ? (
            <motion.div variants={itemVariants} className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Today's Workout
              </h2>
              <div className="card">
                {isFallback && (
                  <p className="text-xs text-orange-500 mb-2">⚠️ Using fallback plan (AI offline)</p>
                )}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold">{todayWorkout.exercises?.length ?? 0} Exercises</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {todayWorkout.totalDuration} mins •{' '}
                      <span
                        className={
                          todayWorkout.intensity === 'push'
                            ? 'text-red-600'
                            : todayWorkout.intensity === 'light'
                            ? 'text-green-600'
                            : 'text-blue-600'
                        }
                      >
                        {todayWorkout.intensity?.toUpperCase()}
                      </span>
                    </p>
                  </div>
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">
                    {todayWorkout.exercises?.length
                      ? Math.round(
                          ((todayWorkout.completedExercises?.length || 0) /
                            todayWorkout.exercises.length) *
                            100
                        )
                      : 0}
                    %
                  </div>
                </div>
                {/* Workout progress bar */}
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mb-4">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        todayWorkout.exercises?.length
                          ? Math.round(
                              ((todayWorkout.completedExercises?.length || 0) /
                                todayWorkout.exercises.length) *
                                100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <button
                  onClick={() => navigate('/workout')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Start Workout →
                </button>
              </div>
            </motion.div>
          ) : (
            /* Empty state — no workout yet */
            <motion.div variants={itemVariants} className="mb-6">
              <div className="card text-center py-8">
                <Zap size={40} className="text-blue-400 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  No workout plan yet
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Let HIRA AI generate a personalised plan for you.
                </p>
                <button
                  onClick={handleGeneratePlan}
                  disabled={planLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center gap-2 mx-auto"
                >
                  {planLoading ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                        <RefreshCw size={18} />
                      </motion.div>
                      Generating…
                    </>
                  ) : (
                    '✨ Generate My Plan'
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
