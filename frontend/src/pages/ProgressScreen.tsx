import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, TrendingUp, Award, Zap, Weight } from 'lucide-react';

const ProgressScreen: React.FC = () => {
  const navigate = useNavigate();

  const statsData = [
    { label: 'Weight', value: '75 kg', change: '-2 kg', trend: 'down', icon: Weight },
    { label: 'Workouts', value: '18/30', change: '+3 this week', trend: 'up', icon: Zap },
    { label: 'Streak', value: '12 days', change: 'Keep it up!', trend: 'up', icon: Award },
    { label: 'Strength', value: '+15%', change: 'vs last month', trend: 'up', icon: TrendingUp },
  ];

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progress</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card"
              >
                <Icon className="text-blue-600 mb-2" size={24} />
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold my-1">{stat.value}</p>
                <p
                  className={`text-xs ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-orange-600'
                  }`}
                >
                  {stat.change}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Weekly Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="card mb-6"
        >
          <h2 className="font-bold mb-4">This Week's Activity</h2>
          <div className="flex items-end justify-between h-40 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
              const height = Math.random() * 80 + 20;
              return (
                <div key={day} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                  <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">{day}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="font-bold mb-4">Recent Milestones</h2>
          <div className="space-y-3">
            {[
              '🎯 Reached 20 workouts this month',
              '💪 New PR: Bench Press 100kg',
              '🔥 7-day workout streak',
              '📈 Weight stable at goal',
            ].map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="card"
              >
                <p>{milestone}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressScreen;
