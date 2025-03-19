import React, { useState, useEffect } from 'react';
import {
  Moon, Sun, Utensils, Dumbbell, Bed, Clock,
  Activity, Battery, BatteryFull, BatteryMedium, BatteryLow, Check
} from 'lucide-react';

const CircadianVisualization = ({
  userData,
  currentTime,
  idealSchedule,
  activeTab,
  setActiveTab,
  logs,
}) => {
  const [sunrise, setSunrise] = useState(null);
  const [sunset, setSunset] = useState(null);

  // Fetch sunrise and sunset times based on user's location
  useEffect(() => {
    const fetchSunTimes = async () => {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        const { latitude, longitude } = position.coords;
        const response = await fetch(
          `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`
        );
        const data = await response.json();
        setSunrise(new Date(data.results.sunrise));
        setSunset(new Date(data.results.sunset));
      } catch (error) {
        console.error('Error fetching sun times:', error);
      }
    };

    fetchSunTimes();
  }, []);

  // Helper function to convert time string to minutes
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Helper function to convert minutes to time
  const minutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Helper function to convert 24-hour time to 12-hour format
  const convertTo12HourFormat = (time) => {
    if (!time) return 'Not set';
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes.padStart(2, '0')} ${period}`;
  };

  // Calculate energy level based on time of day
  const calculateEnergyLevel = () => {
    if (!idealSchedule) return 'Medium';

    const currentTimeMinutes = timeToMinutes(currentTime.toTimeString().slice(0, 5));
    const wakeTime = timeToMinutes(idealSchedule.wake);
    const sleepTime = timeToMinutes(idealSchedule.sleep);

    const dayLength = sleepTime < wakeTime ? (24 * 60 - wakeTime + sleepTime) : (sleepTime - wakeTime);
    const timeSinceWake = (currentTimeMinutes - wakeTime + 24 * 60) % (24 * 60);

    if (timeSinceWake < dayLength * 0.25) return 'High';
    if (timeSinceWake < dayLength * 0.5) return 'Medium';
    if (timeSinceWake < dayLength * 0.75) return 'Low';
    return 'Unwind';
  };

  const energyLevel = calculateEnergyLevel();

  // Get optimal activity based on energy level
  const getOptimalActivity = () => {
    switch (energyLevel) {
      case 'High':
        return 'Optimal time for focused work 🚀';
      case 'Medium':
        return 'Great time for socializing 🗣️';
      case 'Low':
        return 'Ideal for light workouts 🏋️';
      case 'Unwind':
        return 'Relax and Unwind 🌙';
      default:
        return '';
    }
  };

  // Render energy and achievement rings
  const renderRings = () => {
    if (!idealSchedule) return null;

    const radius = 120;
    const strokeWidth = 24;
    const centerX = 150;
    const centerY = 150;
    const circumference = 2 * Math.PI * radius;

    const currentTimeMinutes = timeToMinutes(currentTime.toTimeString().slice(0, 5));
    const wakeTime = timeToMinutes(idealSchedule.wake);
    const sleepTime = timeToMinutes(idealSchedule.sleep);

    const dayLength = sleepTime < wakeTime ? (24 * 60 - wakeTime + sleepTime) : (sleepTime - wakeTime);
    const timeSinceWake = (currentTimeMinutes - wakeTime + 24 * 60) % (24 * 60);
    const progress = timeSinceWake / dayLength;

    return (
      <svg viewBox="0 0 300 300" className="w-full max-w-md mx-auto">
        <defs>
          <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="25%" stopColor="#fcd34d" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="75%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="achievementGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>

        {/* Energy Ring */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="url(#energyGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference * progress} ${circumference * (1 - progress)}`}
          strokeDashoffset={circumference * 0.25}
        />

        {/* Achievement Ring */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius - strokeWidth - 10}
          fill="none"
          stroke="url(#achievementGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`} // Placeholder for achievements
          strokeDashoffset={circumference * 0.25}
        />

        {/* Center Text */}
        <text
          x={centerX}
          y={centerY - 15}
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="#0f172a"
        >
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </text>
        <text
          x={centerX}
          y={centerY + 15}
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          fill="#1e293b"
        >
          {getOptimalActivity()}
        </text>
      </svg>
    );
  };

  // Render sunrise and sunset times
  const renderSunTimes = () => {
    if (!sunrise || !sunset) return null;

    return (
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-2xl shadow-md border border-blue-100">
          <div className="flex items-center">
            <Sun className="w-5 h-5 text-amber-500" />
            <span className="ml-2 text-sm font-medium text-slate-700">Sunrise</span>
          </div>
          <div className="mt-2 text-lg font-semibold text-slate-900">
            {sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-2xl shadow-md border border-blue-100">
          <div className="flex items-center">
            <Moon className="w-5 h-5 text-indigo-500" />
            <span className="ml-2 text-sm font-medium text-slate-700">Sunset</span>
          </div>
          <div className="mt-2 text-lg font-semibold text-slate-900">
            {sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  };

  // Render activity cards
  const renderActivityCards = () => {
    if (!idealSchedule) return null;

    const allActivities = [
      ...idealSchedule.transitions,
      ...idealSchedule.meals,
      ...idealSchedule.workouts,
    ].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

    const currentTimeMinutes = timeToMinutes(currentTime.toTimeString().slice(0, 5));

    let closestActivity = allActivities[0];
    let minDifference = Infinity;

    allActivities.forEach(activity => {
      const activityTime = timeToMinutes(activity.time);
      const difference = Math.abs(activityTime - currentTimeMinutes);
      if (difference < minDifference) {
        minDifference = difference;
        closestActivity = activity;
      }
    });

    const isNearActivity = minDifference <= 30; // Within 30 minutes

    return (
      <div className="space-y-3 mt-4">
        {isNearActivity && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-2xl shadow-lg border border-blue-100 mb-4">
            <div className="flex items-center">
              <div className="mr-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  {closestActivity.type.includes("Meal") ? (
                    <Utensils className="w-6 h-6 text-white" />
                  ) : closestActivity.type === "Workout" ? (
                    <Dumbbell className="w-6 h-6 text-white" />
                  ) : closestActivity.type === "Wake Up" ? (
                    <Sun className="w-6 h-6 text-white" />
                  ) : closestActivity.type === "Sleep" ? (
                    <Moon className="w-6 h-6 text-white" />
                  ) : (
                    <Clock className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-indigo-700">COMING UP</h3>
                <p className="text-xl font-bold text-gray-800">{closestActivity.type}</p>
                <p className="text-sm text-gray-500">
                  {convertTo12HourFormat(closestActivity.time)} • {minDifference < 1 ? 'Now' : `In ${minDifference} min`}
                </p>
              </div>
            </div>
          </div>
        )}

        {allActivities.map((activity, index) => {
          const isNow = Math.abs(timeToMinutes(activity.time) - currentTimeMinutes) <= 15;
          const isPast = timeToMinutes(activity.time) < currentTimeMinutes;

          let iconComponent;
          if (activity.type.includes("Meal")) {
            iconComponent = <Utensils className="w-5 h-5 text-white" />;
          } else if (activity.type === "Workout") {
            iconComponent = <Dumbbell className="w-5 h-5 text-white" />;
          } else if (activity.type === "Wake Up") {
            iconComponent = <Sun className="w-5 h-5 text-white" />;
          } else if (activity.type === "Sleep") {
            iconComponent = <Moon className="w-5 h-5 text-white" />;
          } else {
            iconComponent = <Clock className="w-5 h-5 text-white" />;
          }

          let gradientClass;
          if (activity.type.includes("Meal")) {
            gradientClass = "bg-gradient-to-br from-amber-400 to-orange-500";
          } else if (activity.type === "Workout") {
            gradientClass = "bg-gradient-to-br from-rose-400 to-red-500";
          } else if (activity.type === "Wake Up") {
            gradientClass = "bg-gradient-to-br from-pink-400 to-pink-600";
          } else if (activity.type === "Sleep") {
            gradientClass = "bg-gradient-to-br from-indigo-400 to-blue-600";
          } else {
            gradientClass = "bg-gradient-to-br from-green-400 to-teal-500";
          }

          return (
            <div
              key={index}
              className={`flex items-center p-4 rounded-2xl transition-all ${
                isNow
                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 shadow-md border border-blue-200'
                  : isPast
                  ? 'bg-white shadow-sm opacity-75'
                  : 'bg-gradient-to-r from-slate-50 to-blue-50 shadow-md border border-slate-100'
              }`}
            >
              <div className={`p-3 rounded-xl mr-4 ${gradientClass}`}>
                {iconComponent}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-800">{activity.type}</div>
                <div className="text-sm text-slate-500">
                  {isPast ? 'Completed' : isNow ? 'Now' : 'Upcoming'}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-lg text-slate-800">
                  {convertTo12HourFormat(activity.time)}
                </div>
                <div className={`text-xs font-medium ${
                  isPast ? 'text-green-600' : isNow ? 'text-purple-600' : 'text-slate-500'
                } flex items-center justify-end`}>
                  {isPast ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Done
                    </>
                  ) : isNow ? (
                    <>
                      <Activity className="w-3 h-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 mr-1" />
                      Scheduled
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render logs in the "Daily Log" tab
  const renderLogs = () => {
    if (!logs || logs.length === 0) {
      return <div className="text-center text-gray-500">No logs available.</div>;
    }

    return logs.map((log, index) => {
      const logTime = timeToMinutes(log.time);
      const currentTimeMinutes = timeToMinutes(currentTime.toTimeString().slice(0, 5));
      const isPast = logTime < currentTimeMinutes;

      let iconComponent;
      if (log.type === 'Meal') {
        iconComponent = <Utensils className="w-5 h-5 text-white" />;
      } else if (log.type === 'Workout') {
        iconComponent = <Dumbbell className="w-5 h-5 text-white" />;
      } else if (log.type === 'Sleep') {
        iconComponent = <Bed className="w-5 h-5 text-white" />;
      } else {
        iconComponent = <Clock className="w-5 h-5 text-white" />;
      }

      let gradientClass;
      if (log.type === 'Meal') {
        gradientClass = "bg-gradient-to-br from-amber-400 to-orange-500";
      } else if (log.type === 'Workout') {
        gradientClass = "bg-gradient-to-br from-rose-400 to-red-500";
      } else if (log.type === 'Sleep') {
        gradientClass = "bg-gradient-to-br from-indigo-400 to-blue-600";
      } else {
        gradientClass = "bg-gradient-to-br from-green-400 to-teal-500";
      }

      return (
        <div
          key={index}
          className={`flex items-center p-4 rounded-2xl transition-all ${
            isPast
              ? 'bg-white shadow-sm opacity-75'
              : 'bg-gradient-to-r from-slate-50 to-blue-50 shadow-md border border-slate-100'
          }`}
        >
          <div className={`p-3 rounded-xl mr-4 ${gradientClass}`}>
            {iconComponent}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-slate-800">{log.type}</div>
            <div className="text-sm text-slate-500">
              {isPast ? 'Completed' : 'Upcoming'}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-lg text-slate-800">
              {convertTo12HourFormat(log.time)}
            </div>
            <div className={`text-xs font-medium ${
              isPast ? 'text-green-600' : 'text-slate-500'
            } flex items-center justify-end`}>
              {isPast ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Done
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 mr-1" />
                  Scheduled
                </>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  // Render legend for rings
  const renderRingLegend = () => (
    <div className="mt-4 text-center space-y-2">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-teal-500 rounded-full"></div>
        <span className="text-sm text-slate-700">Energy Ring</span>
      </div>
      <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
        <span className="text-sm text-slate-700">Achievement Ring</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
        <div className="p-6 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 to-orange-200 text-gray-800">
          <h1 className="text-2xl font-bold">Your Circadian Rhythm</h1>
          <p className="mt-1 opacity-90">
            {userData?.name ? `Hello, ${userData.name}` : 'Optimize your day based on your chronotype'}
          </p>
        </div>

        {/* Current Time */}
        <div className="p-6 text-center">
          <div className="text-slate-500 mb-2">Current Time</div>
          <div className="text-3xl font-bold font-mono text-indigo-800">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Energy and Achievement Rings */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 mt-4">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Daily Energy & Achievements</h2>
          <p className="text-slate-500 text-sm">Based on your circadian rhythm</p>
        </div>
        {renderRings()}
        {renderRingLegend()}
        {renderSunTimes()}
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-xl shadow-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 py-3 text-center rounded-lg transition-all ${
            activeTab === 'schedule'
              ? 'bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 to-orange-200 text-gray-800 font-medium'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Schedule
        </button>
        <button
          onClick={() => setActiveTab('daily-log')}
          className={`flex-1 py-3 text-center rounded-lg transition-all ${
            activeTab === 'daily-log'
              ? 'bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 to-orange-200 text-gray-800 font-medium'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Daily Log
        </button>
      </div>

      {/* Tab Content */}
      <div className="mb-20">
        {activeTab === 'schedule' ? renderActivityCards() : renderLogs()}
      </div>
    </>
  );
};

export default CircadianVisualization;