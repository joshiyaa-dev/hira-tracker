import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Battery, Moon, Brain, Dumbbell } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { apiClient } from '@/services/api';
import { DailyCheckIn } from '@/types';

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (checkIn: DailyCheckIn) => void;
}

interface SliderProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  colorFn?: (v: number) => string;
}

const Slider: React.FC<SliderProps> = ({
  label,
  icon,
  value,
  onChange,
  min = 1,
  max = 10,
  step = 1,
  unit = '',
  colorFn,
}) => {
  const defaultColor = (v: number) => {
    if (v <= 3) return 'text-red-500';
    if (v <= 6) return 'text-yellow-500';
    return 'text-green-500';
  };
  const colorClass = (colorFn ?? defaultColor)(value);

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          {icon}
          <span className="font-medium">{label}</span>
        </div>
        <span className={`text-xl font-bold ${colorClass}`}>
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-slate-600"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
            ((value - min) / (max - min)) * 100
          }%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`,
        }}
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};

const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const user = useAppStore((state) => state.user);
  const setTodayCheckIn = useAppStore((state) => state.setTodayCheckIn);

  const [energy, setEnergy] = useState(7);
  const [sleep, setSleep] = useState(7.0);
  const [stress, setStress] = useState(3);
  const [soreness, setSoreness] = useState(2);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    const checkIn: DailyCheckIn = {
      energy,
      sleep,
      stress,
      soreness,
      notes,
      date: new Date().toISOString().split('T')[0],
    };
    try {
      await apiClient.submitCheckIn(user.id, checkIn);
      setTodayCheckIn(checkIn);
    } catch {
      // Offline / backend not running – store locally anyway
      setTodayCheckIn(checkIn);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
      onComplete?.(checkIn);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    }
  };

  // Quick summary shown after submission
  const readinessApprox = Math.round(
    (energy * 10 * 0.25) +
    (Math.min(sleep / 8, 1) * 100 * 0.35) +
    ((10 - stress) * 10 * 0.25) +
    ((10 - soreness) * 10 * 0.15)
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-slate-600 rounded-full mx-auto mb-6" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Daily Check-in
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  How are you feeling today?
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="text-5xl mb-4">
                  {readinessApprox >= 70 ? '💪' : readinessApprox >= 50 ? '😊' : '😴'}
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  Readiness: {readinessApprox}/100
                </p>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {readinessApprox >= 70
                    ? 'Ready for a great workout!'
                    : readinessApprox >= 50
                    ? 'Moderate intensity recommended'
                    : 'Rest or light activity today'}
                </p>
              </motion.div>
            ) : (
              <>
                {/* Sliders */}
                <Slider
                  label="Energy Level"
                  icon={<Battery size={18} className="text-yellow-500" />}
                  value={energy}
                  onChange={setEnergy}
                />
                <Slider
                  label="Sleep"
                  icon={<Moon size={18} className="text-indigo-500" />}
                  value={sleep}
                  onChange={setSleep}
                  min={2}
                  max={12}
                  step={0.5}
                  unit=" hrs"
                  colorFn={(v) =>
                    v < 5 ? 'text-red-500' : v < 7 ? 'text-yellow-500' : 'text-green-500'
                  }
                />
                <Slider
                  label="Stress Level"
                  icon={<Brain size={18} className="text-purple-500" />}
                  value={stress}
                  onChange={setStress}
                  colorFn={(v) =>
                    v >= 8 ? 'text-red-500' : v >= 5 ? 'text-yellow-500' : 'text-green-500'
                  }
                />
                <Slider
                  label="Muscle Soreness"
                  icon={<Dumbbell size={18} className="text-orange-500" />}
                  value={soreness}
                  onChange={setSoreness}
                  colorFn={(v) =>
                    v >= 8 ? 'text-red-500' : v >= 5 ? 'text-yellow-500' : 'text-green-500'
                  }
                />

                {/* Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Any injuries, illnesses, or special conditions?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full input-field resize-none"
                  />
                </div>

                {/* Rule hints */}
                <div className="bg-blue-50 dark:bg-slate-700 rounded-xl p-4 mb-6 space-y-1.5">
                  {sleep < 5 && (
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      ⚠️ Low sleep detected – workout intensity will be reduced
                    </p>
                  )}
                  {stress >= 8 && (
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      ⚠️ High stress – light workout or rest day recommended
                    </p>
                  )}
                  {soreness >= 8 && (
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      ⚠️ High soreness – recovery workout suggested
                    </p>
                  )}
                  {sleep >= 7 && stress <= 4 && soreness <= 4 && energy >= 7 && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      ✅ Great readiness! Push workout possible
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : 'Submit Check-in'}
                </button>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DailyCheckInModal;
