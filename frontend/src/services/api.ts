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
  async generateWorkoutPlan(userId: string) {
    return this.client.post<WorkoutPlan>(`/workouts/${userId}/generate`, {});
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
