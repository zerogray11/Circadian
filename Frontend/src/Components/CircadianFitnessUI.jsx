import React from 'react';
import { Moon, Sun, Utensils, Dumbbell, Bed, Clock, Check, X, Activity, Plus } from 'lucide-react';
import useCircadianFitnessLogic from './CircadianVisualization';

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

  // Helper function to convert 24-hour time to 12-hour format
  const convertTo12HourFormat = (time) => {
    if (!time) return 'Not set';
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert 0 to 12 for AM
    return `${hours}:${minutes.padStart(2, '0')} ${period}`;
  };

  // Check if time is near current time
  const isTimeNearNow = (timeStr, windowMinutes) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const targetMinutes = timeToMinutes(timeStr);

    const getAngle = (timeStr) => {
      const minutes = timeToMinutes(timeStr); // Convert time to minutes
      return (minutes / (24 * 60)) * 360; // Convert minutes to degrees (0-360)
    };
    

    // Handle midnight crossing
    const diff = Math.min(
      Math.abs(currentMinutes - targetMinutes),
      Math.abs(currentMinutes - (targetMinutes + 24 * 60)),
      Math.abs((currentMinutes + 24 * 60) - targetMinutes)
    );

    return diff <= windowMinutes;
  };

  // Render circular timeline
  const renderCircularTimeline = () => {
    const idealSchedule = calculateIdealSchedule();
    if (!idealSchedule) return null;

    const clockRadius = 140;
    const centerX = 150;
    const centerY = 150;

    // Calculate current time indicator
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    const currentAngle = getAngle(currentTimeStr);

    // Helper function to calculate coordinates on the circle
    const getCoordinates = (angle, radius) => {
      const radians = (angle - 90) * Math.PI / 180;
      return {
        x: centerX + radius * Math.cos(radians),
        y: centerY + radius * Math.sin(radians)
      };
    };

    // Create arc path
    const createArc = (startAngle, endAngle, radius) => {
      const adjustedEndAngle = endAngle < startAngle ? endAngle + 360 : endAngle;
      const start = getCoordinates(startAngle, radius);
      const end = getCoordinates(adjustedEndAngle, radius);
      const largeArcFlag = adjustedEndAngle - startAngle <= 180 ? "0" : "1";
      return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
    };

    // All activities for rendering
    const allActivities = [
      ...idealSchedule.transitions.map(item => ({
        ...item,
        category: item.type === 'Wake Up' ? 'wake' : 'sleep',
        startAngle: getAngle(item.time),
        endAngle: getAngle(item.time)
      })),
      ...idealSchedule.meals.map(item => ({
        ...item,
        category: 'meal',
        startAngle: getAngle(item.time),
        endAngle: getAngle(item.time)
      })),
      ...idealSchedule.workouts.map(item => ({
        ...item,
        category: 'workout',
        startAngle: getAngle(item.time),
        endAngle: getAngle(item.time)
      }))
    ];

    // Sleep window: from sleep time to wake time
    const sleepStartAngle = getAngle(idealSchedule.sleep);
    const sleepEndAngle = getAngle(idealSchedule.wake);

    return (
      <svg viewBox="0 0 300 300" className="w-full max-w-md mx-auto">
        {/* Clock face background */}
        <circle cx={centerX} cy={centerY} r={clockRadius} fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />

        {/* Hours markers */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * 360;
          const isMainHour = i % 3 === 0;
          const markerLength = isMainHour ? 10 : 5;
          const textRadius = clockRadius - 20;
          const coord = getCoordinates(angle, clockRadius);
          const innerCoord = getCoordinates(angle, clockRadius - markerLength);
          const textCoord = getCoordinates(angle, textRadius);

          return (
            <g key={i}>
              <line
                x1={coord.x}
                y1={coord.y}
                x2={innerCoord.x}
                y2={innerCoord.y}
                stroke={isMainHour ? "#64748b" : "#94a3b8"}
                strokeWidth={isMainHour ? "2" : "1"}
              />
              {isMainHour && (
                <text
                  x={textCoord.x}
                  y={textCoord.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="#64748b"
                  fontWeight="500"
                >
                  {i === 0 ? '12am' : i === 12 ? '12pm' : i > 12 ? `${i - 12}pm` : `${i}am`}
                </text>
              )}
            </g>
          );
        })}

        {/* Sleep window arc */}
        <path
          d={createArc(sleepStartAngle, sleepEndAngle, clockRadius - 25)}
          stroke="none"
          fill="url(#sleepGradient)"
          strokeWidth="15"
          strokeLinecap="round"
          opacity="0.4"
        />

        <defs>
          <linearGradient id="sleepGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4338ca" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="nowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
          <linearGradient id="mealGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
          <linearGradient id="workoutGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id="wakeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#fcd34d" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Current time indicator */}
        <line
          x1={centerX}
          y1={centerY}
          x2={getCoordinates(currentAngle, clockRadius).x}
          y2={getCoordinates(currentAngle, clockRadius).y}
          stroke="url(#nowGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#glow)"
        />
        <circle
          cx={getCoordinates(currentAngle, clockRadius).x}
          cy={getCoordinates(currentAngle, clockRadius).y}
          r="6"
          fill="url(#nowGradient)"
          filter="url(#glow)"
        />
        <circle cx={centerX} cy={centerY} r="5" fill="url(#nowGradient)" />

        {/* Activity markers */}
        {allActivities.map((activity, index) => {
          const markerRadius = 12;
          const orbitRadius = clockRadius - 40;
          const position = getCoordinates(activity.startAngle, orbitRadius);

          return (
            <g key={`activity-${index}`} className="cursor-pointer">
              <circle
                cx={position.x}
                cy={position.y}
                r={markerRadius}
                fill={`url(#${activity.category}Gradient)`}
                strokeWidth="2"
                stroke="#ffffff"
              />
              <foreignObject
                x={position.x - markerRadius / 2}
                y={position.y - markerRadius / 2}
                width={markerRadius}
                height={markerRadius}
                className="text-white flex items-center justify-center"
              >
                <div className="flex items-center justify-center w-full h-full text-white">
                  {React.cloneElement(activity.icon, { className: "w-3 h-3 text-white" })}
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    );
  };

  // Render activity schedule
  const renderSchedule = () => {
    const idealSchedule = calculateIdealSchedule();
    if (!idealSchedule) return null;

    const allActivities = [
      ...idealSchedule.transitions,
      ...idealSchedule.meals,
      ...idealSchedule.workouts
    ].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

    return (
      <div className="space-y-2 mt-4">
        {allActivities.map((activity, index) => {
          const isNow = isTimeNearNow(activity.time, 30); // within 30 min

          let categoryColor;
          if (activity.type === "Wake Up") categoryColor = "bg-gradient-to-r from-cyan-500 to-blue-400";
          else if (activity.type === "Sleep") categoryColor = "bg-gradient-to-r from-indigo-500 to-purple-400";
          else if (activity.type.includes("Meal") || activity.type === "Breakfast" || activity.type === "Lunch" || activity.type === "Dinner")
            categoryColor = "bg-gradient-to-r from-teal-500 to-cyan-400";
          else if (activity.type === "Workout") categoryColor = "bg-gradient-to-r from-blue-500 to-indigo-400";

          return (
            <div
              key={index}
              className={`flex items-center p-3 rounded-xl transition-all ${
                isNow ? 'bg-gradient-to-r from-purple-50 to-fuchsia-50 shadow-md border border-purple-200' : 'bg-white shadow'
              }`}
            >
              <div className={`p-3 rounded-full mr-3 text-white ${categoryColor}`}>
                {activity.icon}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-800">{activity.type}</div>
                <div className="text-sm text-slate-500">Recommended time</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-lg text-slate-800">
                  {convertTo12HourFormat(activity.time)}
                </div>
                {isNow && (
                  <div className="text-xs font-semibold text-purple-600 flex items-center justify-end">
                    <Activity className="w-3 h-3 mr-1" />
                    Now
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render log entries
  const renderLogEntries = () => {
    if (!userData || !userData.logEntries || userData.logEntries.length === 0) {
      return (
        <div className="bg-white rounded-xl p-6 text-center">
          <div className="text-slate-500 mb-4">No entries logged yet</div>
          <button
            onClick={() => setShowLogForm(true)}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add your first entry
          </button>
        </div>
      );
    }

    // Group entries by date
    const entriesByDate = userData.logEntries.reduce((acc, entry) => {
      const date = entry.date || new Date(entry.timestamp).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(entry);
      return acc;
    }, {});

    return (
      <div className="space-y-6 mt-4">
        {Object.entries(entriesByDate).map(([date, entries]) => (
          <div key={date} className="bg-white rounded-xl overflow-hidden shadow">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 text-white font-medium">
              {date}
            </div>
            <div className="divide-y divide-slate-100">
              {entries.map((entry, i) => {
                let icon, color;

                if (entry.type === 'Meal') {
                  icon = <Utensils className="w-4 h-4" />;
                  color = "text-teal-500";
                } else if (entry.type === 'Workout') {
                  icon = <Dumbbell className="w-4 h-4" />;
                  color = "text-blue-500";
                } else if (entry.type === 'Sleep') {
                  icon = <Bed className="w-4 h-4" />;
                  color = "text-indigo-500";
                }

                return (
                  <div key={i} className="p-3 flex items-center">
                    <div className={`mr-3 ${color}`}>{icon}</div>
                    <div className="flex-1">
                      <div className="font-medium">{entry.type}</div>
                      {entry.note && <div className="text-sm text-slate-500">{entry.note}</div>}
                    </div>
                    <div className="text-sm font-mono text-slate-600">
                      {convertTo12HourFormat(entry.time)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

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
          {renderCircularTimeline()}
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl shadow-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 py-3 text-center rounded-lg transition-all ${
              activeTab === 'schedule'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Schedule
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-3 text-center rounded-lg transition-all ${
              activeTab === 'logs'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Activity Log
          </button>
        </div>

        {/* Tab Content */}
        <div className="mb-20">
          {activeTab === 'schedule' ? renderSchedule() : renderLogEntries()}
        </div>

        {/* Log Entry Form */}
        {showLogForm && (
          <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md m-4">
              <h2 className="text-xl font-bold mb-4 text-slate-800">Log Activity</h2>
              <form onSubmit={handleLogEntry} className="space-y-4">
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
      </div>
    </div>
  );
};

export default CircadianFitnessUI;