// User Types
export interface User {
  id: string;
  phone: string;
  email?: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  language: 'en' | 'ta' | 'hi';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  bodyType: 'ectomorph' | 'mesomorph' | 'endomorph';
  lifestyle: 'sedentary' | 'moderate' | 'active';
  jobType: string;
  gymExperience: 'beginner' | 'intermediate' | 'advanced';
  fitnessGoal: 'fat-loss' | 'muscle-gain' | 'strength' | 'general-fitness';
  dietType: 'veg' | 'non-veg' | 'vegan';
}

// Workout Types
export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string;
  sets: number;
  reps: number;
  restSeconds: number;
  safetyTips: string[];
  imageUrl?: string;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  date: string;
  exercises: Exercise[];
  totalDuration: number; // minutes
  intensity: 'light' | 'normal' | 'push';
  readinessScore: number; // 0-100
  completed: boolean;
  completedExercises: string[]; // exercise IDs
}

// Food Types
export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number; // grams
  carbs: number;
  fat: number;
  fiber: number;
  servingSize: string;
  currency?: string;
  cuisine: string;
  imageUrl?: string;
}

export interface FoodLog {
  id: string;
  userId: string;
  foodId: string;
  servings: number;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface DailyNutrition {
  date: string;
  totalCalories: number;
  totalProtein: number;
  targetProtein: number;
  logs: FoodLog[];
}

// Health Metrics
export interface DailyCheckIn {
  id: string;
  userId: string;
  date: string;
  energy: number; // 1-10
  sleep: number; // hours
  stress: number; // 1-10
  soreness: number; // 1-10
  notes?: string;
}

export interface ReadinessScore {
  score: number; // 0-100
  factors: {
    sleep: number;
    stress: number;
    soreness: number;
    energy: number;
  };
  recommendation: string;
}

// Progress Types
export interface WeeklyStats {
  week: string;
  workoutsCompleted: number;
  totalVolume: number;
  averageIntensity: number;
  proteinIntake: number;
  strengProgressIncrease: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
