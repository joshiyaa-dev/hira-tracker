import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Moon, LogOut, Lock, Bell, Globe, LucideIcon } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { apiClient } from '@/services/api';

type ToggleItem = {
  label: string;
  icon: LucideIcon;
  isToggle: true;
  value: boolean;
  action: () => void;
};

type ActionItem = {
  label: string;
  icon: LucideIcon;
  isToggle?: false;
  description?: string;
  action: () => void;
};

type SettingsItem = ToggleItem | ActionItem;

const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const darkMode = useAppStore((state) => state.darkMode);
  const toggleDarkMode = useAppStore((state) => state.toggleDarkMode);
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const logout = useAppStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    apiClient.clearToken();
    navigate('/login');
  };

  const settingsSections: { title: string; items: SettingsItem[] }[] = [
    {
      title: 'Display',
      items: [
        {
          label: 'Dark Mode',
          icon: Moon,
          action: () => toggleDarkMode(),
          isToggle: true,
          value: darkMode,
        },
      ],
    },
    {
      title: 'Language',
      items: [
        {
          label: 'Select Language',
          icon: Globe,
          description: `Current: ${language === 'en' ? 'English' : language === 'hi' ? 'हिंदी' : 'தமிழ்'}`,
          action: () => {
            const next = language === 'en' ? 'hi' : language === 'hi' ? 'ta' : 'en';
            setLanguage(next);
          },
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          label: 'Workout Reminders',
          icon: Bell,
          isToggle: true,
          value: true,
          action: () => {},
        },
        {
          label: 'Meal Suggestions',
          icon: Bell,
          isToggle: true,
          value: true,
          action: () => {},
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          label: 'Privacy Policy',
          icon: Lock,
          action: () => window.open('https://hira.app/privacy'),
        },
        {
          label: 'Terms of Service',
          icon: Lock,
          action: () => window.open('https://hira.app/terms'),
        },
      ],
    },
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="mb-6"
          >
            <h2 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase mb-3 px-2">
              {section.title}
            </h2>
            <div className="space-y-2">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={`${section.title}-${itemIndex}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: sectionIndex * 0.1 + itemIndex * 0.05 }}
                    onClick={item.action}
                    className="w-full card flex items-center justify-between hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="text-gray-600 dark:text-gray-400" size={20} />
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.label}
                        </p>
                        {!item.isToggle && item.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {item.isToggle && (
                      <div
                        className={`w-10 h-6 rounded-full transition ${
                          item.value ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'
                        } relative`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${
                            item.value ? 'right-0.5' : 'left-0.5'
                          }`}
                        />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}

        {/* Language Selection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <h2 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase mb-3 px-2">
            Language Selection
          </h2>
          <div className="space-y-2">
            {[
              { code: 'en', label: 'English', flag: '🇬🇧' },
              { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
              { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code as any)}
                className={`w-full card flex items-center gap-3 ${
                  language === lang.code ? 'bg-blue-50 dark:bg-blue-900 border-blue-500' : ''
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <p className="font-medium">{lang.label}</p>
                {language === lang.code && (
                  <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={handleLogout}
          className="w-full btn-primary flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700"
        >
          <LogOut size={20} />
          Logout
        </motion.button>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400">
            HIRA v1.0.0<br />
            © 2024. All rights reserved.
          </p>
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-4">
            ⚠️ Disclaimer: This app provides fitness recommendations but is NOT a substitute
            for professional medical advice.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsScreen;
