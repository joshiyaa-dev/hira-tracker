import axios, { AxiosInstance } from 'axios';
import { User, WorkoutPlan, DailyNutrition, DailyCheckIn, ReadinessScore, Food } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class APIClient {
  private client: AxiosInstance;
  private token: string | null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.token = localStorage.getItem('authToken');
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Response interceptor for global error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        // Retry once on network errors
        if (!config._retried && (error.code === 'ECONNABORTED' || !error.response)) {
          config._retried = true;
          await new Promise((r) => setTimeout(r, 1000));
          return this.client(config);
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Auth APIs
  async loginWithOTP(phone: string, otp: string) {
    return this.client.post<{ user: User; token: string }>('/auth/login-otp', {
      phone,
      otp,
    });
  }

  async requestOTP(phone: string) {
    return this.client.post('/auth/request-otp', { phone });
  }

  async loginWithGoogle(googleToken: string) {
    return this.client.post<{ user: User; token: string }>('/auth/google', {
      token: googleToken,
    });
  }

  async getCurrentUser() {
    return this.client.get<User>('/auth/me');
  }

  // User APIs
  async updateUserProfile(userId: string, data: any) {
    return this.client.put(`/users/${userId}`, data);
  }

  async setUserOnboarding(userId: string, data: any) {
    return this.client.post(`/users/${userId}/onboarding`, data);
  }

  // Workout APIs
  async generateWorkoutPlan(userId: string, readinessScore?: number) {
    return this.client.post<WorkoutPlan>(`/workouts/${userId}/generate`, {
      readiness_score: readinessScore ?? 75,
    });
  }

  async getTodayWorkout(userId: string) {
    return this.client.get<WorkoutPlan>(`/workouts/${userId}/today`);
  }

  async logWorkoutProgress(workoutId: string, exerciseId: string) {
    return this.client.post(`/workouts/${workoutId}/log`, { exerciseId });
  }

  async getWorkoutHistory(userId: string, days: number = 30) {
    return this.client.get(`/workouts/${userId}/history`, {
      params: { days },
    });
  }

  // Nutrition APIs
  async getTodayNutrition(userId: string) {
    return this.client.get<DailyNutrition>(`/nutrition/${userId}/today`);
  }

  async logFood(userId: string, foodId: string, servings: number, mealType: string) {
    return this.client.post(`/nutrition/${userId}/log-food`, {
      foodId,
      servings,
      mealType,
    });
  }

  async searchFoods(query: string) {
    return this.client.get<Food[]>('/foods/search', { params: { q: query } });
  }

  async getFoodSuggestions(userId: string) {
    return this.client.get(`/nutrition/${userId}/suggestions`);
  }

  // Health Check-in APIs
  async submitCheckIn(userId: string, checkIn: DailyCheckIn) {
    return this.client.post(`/health/${userId}/check-in`, checkIn);
  }

  async getTodayCheckIn(userId: string) {
    return this.client.get<DailyCheckIn>(`/health/${userId}/today-check-in`);
  }

  async getReadinessScore(userId: string) {
    return this.client.get<ReadinessScore>(`/health/${userId}/readiness`);
  }

  // AI APIs

  /** Generate a full daily workout plan from the AI engine */
  async generatePlan(userId: string, readinessScore?: number) {
    return this.client.post(`/ai/${userId}/generate-plan`, {
      readiness_score: readinessScore ?? 75,
    });
  }

  /** Get AI-powered meal suggestions, passing current protein consumed */
  async getMealSuggestions(userId: string, currentProtein?: number) {
    return this.client.post(`/ai/${userId}/meal-suggestion`, {
      current_protein: currentProtein ?? 0,
    });
  }

  /** Update intensity based on daily check-in (sleep, stress, soreness, energy) */
  async adjustPlan(
    userId: string,
    checkIn: { sleep: number; stress: number; soreness: number; energy: number }
  ) {
    return this.client.post(`/ai/${userId}/adjust-plan`, checkIn);
  }

  // Legacy AI APIs (kept for backward compatibility)
  async generateMealSuggestions(userId: string) {
    return this.client.post(`/ai/${userId}/meal-suggestions`, {});
  }

  async adjustWorkoutIntensity(userId: string, intensity: 'light' | 'normal' | 'push') {
    return this.client.post(`/ai/${userId}/adjust-intensity`, { intensity });
  }

  async getPersonalizedPlan(userId: string) {
    return this.client.post(`/ai/${userId}/personalized-plan`, {});
  }

  // Smartwatch APIs
  async connectSmartwatch(userId: string, provider: string, token: string) {
    return this.client.post(`/smartwatch/${userId}/connect`, {
      provider,
      token,
    });
  }

  async syncSmartwatch(userId: string) {
    return this.client.post(`/smartwatch/${userId}/sync`, {});
  }
}

export const apiClient = new APIClient();
