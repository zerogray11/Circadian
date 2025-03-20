import React, { useState } from 'react';
import { Utensils, Dumbbell, Bed, Plus, Check, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DailyLog = ({ showLogForm, setShowLogForm, logEntry, setLogEntry, setLogs }) => {
  const [detailedLog, setDetailedLog] = useState({
    mealType: '',
    mealComposition: '',
    workoutType: '',
    sleepStartTime: '',
    sleepEndTime: '',
    wakeUpCount: 0,
    sleepQuality: 5,
    calories: '',
    duration: '',
  });

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const newLog = {
      ...logEntry,
      ...detailedLog,
      id: Date.now(),
    };
    setLogs((prevLogs) => [...prevLogs, newLog]);
    setShowLogForm(false);
    setLogEntry({ type: '', time: '', note: '' });
    setDetailedLog({
      mealType: '',
      mealComposition: '',
      workoutType: '',
      sleepStartTime: '',
      sleepEndTime: '',
      wakeUpCount: 0,
      sleepQuality: 5,
      calories: '',
      duration: '',
    });
  };

  // Get color based on activity type
  const getActivityColor = (type) => {
    switch (type) {
      case 'Meal':
        return 'from-teal-400 to-emerald-500';
      case 'Workout':
        return 'from-blue-400 to-indigo-600';
      case 'Sleep':
        return 'from-purple-400 to-indigo-500';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  // Get icon based on activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'Meal':
        return <Utensils className="w-5 h-5" />;
      case 'Workout':
        return <Dumbbell className="w-5 h-5" />;
      case 'Sleep':
        return <Bed className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  // Render detailed log form based on activity type
  const renderDetailedForm = () => {
    switch (logEntry.type) {
      case 'Meal':
        return (
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">Meal Type</label>
            <select
              value={detailedLog.mealType}
              onChange={(e) => setDetailedLog({ ...detailedLog, mealType: e.target.value })}
              className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 bg-white/80 backdrop-blur-sm transition-all"
            >
              <option value="">Select meal type</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
            </select>

            <label className="text-sm font-medium text-slate-700">Meal Composition</label>
            <select
              value={detailedLog.mealComposition}
              onChange={(e) => setDetailedLog({ ...detailedLog, mealComposition: e.target.value })}
              className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 bg-white/80 backdrop-blur-sm transition-all"
            >
              <option value="">Select composition</option>
              <option value="Carbs-heavy">Carbs-heavy</option>
              <option value="Protein-heavy">Protein-heavy</option>
              <option value="Fiber-heavy">Fiber-heavy</option>
              <option value="Fat-heavy">Fat-heavy</option>
              <option value="Balanced">Balanced</option>
            </select>

            <label className="text-sm font-medium text-slate-700">Calories</label>
            <input
              type="number"
              value={detailedLog.calories}
              onChange={(e) => setDetailedLog({ ...detailedLog, calories: e.target.value })}
              placeholder="Enter calories"
              className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 bg-white/80 backdrop-blur-sm transition-all"
            />
          </div>
        );
      case 'Workout':
        return (
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">Workout Type</label>
            <select
              value={detailedLog.workoutType}
              onChange={(e) => setDetailedLog({ ...detailedLog, workoutType: e.target.value })}
              className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
            >
              <option value="">Select workout type</option>
              <option value="Cardio">Cardio</option>
              <option value="Weight Lifting">Weight Lifting</option>
              <option value="HIIT">HIIT</option>
              <option value="Yoga">Yoga</option>
              <option value="Pilates">Pilates</option>
              <option value="Other">Other</option>
            </select>

            <label className="text-sm font-medium text-slate-700">Duration (minutes)</label>
            <input
              type="number"
              value={detailedLog.duration}
              onChange={(e) => setDetailedLog({ ...detailedLog, duration: e.target.value })}
              placeholder="Enter duration"
              className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
            />
          </div>
        );
      case 'Sleep':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Sleep Start</label>
                <input
                  type="time"
                  value={detailedLog.sleepStartTime}
                  onChange={(e) => setDetailedLog({ ...detailedLog, sleepStartTime: e.target.value })}
                  className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 bg-white/80 backdrop-blur-sm transition-all"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Sleep End</label>
                <input
                  type="time"
                  value={detailedLog.sleepEndTime}
                  onChange={(e) => setDetailedLog({ ...detailedLog, sleepEndTime: e.target.value })}
                  className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 bg-white/80 backdrop-blur-sm transition-all"
                  required
                />
              </div>
            </div>

            <label className="text-sm font-medium text-slate-700">Number of Wake-ups</label>
            <input
              type="number"
              value={detailedLog.wakeUpCount}
              onChange={(e) => setDetailedLog({ ...detailedLog, wakeUpCount: e.target.value })}
              placeholder="Enter number of times waking up"
              className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 bg-white/80 backdrop-blur-sm transition-all"
            />

            <label className="text-sm font-medium text-slate-700">Sleep Quality</label>
            <div className="flex items-center">
              <input
                type="range"
                min="1"
                max="10"
                value={detailedLog.sleepQuality}
                onChange={(e) => setDetailedLog({ ...detailedLog, sleepQuality: e.target.value })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="ml-2 text-lg font-medium text-slate-700">{detailedLog.sleepQuality}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Log Entry Form */}
      <AnimatePresence>
        {showLogForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white/90 rounded-2xl shadow-xl p-6 w-full max-w-md m-4 max-h-[90vh] overflow-y-auto"
            >
              {/* Form Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                  {logEntry.type ? `${logEntry.type} Log` : 'New Log Entry'}
                </h2>
                <button
                  onClick={() => setShowLogForm(false)}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-700" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Activity Type Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">Activity Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    <motion.button
                      type="button"
                      onClick={() => setLogEntry({ ...logEntry, type: 'Meal' })}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`p-4 flex flex-col items-center justify-center rounded-xl transition-all ${
                        logEntry.type === 'Meal'
                          ? 'bg-gradient-to-br from-teal-400 to-emerald-500 text-white shadow-lg'
                          : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-teal-200'
                      }`}
                    >
                      <Utensils className="w-6 h-6 mb-1" />
                      <span className="text-sm font-medium">Meal</span>
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setLogEntry({ ...logEntry, type: 'Workout' })}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`p-4 flex flex-col items-center justify-center rounded-xl transition-all ${
                        logEntry.type === 'Workout'
                          ? 'bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-lg'
                          : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-blue-200'
                      }`}
                    >
                      <Dumbbell className="w-6 h-6 mb-1" />
                      <span className="text-sm font-medium">Workout</span>
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setLogEntry({ ...logEntry, type: 'Sleep' })}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`p-4 flex flex-col items-center justify-center rounded-xl transition-all ${
                        logEntry.type === 'Sleep'
                          ? 'bg-gradient-to-br from-purple-400 to-indigo-500 text-white shadow-lg'
                          : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-indigo-200'
                      }`}
                    >
                      <Bed className="w-6 h-6 mb-1" />
                      <span className="text-sm font-medium">Sleep</span>
                    </motion.button>
                  </div>
                </div>

                {/* Detailed Log Form */}
                <AnimatePresence mode="wait">
                  {logEntry.type && (
                    <motion.div
                      key={logEntry.type}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-white/70 p-4 rounded-xl border border-slate-200 backdrop-blur-md"
                    >
                      {renderDetailedForm()}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Notes Input */}
                {logEntry.type && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <label className="text-sm font-medium text-slate-700">Notes (optional)</label>
                    <textarea
                      value={logEntry.note}
                      onChange={(e) => setLogEntry({ ...logEntry, note: e.target.value })}
                      placeholder="Add any details..."
                      className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-white/80 backdrop-blur-sm transition-all"
                      rows="2"
                    />
                  </motion.div>
                )}

                {/* Form Actions */}
                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="submit"
                    disabled={!logEntry.type || (logEntry.type === 'Sleep' && (!detailedLog.sleepStartTime || !detailedLog.sleepEndTime))}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium shadow-md ${
                      (!logEntry.type || (logEntry.type === 'Sleep' && (!detailedLog.sleepStartTime || !detailedLog.sleepEndTime))) 
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                        : `bg-gradient-to-r ${getActivityColor(logEntry.type)} text-white hover:shadow-lg`
                    }`}
                  >
                    {logEntry.type ? (
                      <>
                        <Check className="w-4 h-4" />
                        Save {logEntry.type}
                      </>
                    ) : (
                      'Select Activity Type'
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log Entry Button */}
      <motion.button
        onClick={() => setShowLogForm(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-full shadow-lg z-40"
      >
        <motion.div 
          animate={{ 
            rotate: [0, 0, 180, 180, 0],
            scale: [1, 1.1, 1.1, 1, 1]
          }}
          transition={{ 
            duration: 5,
            ease: "easeInOut", 
            times: [0, 0.2, 0.5, 0.8, 1],
            repeat: Infinity,
            repeatDelay: 7
          }}
        >
          <Plus className="w-6 h-6" />
        </motion.div>
      </motion.button>
    </>
  );
};

export default DailyLog;