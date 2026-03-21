import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

// Pages
import SplashScreen from '@/pages/SplashScreen';
import LoginScreen from '@/pages/LoginScreen';
import OnboardingScreen from '@/pages/OnboardingScreen';
import Dashboard from '@/pages/Dashboard';
import WorkoutScreen from '@/pages/WorkoutScreen';
import FoodScreen from '@/pages/FoodScreen';
import ProgressScreen from '@/pages/ProgressScreen';
import SmartwatchScreen from '@/pages/SmartwatchScreen';
import SettingsScreen from '@/pages/SettingsScreen';

const App: React.FC = () => {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const darkMode = useAppStore((state) => state.darkMode);

  useEffect(() => {
    // Apply dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/splash" element={<SplashScreen />} />
          
          {isAuthenticated ? (
            <>
              {/* Protected Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/workout" element={<WorkoutScreen />} />
              <Route path="/food" element={<FoodScreen />} />
              <Route path="/progress" element={<ProgressScreen />} />
              <Route path="/smartwatch" element={<SmartwatchScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
              
              {/* Redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="/onboarding" element={<Navigate to="/dashboard" replace />} />
            </>
          ) : (
            <>
              {/* Auth Routes */}
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/onboarding" element={<OnboardingScreen />} />
              
              {/* Redirects */}
              <Route path="/" element={<Navigate to="/splash" replace />} />
              <Route path="/dashboard" element={<Navigate to="/login" replace />} />
              <Route path="/workout" element={<Navigate to="/login" replace />} />
            </>
          )}
        </Routes>
      </Router>
    </div>
  );
};

export default App;
