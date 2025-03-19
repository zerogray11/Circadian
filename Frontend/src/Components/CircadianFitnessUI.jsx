// CircadianFitnessUI.js
import React from 'react';
import { Moon, Sun, Utensils, Dumbbell, Bed, Clock, Check, X, Activity, Plus } from 'lucide-react';
import useCircadianFitnessLogic from './CircadianVisualization';
import CircadianTimeline from './CircadianTimeline';

const CircadianFitnessUI = () => {
  const {
    userData,
    loading,
    logEntry,
    showLogForm,
    currentTime,
    activeTab,
    setLogEntry,
    setShowLogForm,
    setActiveTab,
    calculateIdealSchedule,
    handleLogEntry,
  } = useCircadianFitnessLogic();

  const idealSchedule = calculateIdealSchedule();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-indigo-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <h1 className="text-2xl font-bold">Your Circadian Rhythm</h1>
            <p className="mt-1 opacity-90">
              {userData?.name ? `Hello, ${userData.name}` : 'Optimize your day based on your chronotype'}
            </p>
          </div>

          {/* Chronotype Badge */}
          {userData?.chronotype && (
            <div className="flex justify-center -mt-4">
              <div
                className={`px-4 py-2 bg-white rounded-full shadow-lg text-sm font-medium ${
                  userData.chronotype === 'Morning Lark'
                    ? 'text-cyan-600'
                    : userData.chronotype === 'Night Owl'
                    ? 'text-indigo-600'
                    : 'text-gray-600'
                }`}
              >
                {userData.chronotype === 'Morning Lark' && '🌞 Morning Lark'}
                {userData.chronotype === 'Night Owl' && '🦉 Night Owl'}
                {userData.chronotype === 'Intermediate Type' && '⏳ Intermediate Type'}
              </div>
            </div>
          )}

          {/* Current Time */}
          <div className="p-6 text-center">
            <div className="text-slate-500 mb-2">Current Time</div>
            <div className="text-3xl font-bold font-mono text-indigo-800">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Clock Visualization */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="text-center mb-2">
            <h2 className="text-xl font-bold text-slate-800">Your Optimal Schedule</h2>
            <p className="text-slate-500 text-sm">Based on your circadian rhythm</p>
          </div>
          <CircadianTimeline idealSchedule={idealSchedule} currentTime={currentTime} />
        </div>

        {/* Rest of the component remains the same */}
      </div>
    </div>
  );
};

export default CircadianFitnessUI;