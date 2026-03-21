import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Mail } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { apiClient } from '@/services/api';

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useAppStore((state) => state.setUser);
  const setLanguage = useAppStore((state) => state.setLanguage);

  const [step, setStep] = useState<'language' | 'phone' | 'otp'>('language');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLanguageSelect = (lang: 'en' | 'ta' | 'hi') => {
    setLanguage(lang);
    setStep('phone');
  };

  const handleRequestOTP = async () => {
    if (!phone) {
      setError('Please enter your phone number');
      return;
    }
    setLoading(true);
    try {
      await apiClient.requestOTP(phone);
      setStep('otp');
      setError('');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      setError('Please enter OTP');
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.loginWithOTP(phone, otp);
      setUser(response.data.user);
      apiClient.setToken(response.data.token);
      navigate('/onboarding');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError('Google login coming soon');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">💪</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">HIRA</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Your Personal Gym Assistant</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          {/* Language Selection */}
          {step === 'language' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Select Language
              </h2>
              <div className="space-y-3">
                {[
                  { code: 'en' as const, label: '🇬🇧 English' },
                  { code: 'hi' as const, label: '🇮🇳 हिंदी' },
                  { code: 'ta' as const, label: '🇮🇳 தமிழ்' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className="w-full p-4 border-2 border-gray-300 dark:border-slate-600 rounded-lg hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition font-semibold text-gray-900 dark:text-white"
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Phone Input */}
          {step === 'phone' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Enter Phone Number
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We'll send you an OTP to verify
              </p>

              <div className="relative mb-6">
                <Phone className="absolute left-4 top-4 text-gray-400" size={20} />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setError('');
                  }}
                  className="input-field pl-12"
                />
              </div>

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <button
                onClick={handleRequestOTP}
                disabled={loading || !phone}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-slate-800 text-gray-500">Or</span>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Mail size={20} />
                Continue with Google
              </button>
            </motion.div>
          )}

          {/* OTP Verification */}
          {step === 'otp' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verify OTP
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Enter the 6-digit code sent to {phone}
              </p>

              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                className="input-field text-center text-2xl tracking-widest mb-6 font-mono"
              />

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>

              <button
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                }}
                className="btn-secondary"
              >
                Change Phone Number
              </button>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
