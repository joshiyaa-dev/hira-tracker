import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, Plus, TrendingUp, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { apiClient } from '@/services/api';

interface MealItem {
  name: string;
  calories: number | string;
  protein: number | string;
  serving: string;
}

interface MealSuggestions {
  breakfast: MealItem[];
  lunch: MealItem[];
  dinner: MealItem[];
  snacks: MealItem[];
  daily_targets?: { calories: number; protein_grams: number };
  protein_alert?: string | null;
}

const sampleFoods = [
  { id: '1', name: 'Boiled Egg', protein: 6, calories: 78, serving: '1 egg' },
  { id: '2', name: 'Chicken Breast', protein: 26, calories: 165, serving: '100g' },
  { id: '3', name: 'Dal (cooked)', protein: 9, calories: 130, serving: '1 cup' },
  { id: '4', name: 'Curd', protein: 10, calories: 98, serving: '200g' },
  { id: '5', name: 'Paneer', protein: 28, calories: 265, serving: '100g' },
  { id: '6', name: 'Oats', protein: 17, calories: 389, serving: '100g' },
];

const FoodScreen: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const todayNutrition = useAppStore((state) => state.todayNutrition);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'log' | 'tracker' | 'suggestions'>('tracker');

  // Meal suggestions state
  const [suggestions, setSuggestions] = useState<MealSuggestions | null>(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    if (!user) return;
    setSuggestionsLoading(true);
    setSuggestionsError(null);
    try {
      const res = await apiClient.getMealSuggestions(user.id, todayNutrition?.totalProtein ?? 0);
      const data = (res.data as any).data ?? res.data;
      setSuggestions(data);
    } catch (err: any) {
      setSuggestionsError('Could not load meal suggestions. Please try again.');
      // Fallback static suggestions
      setSuggestions({
        breakfast: [{ name: '2 Boiled Eggs + Milk', calories: 220, protein: 18, serving: '2 eggs + 200ml' }],
        lunch: [{ name: 'Chicken Breast + Brown Rice', calories: 420, protein: 38, serving: '150g + 100g' }],
        dinner: [{ name: 'Dal + Roti + Salad', calories: 380, protein: 16, serving: '1 bowl + 2 rotis' }],
        snacks: [{ name: 'Greek Yogurt + Almonds', calories: 180, protein: 14, serving: '100g + 20g' }],
        protein_alert: null,
      });
    } finally {
      setSuggestionsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'suggestions' && !suggestions && !suggestionsLoading) {
      fetchSuggestions();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredFoods = sampleFoods.filter((f) =>
    searchQuery ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

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
          <div className="w-10" />
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search foods…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 py-2 w-full"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-20 z-10">
        <div className="max-w-md mx-auto flex">
          {(['log', 'tracker', 'suggestions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
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
        {/* ---- LOG TAB ---- */}
        {activeTab === 'log' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-lg font-bold mb-4">Popular Indian Foods</h2>
            {filteredFoods.length === 0 ? (
              <div className="text-center py-10">
                <Search size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No foods found for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFoods.map((food) => (
                  <div key={food.id} className="card flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{food.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {food.calories} cal • {food.protein}g protein • {food.serving}
                      </p>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition">
                      <Plus size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ---- TRACKER TAB ---- */}
        {activeTab === 'tracker' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-lg font-bold mb-4">Today's Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Calories</p>
                    <p className="text-3xl font-bold">{todayNutrition?.totalCalories || 0}/2500</p>
                  </div>
                  <TrendingUp className="text-orange-500" size={32} />
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mt-4">
                  <motion.div
                    className="bg-orange-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ((todayNutrition?.totalCalories || 0) / 2500) * 100)}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Protein</p>
                    <p className="text-3xl font-bold">
                      {todayNutrition?.totalProtein || 0}g/{todayNutrition?.targetProtein || 150}g
                    </p>
                  </div>
                  <TrendingUp className="text-blue-500" size={32} />
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mt-4">
                  <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(100, ((todayNutrition?.totalProtein || 0) / (todayNutrition?.targetProtein || 150)) * 100)}%`,
                    }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                {/* Low protein nudge */}
                {(todayNutrition?.totalProtein || 0) < (todayNutrition?.targetProtein || 150) * 0.5 && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    You're below 50% of your protein goal — consider a high-protein snack.
                  </p>
                )}
              </div>
            </div>

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
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-3">No foods logged yet today.</p>
                <button
                  onClick={() => setActiveTab('log')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition"
                >
                  + Log your first meal
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ---- SUGGESTIONS TAB ---- */}
        {activeTab === 'suggestions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">AI Meal Suggestions</h2>
              <button
                onClick={fetchSuggestions}
                disabled={suggestionsLoading}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm disabled:opacity-50"
              >
                <motion.div
                  animate={suggestionsLoading ? { rotate: 360 } : { rotate: 0 }}
                  transition={suggestionsLoading ? { repeat: Infinity, duration: 1, ease: 'linear' } : {}}
                >
                  <RefreshCw size={16} />
                </motion.div>
                Refresh
              </button>
            </div>

            {/* Protein alert */}
            {suggestions?.protein_alert && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-lg p-3 mb-4 text-sm text-orange-800 dark:text-orange-300 flex gap-2"
              >
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                {suggestions.protein_alert}
              </motion.div>
            )}

            {suggestionsLoading ? (
              <div className="flex flex-col items-center py-12 gap-3">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                  <RefreshCw size={32} className="text-blue-500" />
                </motion.div>
                <p className="text-gray-500 text-sm">HIRA AI is creating your meal plan…</p>
              </div>
            ) : suggestions ? (
              <div className="space-y-4">
                {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((meal) => (
                  <div key={meal} className="card">
                    <h3 className="font-bold capitalize mb-3 text-gray-900 dark:text-white">
                      {meal === 'snacks' ? '🥜 Snacks' : meal === 'breakfast' ? '🌅 Breakfast' : meal === 'lunch' ? '☀️ Lunch' : '🌙 Dinner'}
                    </h3>
                    {(suggestions[meal] as MealItem[]).length === 0 ? (
                      <p className="text-sm text-gray-500">No suggestions available.</p>
                    ) : (
                      <div className="space-y-2">
                        {(suggestions[meal] as MealItem[]).map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-gray-500 dark:text-gray-400">
                                {item.serving} • {item.calories} cal • {item.protein}g protein
                              </p>
                            </div>
                            <button className="text-blue-600 hover:text-blue-700 p-1">
                              <Plus size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {suggestions.daily_targets && (
                  <div className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">Daily Targets</p>
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      🔥 {Math.round(suggestions.daily_targets.calories)} kcal &nbsp;•&nbsp;
                      💪 {Math.round(suggestions.daily_targets.protein_grams)}g protein
                    </p>
                  </div>
                )}
              </div>
            ) : suggestionsError ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-3">{suggestionsError}</p>
                <button
                  onClick={fetchSuggestions}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm"
                >
                  Retry
                </button>
              </div>
            ) : null}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FoodScreen;
