import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, Plus, TrendingUp, Loader2, AlertTriangle } from 'lucide-react';
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
  protein_alert?: boolean;
  protein_message?: string;
  protein_boost_suggestions?: MealItem[];
}

const FALLBACK_SUGGESTIONS: MealSuggestions = {
  breakfast: [{ name: 'Boiled Eggs + Milk', calories: 234, protein: 19, serving: '2 eggs + 200ml' }],
  lunch: [{ name: 'Chicken + Rice + Salad', calories: 450, protein: 35, serving: '1 plate' }],
  dinner: [{ name: 'Dal + Roti + Sabji', calories: 380, protein: 14, serving: '2 rotis' }],
  snacks: [{ name: 'Curd + Peanuts', calories: 200, protein: 10, serving: '1 bowl' }],
  daily_targets: { calories: 2200, protein_grams: 120 },
};

const FoodScreen: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const todayNutrition = useAppStore((state) => state.todayNutrition);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'log' | 'tracker' | 'suggestions'>('tracker');
  const [mealSuggestions, setMealSuggestions] = useState<MealSuggestions | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const proteinPct = todayNutrition
    ? (todayNutrition.totalProtein || 0) / (todayNutrition.targetProtein || 150)
    : 1.0;

  const sampleFoods = [
    { id: '1', name: 'Boiled Egg', protein: 6, calories: 78, serving: '1 egg' },
    { id: '2', name: 'Chicken Breast', protein: 31, calories: 165, serving: '100g' },
    { id: '3', name: 'Dal (cooked)', protein: 9, calories: 130, serving: '1 cup' },
    { id: '4', name: 'Curd', protein: 10, calories: 98, serving: '200g' },
    { id: '5', name: 'Paneer', protein: 28, calories: 265, serving: '100g' },
    { id: '6', name: 'Soya Chunks', protein: 52, calories: 345, serving: '100g dry' },
  ];

  const filteredFoods = searchQuery
    ? sampleFoods.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sampleFoods;

  const loadSuggestions = async () => {
    if (!user) return;
    setLoadingSuggestions(true);
    setSuggestionError(null);

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const res = await apiClient.getFoodSuggestions(user.id);
        setMealSuggestions((res as any).data || res);
        setLoadingSuggestions(false);
        return;
      } catch (err: any) {
        attempts++;
        if (attempts >= maxAttempts) {
          setMealSuggestions(FALLBACK_SUGGESTIONS);
          setSuggestionError('Using offline suggestions — check your connection');
        } else {
          await new Promise((r) => setTimeout(r, 1000 * attempts));
        }
      }
    }
    setLoadingSuggestions(false);
  };

  useEffect(() => {
    if (activeTab === 'suggestions' && !mealSuggestions) {
      loadSuggestions();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderMealSection = (title: string, items: MealItem[], emoji: string) => (
    <div className="mb-4">
      <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">
        {emoji} {title}
      </h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="card py-3">
            <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {item.calories} cal · {item.protein}g protein · {item.serving}
            </p>
          </div>
        ))}
      </div>
    </div>
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
        {activeTab === 'log' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-lg font-bold mb-4">
              {searchQuery ? `Results for "${searchQuery}"` : 'Popular Indian Foods'}
            </h2>
            {filteredFoods.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">🔍</p>
                <p className="text-gray-600 dark:text-gray-400">No foods found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFoods.map((food) => (
                  <div key={food.id} className="card flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{food.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {food.calories} cal · {food.protein}g protein · {food.serving}
                      </p>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg">
                      <Plus size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'tracker' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-lg font-bold mb-4">Today's Summary</h2>

            {/* Protein alert */}
            {proteinPct < 0.5 && (
              <div className="bg-red-50 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-xl p-3 mb-4 flex items-center gap-2">
                <AlertTriangle className="text-red-600 flex-shrink-0" size={18} />
                <p className="text-sm text-red-700 dark:text-red-200">
                  ⚡ Protein is very low! Switch to Suggestions tab for high-protein meal ideas.
                </p>
              </div>
            )}

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
                  <motion.div
                    className="bg-orange-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(100, ((todayNutrition?.totalCalories || 0) / 2500) * 100)}%`,
                    }}
                    transition={{ duration: 0.8 }}
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
                  <motion.div
                    className={`h-2 rounded-full ${proteinPct < 0.5 ? 'bg-red-500' : 'bg-blue-500'}`}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(
                        100,
                        ((todayNutrition?.totalProtein || 0) /
                          (todayNutrition?.targetProtein || 150)) *
                          100
                      )}%`,
                    }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                {proteinPct < 0.5 && (
                  <p className="text-xs text-red-500 mt-1">
                    Low protein — try adding eggs, dal, or paneer
                  </p>
                )}
              </div>
            </div>

            {/* Today's logged foods */}
            <h3 className="font-bold mb-3">Today's Foods</h3>
            {todayNutrition?.logs && todayNutrition.logs.length > 0 ? (
              <div className="space-y-2">
                {todayNutrition.logs.map((log) => (
                  <div key={log.id} className="card text-sm">
                    <p className="font-medium">Food #{log.foodId}</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {log.servings} servings · {log.mealType}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-3xl mb-2">🥗</p>
                <p className="text-gray-600 dark:text-gray-400 mb-3">No foods logged yet</p>
                <button
                  onClick={() => setActiveTab('log')}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded-lg transition text-sm"
                >
                  + Log a meal
                </button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'suggestions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-lg font-bold mb-1">AI Meal Suggestions</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Personalised based on your goals and preferences
            </p>

            {loadingSuggestions && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="animate-spin text-blue-600 mx-auto mb-2" size={32} />
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Getting AI suggestions…</p>
                </div>
              </div>
            )}

            {!loadingSuggestions && mealSuggestions && (
              <>
                {suggestionError && (
                  <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-300 rounded-lg p-3 mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-yellow-600" size={16} />
                    <p className="text-xs text-yellow-700 dark:text-yellow-200">{suggestionError}</p>
                  </div>
                )}

                {/* Protein alert from AI */}
                <AnimatePresence>
                  {mealSuggestions.protein_alert && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-orange-50 dark:bg-orange-900 border border-orange-300 dark:border-orange-700 rounded-xl p-4 mb-4"
                    >
                      <p className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-1">
                        ⚡ Low Protein Alert
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-300">
                        {mealSuggestions.protein_message}
                      </p>
                      {mealSuggestions.protein_boost_suggestions && (
                        <div className="mt-3 space-y-1">
                          {mealSuggestions.protein_boost_suggestions.map((item, i) => (
                            <div key={i} className="flex justify-between text-xs text-orange-800 dark:text-orange-200">
                              <span>🥩 {item.name}</span>
                              <span>{item.protein}g protein · {item.serving}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {mealSuggestions.daily_targets && (
                  <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-3 mb-4 text-sm">
                    <p className="text-blue-700 dark:text-blue-300 font-medium">
                      Daily Target: {mealSuggestions.daily_targets.calories} cal ·{' '}
                      {mealSuggestions.daily_targets.protein_grams}g protein
                    </p>
                  </div>
                )}

                {renderMealSection('Breakfast', mealSuggestions.breakfast, '🌅')}
                {renderMealSection('Lunch', mealSuggestions.lunch, '☀️')}
                {renderMealSection('Dinner', mealSuggestions.dinner, '🌙')}
                {renderMealSection('Snacks', mealSuggestions.snacks, '🥜')}

                <button
                  onClick={loadSuggestions}
                  className="w-full mt-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 font-semibold py-3 rounded-lg transition"
                >
                  🔄 Refresh Suggestions
                </button>
              </>
            )}

            {!loadingSuggestions && !mealSuggestions && (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">🍽️</p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Get personalised meal suggestions from HIRA AI
                </p>
                <button
                  onClick={loadSuggestions}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
                >
                  ✨ Get AI Suggestions
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FoodScreen;
