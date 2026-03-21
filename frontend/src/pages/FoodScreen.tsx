import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, Plus, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const FoodScreen: React.FC = () => {
  const navigate = useNavigate();
  const todayNutrition = useAppStore((state) => state.todayNutrition);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'log' | 'tracker' | 'suggestions'>('tracker');

  const sampleFoods = [
    { id: '1', name: 'Boiled Egg', protein: 6, calories: 78, serving: '1 egg' },
    { id: '2', name: 'Chicken Breast', protein: 26, calories: 165, serving: '100g' },
    { id: '3', name: 'Dal (cooked)', protein: 9, calories: 130, serving: '1 cup' },
    { id: '4', name: 'Curd', protein: 10, calories: 98, serving: '200g' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-20 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Food & Nutrition</h1>
          <div className="w-10"></div>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search foods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 py-2"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-20 z-10">
        <div className="max-w-md mx-auto flex">
          {['log', 'tracker', 'suggestions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-3 border-b-2 transition font-medium ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              {tab === 'log' && '📝 Log'}
              {tab === 'tracker' && '📊 Tracker'}
              {tab === 'suggestions' && '💡 Suggestions'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        {activeTab === 'log' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-lg font-bold mb-4">Popular Indian Foods</h2>
            <div className="space-y-3">
              {sampleFoods.map((food) => (
                <div key={food.id} className="card flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{food.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {food.calories} cal • {food.protein}g protein
                    </p>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg">
                    <Plus size={18} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'tracker' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-lg font-bold mb-4">Today's Summary</h2>

            {/* Nutrition Cards */}
            <div className="space-y-4 mb-6">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Calories</p>
                    <p className="text-3xl font-bold">
                      {todayNutrition?.totalCalories || 0}/2500
                    </p>
                  </div>
                  <TrendingUp className="text-orange-500" size={32} />
                </div>
                <div className="w-full bg-gray-300 dark:bg-slate-700 rounded-full h-2 mt-4">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        ((todayNutrition?.totalCalories || 0) / 2500) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Protein</p>
                    <p className="text-3xl font-bold">
                      {todayNutrition?.totalProtein || 0}g/
                      {todayNutrition?.targetProtein || 150}g
                    </p>
                  </div>
                  <TrendingUp className="text-blue-500" size={32} />
                </div>
                <div className="w-full bg-gray-300 dark:bg-slate-700 rounded-full h-2 mt-4">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        ((todayNutrition?.totalProtein || 0) /
                          (todayNutrition?.targetProtein || 150)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Recent Foods */}
            <h3 className="font-bold mb-3">Today's Foods</h3>
            {todayNutrition?.logs && todayNutrition.logs.length > 0 ? (
              <div className="space-y-2">
                {todayNutrition.logs.map((log) => (
                  <div key={log.id} className="card text-sm">
                    <p className="font-medium">Food #{log.foodId}</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {log.servings} servings • {log.mealType}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No foods logged yet</p>
            )}
          </motion.div>
        )}

        {activeTab === 'suggestions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-lg font-bold mb-4">AI Meal Suggestions</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Based on your goals and preferences, here are recommended meals:
            </p>
            <div className="space-y-3">
              {[
                { meal: 'Breakfast', suggestion: '2 eggs + 1 glass milk + toast' },
                { meal: 'Lunch', suggestion: 'Chicken curry + rice + salad' },
                { meal: 'Snack', suggestion: 'Greek yogurt + nuts' },
                { meal: 'Dinner', suggestion: 'Dal + roti + vegetables' },
              ].map((item) => (
                <div key={item.meal} className="card">
                  <p className="font-bold">{item.meal}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.suggestion}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FoodScreen;
