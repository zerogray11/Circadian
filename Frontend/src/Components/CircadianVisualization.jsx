import React from 'react';
import { Moon, Sun, Utensils, Dumbbell, Bed, Clock, Check, X, Activity, Plus } from 'lucide-react';

const CircadianVisualization = ({ userData, currentTime, idealSchedule, activeTab, setActiveTab }) => {
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

  // Render circular timeline
  const renderCircularTimeline = () => {
    if (!idealSchedule) return null;

    const clockRadius = 140;
    const centerX = 150;
    const centerY = 150;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    const currentAngle = (timeToMinutes(currentTimeStr) / (24 * 60) * 360);

    const getCoordinates = (angle, radius) => {
      const radians = (angle - 90) * Math.PI / 180;
      return {
        x: centerX + radius * Math.cos(radians),
        y: centerY + radius * Math.sin(radians),
      };
    };

    const createArc = (startAngle, endAngle, radius) => {
      const adjustedEndAngle = endAngle < startAngle ? endAngle + 360 : endAngle;
      const start = getCoordinates(startAngle, radius);
      const end = getCoordinates(adjustedEndAngle, radius);
      const largeArcFlag = adjustedEndAngle - startAngle <= 180 ? "0" : "1";
      return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
    };

    const sleepStartAngle = (timeToMinutes(idealSchedule.sleep) / (24 * 60)) * 360;
    const sleepEndAngle = (timeToMinutes(idealSchedule.wake) / (24 * 60)) * 360;

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
                  {i === 0 ? '12am' : i === 12 ? '12pm' : i > 12 ? `${i-12}pm` : `${i}am`}
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
        {[
          ...idealSchedule.transitions,
          ...idealSchedule.meals,
          ...idealSchedule.workouts,
        ].map((activity, index) => {
          const markerRadius = 12;
          const orbitRadius = clockRadius - 40;
          const position = getCoordinates((timeToMinutes(activity.time) / (24 * 60)) * 360, orbitRadius);

          return (
            <g key={`activity-${index}`} className="cursor-pointer">
              <circle
                cx={position.x}
                cy={position.y}
                r={markerRadius}
                fill={`url(#${activity.icon.toLowerCase()}Gradient)`}
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
                  {React.createElement(eval(activity.icon), { className: "w-3 h-3 text-white" })}
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
    if (!idealSchedule) return null;

    const allActivities = [
      ...idealSchedule.transitions,
      ...idealSchedule.meals,
      ...idealSchedule.workouts,
    ].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

    return (
      <div className="space-y-2 mt-4">
        {allActivities.map((activity, index) => {
          const isNow = Math.abs(timeToMinutes(activity.time) - timeToMinutes(currentTime.toTimeString().slice(0, 5))) <= 30;

          let categoryColor;
          if (activity.type === "Wake Up") categoryColor = "bg-gradient-to-r from-cyan-500 to-blue-400";
          else if (activity.type === "Sleep") categoryColor = "bg-gradient-to-r from-indigo-500 to-purple-400";
          else if (activity.type.includes("Meal")) categoryColor = "bg-gradient-to-r from-teal-500 to-cyan-400";
          else if (activity.type === "Workout") categoryColor = "bg-gradient-to-r from-blue-500 to-indigo-400";

          return (
            <div
              key={index}
              className={`flex items-center p-3 rounded-xl transition-all ${
                isNow ? 'bg-gradient-to-r from-purple-50 to-fuchsia-50 shadow-md border border-purple-200' : 'bg-white shadow'
              }`}
            >
              <div className={`p-3 rounded-full mr-3 text-white ${categoryColor}`}>
                {React.createElement(eval(activity.icon), { className: "w-5 h-5" })}
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

  return (
    <>
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
        {activeTab === 'schedule' ? renderSchedule() : null}
      </div>
    </>
  );
};

export default CircadianVisualization;