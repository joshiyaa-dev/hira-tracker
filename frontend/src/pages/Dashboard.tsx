import React, { useEffect, useState } from 'react';
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
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        const [workoutRes, readinessRes] = await Promise.all([
          apiClient.getTodayWorkout(user.id).catch(() => null),
          apiClient.getReadinessScore(user.id),
        ]);

        if (workoutRes) setTodayWorkout(workoutRes.data);
        setReadiness(readinessRes.data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, navigate, setTodayWorkout]);

  const handleLogout = () => {
    logout();
    apiClient.clearToken();
    navigate('/login');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back</p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user?.name.split(' ')[0]}
            </h1>
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
      <motion.div
        className="max-w-md mx-auto px-4 py-6 pb-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Readiness Score Card */}
        {readiness && (
          <motion.div variants={itemVariants} className="mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
              <p className="text-sm opacity-90 mb-2">Today's Readiness Score</p>
              <div className="flex items-end gap-4 mb-4">
                <div className="text-5xl font-bold">{readiness.score}</div>
                <div className="text-sm opacity-80 mb-1">/100</div>
              </div>
              <p className="text-blue-100">{readiness.recommendation}</p>
            </div>
          </motion.div>
        )}

        {/* Quick Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mb-6">
          <div className="card flex flex-col items-center p-6">
            <Flame className="text-orange-500 mb-2" size={28} />
            <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
            <p className="text-2xl font-bold">
              {todayNutrition?.totalCalories || '0'}/2500
            </p>
          </div>

          <div className="card flex flex-col items-center p-6">
            <Droplet className="text-blue-500 mb-2" size={28} />
            <p className="text-sm text-gray-600 dark:text-gray-400">Protein</p>
            <p className="text-2xl font-bold">
              {todayNutrition?.totalProtein || '0'}g
            </p>
          </div>

          <div className="card flex flex-col items-center p-6">
            <Zap className="text-yellow-500 mb-2" size={28} />
            <p className="text-sm text-gray-600 dark:text-gray-400">Workouts</p>
            <p className="text-2xl font-bold">
              {todayWorkout?.completedExercises.length || '0'}/
              {todayWorkout?.exercises.length || '0'}
            </p>
          </div>

          <div className="card flex flex-col items-center p-6">
            <TrendingUp className="text-green-500 mb-2" size={28} />
            <p className="text-sm text-gray-600 dark:text-gray-400">Streak</p>
            <p className="text-2xl font-bold">12 Days</p>
          </div>
        </motion.div>

        {/* Today's Workout */}
        {todayWorkout && (
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
                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                  {Math.round(
                    (todayWorkout.completedExercises.length /
                      todayWorkout.exercises.length) *
                      100
                  )}%
                </div>
              </div>
              <button
                onClick={() => navigate('/workout')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Start Workout →
              </button>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 sticky bottom-24">
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
