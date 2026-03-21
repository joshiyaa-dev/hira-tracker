import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserProfile, WorkoutPlan, DailyNutrition, DailyCheckIn } from '@/types';

interface AppStore {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;

  // User Profile
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;

  // Current Data
  todayWorkout: WorkoutPlan | null;
  setTodayWorkout: (workout: WorkoutPlan) => void;
  
  todayNutrition: DailyNutrition | null;
  setTodayNutrition: (nutrition: DailyNutrition) => void;

  todayCheckIn: DailyCheckIn | null;
  setTodayCheckIn: (checkIn: DailyCheckIn) => void;

  // UI State
  darkMode: boolean;
  toggleDarkMode: () => void;
  
  language: 'en' | 'ta' | 'hi';
  setLanguage: (lang: 'en' | 'ta' | 'hi') => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // Auth defaults
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),

      // Profile
      userProfile: null,
      setUserProfile: (userProfile) => set({ userProfile }),

      // Current data
      todayWorkout: null,
      setTodayWorkout: (todayWorkout) => set({ todayWorkout }),

      todayNutrition: null,
      setTodayNutrition: (todayNutrition) => set({ todayNutrition }),

      todayCheckIn: null,
      setTodayCheckIn: (todayCheckIn) => set({ todayCheckIn }),

      // UI
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      language: 'en',
      setLanguage: (language) => set({ language }),

      // Loading
      isLoading: false,
      setIsLoading: (isLoading) => set({ isLoading }),

      error: null,
      setError: (error) => set({ error }),
    }),
    {
      name: 'hira-store',
      partialize: (state) => ({
        user: state.user,
        userProfile: state.userProfile,
        darkMode: state.darkMode,
        language: state.language,
      }),
    }
  )
);
