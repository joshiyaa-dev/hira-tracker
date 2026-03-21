import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { apiClient } from '@/services/api';

const OnboardingScreen: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const setUserProfile = useAppStore((state) => state.setUserProfile);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1
    age: '',
    gender: '',
    height: '',
    weight: '',
    // Step 2
    bodyType: '',
    // Step 3
    lifestyle: '',
    jobType: '',
    // Step 4
    gymExperience: '',
    // Step 5
    fitnessGoal: '',
    dietType: '',
  });

  const steps = [
    { title: 'Personal Info', description: 'Tell us about yourself' },
    { title: 'Body Type', description: 'How is your body composition?' },
    { title: 'Lifestyle', description: 'What is your daily activity?' },
    { title: 'Gym Experience', description: 'What is your experience level?' },
    { title: 'Goals & Diet', description: 'What are your fitness goals?' },
  ];

  const handleNext = async () => {
    if (step === steps.length - 1) {
      await handleSubmit();
    } else {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await apiClient.setUserOnboarding(user.id, formData);
      setUserProfile({
        bodyType: formData.bodyType as any,
        lifestyle: formData.lifestyle as any,
        jobType: formData.jobType,
        gymExperience: formData.gymExperience as any,
        fitnessGoal: formData.fitnessGoal as any,
        dietType: formData.dietType as any,
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Age</label>
              <input
                type="number"
                min="16"
                max="100"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="input-field"
                placeholder="25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Gender</label>
              <div className="grid grid-cols-3 gap-3">
                {['male', 'female', 'other'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setFormData({ ...formData, gender: g })}
                    className={`py-2 rounded-lg font-medium transition ${
                      formData.gender === g
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Height (cm)</label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="input-field"
                placeholder="180"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Weight (kg)</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="input-field"
                placeholder="75"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Choose based on your natural body composition
            </p>
            {['ectomorph', 'mesomorph', 'endomorph'].map((type) => (
              <button
                key={type}
                onClick={() => setFormData({ ...formData, bodyType: type })}
                className={`w-full p-4 rounded-lg border-2 transition ${
                  formData.bodyType === type
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-300 dark:border-slate-600'
                }`}
              >
                <div className="font-semibold text-left">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 text-left">
                  {type === 'ectomorph' &&
                    'Lean, fast metabolism, hard to gain weight'}
                  {type === 'mesomorph' &&
                    'Athletic, gains muscle easily, moderate weight gain'}
                  {type === 'endomorph' &&
                    'Round body shape, easier to gain weight, hard to lose'}
                </div>
              </button>
            ))}
          </div>
        );

      case 2:
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-3">Activity Level</label>
              {['sedentary', 'moderate', 'active'].map((level) => (
                <button
                  key={level}
                  onClick={() => setFormData({ ...formData, lifestyle: level })}
                  className={`w-full p-3 rounded-lg border-2 text-left transition mb-2 ${
                    formData.lifestyle === level
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                      : 'border-gray-300 dark:border-slate-600'
                  }`}
                >
                  {level === 'sedentary' && '💼 Mostly sitting (desk job)'}
                  {level === 'moderate' && '🏃 Moderately active (mixed)'}
                  {level === 'active' && '⚡ Very active (manual labor)'}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Job Type</label>
              <input
                type="text"
                value={formData.jobType}
                onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                className="input-field"
                placeholder="e.g., Software Engineer, Accountant"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-3">
            {['beginner', 'intermediate', 'advanced'].map((exp) => (
              <button
                key={exp}
                onClick={() => setFormData({ ...formData, gymExperience: exp })}
                className={`w-full p-4 rounded-lg border-2 transition ${
                  formData.gymExperience === exp
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-300 dark:border-slate-600'
                }`}
              >
                <div className="font-semibold text-left">
                  {exp === 'beginner' && '🆕 Beginner (< 6 months)'}
                  {exp === 'intermediate' && '💪 Intermediate (6 months - 2 years)'}
                  {exp === 'advanced' && '🏆 Advanced (2+ years)'}
                </div>
              </button>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-3">Fitness Goal</label>
              {['fat-loss', 'muscle-gain', 'strength', 'general-fitness'].map(
                (goal) => (
                  <button
                    key={goal}
                    onClick={() => setFormData({ ...formData, fitnessGoal: goal })}
                    className={`w-full p-3 rounded-lg border-2 text-left transition mb-2 ${
                      formData.fitnessGoal === goal
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                        : 'border-gray-300 dark:border-slate-600'
                    }`}
                  >
                    {goal === 'fat-loss' && '🔥 Fat Loss'}
                    {goal === 'muscle-gain' && '💪 Muscle Gain'}
                    {goal === 'strength' && '🏋️ Build Strength'}
                    {goal === 'general-fitness' && '⚖️ General Fitness'}
                  </button>
                )
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-3">Diet Type</label>
              {['veg', 'non-veg', 'vegan'].map((diet) => (
                <button
                  key={diet}
                  onClick={() => setFormData({ ...formData, dietType: diet })}
                  className={`w-full p-3 rounded-lg border-2 text-left transition mb-2 ${
                    formData.dietType === diet
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                      : 'border-gray-300 dark:border-slate-600'
                  }`}
                >
                  {diet === 'veg' && '🥬 Vegetarian'}
                  {diet === 'non-veg' && '🍗 Non-Vegetarian'}
                  {diet === 'vegan' && '🌱 Vegan'}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div className="w-full max-w-md">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {steps[step].title}
            </h2>
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              {step + 1}/{steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-300 dark:bg-slate-700 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {steps[step].description}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="btn-secondary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === steps.length - 1 ? (
              loading ? 'Creating...' : 'Complete'
            ) : (
              <>
                Next
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingScreen;
