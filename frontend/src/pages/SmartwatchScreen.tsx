import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus, X } from 'lucide-react';

const SmartwatchScreen: React.FC = () => {
  const navigate = useNavigate();
  const [connected, setConnected] = useState<string[]>([]);

  const devices = [
    {
      id: 'google-fit',
      name: 'Google Fit',
      icon: '🔵',
      description: 'Sync steps, heart rate, calories',
    },
    {
      id: 'fitbit',
      name: 'Fitbit',
      icon: '💚',
      description: 'Connect your Fitbit device',
    },
    {
      id: 'apple-health',
      name: 'Apple Health',
      icon: '🍎',
      description: 'iOS health data integration',
    },
  ];

  const toggleDevice = (deviceId: string) => {
    setConnected((prev) =>
      prev.includes(deviceId) ? prev.filter((id) => id !== deviceId) : [...prev, deviceId]
    );
  };

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Smartwatch</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Connect your fitness devices to automatically sync workout and health data.
        </p>

        <div className="space-y-3">
          {devices.map((device, index) => {
            const isConnected = connected.includes(device.id);
            return (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`card border-2 transition cursor-pointer ${
                  isConnected
                    ? 'border-green-500 bg-green-50 dark:bg-green-900'
                    : 'border-gray-300 dark:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{device.icon}</span>
                    <div>
                      <p className="font-bold">{device.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {device.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleDevice(device.id)}
                    className={`p-2 rounded-lg ${
                      isConnected
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isConnected ? <X size={20} /> : <Plus size={20} />}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {connected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <p className="font-semibold text-green-900 dark:text-green-100 mb-2">
              ✅ {connected.length} device(s) connected
            </p>
            <p className="text-sm text-green-800 dark:text-green-200">
              Your data will sync automatically every hour. Last sync: just now
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SmartwatchScreen;
