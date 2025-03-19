import React, { useState } from 'react';
import { Utensils, Dumbbell, Bed, Plus, Check, X } from 'lucide-react';

const DailyLog = ({ showLogForm, setShowLogForm, logEntry, setLogEntry, setLogs }) => {
  const [detailedLog, setDetailedLog] = useState({
    mealType: '',
    mealComposition: '', // Carbs-heavy, protein-heavy, fiber-heavy, fat-heavy, balanced
    workoutType: '', // Cardio, Weight Lifting
    sleepQuality: '', // Light, Moderate, Deep
    calories: '',
    duration: '',
  });

  // Helper function to convert 24-hour time to 12-hour format
  const convertTo12HourFormat = (time) => {
    if (!time) return 'Not set';
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes.padStart(2, '0')} ${period}`;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const newLog = {
      ...logEntry,
      ...detailedLog,
      id: Date.now(), // Unique ID for each log
    };
    setLogs((prevLogs) => [...prevLogs, newLog]); // Save the log
    setShowLogForm(false); // Close the form
    setLogEntry({ type: '', time: '', note: '' }); // Reset log entry
    setDetailedLog({
      mealType: '',
      mealComposition: '',
      workoutType: '',
      sleepQuality: '',
      calories: '',
      duration: '',
    }); // Reset detailed log
  };

  // Render detailed log form based on activity type
  const renderDetailedForm = () => {
    switch (logEntry.type) {
      case 'Meal':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Meal Type</label>
            <select
              value={detailedLog.mealType}
              onChange={(e) => setDetailedLog({ ...detailedLog, mealType: e.target.value })}
              className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
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
              className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
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
              className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        );
      case 'Workout':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Workout Type</label>
            <select
              value={detailedLog.workoutType}
              onChange={(e) => setDetailedLog({ ...detailedLog, workoutType: e.target.value })}
              className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">Select workout type</option>
              <option value="Cardio">Cardio</option>
              <option value="Weight Lifting">Weight Lifting</option>
            </select>

            <label className="text-sm font-medium text-slate-700">Duration (minutes)</label>
            <input
              type="number"
              value={detailedLog.duration}
              onChange={(e) => setDetailedLog({ ...detailedLog, duration: e.target.value })}
              placeholder="Enter duration"
              className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        );
      case 'Sleep':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Sleep Quality</label>
            <select
              value={detailedLog.sleepQuality}
              onChange={(e) => setDetailedLog({ ...detailedLog, sleepQuality: e.target.value })}
              className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">Select sleep quality</option>
              <option value="Light">Light</option>
              <option value="Moderate">Moderate</option>
              <option value="Deep">Deep</option>
            </select>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Log Entry Form */}
      {showLogForm && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md m-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Daily Log</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Activity Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Activity Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLogEntry({ ...logEntry, type: 'Meal' })}
                    className={`p-3 flex flex-col items-center justify-center rounded-lg transition-all ${
                      logEntry.type === 'Meal'
                        ? 'bg-teal-50 border-2 border-teal-500 text-teal-600'
                        : 'border-2 border-slate-200 text-slate-600 hover:border-teal-200'
                    }`}
                  >
                    <Utensils className="w-5 h-5 mb-1" />
                    <span className="text-sm">Meal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogEntry({ ...logEntry, type: 'Workout' })}
                    className={`p-3 flex flex-col items-center justify-center rounded-lg transition-all ${
                      logEntry.type === 'Workout'
                        ? 'bg-blue-50 border-2 border-blue-500 text-blue-600'
                        : 'border-2 border-slate-200 text-slate-600 hover:border-blue-200'
                    }`}
                  >
                    <Dumbbell className="w-5 h-5 mb-1" />
                    <span className="text-sm">Workout</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogEntry({ ...logEntry, type: 'Sleep' })}
                    className={`p-3 flex flex-col items-center justify-center rounded-lg transition-all ${
                      logEntry.type === 'Sleep'
                        ? 'bg-indigo-50 border-2 border-indigo-500 text-indigo-600'
                        : 'border-2 border-slate-200 text-slate-600 hover:border-indigo-200'
                    }`}
                  >
                    <Bed className="w-5 h-5 mb-1" />
                    <span className="text-sm">Sleep</span>
                  </button>
                </div>
              </div>

              {/* Detailed Log Form */}
              {renderDetailedForm()}

              {/* Time Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Time</label>
                <input
                  type="time"
                  value={logEntry.time}
                  onChange={(e) => setLogEntry({ ...logEntry, time: e.target.value })}
                  className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              {/* Notes Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Notes (optional)</label>
                <textarea
                  value={logEntry.note}
                  onChange={(e) => setLogEntry({ ...logEntry, note: e.target.value })}
                  placeholder="Add any details..."
                  className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  rows="2"
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={!logEntry.type || !logEntry.time}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium ${
                    (!logEntry.type || !logEntry.time) ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-600 hover:to-indigo-700'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogForm(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Entry Button */}
      <button
        onClick={() => setShowLogForm(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-colors"
      >
        <Plus className="w-6 h-6" />
      </button>
    </>
  );
};

export default DailyLog;